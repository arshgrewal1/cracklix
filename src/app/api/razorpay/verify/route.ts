
import { NextResponse } from "next/server";
import crypto from "crypto";
import { initializeFirebase } from "@/firebase/app";
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import Razorpay from "razorpay";

/**
 * @fileOverview Hardened Razorpay Verification Node v5.0.
 * Includes detailed diagnostic logging and server-side status auditing.
 */

export async function POST(req: Request) {
  console.log("[RAZORPAY_VERIFY] Incoming verification request...");
  
  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      planId,
    } = body;

    console.log("[RAZORPAY_VERIFY] Payload parameters received:", { 
      orderId: razorpay_order_id, 
      paymentId: razorpay_payment_id, 
      userId, 
      planId 
    });

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !userId || !planId) {
      console.error("[RAZORPAY_VERIFY] Missing required fields in request body.");
      return NextResponse.json({ success: false, reason: "Missing verification tokens." }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID?.trim();
    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

    if (!keyId || !keySecret) {
      console.error("[RAZORPAY_VERIFY] RAZORPAY_KEY_ID or SECRET missing from environment.");
      return NextResponse.json({ success: false, reason: "Gateway configuration error." }, { status: 500 });
    }

    // 1. CRYPTOGRAPHIC HANDSHAKE (HMAC SHA256)
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    console.log("[RAZORPAY_VERIFY] Signature Audit:", {
      received: razorpay_signature,
      expected: expectedSignature,
      match: expectedSignature === razorpay_signature
    });

    if (expectedSignature !== razorpay_signature) {
      console.error("[RAZORPAY_VERIFY] Signature mismatch detected.");
      return NextResponse.json({ success: false, reason: "Security signature mismatch." }, { status: 400 });
    }

    // 2. SECONDARY AUDIT: Verify payment status directly with Razorpay
    const rzp = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const payment = await rzp.payments.fetch(razorpay_payment_id);
    
    console.log("[RAZORPAY_VERIFY] Razorpay Payment Status:", payment.status);

    if (payment.status !== 'captured' && payment.status !== 'authorized') {
       return NextResponse.json({ success: false, reason: `Payment status is ${payment.status}. Expected captured.` }, { status: 400 });
    }

    const { firestore: db } = initializeFirebase();

    // 3. REGISTRY SYNC: Activate Pass
    const planRef = doc(db, "passes", planId);
    const planSnap = await getDoc(planRef);
    
    if (!planSnap.exists()) {
      console.error("[RAZORPAY_VERIFY] Plan ID not found in Firestore passes collection.");
      throw new Error("Target plan node not found.");
    }
    
    const plan = planSnap.data();
    const duration = Number(plan.durationDays ?? 30);
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + duration);

    console.log("[RAZORPAY_VERIFY] Updating user document:", userId);
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      pass: {
        active: true,
        plan: plan.name,
        purchaseDate: new Date().toISOString(),
        expiryDate: expiryDate.toISOString(),
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        freePassClaimed: false
      },
      passStatus: "active",
      status: planId,
      planTier: plan.tier || 1,
      passExpiresAt: expiryDate.toISOString(),
      updatedAt: serverTimestamp(),
    });

    // 4. LEDGER LOGGING
    console.log("[RAZORPAY_VERIFY] Writing payment request record...");
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
      updatedAt: serverTimestamp()
    });

    console.log("[RAZORPAY_VERIFY] Verification flow completed successfully.");
    return NextResponse.json({ success: true, paymentId: razorpay_payment_id });
  } catch (error: any) {
    console.error("[RAZORPAY_VERIFY_FATAL_ERROR]", error);
    return NextResponse.json({ success: false, reason: error?.message || "Internal registry error." }, { status: 500 });
  }
}
