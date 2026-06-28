import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { initializeFirebase } from "@/firebase/app";
import { doc, getDoc } from "firebase/firestore";

/**
 * Razorpay Order API (Production Hardened v17.0)
 * Security: Strict price validation, environment auditing, and detailed diagnostic logging.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { planId, userId } = body;

    console.log("[RAZORPAY_ORDER] Incoming request:", { planId, userId });

    if (!planId || !userId) {
      return NextResponse.json({ success: false, reason: "Incomplete identity tokens." }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID?.trim();
    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

    if (!keyId || !keySecret || keyId === "" || keySecret === "") {
      console.error("[RAZORPAY_ORDER] Environment anomaly: Missing or empty keys.");
      return NextResponse.json({ success: false, reason: "Invalid Razorpay API Keys" }, { status: 503 });
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

    // Initialize Razorpay SDK
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // Amount must be in Paise (Sub-units)
    const amountInPaise = Math.round(price * 100);

    console.log("[RAZORPAY_ORDER] Creating order for amount:", amountInPaise);

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `ORD_${Date.now()}_${userId.slice(-5)}`,
      notes: { userId, planId, planName: plan.name },
    });

    console.log("[RAZORPAY_ORDER] Order Created Successfully:", order.id);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: keyId,
    });

  } catch (err: any) {
    console.error("[RAZORPAY_CRITICAL_FAILURE]", err);
    
    // Check for specific Razorpay auth errors
    const errorMessage = err?.message || "";
    if (errorMessage.toLowerCase().includes("api key") || errorMessage.toLowerCase().includes("secret")) {
       return NextResponse.json({ success: false, reason: "Invalid Razorpay API Keys" }, { status: 401 });
    }

    return NextResponse.json({ 
      success: false, 
      reason: err?.description || err?.message || "Internal payment node failure."
    }, { status: 500 });
  }
}
