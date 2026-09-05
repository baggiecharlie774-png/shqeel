import { fetchTickets } from "@/lib/data";
import { TechQueueTable } from "./tech-queue-table";

export default async function AssignedPage() {
  const tickets = await fetchTickets();
  const active = tickets.filter((t) => ["ASSIGNED", "IN_PROGRESS", "PENDING"].includes(t.status));
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Assigned queue ({active.length})</h2>
        <p className="text-sm text-muted-foreground">Update progress, post work logs and resolve tickets.</p>
      </div>
      <TechQueueTable tickets={active} />
    </div>
  );
}
