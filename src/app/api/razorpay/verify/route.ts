import { NextResponse } from "next/server";
import crypto from "crypto";
import Razorpay from "razorpay";
import { initializeFirebase } from "@/firebase/app";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

/**
 * Razorpay Verification Node (Pro Anti-Fraud v6.2)
 * Logic: Mandatory HMAC-SHA256 signature verification + Idempotency Check.
 */

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, planId } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !userId || !planId) {
      return NextResponse.json({ success: false, reason: "Incomplete payment tokens received." }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID?.trim();
    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

    if (!keyId || !keySecret) {
      return NextResponse.json({ success: false, reason: "Server configuration error." }, { status: 500 });
    }

    // 1. SIGNATURE VERIFICATION (Anti-Tampering)
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.error("[RAZORPAY_VERIFY] Security signature mismatch.");
      return NextResponse.json({ success: false, reason: "Security signature mismatch." }, { status: 400 });
    }

    const { firestore: db } = initializeFirebase();

    // 2. IDEMPOTENCY CHECK (Anti-Duplicate)
    const paymentRef = doc(db, "payment_requests", razorpay_payment_id);
    const paymentSnap = await getDoc(paymentRef);

    if (paymentSnap.exists() && paymentSnap.data().verified) {
       console.log(`[RAZORPAY_VERIFY] Payment ${razorpay_payment_id} already processed. Skipping.`);
       return NextResponse.json({ success: true, message: "Payment already verified." });
    }

    // 3. SERVER-TO-SERVER AUDIT
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    const paymentStatus = String((payment as any).status).toLowerCase();

    if (!["captured", "authorized"].includes(paymentStatus)) {
       return NextResponse.json({ success: false, reason: `Invalid payment status: ${paymentStatus}` }, { status: 400 });
    }

    // 4. PLAN AUDIT & ACTIVATION
    const planRef = doc(db, "passes", planId);
    const planSnap = await getDoc(planRef);
    if (!planSnap.exists()) return NextResponse.json({ success: false, reason: "Plan node lost in registry." }, { status: 404 });

    const planData = planSnap.data();
    const duration = Number(planData.durationDays || 30);
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + duration);

    const userRef = doc(db, "users", userId);
    await setDoc(userRef, {
      pass: {
        active: true,
        plan: planData.name || planId.toUpperCase(),
        purchaseDate: new Date().toISOString(),
        expiryDate: expiry.toISOString(),
        paymentId: razorpay_payment_id,
        order_id: razorpay_order_id,
        freePassClaimed: false
      },
      passStatus: 'active',
      status: planId,
      planTier: Number(planData.tier || 1),
      passExpiresAt: expiry.toISOString(),
      updatedAt: serverTimestamp()
    }, { merge: true });

    // 5. TRANSACTION LOGGING
    await setDoc(paymentRef, {
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      userId,
      planId,
      amount: Number(payment.amount) / 100,
      currency: payment.currency,
      gateway: "RAZORPAY",
      status: paymentStatus,
      email: payment.email,
      contact: payment.contact,
      verified: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return NextResponse.json({ success: true, orderId: razorpay_order_id });

  } catch (error: any) {
    console.error("[RAZORPAY_VERIFY_EXCEPTION]", error);
    return NextResponse.json({ success: false, error: error?.message || "Verification failed." }, { status: 500 });
  }
}