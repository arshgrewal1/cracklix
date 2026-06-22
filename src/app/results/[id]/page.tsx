import ResultClient from "@/components/results/ResultClient";

/**
 * @fileOverview Official Result Node Entry.
 * Satisfies static export requirements with generateStaticParams.
 */

export const dynamicParams = false;

export async function generateStaticParams() {
  return [
    { id: 'mock-punjab-1' },
    { id: 'dummy-result' }
  ];
}

export default function ResultPage() {
  return <ResultClient />;
}