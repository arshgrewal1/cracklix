import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { initializeFirebase } from "@/firebase/app";
import { doc, getDoc } from "firebase/firestore";

/**
 * Razorpay Order API (Production Safe v4.2)
 * Hardened diagnostic logging and Firestore price audit.
 */

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { planId, userId } = body;

    console.log("[RAZORPAY_ORDER_REQUEST]", { planId, userId });

    if (!planId || !userId) {
      return NextResponse.json(
        { success: false, reason: "Missing planId or userId" },
        { status: 400 }
      );
    }

    const keyId = process.env.RAZORPAY_KEY_ID?.trim();
    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

    if (!keyId || !keySecret) {
      console.error("[RAZORPAY_CONFIG_ERROR] Environment variables missing");
      return NextResponse.json(
        {
          success: false,
          reason: "Razorpay environment variables missing in production node.",
        },
        { status: 500 }
      );
    }

    const { firestore: db } = initializeFirebase();

    // Fetch canonical plan from Firestore to prevent client-side price manipulation
    const planRef = doc(db, "passes", planId);
    const planSnap = await getDoc(planRef);

    if (!planSnap.exists()) {
      return NextResponse.json(
        { success: false, reason: `Plan document [${planId}] not found in registry.` },
        { status: 404 }
      );
    }

    const plan = planSnap.data();
    const price = Number(plan?.price);

    if (!price || isNaN(price) || price < 1) {
      return NextResponse.json(
        {
          success: false,
          reason: "Invalid plan price detected in registry audit.",
        },
        { status: 400 }
      );
    }

    const amountInPaise = Math.round(price * 100);

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const orderOptions = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `ORD_${Date.now()}_${userId?.slice?.(-6) ?? "user"}`,
      notes: {
        userId,
        planId,
        planName: String(plan?.name ?? "Unknown Plan"),
      },
    };

    const order = await razorpay.orders.create(orderOptions);

    console.log("[RAZORPAY_ORDER_CREATED]", order.id);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: keyId,
    });
  } catch (error: any) {
    console.error("[RAZORPAY_ORDER_ERROR FULL]", {
      message: error?.message,
      stack: error?.stack,
      raw: error,
    });

    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Razorpay order failed",
      },
      { status: 500 }
    );
  }
}
