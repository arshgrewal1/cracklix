"use client"

import React, { Suspense } from "react"
import MockOverviewClient from "@/components/mocks/MockOverviewClient"
import { Loader2 } from "lucide-react"

/**
 * @fileOverview Universal Mock Overview Hub.
 * FIXED: Added Suspense boundary for static export compatibility.
 */

export default function MockViewPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-primary" /></div>}>
      <MockOverviewClient />
    </Suspense>
  )
}
