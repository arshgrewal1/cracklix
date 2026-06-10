
import { NextResponse } from 'next/server';
import { Cashfree } from 'cashfree-pg';
import { initializeFirebase } from '@/firebase';
import { doc, updateDoc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';

/**
 * @fileOverview Hardened Cashfree Payment Verification.
 * Verifies transaction status and synchronizes institutional registry.
 */

Cashfree.XClientId = process.env.CASHFREE_CLIENT_ID!;
Cashfree.XClientSecret = process.env.CASHFREE_CLIENT_SECRET!;
// Hardened: Synchronized production check
Cashfree.XEnvironment = (process.env.CASHFREE_ENV === 'production' || process.env.CASHFREE_CLIENT_SECRET?.includes('_prod_')) 
  ? Cashfree.Environment.PRODUCTION 
  : Cashfree.Environment.SANDBOX;

export async function POST(req: Request) {
  try {
    const { order_id, userId, planId } = await req.json();

    if (!order_id || !userId || !planId) {
      return NextResponse.json({ error: 'Missing verification metadata.' }, { status: 400 });
    }

    // 1. Audit Transaction with Cashfree
    const response = await Cashfree.PGOrderFetchPayments("2023-08-01", order_id);
    const payments = response.data;
    
    const successfulPayment = payments?.find(p => p.payment_status === 'SUCCESS');

    if (!successfulPayment) {
      return NextResponse.json({ error: 'No successful transaction node found.' }, { status: 400 });
    }

    const { firestore: db } = initializeFirebase();

    // 2. Fetch Plan Metadata
    const planSnap = await getDoc(doc(db, "passes", planId));
    const planData = planSnap?.data();
    
    if (!planData) {
      return NextResponse.json({ error: 'Registry Sync Error: Plan Missing' }, { status: 404 });
    }

    // 3. Institutional Registry Upgrade
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + (planData.durationDays || 30));

    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      pass: {
        active: true,
        plan: planData.id?.toUpperCase() || 'PREMIUM',
        purchaseDate: new Date().toISOString(),
        expiryDate: expiryDate.toISOString(),
        freePassClaimed: false
      },
      status: planData.id,
      updatedAt: serverTimestamp()
    });

    // 4. Ledger Entry
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
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[CASHFREE_VERIFY_FAILURE]:', error?.response?.data || error);
    return NextResponse.json({ error: 'Registry synchronization failed.' }, { status: 500 });
  }
}
