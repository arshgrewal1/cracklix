import LinkerContent from "@/components/admin/LinkerContent";

/**
 * @fileOverview Content Linking Engine v1.3.
 */

export const dynamicParams = true;

export async function generateStaticParams() {
  return [
    { examId: 'pcs' },
    { examId: 'patwari' },
    { examId: 'constable' }
  ];
}

export default async function Page(props: { params: Promise<{ examId: string }> }) {
  const { examId } = await props.params;
  return <LinkerContent examId={examId} />;
}