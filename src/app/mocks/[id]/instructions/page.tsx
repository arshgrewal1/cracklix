import InstructionsClient from "@/components/mocks/InstructionsClient";

/**
 * @fileOverview Official Mock Instructions Entry.
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

export default async function InstructionsPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  return <InstructionsClient mockId={id} />;
}
