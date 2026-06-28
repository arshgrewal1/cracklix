
import { NextResponse } from "next/server";
import crypto from "crypto";
import { initializeFirebase } from "@/firebase/app";
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from "firebase/firestore";

/**
 * @fileOverview Institutional Verification Node v4.1.
 * ENSURES pass activation only after HMAC verification.
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

    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim() || "FfSx6bUYZPGM2Om052kshxNO";

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

    // 2. REGISTRY SYNC: Activate Pass
    const planSnap = await getDoc(doc(db, "passes", planId));
    if (!planSnap.exists()) throw new Error("Plan not found during activation.");
    
    const plan = planSnap.data();
    const duration = Number(plan.durationDays ?? 30);
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + duration);

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

    // 3. LEDGER SYNC
    const paymentRef = doc(db, "payment_requests", razorpay_payment_id);
    await setDoc(paymentRef, {
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      signature: razorpay_signature,
      userId,
      planId,
      amount: plan.price,
      gateway: "RAZORPAY",
      status: "APPROVED",
      createdAt: serverTimestamp(),
    });

    return NextResponse.json({ success: true, paymentId: razorpay_payment_id });
  } catch (error: any) {
    console.error("[RAZORPAY_VERIFY_ERROR]", error);
    return NextResponse.json({ error: error?.message || "Verification hub error." }, { status: 500 });
  }
}
