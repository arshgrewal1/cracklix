import React, { Suspense } from "react";
import AttemptClient from "@/components/mocks/AttemptClient";
import { Loader2 } from "lucide-react";

/**
 * @fileOverview Official Mock Attempt Server Entry v1.1.
 * FIXED: Wrapped in Suspense to satisfy Next.js 15 CSR bailout requirements.
 */

export const dynamicParams = false;

export async function generateStaticParams() {
  return [
    { id: 'mock-punjab-1' },
    { id: 'patwari-mock-1' },
    { id: 'constable-mock-1' }
  ];
}

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-[#0B1528]"><Loader2 className="animate-spin text-primary" /></div>}>
      <AttemptClient mockId={id} />
    </Suspense>
  );
}
