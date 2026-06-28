
import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { initializeFirebase } from "@/firebase/app";
import { doc, getDoc } from "firebase/firestore";

/**
 * @fileOverview Hardened Razorpay Order Node v4.0.
 * Includes explicit diagnostic logging and verified plan auditing.
 */

export async function POST(req: Request) {
  console.log("[RAZORPAY_ORDER] Incoming request received.");

  try {
    const keyId = process.env.RAZORPAY_KEY_ID?.trim();
    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

    if (!keyId || !keySecret) {
      console.error("[RAZORPAY_ORDER] Configuration missing in environment.");
      return NextResponse.json({ 
        error: "Gateway configuration error", 
        reason: "Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET in environment variables." 
      }, { status: 503 });
    }

    const body = await req.json();
    const { planId, userId } = body;
    console.log("[RAZORPAY_ORDER] Context:", { planId, userId });

    if (!planId || !userId) {
      return NextResponse.json({ error: "Missing required fields.", reason: "userId and planId are mandatory." }, { status: 400 });
    }

    const { firestore: db } = initializeFirebase();

    // 1. Audit Plan from Firestore Registry
    const planRef = doc(db, "passes", planId);
    const planSnap = await getDoc(planRef);

    if (!planSnap.exists()) {
      console.error("[RAZORPAY_ORDER] Plan document not found in registry:", planId);
      return NextResponse.json({ error: "Plan not found", reason: `Document 'passes/${planId}' does not exist in Firestore.` }, { status: 404 });
    }

    const plan = planSnap.data();
    const price = Number(plan?.price ?? 0);

    if (price < 1) {
      console.error("[RAZORPAY_ORDER] Invalid plan price detected:", price);
      return NextResponse.json({ error: "Invalid pricing", reason: "The plan price must be at least ₹1." }, { status: 400 });
    }

    // 2. Initialize Razorpay with strict credentials
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const amountInPaise = Math.round(price * 100);
    console.log("[RAZORPAY_ORDER] Attempting order creation for amount:", amountInPaise);

    // 3. Create Order via Razorpay SDK
    try {
      const order = await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: `ORD_${Date.now()}_${userId.slice(-6)}`,
        notes: {
          userId,
          planId,
          planName: String(plan?.name ?? "Elite Pass"),
        },
      });

      console.log("[RAZORPAY_ORDER] Success:", order.id);

      return NextResponse.json({
        success: true,
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        key: keyId,
      });
    } catch (rzpError: any) {
      console.error("[RAZORPAY_SDK_ERROR]", rzpError);
      return NextResponse.json({ 
        error: "Razorpay SDK Failure", 
        reason: rzpError.description || rzpError.message,
        metadata: rzpError.metadata || null,
        statusCode: rzpError.statusCode || 500
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error("[RAZORPAY_ORDER_CRITICAL]", error);
    return NextResponse.json({ error: "Internal Server Error", reason: error.message }, { status: 500 });
  }
}
