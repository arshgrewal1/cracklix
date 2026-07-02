import { NextRequest, NextResponse } from 'next/server';

/**
 * @fileOverview Firebase Admin API - DISABLED.
 * This endpoint was an unauthenticated Firestore proxy that allowed
 * arbitrary read/write to any collection via the Admin SDK, bypassing
 * all Firestore security rules. It has been disabled for security.
 *
 * Use Firestore client SDK with proper security rules instead.
 */
export async function POST(req: NextRequest) {
  return NextResponse.json(
    { success: false, error: 'This endpoint has been disabled for security reasons.' },
    { status: 403 }
  );
}
