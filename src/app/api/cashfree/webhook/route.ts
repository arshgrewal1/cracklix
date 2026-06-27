import { NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase/app';
import { doc, setDoc, serverTimestamp, getDoc, updateDoc } from 'firebase/firestore';

/**
 * @fileOverview Institutional Background Sync Node v5.0.
 * Handles async payment confirmations to prevent service disruption.
 */

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const payload = JSON.parse(rawBody);
    
    if (payload.type === 'PAYMENT_SUCCESS_WEBHOOK') {
      const { order, payment } = payload.data;
      const { firestore: db } = initializeFirebase();
      const userId = order.customer_details.customer_id;
      
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        
        // Only trigger if user hasn't been upgraded by client-side redirect yet
        if (userData.passStatus !== 'active') {
          const planId = order.order_note?.split(': ')[1]?.toLowerCase().replace(/\s+/g, '-') || 'monthly-pass';
          const planSnap = await getDoc(doc(db, 'passes', planId));
          
          if (planSnap.exists()) {
            const planData = planSnap.data();
            const now = new Date();
            const expiry = new Date();
            expiry.setDate(now.getDate() + (planData.durationDays || 30));

            await updateDoc(userRef, {
              passStatus: 'active',
              passExpiresAt: expiry.toISOString(),
              updatedAt: serverTimestamp()
            });
          }
        }
      }

      await setDoc(doc(db, 'payment_requests', payment.cf_payment_id.toString()), {
        status: 'APPROVED',
        webhook_synced: true,
        updatedAt: serverTimestamp()
      }, { merge: true });
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('[WEBHOOK_FAILURE]:', error);
    return NextResponse.json({ error: 'Internal processing error' }, { status: 500 });
  }
}
