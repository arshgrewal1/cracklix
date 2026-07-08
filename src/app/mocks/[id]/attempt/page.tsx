import AttemptClient from "@/components/mocks/AttemptClient";

/**
 * @fileOverview Official Mock Attempt Server Entry.
 * FIXED: dynamicParams: true is incompatible with output: export.
 */

export const dynamicParams = false;

export async function generateStaticParams() {
  return [
    { id: 'mock-punjab-1' },
    { id: 'patwari-mock-1' },
    { id: 'constable-mock-1' }
  ];
}

export default async function Page(props: { params: { id: string } }) {
  const { id } = props.params;
  return <AttemptClient mockId={id} />;
}
