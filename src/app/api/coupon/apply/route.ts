import { NextResponse } from "next/server";
import { initializeFirebase } from "@/firebase/app";
import { doc, getDoc } from "firebase/firestore";

/**
 * @fileOverview Coupon Verification API v1.1.
 * FIXED: Safe JSON body parsing to prevent "Unexpected end of JSON input".
 */

export async function POST(req: Request) {
  try {
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ error: "Invalid or missing request body" }, { status: 400 });
    }

    const { code } = body;

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
    
    return NextResponse.json({
      success: true,
      discount: data.discount,
      type: data.type, // 'percent' or 'fixed'
    });

  } catch (error: any) {
    console.error("[COUPON_VERIFY_ERROR]", error);
    return NextResponse.json(
      { error: error?.message || "Internal verification failure" },
      { status: 500 }
    );
  }
}
