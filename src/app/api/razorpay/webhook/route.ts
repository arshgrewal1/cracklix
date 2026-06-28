
import { NextResponse } from "next/server";
import crypto from "crypto";
import { initializeFirebase } from "@/firebase/app";
import { doc, setDoc, serverTimestamp, getDoc, updateDoc, increment } from "firebase/firestore";
import { logEvent } from "@/lib/logger";
import { sendEmail } from "@/lib/email";
import { sendWhatsApp } from "@/lib/whatsapp";

/**
 * Razorpay Enterprise Webhook Hub (v12.0)
 * Logic: Signature verification, Fraud detection, Referral rewards, and Multi-channel Automation.
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
         return NextResponse.json({ success: true });
      }

      // 1. FRAUD DETECTION (Amount Audit)
      const planSnap = await getDoc(doc(db, "passes", planId));
      if (planSnap.exists()) {
         const expectedPrice = Number(planSnap.data().price);
         const paidPrice = Number(payment.amount) / 100;
         if (paidPrice < expectedPrice * 0.4) {
            await logEvent({ type: "critical", message: "Price mismatch detected.", userId, metadata: { paid: paidPrice, expected: expectedPrice } });
            return NextResponse.json({ success: true, flagged: true });
         }
      }

      // 2. ACTIVATION LOGIC
      const durationDays = planSnap.exists() ? (planSnap.data().durationDays || 30) : 30;
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + durationDays);

      // A. PROFILE SYNC
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();

      await updateDoc(userRef, {
        pass: {
          active: true,
          plan: planSnap.data()?.name || planId.toUpperCase(),
          purchaseDate: new Date().toISOString(),
          expiryDate: expiryDate.toISOString(),
          freePassClaimed: false
        },
        passStatus: 'active',
        passExpiresAt: expiryDate.toISOString(),
        status: planId,
        updatedAt: serverTimestamp()
      });

      // B. REFERRAL REWARD
      if (userData?.referredBy) {
        const referrerId = userData.referredBy;
        await updateDoc(doc(db, "users", referrerId), {
          coins: increment(50),
          updatedAt: serverTimestamp()
        }).catch(e => console.error("[REFERRAL_ERR]", e));
      }

      // C. MULTI-CHANNEL AUTOMATION
      const userEmail = userSnap.data()?.email || payment.email;
      if (userEmail) {
         await sendEmail(
            userEmail, 
            "Payment Successful 🎉", 
            `<h2>Welcome to Cracklix Pro!</h2><p>Your subscription for ${planSnap.data()?.name || planId} is now active.</p><p>Expires on: ${expiryDate.toLocaleDateString()}</p>`
         );
      }

      await sendWhatsApp(
         `💰 New Payment Received\nUser: ${userData?.name || userId}\nPlan: ${planId}\nAmount: ₹${Number(payment.amount)/100}`
      );

      // D. AUDIT LOG
      await logEvent({ type: "payment", message: "Pass activated via Webhook", userId, planId });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[WEBHOOK_EXCEPTION]", error);
    await logEvent({ type: "error", message: error.message, stack: error.stack });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
