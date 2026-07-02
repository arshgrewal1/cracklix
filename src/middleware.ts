import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * @fileOverview Production Hardened Global Middleware.
 * Logic: In-memory rate limiting for API nodes with periodic cleanup.
 */

const rateMap = new Map<string, number[]>();
const MAX_MAP_SIZE = 10000;
let lastCleanup = Date.now();

function cleanupRateMap(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < windowMs) return;
  lastCleanup = now;
  for (const [key, timestamps] of rateMap) {
    const valid = timestamps.filter((t) => now - t < windowMs);
    if (valid.length === 0) {
      rateMap.delete(key);
    } else {
      rateMap.set(key, valid);
    }
  }
}

export function middleware(req: NextRequest) {
  const url = req.nextUrl.pathname;
  
  if (url.startsWith("/api/")) {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.ip || "unknown";
    const now = Date.now();
    const limit = 40;
    const windowMs = 60 * 1000;

    cleanupRateMap(windowMs);

    if (rateMap.size > MAX_MAP_SIZE) {
      rateMap.clear();
    }

    const record = rateMap.get(ip) || [];
    const filtered = record.filter((t) => now - t < windowMs);
    
    filtered.push(now);
    rateMap.set(ip, filtered);

    if (filtered.length > limit) {
      return NextResponse.json(
        { error: "Too many requests." },
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
