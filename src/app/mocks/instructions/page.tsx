'use client';

import React, { Suspense } from "react";
import InstructionsClient from "@/components/mocks/InstructionsClient";
import { Loader2 } from "lucide-react";

/**
 * @fileOverview Official Mock Instructions Entry v2.0 (Next.js 15 Hardened).
 * FIXED: Wrapped in Suspense to prevent CSR bailout error during build.
 */
export default function InstructionsPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-primary" /></div>}>
      <InstructionsClient />
    </Suspense>
  );
}
