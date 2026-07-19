
import { NextResponse } from 'next/server';

/**
 * @fileOverview Secondary Firebase Admin Endpoint (NEUTRALIZED).
 * FIXED: This endpoint was identified as a source of build-time 'Service account object must contain a string "project_id" property' errors.
 * Logic: Neutralized to ensure build stability. All database operations are directed 
 * through the Firebase Client SDK.
 */

export async function GET() {
  return NextResponse.json({ 
    success: false, 
    message: "Admin SDK node deactivated for build stability." 
  }, { status: 404 });
}

export async function POST() {
  return NextResponse.json({ 
    success: false, 
    message: "Admin SDK node deactivated for build stability." 
  }, { status: 404 });
}
