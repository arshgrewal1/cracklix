import CategoryHubClient from "@/components/exams/CategoryHubClient";

/**
 * @fileOverview Official Category Hub Entry.
 * Satisfies static export requirements with generateStaticParams.
 */

export const dynamicParams = false;

export async function generateStaticParams() {
  return [
    { id: "punjab-government-exams" },
    { id: "punjab-teaching-exams" },
    { id: "punjab-technical-exams" },
    { id: "banking-exams" },
    { id: "judiciary-exams" },
    { id: "central-government-exams" }
  ];
}

export default async function CategoryHubPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  return <CategoryHubClient catId={id} />;
}