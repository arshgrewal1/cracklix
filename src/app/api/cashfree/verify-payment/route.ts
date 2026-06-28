
import { NextResponse } from 'next/server';

/**
 * @fileOverview DEPRECATED.
 */
export async function POST() {
  return NextResponse.json({ error: "Endpoint deprecated." }, { status: 410 });
}
