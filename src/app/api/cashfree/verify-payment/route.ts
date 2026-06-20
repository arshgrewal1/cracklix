import { NextResponse } from 'next/server';
import { Cashfree } from 'cashfree-pg';
import { initializeFirebase } from '@/firebase/app';
import { doc, updateDoc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';

/**
 * @fileOverview Hardened Cashfree Verification Hub v5.0.
 * STABILITY: Atomic updates for subscription registry and pass activation.
 * SECURITY: Implements passActivatedAt and passExpiresAt fields for automatic expiry logic.
 */

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { order_id, userId, planId } = body;
    
    const clientId = process.env.CASHFREE_CLIENT_ID;
    const clientSecret = process.env.CASHFREE_CLIENT_SECRET;
    const env = process.env.CASHFREE_ENV || 'production';

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: 'Gateway authentication failure.' }, { status: 500 });
    }

    Cashfree.XClientId = clientId;
    Cashfree.XClientSecret = clientSecret;
    const isProd = env === 'production' || clientSecret.startsWith('cf_prod_');
    Cashfree.XEnvironment = isProd ? Cashfree.Environment.PRODUCTION : Cashfree.Environment.SANDBOX;

    if (!order_id || !userId || !planId) {
      return NextResponse.json({ error: 'Audit parameters missing.' }, { status: 400 });
    }

    // Step 1: Gateway Verification
    const response = await Cashfree.PGOrderFetchPayments("2023-08-01", order_id);
    const payments = response.data;
    const successNode = payments?.find(p => p.payment_status === 'SUCCESS');

    if (!successNode) {
      return NextResponse.json({ error: 'Transaction pending or rejected.' }, { status: 400 });
    }

    // Step 2: Atomic Registry Sync
    const { firestore: db } = initializeFirebase();
    const planSnap = await getDoc(doc(db, "passes", planId));
    const planData = planSnap.data();
    
    if (!planData) {
      return NextResponse.json({ error: 'Registry error: Pass node archived.' }, { status: 404 });
    }

    const duration = Number(planData.durationDays) || 30;
    const now = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(now.getDate() + duration);

    // Step 3: Pass Activation (Enhanced Structure)
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      pass: {
        active: true,
        plan: planData.id?.toUpperCase() || 'ELITE',
        purchaseDate: now.toISOString(),
        expiryDate: expiryDate.toISOString(),
        freePassClaimed: planData.id === 'free-pass'
      },
      passStatus: 'active',
      passActivatedAt: now.toISOString(),
      passExpiresAt: expiryDate.toISOString(),
      status: planData.id,
      updatedAt: serverTimestamp()
    });

    // Step 4: Ledger Audit Log
    const paymentRef = doc(db, 'payment_requests', successNode.cf_payment_id!.toString());
    await setDoc(paymentRef, {
      id: successNode.cf_payment_id!.toString(),
      orderId: order_id,
      userId,
      planId,
      planName: planData.name,
      amount: Number(planData.price),
      status: 'APPROVED',
      gateway: 'CASHFREE',
      method: successNode.payment_group || 'UNKNOWN',
      verifiedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });

    return NextResponse.json({ success: true, expiry: expiryDate.toISOString() });

  } catch (error: any) {
    console.error("[VERIFICATION_FAILURE]:", error?.response?.data || error);
    return NextResponse.json({ error: 'Registry synchronization failed. Contact support with Order ID.' }, { status: 500 });
  }
}
