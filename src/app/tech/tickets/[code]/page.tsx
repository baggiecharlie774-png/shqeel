import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryBadge, PriorityBadge, StatusBadge } from "@/components/tickets/badges";
import { StatusStepper } from "@/components/tickets/status-stepper";
import { fetchTicketByCode } from "@/lib/data";
import { WorkstationActions } from "./workstation-actions";

export default async function TechTicketPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  let ticket;
  try {
    ticket = await fetchTicketByCode(decodeURIComponent(code));
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link href="/tech/assigned" className="text-sm font-medium text-primary hover:underline">← Back to queue</Link>
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-mono text-sm font-bold text-primary">{ticket.ticket_code}</p>
              <CardTitle className="mt-1 text-xl">{ticket.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{ticket.client?.name} · {ticket.client?.email}</p>
            </div>
            <div className="flex gap-2">
              <CategoryBadge category={ticket.category} />
              <StatusBadge status={ticket.status} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="rounded-xl border bg-muted/40 p-4 text-sm">{ticket.description}</p>
          <p className="text-sm text-muted-foreground">Priority: <PriorityBadge priority={ticket.priority} /></p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Workstation</CardTitle></CardHeader>
        <CardContent>
          <WorkstationActions ticketId={ticket.id} status={ticket.status} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Progress</CardTitle></CardHeader>
        <CardContent><StatusStepper status={ticket.status} /></CardContent>
      </Card>

      {ticket.work_notes.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Work log</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {ticket.work_notes.map((n) => (
              <div key={n.id} className="rounded-xl border p-3 text-sm">
                <p className="font-semibold">{n.author?.name} · {new Date(n.created_at).toLocaleString()}</p>
                <p className="mt-1">{n.note}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Timeline</CardTitle></CardHeader>
        <CardContent>
          <ol className="space-y-3 border-l pl-5">
            {ticket.timeline.map((e) => (
              <li key={e.id} className="relative text-sm">
                <span className="absolute -left-[26px] top-1 size-3 rounded-full bg-primary" />
                <p className="text-xs text-muted-foreground">{new Date(e.created_at).toLocaleString()}</p>
                <p className="font-semibold">{e.title}</p>
                {e.description && <p className="text-muted-foreground">{e.description}</p>}
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
