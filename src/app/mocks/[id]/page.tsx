import MockOverviewClient from "@/components/mocks/MockOverviewClient";

/**
 * @fileOverview Official Mock Overview Entry.
 * FIXED: params is a Promise in Next.js 15.
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

export default async function MockOverviewPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  return <MockOverviewClient mockId={id} />;
}
