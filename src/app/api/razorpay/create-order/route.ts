import { NextResponse } from "next/next/server";
import Razorpay from "razorpay";
import { initializeFirebase } from "@/firebase/app";
import { doc, getDoc } from "firebase/firestore";

/**
 * Razorpay Order API (Production Hardened v5.5)
 * FIXED: Explicit diagnostic logging and detailed error reporting.
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
      console.error("[RAZORPAY_CONFIG_ERROR] Environment variables missing in deployment.");
      return NextResponse.json(
        { 
          success: false, 
          reason: "Payment gateway configuration missing. Check RAZORPAY_KEY_ID and SECRET.",
          debug: { id: !!keyId, secret: !!keySecret }
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
      console.error("[INVALID_PRICE]", { price });
      return NextResponse.json(
        { success: false, reason: "Selected plan has an invalid price configuration in Firestore." },
        { status: 400 }
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const amountInPaise = Math.round(price * 100);

    let order;
    try {
      order = await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: `ORD_${Date.now()}_${userId.slice(-6)}`,
        notes: {
          userId,
          planId,
          planName: planData.name || "Elite Pass",
        },
      });
    } catch (rzpError: any) {
      console.error("[RAZORPAY_SDK_CRASH]", rzpError);
      return NextResponse.json(
        { 
          success: false, 
          error: "Razorpay SDK rejected order creation.", 
          reason: rzpError.description || rzpError.message,
          metadata: rzpError.metadata 
        },
        { status: 500 }
      );
    }

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
      stack: error?.stack
    });

    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Internal payment processing error.",
        reason: "The server encountered an unhandled exception while contacting Razorpay."
      },
      { status: 500 }
    );
  }
}
