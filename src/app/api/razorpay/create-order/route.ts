
import { NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

/**
 * @fileOverview Razorpay Order Logic (Archived).
 * UPDATED: Stripped Razorpay SDK imports to resolve production build failures.
 * This route is now a placeholder; use Cashfree for active preparation nodes.
 */

export async function POST(req: Request) {
  try {
    const { planId, userId } = await req.json();
    const { firestore: db } = initializeFirebase();

    if (!userId || !planId) {
      return NextResponse.json({ error: 'Missing mandatory session data.' }, { status: 400 });
    }

    const planSnap = await getDoc(doc(db, "passes", planId));
    if (!planSnap.exists()) {
      return NextResponse.json({ error: 'Invalid Pass Node.' }, { status: 404 });
    }

    // Razorpay logic disabled in favor of Cashfree.
    return NextResponse.json({ 
      error: 'Gateway archived. Please utilize the Cashfree preparation node for transactions.',
      status: 'ARCHIVED'
    }, { status: 410 });
    
  } catch (error: any) {
    console.error('[RAZORPAY_STUB_FAILURE]:', error);
    return NextResponse.json({ error: 'Legacy gateway failed to initialize.' }, { status: 500 });
  }
}
