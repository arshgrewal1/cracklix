import { NextResponse } from "next/server";
import { initializeFirebase } from "@/firebase/app";
import { doc, getDoc } from "firebase/firestore";

/**
 * @fileOverview Coupon Verification API v1.0.
 */

export async function POST(req: Request) {
  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    const { firestore: db } = initializeFirebase();
    const couponRef = doc(db, "coupons", code.toUpperCase());
    const snap = await getDoc(couponRef);

    if (!snap.exists()) {
      return NextResponse.json({ error: "Invalid coupon code" }, { status: 404 });
    }

    const data = snap.data();

    if (!data.active) {
      return NextResponse.json({ error: "This coupon is no longer active" }, { status: 400 });
    }

    // Optional: Check if user has already used this coupon (requires user context in req)
    
    return NextResponse.json({
      success: true,
      discount: data.discount,
      type: data.type, // 'percent' or 'fixed'
    });

  } catch (error: any) {
    console.error("[COUPON_VERIFY_ERROR]", error);
    return NextResponse.json(
      { error: error?.message || "Verification failed" },
      { status: 500 }
    );
  }
}
