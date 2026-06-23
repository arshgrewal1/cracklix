import ExamHubClient from "@/components/exams/ExamHubClient";

/**
 * @fileOverview Official Exam Hub Entry.
 * FIXED: Expanded registry nodes to resolve 404 errors for PSSSB SA and others.
 */

export const dynamicParams = false;

export async function generateStaticParams() {
  // Pre-rendering core exam nodes for the static registry
  return [
    { id: 'pcs' },
    { id: 'patwari' },
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
