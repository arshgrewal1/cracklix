import { NextResponse } from "next/server";
import crypto from "crypto";
import Razorpay from "razorpay";
import { initializeFirebase } from "@/firebase/app";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      planId,
    } = await req.json();

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !userId ||
      !planId
    ) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: "Razorpay configuration missing." },
        { status: 500 }
      );
    }

    // Verify Signature
    const expected = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expected !== razorpay_signature) {
      return NextResponse.json(
        { error: "Invalid payment signature." },
        { status: 400 }
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // Verify payment from Razorpay
    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    if (
      payment.status !== "captured" &&
      payment.status !== "authorized"
    ) {
      return NextResponse.json(
        { error: "Payment not captured." },
        { status: 400 }
      );
    }

    const { firestore: db } = initializeFirebase();

    // Duplicate protection
    const paymentRef = doc(db, "payment_requests", razorpay_payment_id);

    const paymentSnap = await getDoc(paymentRef);

    if (paymentSnap.exists()) {
      return NextResponse.json({
        success: true,
        message: "Payment already verified.",
      });
    }

    // Plan
    const planRef = doc(db, "passes", planId);
    const planSnap = await getDoc(planRef);

    if (!planSnap.exists()) {
      return NextResponse.json(
        { error: "Plan not found." },
        { status: 404 }
      );
    }

    const plan = planSnap.data();

    const duration = Number(plan.durationDays ?? 30);

    const expiry = new Date();
    expiry.setDate(expiry.getDate() + duration);

    // Activate Pass
    await setDoc(
      doc(db, "users", userId),
      {
        pass: {
          active: true,
          plan: plan.name,
          purchaseDate: new Date().toISOString(),
          expiryDate: expiry.toISOString(),
          paymentId: razorpay_payment_id,
          orderId: razorpay_order_id,
        },

        passStatus: "active",
        status: planId,
        passExpiresAt: expiry.toISOString(),

        updatedAt: serverTimestamp(),
      },
      {
        merge: true,
      }
    );

    // Save Payment
    await setDoc(paymentRef, {
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      signature: razorpay_signature,

      userId,
      planId,

      amount: payment.amount / 100,
      currency: payment.currency,

      gateway: "RAZORPAY",

      status: payment.status,

      email: payment.email ?? "",
      contact: payment.contact ?? "",

      createdAt: serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      paymentId: razorpay_payment_id,
    });
  } catch (err: any) {
    console.error(err);

    return NextResponse.json(
      {
        error: err.message || "Verification failed.",
      },
      {
        status: 500,
      }
    );
  }
}