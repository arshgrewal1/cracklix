
"use client"

import React, { Suspense } from "react"
import MockOverviewClient from "@/components/mocks/MockOverviewClient"
import { Loader2 } from "lucide-react"

/**
 * @fileOverview Universal Mock Overview Hub Viewer.
 * Optimized for Static Export: Uses query params (?id=...) to bypass path pre-rendering limitations.
 */

export default function MockViewPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-primary h-10 w-10" /></div>}>
      <MockOverviewClient />
    </Suspense>
  )
}
