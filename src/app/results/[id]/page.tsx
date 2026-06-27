import ResultClient from "@/components/results/ResultClient";

/**
 * @fileOverview Official Result Node Entry.
 * FIXED: dynamicParams: false for static export compatibility.
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

export default function ResultPage() {
  return <ResultClient />;
}
