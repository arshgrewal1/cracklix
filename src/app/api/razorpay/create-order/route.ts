import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { initializeFirebase } from '@/firebase/app';
import { doc, getDoc } from 'firebase/firestore';

/**
 * @fileOverview Production Razorpay Order Engine v5.1.
 * HARDENED: Robust environment variable handling and dynamic pricing audit.
 */

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { planId, userId } = body;
    
    const { firestore: db } = initializeFirebase();

    // Next.js 15 requires process.env access
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error("[RAZORPAY_CONFIG_ERROR]: Credentials missing in server context.");
      return NextResponse.json({ 
        error: 'Payment service is temporarily unavailable.' 
      }, { status: 503 });
    }

    const instance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    if (!userId || !planId) {
      return NextResponse.json({ error: 'Context missing: identity and plan node required' }, { status: 400 });
    }

    // 1. Audit Price from Firestore Registry
    const planSnap = await getDoc(doc(db, "passes", planId));
    if (!planSnap.exists()) {
      return NextResponse.json({ error: 'Plan node not found in registry' }, { status: 404 });
    }
    
    const planData = planSnap.data();
    const amountInPaise = Math.round(Number(planData.price) * 100);

    if (isNaN(amountInPaise) || (planData.price > 0 && amountInPaise < 100)) {
      return NextResponse.json({ error: 'Minimum transaction limit not met (₹1)' }, { status: 400 });
    }

    // 2. Create Official Razorpay Order
    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `ORD_${Date.now()}_${userId.slice(-6)}`,
      notes: { 
        userId, 
        planId, 
        planName: planData.name 
      }
    };

    const order = await instance.orders.create(options);

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: keyId
    });

  } catch (error: any) {
    console.error("[RAZORPAY_GATEWAY_CRITICAL]:", error);
    return NextResponse.json({ 
      error: error.message || 'Payment handshake failed.' 
    }, { status: 500 });
  }
}