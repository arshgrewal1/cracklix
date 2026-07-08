import InstructionsClient from "@/components/mocks/InstructionsClient";

/**
 * @fileOverview Official Mock Instructions Entry.
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

export default async function InstructionsPage(props: { params: { id: string } }) {
  const { id } = props.params;
  return <InstructionsClient mockId={id} />;
}
