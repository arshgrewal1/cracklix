import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { initializeFirebase } from '@/firebase/app';
import { doc, getDoc } from 'firebase/firestore';

/**
 * @fileOverview Production Razorpay Order Engine v2.0.
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
      console.error("[RAZORPAY_CONFIG_ERROR]: Credentials not found in environment variables.");
      return NextResponse.json({ 
        error: 'Payment service is temporarily unavailable. Please try again later.' 
      }, { status: 503 });
    }

    const instance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    if (!userId || !planId) {
      return NextResponse.json({ error: 'Context Missing: userId and planId are required' }, { status: 400 });
    }

    // 1. Audit Price from Registry
    const planSnap = await getDoc(doc(db, "passes", planId));
    if (!planSnap.exists()) {
      return NextResponse.json({ error: 'Invalid plan node selected.' }, { status: 404 });
    }
    const planData = planSnap.data();

    // 2. Prepare Order Options
    const options = {
      amount: Math.round(Number(planData.price) * 100), // Amount in paise
      currency: "INR",
      receipt: `RCPT_${Date.now()}_${userId.slice(-4)}`,
      notes: {
        userId,
        planId,
        planName: planData.name
      }
    };

    console.log("[RAZORPAY_REQUEST]: Creating order for", planId);
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
      error: error.message || 'Payment processing failed. Please try again.' 
    }, { status: 500 });
  }
}
