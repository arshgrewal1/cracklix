import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { firestore } from '@/firebase/app';
import { doc, getDoc } from 'firebase/firestore';

/**
 * @fileOverview Razorpay Order Creation Node.
 * SECURITY: Validates plan existence before initializing order.
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
      // In development environments without keys, return a mock order for UI testing
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json({
          orderId: `order_mock_${Date.now()}`,
          amount: 100,
          currency: "INR",
          key: "rzp_test_mockkey"
        });
      }
      return NextResponse.json({ error: 'Gateway configuration missing.' }, { status: 500 });
    }

    const instance = new Razorpay({ key_id, key_secret });

    // Fetch plan details from registry to verify price
    const planRef = doc(firestore, "passes", planId);
    const planSnap = await getDoc(planRef);
    
    if (!planSnap.exists()) {
      return NextResponse.json({ error: 'Pass plan not found.' }, { status: 404 });
    }

    const planData = planSnap.data();
    let finalAmount = Number(planData.price) || 0;

    // Optional Coupon Validation
    if (couponCode) {
      try {
        const couponRef = doc(firestore, "coupons", couponCode.toUpperCase().trim());
        const couponSnap = await getDoc(couponRef);
        if (couponSnap.exists() && couponSnap.data().active) {
          const c = couponSnap.data();
          if (c.type === 'percent') {
            finalAmount -= (finalAmount * (Number(c.discount) || 0) / 100);
          } else {
            finalAmount -= (Number(c.discount) || 0);
          }
        }
      } catch (e) {
        console.warn("[CHECKOUT] Coupon node skip.");
      }
    }

    const options = {
      amount: Math.round(Math.max(1, finalAmount) * 100), 
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
