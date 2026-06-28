
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { initializeFirebase } from '@/firebase/app';
import { doc, getDoc } from 'firebase/firestore';

/**
 * @fileOverview Production Razorpay Order Engine v5.0.
 * HARDENED: Secure price audit from Firestore and robust error propagation.
 */

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { planId, userId } = body;
    
    const { firestore: db } = initializeFirebase();

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error("[RAZORPAY_CONFIG_ERROR]: Credentials missing in environment.");
      return NextResponse.json({ 
        error: 'Payment service is temporarily unavailable.' 
      }, { status: 503 });
    }

    const instance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    if (!userId || !planId) {
      return NextResponse.json({ error: 'Context missing: userId and planId required' }, { status: 400 });
    }

    // 1. Audit Price from Registry to prevent manipulation
    const planSnap = await getDoc(doc(db, "passes", planId));
    if (!planSnap.exists()) {
      return NextResponse.json({ error: 'Plan not found in registry' }, { status: 404 });
    }
    
    const planData = planSnap.data();
    // Razorpay amount is in paise (₹1 = 100 paise)
    const amount = Math.round(Number(planData.price) * 100);

    if (isNaN(amount) || (planData.price > 0 && amount < 100)) {
      return NextResponse.json({ error: 'Invalid plan price (Min ₹1 required for online payments)' }, { status: 400 });
    }

    // 2. Create Razorpay Order
    const options = {
      amount,
      currency: "INR",
      receipt: `CRK_${Date.now()}_${userId.slice(-4)}`,
      notes: { userId, planId, planName: planData.name }
    };

    const order = await instance.orders.create(options);

    console.log("[RAZORPAY_ORDER_CREATED]:", order.id);

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: keyId
    });

  } catch (error: any) {
    console.error("[RAZORPAY_ORDER_FAILURE]:", error);
    return NextResponse.json({ 
      error: error.message || 'Gateway handshake failed.' 
    }, { status: 500 });
  }
}
