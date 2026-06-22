import BoardHubClient from "@/components/exams/BoardHubClient";

/**
 * @fileOverview Official Board Hub Entry.
 * Satisfies static export requirements with generateStaticParams.
 */

export const dynamicParams = false;

export async function generateStaticParams() {
  return [
    { id: "ppsc" },
    { id: "psssb" },
    { id: "punjab-police" },
    { id: "teaching-hub" }
  ];
}

export default async function HubExamsPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  return <BoardHubClient hubId={id} />;
}