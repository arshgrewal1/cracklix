
import { NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase';

/**
 * @fileOverview Razorpay Verification Logic (Archived).
 * UPDATED: Stripped cryptographic imports to resolve module resolution errors.
 */

export async function POST(req: Request) {
  try {
    // Legacy verification node is disabled.
    return NextResponse.json({ 
      error: 'Legacy verification node disabled. Use Cashfree audit hub.',
      success: false 
    }, { status: 410 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Registry synchronization failed for legacy node.' }, { status: 500 });
  }
}
