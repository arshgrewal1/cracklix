import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { initializeFirebase } from "@/firebase/app";
import { doc, getDoc } from "firebase/firestore";

/**
 * Razorpay Order API (Production Hardened v5.3)
 * Optimized for diagnostic visibility and secure price auditing.
 */

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { planId, userId } = body;

    console.log("[RAZORPAY_ORDER_REQUEST]", { planId, userId });

    if (!planId || !userId) {
      return NextResponse.json(
        { success: false, reason: "Missing planId or userId in request payload." },
        { status: 400 }
      );
    }

    const keyId = process.env.RAZORPAY_KEY_ID?.trim();
    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

    if (!keyId || !keySecret) {
      console.error("[RAZORPAY_CONFIG_ERROR] Environment variables missing.");
      return NextResponse.json(
        { 
          success: false, 
          reason: "Payment gateway configuration is missing on server. Verify RAZORPAY_KEY_ID and SECRET." 
        },
        { status: 503 }
      );
    }

    const { firestore: db } = initializeFirebase();

    // Securely fetch plan from Firestore to prevent tampering
    const planRef = doc(db, "passes", planId);
    const planSnap = await getDoc(planRef);

    if (!planSnap.exists()) {
      console.error(`[PLAN_NOT_FOUND] ${planId}`);
      return NextResponse.json(
        { success: false, reason: `Plan node [${planId}] not found in registry.` },
        { status: 404 }
      );
    }

    const planData = planSnap.data();
    const price = Number(planData?.price);

    if (isNaN(price) || price <= 0) {
      return NextResponse.json(
        { success: false, reason: "Selected plan has an invalid price configuration." },
        { status: 400 }
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const amountInPaise = Math.round(price * 100);

    const orderOptions = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `ORD_${Date.now()}_${userId.slice(-6)}`,
      notes: {
        userId,
        planId,
        planName: planData.name || "Elite Pass",
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
    console.error("[RAZORPAY_ORDER_CRITICAL_FAILURE]", {
      message: error?.message,
      stack: error?.stack,
      raw: error
    });

    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Internal payment processing error.",
        reason: error?.description || error?.message || "The server encountered a failure while contacting Razorpay.",
        code: error?.code || "INTERNAL_ERROR"
      },
      { status: 500 }
    );
  }
}
