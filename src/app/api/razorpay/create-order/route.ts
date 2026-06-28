
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { initializeFirebase } from '@/firebase/app';
import { doc, getDoc } from 'firebase/firestore';

/**
 * @fileOverview Production Razorpay Order Engine v3.0.
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
      console.error("[RAZORPAY_CONFIG_ERROR]: Credentials missing.");
      return NextResponse.json({ 
        error: 'Payment service is temporarily unavailable.' 
      }, { status: 503 });
    }

    const instance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    if (!userId || !planId) {
      return NextResponse.json({ error: 'User/Plan context missing' }, { status: 400 });
    }

    // 1. Audit Price from Registry
    const planSnap = await getDoc(doc(db, "passes", planId));
    if (!planSnap.exists()) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }
    const planData = planSnap.data();
    const amount = Math.round(Number(planData.price) * 100);

    if (isNaN(amount) || amount < 100) {
      return NextResponse.json({ error: 'Invalid plan price (Min ₹1 required)' }, { status: 400 });
    }

    // 2. Create Order
    const options = {
      amount,
      currency: "INR",
      receipt: `CRK_${Date.now()}`,
      notes: { userId, planId, planName: planData.name }
    };

    console.log("[RAZORPAY_INIT]: Creating order for", planId);
    const order = await instance.orders.create(options);

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: keyId
    });

  } catch (error: any) {
    console.error("[RAZORPAY_CRITICAL_FAILURE]:", error);
    return NextResponse.json({ 
      error: error.message || 'Gateway handshake failed.' 
    }, { status: 500 });
  }
}
