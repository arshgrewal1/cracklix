import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { initializeFirebase } from "@/firebase/app";
import { doc, getDoc } from "firebase/firestore";
import { logEvent } from "@/lib/logger";

/**
 * Razorpay Order API (SaaS Lifecycle Hardened v11.0)
 * Security: Origin validation, Smart Plan Lock (Allows Upgrades/Renewals), and real-time logging.
 */
export async function POST(req: Request) {
  try {
    const { planId, userId, couponCode } = await req.json();

    if (!planId || !userId) {
      return NextResponse.json({ error: "Missing identity tokens." }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      await logEvent({ type: "critical", message: "Razorpay environment variables missing." });
      return NextResponse.json({ error: "Server configuration anomaly." }, { status: 503 });
    }

    const { firestore: db } = initializeFirebase();

    // 1. SMART SUBSCRIPTION GUARD (Allow Upgrades/Renewals)
    const userPassRef = doc(db, "user_passes", userId);
    const userPassSnap = await getDoc(userPassRef);
    
    if (userPassSnap.exists()) {
      const currentPass = userPassSnap.data();
      const isActive = currentPass.active && currentPass.expiry > Date.now();
      
      // Only block if trying to buy the SAME plan that is already active
      if (isActive && currentPass.planId === planId) {
        return NextResponse.json({ 
          error: "You already have this Elite Pass active. You can renew once it expires." 
        }, { status: 400 });
      }
    }

    // 2. PLAN REGISTRY AUDIT
    const planRef = doc(db, "passes", planId);
    const planSnap = await getDoc(planRef);

    if (!planSnap.exists()) {
      return NextResponse.json({ error: "Pass tier not found in registry." }, { status: 404 });
    }

    const plan = planSnap.data();
    let price = Number(plan?.price);

    // 3. COUPON VALIDATION
    if (couponCode) {
      const couponRef = doc(db, "coupons", couponCode.toUpperCase());
      const couponSnap = await getDoc(couponRef);
      if (couponSnap.exists() && couponSnap.data().active) {
        const cData = couponSnap.data();
        const discount = cData.type === 'percent' ? (price * cData.discount) / 100 : cData.discount;
        price = Math.max(1, price - discount);
      }
    }

    // 4. RAZORPAY HANDSHAKE
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const order = await razorpay.orders.create({
      amount: Math.round(price * 100),
      currency: "INR",
      receipt: `ORD_${Date.now()}_${userId.slice(-5)}`,
      notes: { userId, planId, planName: plan.name },
    });

    // 5. LOGGING & TRACING
    await logEvent({
       type: "payment",
       message: "Order created successfully",
       userId,
       planId,
       metadata: { orderId: order.id, amount: price }
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: keyId,
    });
  } catch (error: any) {
    console.error("[RAZORPAY_CREATE_ERROR]", error);
    await logEvent({ type: "error", message: error.message, stack: error.stack });
    return NextResponse.json({ error: error.message || "Order creation failure" }, { status: 500 });
  }
}
