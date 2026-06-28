import { NextResponse } from "next/server";
import crypto from "crypto";
import { initializeFirebase } from "@/firebase/app";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";

/**
 * Razorpay Bank-Grade Webhook Hub (v2.0)
 * Security: HMCA-SHA256 Signature Handshake.
 * Logic: Auto-calculates 30-day preparation node expiry on capture.
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

    // 1. Signature Verification Handshake
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.warn("[WEBHOOK] Unauthorized Handshake Attempt Rejected.");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(body);
    const { firestore: db } = initializeFirebase();

    // 2. Process Successful Nodes
    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
      const userId = payment.notes?.userId;
      const planId = payment.notes?.planId;

      if (userId && planId) {
        console.log(`[WEBHOOK] Activating Pass: User ${userId} | Node ${planId}`);
        
        const now = Date.now();
        const durationMs = 30 * 24 * 60 * 60 * 1000; // 30 Days
        const expiry = now + durationMs;

        // A. Primary Subscription Node
        await setDoc(doc(db, "user_passes", userId), {
          planId,
          active: true,
          activatedAt: now,
          expiry: expiry,
          paymentId: payment.id,
          updatedAt: serverTimestamp()
        });

        // B. Legacy Profile Link (Backward Compatibility)
        const userRef = doc(db, "users", userId);
        await setDoc(userRef, {
          passStatus: 'active',
          passExpiresAt: new Date(expiry).toISOString(),
          status: planId,
          updatedAt: serverTimestamp()
        }, { merge: true });

        // C. Transaction Ledger Entry
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
    console.error("[RAZORPAY_WEBHOOK_EXCEPTION]", error);
    return NextResponse.json({ error: error?.message || "Internal Handshake Error" }, { status: 500 });
  }
}
