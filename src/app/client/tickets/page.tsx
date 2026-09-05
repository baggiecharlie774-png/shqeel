import { fetchTickets } from "@/lib/data";

export default async function ClientTicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const tickets = await fetchTickets({
    status: sp.status || undefined,
    search: sp.q || undefined,
    scope: "mine",
  });
  const { TicketsTable } = await import("./tickets-table");
  return <TicketsTable initial={tickets} />;
}
