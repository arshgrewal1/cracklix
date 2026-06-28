import { NextResponse } from "next/server";
import crypto from "crypto";
import { initializeFirebase } from "@/firebase/app";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";

/**
 * Razorpay Bank-Grade Webhook Hub (v1.0)
 * Purpose: Secure pass activation via server-to-server confirmation.
 */

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!secret) {
       console.error("[WEBHOOK] Critical: RAZORPAY_WEBHOOK_SECRET is missing.");
       return NextResponse.json({ error: "Config error" }, { status: 500 });
    }

    // 1. Signature Verification
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(body);
    const { firestore: db } = initializeFirebase();

    // 2. Handle Captured Payment
    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
      const userId = payment.notes?.userId;
      const planId = payment.notes?.planId;

      if (userId && planId) {
        console.log(`[WEBHOOK] Activating pass for user: ${userId} | Plan: ${planId}`);
        
        const planSnap = await getDoc(doc(db, "passes", planId));
        const planData = planSnap.data();
        const durationDays = planData?.durationDays || 30;
        
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + durationDays);

        const userRef = doc(db, "users", userId);
        await setDoc(userRef, {
          pass: {
            active: true,
            plan: planData?.name || planId.toUpperCase(),
            purchaseDate: new Date().toISOString(),
            expiryDate: expiry.toISOString(),
            paymentId: payment.id,
            orderId: payment.order_id,
            freePassClaimed: false
          },
          passStatus: 'active',
          status: planId,
          planTier: Number(planData?.tier || 1),
          passExpiresAt: expiry.toISOString(),
          updatedAt: serverTimestamp()
        }, { merge: true });

        // Record in transaction ledger
        await setDoc(doc(db, "payment_requests", payment.id), {
          paymentId: payment.id,
          orderId: payment.order_id,
          userId,
          planId,
          amount: payment.amount / 100,
          status: 'captured',
          gateway: 'RAZORPAY_WEBHOOK',
          verified: true,
          createdAt: serverTimestamp()
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[RAZORPAY_WEBHOOK_ERROR]", error);
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}
