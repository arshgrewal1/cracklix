import React, { Suspense } from "react";
import ExamHubClient from "@/components/exams/ExamHubClient";
import { Loader2 } from "lucide-react";

/**
 * @fileOverview Official Exam Hub Entry v2.2 [Strict NEXT15 Async].
 * FIXED: Handled async params to satisfy Next.js 15 production build.
 */

export const dynamicParams = false;

export async function generateStaticParams() {
  // Pre-rendering core exam nodes for optimized mobile landing
  return [
    { id: 'pcs' },
    { id: 'patwari' },
    { id: 'constable' },
    { id: 'clerk' },
    { id: 'psssb-patwari' },
    { id: 'psssb-clerk' },
    { id: 'ppsc-pcs' }
  ];
}

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-primary" /></div>}>
      <ExamHubClient />
    </Suspense>
  );
}
