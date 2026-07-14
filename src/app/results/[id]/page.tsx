import ResultClient from "@/components/results/ResultClient";

/**
 * @fileOverview Official Result Node Entry.
 * FIXED: Updated prop signature for Next.js 15 compatibility.
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
  // We await params here even if ResultClient uses hooks internally for redundancy
  await props.params;
  return <ResultClient />;
}
