import ResultClient from "@/components/results/ResultClient";

/**
 * @fileOverview Official Result Node Entry.
 * FIXED: dynamicParams: false for static export.
 */

export const dynamicParams = false;

export async function generateStaticParams() {
  return [
    { id: 'mock-punjab-1' },
    { id: 'dummy-result' },
    { id: 'patwari-mock-1' },
    { id: 'constable-mock-1' },
    { id: 'psssb-sa-mock-1' }
  ];
}

export default function ResultPage() {
  return <ResultClient />;
}
