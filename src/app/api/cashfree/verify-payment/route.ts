import { NextResponse } from 'next/server';
import { Cashfree } from 'cashfree-pg';
import { initializeFirebase } from '@/firebase/app';
import { doc, updateDoc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';

/**
 * @fileOverview Production Verification Node v12.0.
 * SECURITY: Server-side check with Cashfree before granting premium tokens.
 */

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { order_id, userId, planId } = body;
    
    const clientId = process.env.CASHFREE_CLIENT_ID;
    const clientSecret = process.env.CASHFREE_CLIENT_SECRET;

    if (!clientId || !clientSecret) return NextResponse.json({ error: 'Config missing' }, { status: 500 });

    Cashfree.XClientId = clientId;
    Cashfree.XClientSecret = clientSecret;
    Cashfree.XEnvironment = clientSecret.startsWith('cf_prod_') ? Cashfree.Environment.PRODUCTION : Cashfree.Environment.SANDBOX;

    // 1. Audit Transaction with Gateway
    const response = await Cashfree.PGOrderFetchPayments("2023-08-01", order_id);
    const payments = response.data;
    const successNode = payments?.find(p => p.payment_status === 'SUCCESS');

    if (!successNode) {
      return NextResponse.json({ error: 'Payment not verified' }, { status: 400 });
    }

    const { firestore: db } = initializeFirebase();
    const normalizedPlanId = planId.toLowerCase().replace(/[\s_]+/g, '-');
    
    const planSnap = await getDoc(doc(db, 'passes', normalizedPlanId));
    if (!planSnap.exists()) return NextResponse.json({ error: 'Plan invalid' }, { status: 404 });
    const planData = planSnap.data();

    // 2. Calculate New Expiry
    const now = new Date();
    const duration = Number(planData.durationDays) || 30;
    const finalExpiry = new Date();
    finalExpiry.setDate(now.getDate() + duration);

    // 3. Update Aspirant Node
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      pass: {
        active: true,
        plan: planData.name,
        purchaseDate: now.toISOString(),
        expiryDate: finalExpiry.toISOString(),
        freePassClaimed: false
      },
      passStatus: 'active',
      passExpiresAt: finalExpiry.toISOString(),
      status: normalizedPlanId,
      updatedAt: serverTimestamp()
    });

    // 4. Log Verified Transaction
    await setDoc(doc(db, 'payment_requests', successNode.cf_payment_id!.toString()), {
      id: successNode.cf_payment_id!.toString(),
      orderId: order_id,
      userId,
      planId: normalizedPlanId,
      amount: Number(planData.price),
      status: 'APPROVED',
      gateway: 'CASHFREE',
      method: successNode.payment_group || 'UNKNOWN',
      verifiedAt: serverTimestamp()
    }, { merge: true });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("[VERIFICATION_FAILURE]:", error);
    return NextResponse.json({ error: 'Internal sync failed' }, { status: 500 });
  }
}
