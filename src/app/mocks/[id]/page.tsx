import MockOverviewClient from "@/components/mocks/MockOverviewClient";

/**
 * @fileOverview Official Mock Overview Entry.
 * FIXED: Expanded registry nodes to resolve potential 404 errors during static generation.
 */

export const dynamicParams = false;

export async function generateStaticParams() {
  return [
    { id: 'mock-punjab-1' },
    { id: 'patwari-mock-1' },
    { id: 'constable-mock-1' },
    { id: 'psssb-sa-mock-1' },
    { id: 'clerk-mock-1' }
  ];
}

export default function MockOverviewPage() {
  return <MockOverviewClient />;
}
