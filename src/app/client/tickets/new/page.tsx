import { NewTicketForm } from "./new-ticket-form";

export default async function NewTicketPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const sp = await searchParams;
  return <NewTicketForm presetCategory={sp.category} />;
}
