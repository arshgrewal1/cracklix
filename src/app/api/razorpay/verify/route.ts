import { NextResponse } from "next/server";
import crypto from "crypto";
import Razorpay from "razorpay";
import { initializeFirebase } from "@/firebase/app";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

/**
 * Razorpay Verification Node (Pro Anti-Fraud v6.4)
 * FIXED: Hardened environment variable retrieval and signature verification logic.
 */

export async function POST(req: Request) {
  try {
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ success: false, reason: "Invalid payload format." }, { status: 400 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, planId } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !userId || !planId) {
      return NextResponse.json({ success: false, reason: "Incomplete payment verification tokens." }, { status: 400 });
    }

    const keyId = (process.env.RAZORPAY_KEY_ID || "").trim();
    const keySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim();

    if (!keyId || !keySecret) {
      console.error("[RAZORPAY_VERIFY] Missing credentials in environment.");
      return NextResponse.json({ success: false, reason: "Internal server configuration error." }, { status: 500 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ success: false, reason: "Security signature mismatch. Transaction could not be verified." }, { status: 400 });
    }

    const { firestore: db } = initializeFirebase();
    const paymentRef = doc(db, "payment_requests", razorpay_payment_id);
    const paymentSnap = await getDoc(paymentRef);

    if (paymentSnap.exists() && paymentSnap.data().verified) {
       return NextResponse.json({ success: true, message: "Transaction already synced and verified." });
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    const paymentStatus = String((payment as any).status || "").toLowerCase();

    if (!["captured", "authorized"].includes(paymentStatus)) {
       return NextResponse.json({ success: false, reason: `Invalid gateway status: ${paymentStatus}` }, { status: 400 });
    }

    const planRef = doc(db, "passes", planId);
    const planSnap = await getDoc(planRef);
    if (!planSnap.exists()) {
       return NextResponse.json({ success: false, reason: "Requested plan node not found in registry." }, { status: 404 });
    }

    const planData = planSnap.data();
    const duration = Number(planData.durationDays || 30);
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + duration);

    const userRef = doc(db, "users", userId);
    await setDoc(userRef, {
      pass: {
        active: true,
        plan: planData.name || String(planId).toUpperCase(),
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

    await setDoc(paymentRef, {
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      userId,
      planId,
      amount: Number(payment.amount) / 100,
      currency: payment.currency || "INR",
      gateway: "RAZORPAY",
      status: paymentStatus,
      email: payment.email || "",
      contact: payment.contact || "",
      verified: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return NextResponse.json({ success: true, orderId: razorpay_order_id });

  } catch (error: any) {
    console.error("[RAZORPAY_VERIFY_EXCEPTION]", error);
    return NextResponse.json({ success: false, error: "Critical internal verification failure.", detail: error.message }, { status: 500 });
  }
}
