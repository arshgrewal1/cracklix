
import ExamHubClient from "@/components/exams/ExamHubClient";

/**
 * @fileOverview Official Exam Hub Entry v2.0.
 * Redesigned for high-fidelity mobile PWA presentation.
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

export default async function ExamIdPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  return <ExamHubClient />;
}
