import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { firestore } from '@/firebase/app';
import { doc, getDoc } from 'firebase/firestore';

/**
 * @fileOverview Razorpay Order Creation Node.
 * FIXED: Handled optional coupon codes and added JSON parse guards.
 */

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { planId, userId, couponCode } = body;

    if (!planId || !userId) {
      return NextResponse.json({ error: 'Plan ID and User ID are required.' }, { status: 400 });
    }

    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      console.error("[RAZORPAY_ERROR] Keys missing in environment.");
      return NextResponse.json({ error: 'Gateway configuration missing.' }, { status: 500 });
    }

    const instance = new Razorpay({ key_id, key_secret });

    // Fetch plan details from the live registry
    const planRef = doc(firestore, "passes", planId);
    const planSnap = await getDoc(planRef);
    
    if (!planSnap.exists()) {
      return NextResponse.json({ error: 'Pass plan not found.' }, { status: 404 });
    }

    const planData = planSnap.data();
    let finalAmount = Number(planData.price);

    // Apply Coupon Logic if code is provided and not empty
    if (couponCode && couponCode.trim().length > 0) {
      try {
        const couponRef = doc(firestore, "coupons", couponCode.toUpperCase().trim());
        const couponSnap = await getDoc(couponRef);
        if (couponSnap.exists() && couponSnap.data().active) {
          const c = couponSnap.data();
          if (c.type === 'percent') {
            finalAmount = finalAmount - (finalAmount * (Number(c.discount) || 0) / 100);
          } else {
            finalAmount = finalAmount - (Number(c.discount) || 0);
          }
        }
      } catch (couponErr) {
        console.warn("[COUPON_AUDIT_SKIP] Optional coupon validation failed.");
      }
    }

    const options = {
      amount: Math.round(Math.max(1, finalAmount) * 100), // convert to paisa
      currency: "INR",
      receipt: `rcpt_${userId.slice(-6)}_${Date.now()}`,
    };

    const order = await instance.orders.create(options);
    
    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: key_id
    });
  } catch (error: any) {
    console.error("[RAZORPAY_CREATE_ERROR]", error);
    return NextResponse.json({ error: error.message || 'Order creation failed' }, { status: 500 });
  }
}
