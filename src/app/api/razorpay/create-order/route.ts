
import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { initializeFirebase } from "@/firebase/app";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

/**
 * Razorpay Order API (Startup Hardened v8.0)
 * Logic: Audit plan prices, block duplicate subscriptions, and log attempt.
 */

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { planId, userId, couponCode } = body;

    console.log("[RAZORPAY_ORDER_AUDIT]", { planId, userId });

    if (!planId || !userId) {
      return NextResponse.json(
        { success: false, reason: "Missing identification tokens." },
        { status: 400 }
      );
    }

    const keyId = process.env.RAZORPAY_KEY_ID?.trim();
    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { success: false, reason: "Payment config node missing in environment." },
        { status: 503 }
      );
    }

    const { firestore: db } = initializeFirebase();

    // 1. ACTIVE PLAN LOCK (Anti-Abuse)
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
       const userData = userSnap.data();
       const now = new Date();
       if (userData.passStatus === 'active' && userData.passExpiresAt && new Date(userData.passExpiresAt) > now) {
          return NextResponse.json(
            { success: false, reason: "You already have an active elite hub pass." },
            { status: 400 }
          );
       }
    }

    // 2. PLAN AUDIT
    const planRef = doc(db, "passes", planId);
    const planSnap = await getDoc(planRef);

    if (!planSnap.exists()) {
      return NextResponse.json(
        { success: false, reason: "Plan node not found in canonical registry." },
        { status: 404 }
      );
    }

    const planData = planSnap.data();
    let price = Number(planData?.price);

    if (isNaN(price) || price < 0) {
      return NextResponse.json(
        { success: false, reason: "Invalid price registry for this vertical." },
        { status: 400 }
      );
    }

    // 3. COUPON VERIFICATION
    let appliedDiscount = 0;
    if (couponCode) {
      const couponRef = doc(db, "coupons", couponCode.toUpperCase());
      const couponSnap = await getDoc(couponRef);
      if (couponSnap.exists() && couponSnap.data().active) {
        const cData = couponSnap.data();
        if (cData.type === 'percent') {
          appliedDiscount = (price * cData.discount) / 100;
        } else {
          appliedDiscount = cData.discount;
        }
        price = Math.max(1, price - appliedDiscount);
      }
    }

    // 4. RAZORPAY INITIALIZATION
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const order = await razorpay.orders.create({
      amount: Math.round(price * 100),
      currency: "INR",
      receipt: `ORD_${Date.now()}_${userId.slice(-6)}`,
      notes: { userId, planId, planName: planData.name || "Elite Pass" },
    });

    // 5. AUDIT LOGGING
    await setDoc(doc(db, "payment_logs", order.id), {
       orderId: order.id,
       userId,
       planId,
       amount: price,
       status: "created",
       ip: req.headers.get("x-forwarded-for") || "direct",
       createdAt: serverTimestamp()
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: keyId,
    });

  } catch (error: any) {
    console.error("[RAZORPAY_CREATE_CRITICAL]", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Order creation node failure" },
      { status: 500 }
    );
  }
}
