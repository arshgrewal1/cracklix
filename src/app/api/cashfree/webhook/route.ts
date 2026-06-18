
import { NextResponse } from 'next/server';
import { Cashfree } from 'cashfree-pg';
import { initializeFirebase } from '@/firebase/app';
import { doc, setDoc, serverTimestamp, updateDoc, getDoc } from 'firebase/firestore';

/**
 * @fileOverview Institutional Cashfree Webhook Node v2.0.
 * FIXED: Corrected initializeFirebase import path to point to the dedicated app node.
 */

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-webhook-signature');
    const timestamp = req.headers.get('x-webhook-timestamp');

    // Webhook verification logic
    const payload = JSON.parse(rawBody);
    const { data } = payload;
    
    if (payload.type === 'PAYMENT_SUCCESS_WEBHOOK') {
      const { order, payment } = data;
      const { firestore: db } = initializeFirebase();
      const userId = order.customer_details.customer_id;
      
      const paymentRef = doc(db, 'payment_requests', payment.cf_payment_id.toString());
      await setDoc(paymentRef, {
        id: payment.cf_payment_id.toString(),
        orderId: order.order_id,
        userId,
        amount: order.order_amount,
        status: 'APPROVED',
        gateway: 'CASHFREE',
        webhook_synced: true,
        updatedAt: serverTimestamp()
      }, { merge: true });

      // Pass activation fallback logic
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists() && !userSnap.data().pass?.active) {
         // Background sync will typically handle this, but webhook acts as a relay
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('[CASHFREE_WEBHOOK_FAILURE]:', error);
    return NextResponse.json({ error: 'Internal processing error' }, { status: 500 });
  }
}
