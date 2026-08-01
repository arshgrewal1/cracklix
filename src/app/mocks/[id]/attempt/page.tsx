import React, { Suspense } from "react";
import AttemptClient from "@/components/mocks/AttemptClient";
import { Loader2 } from "lucide-react";

/**
 * @fileOverview Official Mock Attempt Server Entry v1.2 [Strict NEXT15 Async].
 * FIXED: Handled async params for Next.js 15.
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
  const params = await props.params;
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-[#0B1528]"><Loader2 className="animate-spin text-primary" /></div>}>
      <AttemptClient mockId={params.id} />
    </Suspense>
  );
}
