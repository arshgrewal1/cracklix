import { NextResponse } from 'next/server';
import { firestore } from '@/firebase/app';
import { doc, getDoc } from 'firebase/firestore';

/**
 * @fileOverview Institutional Coupon Verification Node.
 */

export async function POST(req: Request) {
  try {
    const { code, userId } = await req.json();
    if (!code) return NextResponse.json({ error: "Code required" }, { status: 400 });

    const couponRef = doc(firestore, "coupons", code.toUpperCase().trim());
    const snap = await getDoc(couponRef);

    if (snap.exists() && snap.data().active) {
      return NextResponse.json({
        success: true,
        ...snap.data()
      });
    }

    return NextResponse.json({ error: "Coupon invalid or expired" }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
