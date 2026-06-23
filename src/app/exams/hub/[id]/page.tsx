import BoardHubClient from "@/components/exams/BoardHubClient";

/**
 * @fileOverview Official Board Hub Entry.
 * FIXED: Expanded board registry to prevent 404s for auxiliary hubs.
 */

export const dynamicParams = false;

export async function generateStaticParams() {
  return [
    { id: "ppsc" },
    { id: "psssb" },
    { id: "punjab-police" },
    { id: "teaching-hub" },
    { id: "pspcl" },
    { id: "ssc" },
    { id: "banking-hub" },
    { id: "judiciary-hub" }
  ];
}

export default async function HubExamsPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  return <BoardHubClient hubId={id} />;
}
