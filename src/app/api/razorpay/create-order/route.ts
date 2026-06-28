import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { initializeFirebase } from "@/firebase/app";
import { doc, getDoc } from "firebase/firestore";

/**
 * Razorpay Order API (Enterprise-Grade v12.0)
 * Security: Strict price validation, environment auditing, and detailed diagnostic logging.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { planId, userId } = body;

    console.log("[RAZORPAY_ORDER] Incoming request:", { planId, userId });

    if (!planId || !userId) {
      console.error("[RAZORPAY_ORDER] Validation failed: Missing planId or userId");
      return NextResponse.json({ success: false, reason: "Incomplete identity tokens." }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error("[RAZORPAY_ORDER] Environment anomaly: Keys not found in process.env");
      return NextResponse.json({ success: false, reason: "Server configuration anomaly: Missing API keys." }, { status: 503 });
    }

    const { firestore: db } = initializeFirebase();

    // 1. REGISTRY AUDIT: Verify plan and fetch official price
    console.log("[RAZORPAY_ORDER] Fetching plan from registry:", planId);
    const planRef = doc(db, "passes", planId);
    const planSnap = await getDoc(planRef);

    if (!planSnap.exists()) {
      console.error("[RAZORPAY_ORDER] Plan node not found:", planId);
      return NextResponse.json({ success: false, reason: "Plan not found in registry." }, { status: 404 });
    }

    const plan = planSnap.data();
    const price = Number(plan?.price);

    if (isNaN(price) || price <= 0) {
      console.error("[RAZORPAY_ORDER] Integrity violation: Invalid price node", { price });
      return NextResponse.json({ success: false, reason: "Invalid price node detected." }, { status: 400 });
    }

    // 2. INITIALIZE RAZORPAY
    let razorpay;
    try {
      razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });
    } catch (initErr: any) {
      console.error("[RAZORPAY_ORDER] Initialization failed:", initErr);
      return NextResponse.json({ success: false, reason: "Invalid Razorpay API Keys" }, { status: 500 });
    }

    // 3. CREATE ORDER (Amount in Paise)
    const amountInPaise = Math.round(price * 100);
    console.log("[RAZORPAY_ORDER] Creating order for amount:", amountInPaise);

    try {
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
    } catch (sdkErr: any) {
      console.error("[RAZORPAY_ORDER] SDK creation error:", sdkErr);
      const isAuthError = sdkErr.statusCode === 401;
      return NextResponse.json({ 
        success: false, 
        reason: isAuthError ? "Invalid Razorpay API Keys" : (sdkErr.description || sdkErr.message || "Gateway rejection.")
      }, { status: 500 });
    }

  } catch (globalErr: any) {
    console.error("[RAZORPAY_ORDER] Critical failure:", globalErr);
    return NextResponse.json({ success: false, reason: globalErr.message || "Internal payment node failure." }, { status: 500 });
  }
}
