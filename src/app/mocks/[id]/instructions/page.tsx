import React, { Suspense } from "react";
import InstructionsClient from "@/components/mocks/InstructionsClient";
import { Loader2 } from "lucide-react";

/**
 * @fileOverview Official Mock Instructions Entry v1.1.
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

export default async function InstructionsPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-primary" /></div>}>
      <InstructionsClient mockId={id} />
    </Suspense>
  );
}
