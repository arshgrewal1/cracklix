
import { NextResponse } from 'next/server';

/**
 * @fileOverview Razorpay Order Logic (Archived).
 * UPDATED: Stripped all Razorpay SDK imports to resolve build failures.
 * Cashfree is now the active preparation node.
 */

export async function POST(req: Request) {
  try {
    return NextResponse.json({ 
      error: 'Legacy gateway archived. Please utilize the Cashfree preparation node for transactions.',
      status: 'ARCHIVED'
    }, { status: 410 });
    
  } catch (error: any) {
    console.error('[RAZORPAY_STUB_FAILURE]:', error);
    return NextResponse.json({ error: 'Legacy gateway failed to initialize.' }, { status: 500 });
  }
}
