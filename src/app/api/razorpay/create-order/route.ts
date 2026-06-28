
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { initializeFirebase } from '@/firebase/app';
import { doc, getDoc } from 'firebase/firestore';

/**
 * @fileOverview Production Razorpay Order Engine v1.0.
 * HARDENED: Secure order creation with dynamic pricing from Firestore.
 */

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { planId, userId } = body;
    
    const { firestore: db } = initializeFirebase();

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error("[RAZORPAY_CONFIG_ERROR]: Credentials not found.");
      return NextResponse.json({ 
        error: 'Payment service is temporarily unavailable.' 
      }, { status: 503 });
    }

    const instance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    if (!userId || !planId) {
      return NextResponse.json({ error: 'Context Missing' }, { status: 400 });
    }

    // Audit Price from Registry
    const planSnap = await getDoc(doc(db, "passes", planId));
    if (!planSnap.exists()) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 404 });
    }
    const planData = planSnap.data();

    const options = {
      amount: Math.round(Number(planData.price) * 100), // Amount in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}_${userId.slice(-4)}`,
    };

    const order = await instance.orders.create(options);

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: keyId
    });

  } catch (error: any) {
    console.error("[RAZORPAY_ORDER_FAILURE]:", error);
    return NextResponse.json({ 
      error: error.message || 'Payment processing failed.' 
    }, { status: 500 });
  }
}
