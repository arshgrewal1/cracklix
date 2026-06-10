
import { NextResponse } from 'next/server';
import { Cashfree } from 'cashfree-pg';
import { initializeFirebase } from '@/firebase';
import { doc, updateDoc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';

/**
 * @fileOverview Audited Cashfree Payment Verification Hub v2.0.
 * UPDATED: Dynamic environment detection for verification node.
 */

export async function POST(req: Request) {
  try {
    const { order_id, userId, planId } = await req.json();
    
    const clientId = process.env.CASHFREE_CLIENT_ID;
    const clientSecret = process.env.CASHFREE_CLIENT_SECRET;
    const env = process.env.CASHFREE_ENV || 'production';

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: 'Auth keys missing.' }, { status: 500 });
    }

    Cashfree.XClientId = clientId;
    Cashfree.XClientSecret = clientSecret;
    const isProd = env === 'production' || clientSecret.startsWith('cf_prod_');
    Cashfree.XEnvironment = isProd ? Cashfree.Environment.PRODUCTION : Cashfree.Environment.SANDBOX;

    if (!order_id || !userId || !planId) {
      return NextResponse.json({ error: 'Missing audit metadata.' }, { status: 400 });
    }

    const response = await Cashfree.PGOrderFetchPayments("2023-08-01", order_id);
    const payments = response.data;
    const successfulPayment = payments?.find(p => p.payment_status === 'SUCCESS');

    if (!successfulPayment) {
      return NextResponse.json({ error: 'Transaction pending or failed.' }, { status: 400 });
    }

    const { firestore: db } = initializeFirebase();
    const planSnap = await getDoc(doc(db, "passes", planId));
    const planData = planSnap?.data();
    
    if (!planData) {
      return NextResponse.json({ error: 'Registry Sync Error: Plan Missing' }, { status: 404 });
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + (planData.durationDays || 30));

    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      pass: {
        active: true,
        plan: planData.id?.toUpperCase() || 'PREMIUM',
        purchaseDate: new Date().toISOString(),
        expiryDate: expiryDate.toISOString(),
        freePassClaimed: planData.id === 'free-pass'
      },
      status: planData.id,
      updatedAt: serverTimestamp()
    });

    const paymentRef = doc(db, 'payment_requests', successfulPayment.cf_payment_id!.toString());
    await setDoc(paymentRef, {
      id: successfulPayment.cf_payment_id!.toString(),
      orderId: order_id,
      userId,
      planId,
      planName: planData.name,
      amount: planData.price,
      status: 'APPROVED',
      gateway: 'CASHFREE',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[CASHFREE_VERIFY_FAILURE]:', error?.response?.data || error);
    return NextResponse.json({ error: 'Institutional registry sync failed.' }, { status: 500 });
  }
}
