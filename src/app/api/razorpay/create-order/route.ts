import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { initializeFirebase } from "@/firebase/app";
import { doc, getDoc } from "firebase/firestore";

/**
 * Razorpay Order API (Production Pro v6.0)
 * Logic: Strictly audit plan prices from Firestore to prevent client-side tampering.
 */

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { planId, userId } = body;

    console.log("[RAZORPAY_ORDER_REQUEST]", { planId, userId });

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
    const price = Number(planData?.price);

    if (isNaN(price) || price <= 0) {
      return NextResponse.json(
        { success: false, reason: "Invalid price configuration in registry." },
        { status: 400 }
      );
    }

    // 2. Razorpay Order Node Creation
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
