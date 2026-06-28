import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { initializeFirebase } from "@/firebase/app";
import { doc, getDoc } from "firebase/firestore";

/**
 * Razorpay Order API (Production Pro v7.0)
 * Logic: Strictly audit plan prices from Firestore and apply valid coupons.
 */

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { planId, userId, couponCode } = body;

    console.log("[RAZORPAY_ORDER_REQUEST]", { planId, userId, couponCode });

    if (!planId || !userId) {
      return NextResponse.json(
        { success: false, reason: "Missing planId or userId." },
        { status: 400 }
      );
    }

    const keyId = process.env.RAZORPAY_KEY_ID?.trim();
    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { success: false, reason: "Payment configuration missing in server environment." },
        { status: 503 }
      );
    }

    const { firestore: db } = initializeFirebase();

    // 1. Plan Integrity Audit
    const planRef = doc(db, "passes", planId);
    const planSnap = await getDoc(planRef);

    if (!planSnap.exists()) {
      return NextResponse.json(
        { success: false, reason: `Plan node [${planId}] not found in registry.` },
        { status: 404 }
      );
    }

    const planData = planSnap.data();
    let price = Number(planData?.price);

    if (isNaN(price) || price < 0) {
      return NextResponse.json(
        { success: false, reason: "Invalid price configuration in registry." },
        { status: 400 }
      );
    }

    // 2. Apply Coupon Logic (Server-side)
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
        price = Math.max(1, price - appliedDiscount); // Minimum 1 rupee
      }
    }

    // 3. Razorpay Order Node Creation
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const order = await razorpay.orders.create({
      amount: Math.round(price * 100),
      currency: "INR",
      receipt: `ORD_${Date.now()}_${userId.slice(-6)}`,
      notes: { userId, planId, couponCode: couponCode || "", planName: planData.name || "Elite Pass" },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: keyId,
    });

  } catch (error: any) {
    console.error("[RAZORPAY_ORDER_CRITICAL]", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Order creation failed" },
      { status: 500 }
    );
  }
}
