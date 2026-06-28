import { NextResponse } from "next/server";
import crypto from "crypto";
import { initializeFirebase } from "@/firebase/app";
import { doc, setDoc, serverTimestamp, getDoc, updateDoc } from "firebase/firestore";
import { logEvent } from "@/lib/logger";

/**
 * Razorpay Enterprise Webhook Hub (v15.0)
 * Security: HMAC-SHA256 Signature Verification + Renewal Stacking Logic.
 */
export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!secret) {
      await logEvent({ type: "critical", message: "RAZORPAY_WEBHOOK_SECRET missing in environment." });
      return NextResponse.json({ error: "Configuration anomaly" }, { status: 500 });
    }

    // 1. SIGNATURE VERIFICATION (Anti-Tampering)
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

    if (event.event === "payment.captured" || event.event === "order.paid") {
      const payment = event.payload.payment?.entity || event.payload.order?.entity;
      const userId = payment.notes?.userId;
      const planId = payment.notes?.planId;

      if (!userId || !planId) {
        return NextResponse.json({ success: true, warning: "Metadata missing" });
      }

      // 2. SUBSCRIPTION ACTIVATION WITH RENEWAL STACKING
      const planSnap = await getDoc(doc(db, "passes", planId));
      if (!planSnap.exists()) {
        await logEvent({ type: "error", message: "Plan not found in registry during webhook.", userId });
        return NextResponse.json({ success: true });
      }

      const planData = planSnap.data();
      const durationDays = Number(planData.durationDays || 30);
      const msPerDay = 24 * 60 * 60 * 1000;
      
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();

      let baseTime = Date.now();
      // If same plan is active, stack the time. If different, start fresh.
      if (userData?.passStatus === 'active' && userData?.passExpiresAt) {
         const currentExpiry = new Date(userData.passExpiresAt).getTime();
         if (currentExpiry > Date.now() && userData.status === planId) {
            baseTime = currentExpiry;
         }
      }

      const expiryDate = new Date(baseTime + (durationDays * msPerDay));

      const passPayload = {
        pass: {
          active: true,
          plan: planData.name || planId.toUpperCase(),
          purchaseDate: new Date().toISOString(),
          expiryDate: expiryDate.toISOString(),
          freePassClaimed: false
        },
        passStatus: 'active',
        passExpiresAt: expiryDate.toISOString(),
        status: planId,
        planTier: Number(planData.tier || 1),
        updatedAt: serverTimestamp()
      };

      await updateDoc(userRef, passPayload);

      // 3. LOG TRANSACTION
      await setDoc(doc(db, "payment_requests", payment.id || `web-${Date.now()}`), {
        userId,
        planId,
        amount: Number(payment.amount) / 100,
        gateway: "RAZORPAY",
        status: "APPROVED",
        verified: true,
        createdAt: serverTimestamp()
      });

      await logEvent({ type: "payment", message: "Pass activated via verified webhook", userId, planId });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[WEBHOOK_EXCEPTION]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
