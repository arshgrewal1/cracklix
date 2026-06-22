import ExamHubClient from "@/components/exams/ExamHubClient";

/**
 * @fileOverview Official Exam Hub Entry.
 * Satisfies static export requirements with generateStaticParams.
 */

export const dynamicParams = false;

export async function generateStaticParams() {
  return [
    { id: 'pcs' },
    { id: 'patwari' },
    { id: 'constable' },
    { id: 'clerk' },
    { id: 'constable-district' },
    { id: 'clerk-legal' },
    { id: 'naib-tehsildar' }
  ];
}

export default function ExamHubPage() {
  return <ExamHubClient />;
}