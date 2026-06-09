
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { initializeFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

/**
 * @fileOverview Server-side order creation for Razorpay.
 * Strictly prevents exposure of Secret Keys to the client.
 */

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  try {
    const { planId, userId } = await req.json();
    const { firestore: db } = initializeFirebase();

    if (!userId || !planId) {
      return NextResponse.json({ error: 'Missing mandatory audit nodes.' }, { status: 400 });
    }

    // 1. Fetch Plan details from Registry
    const planSnap = await getDoc(doc(db, "passes", planId));
    if (!planSnap.exists()) {
      return NextResponse.json({ error: 'Invalid Plan Registry Node.' }, { status: 404 });
    }
    const planData = planSnap.data();

    // 2. Create Razorpay Order
    const options = {
      amount: Math.round(planData.price * 100), // Amount in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}_${userId.slice(-6)}`,
      notes: {
        userId,
        planId,
        planName: planData.name
      }
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error: any) {
    console.error('[RAZORPAY ORDER ERROR]:', error);
    return NextResponse.json({ error: 'Failed to initialize transaction node.' }, { status: 500 });
  }
}
