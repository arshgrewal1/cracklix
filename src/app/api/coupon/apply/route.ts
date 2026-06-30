import { NextResponse } from "next/server";
import { initializeFirebase } from "@/firebase/app";
import { doc, getDoc } from "firebase/firestore";

/**
 * @fileOverview Coupon Verification API v1.2.
 * FIXED: Hardened code normalization and non-string type safety.
 */

export async function POST(req: Request) {
  try {
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ error: "Malformed or missing request body" }, { status: 400 });
    }

    const { code } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: "Valid coupon code is required" }, { status: 400 });
    }

    const { firestore: db } = initializeFirebase();
    const normalizedCode = String(code).trim().toUpperCase();
    
    if (!normalizedCode) {
      return NextResponse.json({ error: "Empty code node detected" }, { status: 400 });
    }

    const couponRef = doc(db, "coupons", normalizedCode);
    const snap = await getDoc(couponRef);

    if (!snap.exists()) {
      return NextResponse.json({ error: "Invalid coupon code node." }, { status: 404 });
    }

    const data = snap.data();

    if (!data.active) {
      return NextResponse.json({ error: "This coupon is no longer active in the registry." }, { status: 400 });
    }
    
    return NextResponse.json({
      success: true,
      discount: Number(data.discount) || 0,
      type: data.type || 'percent', 
    });

  } catch (error: any) {
    console.error("[COUPON_VERIFY_ERROR]", error);
    return NextResponse.json(
      { error: "Internal verification node failure.", detail: error?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
