import React, { use } from "react";
import LinkerContent from "@/components/admin/LinkerContent";

/**
 * @fileOverview Content Linking Engine v1.4.
 * FIXED: dynamicParams: true is incompatible with output: export.
 * FIXED: Handled async params for Next.js 15.
 */

export const dynamicParams = false;

export async function generateStaticParams() {
  return [
    { examId: 'pcs' },
    { examId: 'patwari' },
    { examId: 'constable' },
    { examId: 'clerk' }
  ];
}

export default function Page(props: { params: Promise<{ examId: string }> }) {
  const params = use(props.params);
  return <LinkerContent examId={params.examId} />;
}
