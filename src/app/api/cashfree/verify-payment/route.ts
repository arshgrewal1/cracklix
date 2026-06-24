import { NextResponse } from 'next/server';
import { Cashfree } from 'cashfree-pg';
import { initializeFirebase } from '@/firebase/app';
import { doc, updateDoc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';

/**
 * @fileOverview Hardened Verification Hub v7.0.
 * FIXED: Optimized plan ID normalization to handle both display names and canonical IDs.
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

    if (!order_id || !userId || !planId) {
      return NextResponse.json({ error: 'Audit parameters missing' }, { status: 400 });
    }

    // 1. Pull payment status from gateway
    const response = await Cashfree.PGOrderFetchPayments("2023-08-01", order_id);
    const payments = response.data;
    const successNode = payments?.find(p => p.payment_status === 'SUCCESS');

    if (!successNode) {
      return NextResponse.json({ error: 'Payment not verified by gateway' }, { status: 400 });
    }

    // 2. Normalize and locate plan
    const normalizedPlanId = planId.toLowerCase().replace(/[\s_]+/g, '-');
    const { firestore: db } = initializeFirebase();
    
    const planSnap = await getDoc(doc(db, 'passes', normalizedPlanId));
    if (!planSnap.exists()) {
       return NextResponse.json({ error: `Plan node ${normalizedPlanId} not found` }, { status: 404 });
    }
    const planData = planSnap.data();

    // 3. Calculate Expiry Logic (Extension Support)
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data() || {};

    const now = new Date();
    const duration = Number(planData.durationDays) || 30;
    const currentExpiry = userData.passExpiresAt ? new Date(userData.passExpiresAt) : null;
    const isPassActive = currentExpiry && currentExpiry > now;
    
    let finalExpiry: Date;
    if (isPassActive && userData.status === normalizedPlanId) {
      finalExpiry = new Date(currentExpiry.getTime());
      finalExpiry.setDate(finalExpiry.getDate() + duration);
    } else {
      finalExpiry = new Date();
      finalExpiry.setDate(now.getDate() + duration);
    }

    // 4. Sync Registry
    await updateDoc(userRef, {
      pass: {
        active: true,
        plan: planData.id?.toUpperCase() || 'ELITE',
        purchaseDate: now.toISOString(),
        expiryDate: finalExpiry.toISOString(),
        freePassClaimed: false
      },
      passStatus: 'active',
      passExpiresAt: finalExpiry.toISOString(),
      status: normalizedPlanId,
      planTier: planData.tier || 1,
      updatedAt: serverTimestamp()
    });

    // 5. Save audit request
    await setDoc(doc(db, 'payment_requests', successNode.cf_payment_id!.toString()), {
      id: successNode.cf_payment_id!.toString(),
      orderId: order_id,
      userId,
      planId: normalizedPlanId,
      amount: Number(planData.price),
      status: 'APPROVED',
      gateway: 'CASHFREE',
      method: successNode.payment_group || 'UNKNOWN',
      verifiedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("[VERIFICATION_CRITICAL_FAIL]:", error);
    return NextResponse.json({ error: 'Registry sync failed' }, { status: 500 });
  }
}
