import { NextResponse } from "next/server";
import crypto from "crypto";
import { initializeFirebase } from "@/firebase/app";
import { doc, setDoc, serverTimestamp, getDoc, updateDoc, increment } from "firebase/firestore";
import { logEvent } from "@/lib/logger";
import { sendEmail } from "@/lib/email";
import { sendWhatsApp } from "@/lib/whatsapp";

/**
 * Razorpay Enterprise Webhook Hub (v13.0)
 * Logic: Signature verification, Renewal Stacking, Fraud detection, and Multi-channel Automation.
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

      // 2. ACTIVATION LOGIC (Renewal Stacking)
      const durationDays = planSnap.exists() ? (planSnap.data().durationDays || 30) : 30;
      const msPerDay = 24 * 60 * 60 * 1000;
      
      const userPassRef = doc(db, "user_passes", userId);
      const userPassSnap = await getDoc(userPassRef);
      
      let baseTime = Date.now();
      if (userPassSnap.exists()) {
         const current = userPassSnap.data();
         // If same plan is active, stack the time. If different, start from now.
         if (current.active && current.expiry > Date.now() && current.planId === planId) {
            baseTime = current.expiry;
         }
      }

      const expiryDate = new Date(baseTime + (durationDays * msPerDay));

      // A. SUBSCRIPTION REGISTRY SYNC
      await setDoc(userPassRef, {
        planId,
        active: true,
        activatedAt: serverTimestamp(),
        expiry: expiryDate.getTime(),
        updatedAt: serverTimestamp()
      }, { merge: true });

      // B. PROFILE SYNC (Legacy Compatibility)
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

      // C. REFERRAL REWARD
      if (userData?.referredBy) {
        await updateDoc(doc(db, "users", userData.referredBy), {
          coins: increment(50),
          updatedAt: serverTimestamp()
        }).catch(() => {});
      }

      // D. AUTOMATION
      const userEmail = userSnap.data()?.email || payment.email;
      if (userEmail) {
         await sendEmail(
            userEmail, 
            "Elite Pass Activated 🎉", 
            `<h2>Success!</h2><p>Your subscription for ${planSnap.data()?.name || planId} is now live.</p><p>Valid until: ${expiryDate.toLocaleDateString()}</p>`
         );
      }

      await sendWhatsApp(`💰 Revenue Hub: ₹${Number(payment.amount)/100} captured from ${userData?.name || userId}`);
      await logEvent({ type: "payment", message: "Pass activated via Webhook", userId, planId });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[WEBHOOK_EXCEPTION]", error);
    await logEvent({ type: "error", message: error.message, stack: error.stack });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
