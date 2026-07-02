import { NextResponse } from "next/server";

/**
 * @fileOverview System Health Monitoring Node.
 * Provides a minimal heartbeat for deployment uptime tracking.
 */
export async function GET() {
  try {
    return NextResponse.json({
      status: "OK",
      time: Date.now(),
    });
  } catch {
    return NextResponse.json(
      { status: "DOWN" },
      { status: 500 }
    );
  }
}
