
import { NextResponse } from 'next/server';

/**
 * @fileOverview DEPRECATED.
 * All payment traffic migrated to Razorpay nodes.
 */
export async function POST() {
  return NextResponse.json({ error: "Endpoint deprecated. Migrated to Razorpay." }, { status: 410 });
}
