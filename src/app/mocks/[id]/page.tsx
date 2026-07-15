import React, { Suspense } from "react";
import MockOverviewClient from "@/components/mocks/MockOverviewClient";
import { Loader2 } from "lucide-react";

/**
 * @fileOverview Official Mock Overview Entry v1.1.
 * FIXED: Wrapped in Suspense to satisfy Next.js 15 CSR bailout requirements.
 */

export const dynamicParams = false;

export async function generateStaticParams() {
  // Pre-rendering common test IDs for result nodes
  return [
    { id: 'mock-punjab-1' },
    { id: 'patwari-mock-1' },
    { id: 'constable-mock-1' },
    { id: 'psssb-sa-mock-1' },
    { id: 'clerk-mock-1' }
  ];
}

export default async function MockOverviewPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-primary" /></div>}>
      <MockOverviewClient id={id} />
    </Suspense>
  );
}
