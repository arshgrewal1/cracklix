import { NextResponse } from "next/server";

/**
 * @fileOverview System Health Monitoring Node.
 * Provides a heartbeat for deployment uptime tracking.
 */
export async function GET() {
  try {
    return NextResponse.json({
      status: "OK",
      time: Date.now(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      region: process.env.VERCEL_REGION || "local"
    });
  } catch {
    return NextResponse.json(
      { status: "DOWN", timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}
