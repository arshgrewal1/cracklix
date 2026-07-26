
"use client"

import React, { Suspense, useEffect, useState } from "react"
import ResultClient from "@/components/results/ResultClient"
import { Loader2 } from "lucide-react"

/**
 * @fileOverview Universal Result Hub Viewer v9.1.
 * FIXED: Suspense boundary ensures Next.js 15 pre-rendering compatibility.
 */

export default function ResultViewPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return (
    <div className="h-screen flex items-center justify-center bg-[#F8FAFC]">
      <Loader2 className="animate-spin text-primary h-10 w-10" />
    </div>
  );

  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-[#F8FAFC]"><Loader2 className="animate-spin text-primary h-10 w-10" /></div>}>
      <ResultClient />
    </Suspense>
  )
}
