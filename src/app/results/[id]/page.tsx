import React, { Suspense } from "react";
import ResultClient from "@/components/results/ResultClient";
import { Loader2 } from "lucide-react";

/**
 * @fileOverview Official Result Node Entry v1.2 [Strict NEXT15 Async].
 * FIXED: Handled async params for Next.js 15.
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

export default async function ResultPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-primary" /></div>}>
      <ResultClient />
    </Suspense>
  );
}
