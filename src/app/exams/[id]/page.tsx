import ExamHubClient from "@/components/exams/ExamHubClient";

/**
 * @fileOverview Official Exam Hub Entry.
 * Pre-rendering vertical routes for static export.
 */

export const dynamicParams = false;

export async function generateStaticParams() {
  return [
    { id: 'pcs' },
    { id: 'patwari' },
    { id: 'psssb-patwari' },
    { id: 'constable' },
    { id: 'clerk' },
    { id: 'psssb-sa' },
    { id: 'senior-assistant' },
    { id: 'constable-district' },
    { id: 'clerk-legal' },
    { id: 'naib-tehsildar' },
    { id: 'jail-warder' },
    { id: 'excise-inspector' },
    { id: 'sub-inspector' }
  ];
}

export default function ExamHubPage() {
  return <ExamHubClient />;
}
