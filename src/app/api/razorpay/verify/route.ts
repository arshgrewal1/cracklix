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
  console.log("[RAZORPAY_VERIFY] Incoming Request");

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      planId,
    } = await req.json();

    console.log({
      razorpay_order_id,
      razorpay_payment_id,
      userId,
      planId,
    });

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !userId ||
      !planId
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields.",
        },
        {
          status: 400,
        }
      );
    }

    const keyId = process.env.RAZORPAY_KEY_ID?.trim();
    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

    if (!keyId || !keySecret) {
      return NextResponse.json(
        {
          success: false,
          error: "Razorpay environment variables missing.",
        },
        {
          status: 500,
        }
      );
    }

    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    console.log("Generated Signature:", expectedSignature);
    console.log("Received Signature :", razorpay_signature);

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid payment signature.",
        },
        {
          status: 400,
        }
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const payment = await razorpay.payments.fetch(
      razorpay_payment_id
    );

    console.log(payment);

    const paymentStatus = String(
      (payment as any).status ?? ""
    ).toLowerCase();

    console.log("Payment Status:", paymentStatus);

    if (
      !["captured", "authorized"].includes(paymentStatus)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid payment status: ${paymentStatus}`,
        },
        {
          status: 400,
        }
      );
    }

    const { firestore: db } = initializeFirebase();

    const paymentRef = doc(
      db,
      "payment_requests",
      razorpay_payment_id
    );

    const paymentSnap = await getDoc(paymentRef);

    if (paymentSnap.exists()) {
      return NextResponse.json({
        success: true,
        message: "Payment already verified.",
      });
    }

    const planRef = doc(db, "passes", planId);

    const planSnap = await getDoc(planRef);

    if (!planSnap.exists()) {
      return NextResponse.json(
        {
          success: false,
          error: "Plan not found.",
        },
        {
          status: 404,
        }
      );
    }

    const plan = planSnap.data();

    const duration = Number(plan.durationDays ?? 30);

    const expiry = new Date();

    expiry.setDate(expiry.getDate() + duration);

    const paymentAmount =
      typeof (payment as any).amount === "number"
        ? (payment as any).amount
        : Number((payment as any).amount);
        const userRef = doc(db, "users", userId);

        await setDoc(
          userRef,
          {
            pass: {
              active: true,
              plan: String(plan.name ?? ""),
              purchaseDate: new Date().toISOString(),
              expiryDate: expiry.toISOString(),
              paymentId: razorpay_payment_id,
              orderId: razorpay_order_id,
              freePassClaimed: false,
            },
    
            passStatus: "active",
            status: planId,
            planTier: Number(plan.tier ?? 1),
            passExpiresAt: expiry.toISOString(),
    
            updatedAt: serverTimestamp(),
          },
          {
            merge: true,
          }
        );
    
        console.log("[VERIFY] User Pass Activated");
    
        await setDoc(paymentRef, {
          paymentId: razorpay_payment_id,
          orderId: razorpay_order_id,
          signature: razorpay_signature,
    
          userId,
          planId,
    
          amount: Number(paymentAmount) / 100,
          currency: String((payment as any).currency ?? "INR"),
    
          gateway: "RAZORPAY",
    
          status: paymentStatus,
    
          email: String((payment as any).email ?? ""),
          contact: String((payment as any).contact ?? ""),
    
          razorpayResponse: payment,
    
          verified: true,
    
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
    
        console.log("[VERIFY] Payment Saved");
    
        return NextResponse.json({
          success: true,
          paymentId: razorpay_payment_id,
          orderId: razorpay_order_id,
          message: "Payment verified successfully.",
        });
      } catch (error: any) {
        console.error("[RAZORPAY_VERIFY_ERROR]");
        console.error(error);
    
        return NextResponse.json(
          {
            success: false,
            error: error?.message ?? "Verification failed.",
            stack:
              process.env.NODE_ENV === "development"
                ? error?.stack
                : undefined,
          },
          {
            status: 500,
          }
        );
      }
    }