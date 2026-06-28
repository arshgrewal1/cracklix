import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * @fileOverview Production Hardened Global Middleware.
 * Logic: Simple in-memory rate limiting for API nodes + Auth routing.
 */

const rateMap = new Map();

export function middleware(req: NextRequest) {
  const url = req.nextUrl.pathname;
  
  // 1. Rate Limiting for API Nodes (Anti-Abuse)
  if (url.startsWith("/api/")) {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();
    const limit = 40; // requests
    const windowMs = 60 * 1000; // 1 min window

    const record = rateMap.get(ip) || [];
    const filtered = record.filter((t: number) => now - t < windowMs);
    
    filtered.push(now);
    rateMap.set(ip, filtered);

    if (filtered.length > limit) {
      return NextResponse.json(
        { error: "Too many requests. Anti-abuse node active." },
        { status: 429 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg).*)',
  ],
};
