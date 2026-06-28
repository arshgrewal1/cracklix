import { NextResponse } from "next/server";
import crypto from "crypto";
import Razorpay from "razorpay";
import { initializeFirebase } from "@/firebase/app";
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from "firebase/firestore";

/**
 * @fileOverview Institutional Verification Node v4.0.
 * ENSURES pass activation only after HMAC verification and Razorpay payment fetch.
 */

export async function POST(req: Request) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      planId,
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !userId || !planId) {
      return NextResponse.json({ error: "Audit failed: Missing verification tokens." }, { status: 400 });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const keyId = process.env.RAZORPAY_KEY_ID;

    if (!keyId || !keySecret) {
      return NextResponse.json({ error: "Gateway configuration missing." }, { status: 500 });
    }

    // 1. CRYPTOGRAPHIC HANDSHAKE (HMAC SHA256)
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.error(`[RAZORPAY_VERIFY_FAILED] Invalid signature for user ${userId}`);
      return NextResponse.json({ error: "Signature mismatch. Unauthorized attempt." }, { status: 400 });
    }

    const { firestore: db } = initializeFirebase();

    // 2. DUPLICATE VERIFICATION SHIELD
    const paymentRef = doc(db, "payment_requests", razorpay_payment_id);
    const paymentSnap = await getDoc(paymentRef);

    if (paymentSnap.exists()) {
      return NextResponse.json({ success: true, message: "Transaction already processed." });
    }

    // 3. SERVER-TO-SERVER PAYMENT AUDIT
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    if (payment.status !== "captured" && payment.status !== "authorized") {
      return NextResponse.json({ error: "Payment was not captured successfully." }, { status: 400 });
    }

    // 4. REGISTRY SYNC: Activate Pass
    const planSnap = await getDoc(doc(db, "passes", planId));
    if (!planSnap.exists()) throw new Error("Plan not found during activation.");
    
    const plan = planSnap.data();
    const duration = Number(plan.durationDays ?? 30);
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + duration);

    const amount = typeof payment.amount === 'number' ? payment.amount / 100 : Number(payment.amount) / 100;

    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      pass: {
        active: true,
        plan: plan.name,
        purchaseDate: new Date().toISOString(),
        expiryDate: expiryDate.toISOString(),
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
      },
      passStatus: "active",
      status: planId,
      passExpiresAt: expiryDate.toISOString(),
      updatedAt: serverTimestamp(),
    });

    // 5. LEDGER SYNC
    await setDoc(paymentRef, {
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      signature: razorpay_signature,
      userId,
      planId,
      amount,
      currency: String(payment.currency || "INR"),
      gateway: "RAZORPAY",
      status: String(payment.status),
      email: String(payment.email || ""),
      contact: String(payment.contact || ""),
      createdAt: serverTimestamp(),
    });

    console.log(`[RAZORPAY_VERIFY_SUCCESS] Pass activated for ${userId}`);

    return NextResponse.json({ success: true, paymentId: razorpay_payment_id });
  } catch (error: any) {
    console.error("[RAZORPAY_VERIFY_ERROR]", error);
    return NextResponse.json({ error: error?.message || "Verification hub error." }, { status: 500 });
  }
}
