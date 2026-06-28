
import { NextResponse } from 'next/server';

/**
 * @fileOverview DEPRECATED.
 */
export async function POST() {
  return NextResponse.json({ received: true, status: "deprecated" });
}
