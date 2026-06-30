import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { initializeFirebase } from "@/firebase/app";
import { doc, getDoc } from "firebase/firestore";

/**
 * Razorpay Order API (Production Hardened v18.2)
 * FIXED: Safe environment variable access and NaN price protection.
 */
export async function POST(req: Request) {
  try {
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ success: false, reason: "Malformed request body." }, { status: 400 });
    }

    const { planId, userId } = body;

    if (!planId || !userId) {
      return NextResponse.json({ success: false, reason: "Incomplete identity tokens." }, { status: 400 });
    }

    const keyId = (process.env.RAZORPAY_KEY_ID || "").trim();
    const keySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim();

    if (!keyId || !keySecret || !keyId.startsWith('rzp_')) {
      console.error("[RAZORPAY_ORDER] Environment anomaly: Missing or invalid keys.");
      return NextResponse.json({ 
        success: false, 
        reason: "Internal configuration error.",
        detail: "Razorpay keys are missing or misconfigured in the environment registry."
      }, { status: 503 });
    }

    const { firestore: db } = initializeFirebase();
    const planRef = doc(db, "passes", planId);
    const planSnap = await getDoc(planRef);

    if (!planSnap.exists()) {
      return NextResponse.json({ success: false, reason: "Plan not found in registry." }, { status: 404 });
    }

    const plan = planSnap.data();
    const price = Number(plan?.price);

    if (isNaN(price) || price < 0) {
      return NextResponse.json({ success: false, reason: "Invalid price node detected." }, { status: 400 });
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const amountInPaise = Math.round(price * 100);

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `ORD_${Date.now()}_${String(userId).slice(-5)}`,
      notes: { userId, planId, planName: plan.name || "Elite Pass" },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: keyId,
    });

  } catch (err: any) {
    console.error("[RAZORPAY_CRITICAL_FAILURE]", err);
    const errorDetail = err?.error?.description || err?.message || "Unknown gateway error";
    return NextResponse.json({ 
      success: false, 
      reason: "Internal server error during order creation.",
      error: errorDetail
    }, { status: 500 });
  }
}
