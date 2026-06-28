import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { initializeFirebase } from "@/firebase/app";
import { doc, getDoc } from "firebase/firestore";

/**
 * @fileOverview Institutional Razorpay Order Node v3.0.
 * FETCHES plan details from Firestore to prevent client-side price manipulation.
 */

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { planId, userId } = body;

    if (!planId || !userId) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID?.trim();
    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

    if (!keyId || !keySecret) {
      console.error("[CONFIG_ERROR] Razorpay credentials missing.");
      return NextResponse.json({ error: "Gateway configuration error." }, { status: 503 });
    }

    const { firestore: db } = initializeFirebase();

    // AUDIT: Fetch verified price from Registry
    const planRef = doc(db, "passes", planId);
    const planSnap = await getDoc(planRef);

    if (!planSnap.exists()) {
      return NextResponse.json({ error: "Invalid plan node." }, { status: 404 });
    }

    const plan = planSnap.data();
    const price = Number(plan?.price ?? 0);

    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json({ error: "Illegal price value detected." }, { status: 400 });
    }

    const amountInPaise = Math.round(price * 100);

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `ORD_${Date.now()}_${userId.slice(-6)}`,
      notes: {
        userId,
        planId,
        planName: String(plan?.name ?? "Cracklix Elite"),
      },
    });

    console.log(`[RAZORPAY_ORDER] Order created: ${order.id} for user: ${userId}`);

    return NextResponse.json({
      success: true,
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: keyId,
    });
  } catch (error: any) {
    console.error("[RAZORPAY_ORDER_ERROR]", error);
    return NextResponse.json({ error: "Order initialization failed." }, { status: 500 });
  }
}
