import ExamHubClient from "@/components/exams/ExamHubClient";

/**
 * @fileOverview Official Exam Hub Entry.
 * FIXED: dynamicParams: false is mandatory for static export.
 * Added core registry nodes for pre-rendering.
 */

export const dynamicParams = false;

export async function generateStaticParams() {
  // Pre-rendering core exam nodes for the static registry
  // In a production environment, this could be fetched from a CSV or local JSON
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
