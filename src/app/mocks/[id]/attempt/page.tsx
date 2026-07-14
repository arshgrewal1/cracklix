import AttemptClient from "@/components/mocks/AttemptClient";

/**
 * @fileOverview Official Mock Attempt Server Entry.
 * FIXED: params is a Promise in Next.js 15.
 */

export const dynamicParams = false;

export async function generateStaticParams() {
  return [
    { id: 'mock-punjab-1' },
    { id: 'patwari-mock-1' },
    { id: 'constable-mock-1' }
  ];
}

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  return <AttemptClient mockId={id} />;
}
