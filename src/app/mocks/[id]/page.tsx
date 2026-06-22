import MockOverviewClient from "@/components/mocks/MockOverviewClient";

/**
 * @fileOverview Official Mock Overview Entry.
 * Satisfies static export requirements with generateStaticParams.
 */

export const dynamicParams = false;

export async function generateStaticParams() {
  return [
    { id: 'mock-punjab-1' },
    { id: 'patwari-mock-1' },
    { id: 'constable-mock-1' }
  ];
}

export default function MockOverviewPage() {
  return <MockOverviewClient />;
}