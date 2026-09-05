import { fetchAllTicketsAdmin, fetchTechnicians } from "@/lib/data";
import { AdminTicketsClient } from "./admin-tickets-client";

export default async function AdminTicketsPage() {
  const [tickets, techs] = await Promise.all([fetchAllTicketsAdmin(), fetchTechnicians()]);
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Support tickets</h2>
        <p className="text-sm text-muted-foreground">Review submissions, set priority and assign technicians.</p>
      </div>
      <AdminTicketsClient tickets={tickets} technicians={techs.map((t) => ({ id: t.id, name: t.name }))} />
    </div>
  );
}
