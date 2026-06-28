import { NextResponse } from "next/server";
import crypto from "crypto";
import { initializeFirebase } from "@/firebase/app";
import { doc, setDoc, serverTimestamp, getDoc, updateDoc, increment } from "firebase/firestore";
import { logEvent } from "@/lib/logger";

/**
 * Razorpay Enterprise Webhook Hub (v10.0)
 * Logic: Signature verification, Fraud detection, Referral rewards, and Activation.
 */
export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!secret) {
       await logEvent({ type: "critical", message: "RAZORPAY_WEBHOOK_SECRET is undefined" });
       return NextResponse.json({ error: "Configuration anomaly" }, { status: 500 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      await logEvent({ type: "critical", message: "Unauthorized webhook signature detected." });
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(body);
    const { firestore: db } = initializeFirebase();

    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
      const userId = payment.notes?.userId;
      const planId = payment.notes?.planId;

      if (!userId || !planId) {
         await logEvent({ type: "info", message: "Payment captured without metadata notes." });
         return NextResponse.json({ success: true });
      }

      // 1. FRAUD DETECTION (Amount Audit)
      const planSnap = await getDoc(doc(db, "passes", planId));
      if (planSnap.exists()) {
         const expectedPrice = Number(planSnap.data().price);
         const paidPrice = Number(payment.amount) / 100;
         if (paidPrice < expectedPrice * 0.4) {
            await logEvent({ type: "critical", message: "High-severity price mismatch detected.", userId, metadata: { paid: paidPrice, expected: expectedPrice } });
            await setDoc(doc(db, "fraud_alerts", payment.id), { payment, userId, planId, createdAt: serverTimestamp() });
            return NextResponse.json({ success: true, flagged: true });
         }
      }

      // 2. ACTIVATION LOGIC
      const durationDays = planSnap.exists() ? (planSnap.data().durationDays || 30) : 30;
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + durationDays);

      // A. SUBSCRIPTION REGISTRY
      await setDoc(doc(db, "user_passes", userId), {
        planId, active: true, activatedAt: serverTimestamp(),
        expiry: expiryDate.getTime(),
        paymentId: payment.id,
        orderId: payment.order_id,
        updatedAt: serverTimestamp()
      });

      // B. PROFILE SYNC
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();

      await updateDoc(userRef, {
        passStatus: 'active',
        passExpiresAt: expiryDate.toISOString(),
        status: planId,
        planTier: planSnap.exists() ? (planSnap.data().tier || 1) : 1,
        updatedAt: serverTimestamp()
      });

      // C. REFERRAL REWARD
      if (userData?.referredBy) {
        const referrerId = userData.referredBy;
        await setDoc(doc(db, "referrals", `${referrerId}_${userId}`), {
          referrerId, referredId: userId, amount: payment.amount / 100,
          rewardGiven: true, createdAt: serverTimestamp()
        });

        await updateDoc(doc(db, "users", referrerId), {
          coins: increment(50),
          updatedAt: serverTimestamp()
        }).catch(e => console.error("[REFERRAL_ERR]", e));
      }

      // D. AUDIT LOG CLOSURE
      await logEvent({ type: "payment", message: "Pass activated via Webhook", userId, planId });
      await updateDoc(doc(db, "payment_logs", payment.order_id), {
         status: "captured", paymentId: payment.id, capturedAt: serverTimestamp()
      }).catch(() => {});
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[WEBHOOK_EXCEPTION]", error);
    await logEvent({ type: "error", message: error.message, stack: error.stack });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
