import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryBadge, PriorityBadge, StatusBadge } from "@/components/tickets/badges";
import { StatusStepper } from "@/components/tickets/status-stepper";
import { fetchTicketByCode } from "@/lib/data";
import { TicketActions } from "./ticket-actions";

export default async function ClientTicketDetails({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  let ticket;
  try {
    ticket = await fetchTicketByCode(decodeURIComponent(code));
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link href="/client/tickets" className="text-sm font-medium text-primary hover:underline">
        ← Back to my tickets
      </Link>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-sm font-bold text-primary">{ticket.ticket_code}</p>
              <CardTitle className="mt-1 text-xl">{ticket.title}</CardTitle>
            </div>
            <div className="flex gap-2">
              <CategoryBadge category={ticket.category} />
              <StatusBadge status={ticket.status} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="rounded-xl border bg-muted/40 p-4 text-sm leading-relaxed">{ticket.description}</p>
          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
            <span>Priority: <PriorityBadge priority={ticket.priority} /></span>
            <span>Created: <strong className="text-foreground">{new Date(ticket.created_at).toLocaleString()}</strong></span>
            <span>Updated: <strong className="text-foreground">{new Date(ticket.updated_at).toLocaleString()}</strong></span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Current status</CardTitle></CardHeader>
        <CardContent><StatusStepper status={ticket.status} /></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Assigned technician</CardTitle></CardHeader>
        <CardContent>
          {ticket.technician ? (
            <div className="flex items-center gap-3">
              <Avatar><AvatarFallback>{ticket.technician.name.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
              <div>
                <p className="font-semibold">{ticket.technician.name}</p>
                <p className="text-sm text-muted-foreground">{ticket.technician.email}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No technician yet — an admin will assign one after review.</p>
          )}
        </CardContent>
      </Card>

      {ticket.messages.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Messages</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {ticket.messages.map((m) => (
              <div key={m.id} className="rounded-xl border p-3 text-sm">
                <p className="font-semibold">{m.sender?.name ?? "Unknown"} <span className="font-normal text-muted-foreground">· {new Date(m.created_at).toLocaleString()}</span></p>
                <p className="mt-1">{m.text}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Activity timeline</CardTitle></CardHeader>
        <CardContent>
          <ol className="space-y-4 border-l pl-5">
            {ticket.timeline.map((e) => (
              <li key={e.id} className="relative text-sm">
                <span className="absolute -left-[26px] top-1 size-3 rounded-full bg-primary" />
                <p className="text-xs text-muted-foreground">{new Date(e.created_at).toLocaleString()}</p>
                <p className="font-semibold">{e.title}</p>
                {e.description && <p className="text-muted-foreground">{e.description}</p>}
              </li>
            ))}
            {ticket.timeline.length === 0 && <p className="text-sm text-muted-foreground">No activity yet.</p>}
          </ol>
        </CardContent>
      </Card>

      <Card className="bg-muted/40">
        <CardHeader><CardTitle>Actions</CardTitle></CardHeader>
        <CardContent>
          <TicketActions ticketId={ticket.id} code={ticket.ticket_code} status={ticket.status} />
        </CardContent>
      </Card>
    </div>
  );
}
