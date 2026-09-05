"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PriorityBadge, StatusBadge } from "@/components/tickets/badges";
import { assignTicketAction, reviewTicketAction, setPriorityAction } from "@/lib/actions/tickets";
import { STATUS_LABELS, VALID_PRIORITIES } from "@/lib/constants";
import type { Ticket } from "@/lib/supabase/types";
import type { Profile } from "@/lib/supabase/types";

export function AdminTicketsClient({ tickets, technicians }: { tickets: Ticket[]; technicians: Pick<Profile, "id" | "name">[] }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [assignFor, setAssignFor] = useState<Ticket | null>(null);
  const [techChoice, setTechChoice] = useState("");

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return tickets.filter((t) => {
      const okQ = !needle || t.ticket_code.toLowerCase().includes(needle) || t.title.toLowerCase().includes(needle);
      const okS = status === "all" || STATUS_LABELS[t.status] === status;
      return okQ && okS;
    });
  }, [tickets, q, status]);

  async function review(t: Ticket, priority: string) {
    setBusyId(t.id);
    const res = await reviewTicketAction(t.id, (priority || null) as never);
    setBusyId(null);
    if (!res.ok) return toast.error(res.error);
    toast.success(`${t.ticket_code} moved to Under Review`);
  }

  async function assign() {
    if (!assignFor || !techChoice) return;
    setBusyId(assignFor.id);
    const res = await assignTicketAction(assignFor.id, techChoice);
    setBusyId(null);
    if (!res.ok) return toast.error(res.error);
    toast.success(`${assignFor.ticket_code} assigned`);
    setAssignFor(null);
    setTechChoice("");
  }

  async function priority(t: Ticket, p: string) {
    setBusyId(t.id);
    const res = await setPriorityAction(t.id, p as never);
    setBusyId(null);
    if (!res.ok) return toast.error(res.error);
    toast.success("Priority updated");
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by ID, client or issue…" className="pl-9" />
          </div>
          <NativeSelect value={status} onChange={(e) => setStatus(e.target.value)} className="sm:w-56">
            <NativeSelectOption value="all">Status: all</NativeSelectOption>
            {Object.values(STATUS_LABELS).map((s) => (
              <NativeSelectOption key={s} value={s}>{s}</NativeSelectOption>
            ))}
          </NativeSelect>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket</TableHead>
                <TableHead>Issue</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-mono font-semibold text-primary">{t.ticket_code}</TableCell>
                  <TableCell className="max-w-72">
                    <p className="truncate font-medium">{t.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{t.description}</p>
                  </TableCell>
                  <TableCell>
                    <NativeSelect
                      value={t.priority ?? ""}
                      onChange={(e) => priority(t, e.target.value)}
                      disabled={busyId === t.id}
                      className="w-32"
                    >
                      <NativeSelectOption value="">—</NativeSelectOption>
                      {VALID_PRIORITIES.map((p) => (
                        <NativeSelectOption key={p} value={p}>{p}</NativeSelectOption>
                      ))}
                    </NativeSelect>
                  </TableCell>
                  <TableCell><StatusBadge status={t.status} /></TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1.5">
                      {t.status === "SUBMITTED" && (
                        <Button size="sm" variant="outline" disabled={busyId === t.id} onClick={() => review(t, t.priority ?? "MEDIUM")}>
                          {busyId === t.id && <Loader2 className="size-3 animate-spin" />} Review
                        </Button>
                      )}
                      <Dialog open={assignFor?.id === t.id} onOpenChange={(o) => { if (!o) setAssignFor(null); }}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" onClick={() => { setAssignFor(t); setTechChoice(t.technician_id ?? ""); }}>
                            Assign
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Assign {t.ticket_code}</DialogTitle>
                            <DialogDescription>Moves the ticket to Assigned and notifies everyone.</DialogDescription>
                          </DialogHeader>
                          <NativeSelect value={techChoice} onChange={(e) => setTechChoice(e.target.value)}>
                            <NativeSelectOption value="">Select technician…</NativeSelectOption>
                            {technicians.map((tech) => (
                              <NativeSelectOption key={tech.id} value={tech.id}>{tech.name}</NativeSelectOption>
                            ))}
                          </NativeSelect>
                          <DialogFooter>
                            <Button onClick={assign} disabled={!techChoice || busyId === t.id}>
                              {busyId === t.id && <Loader2 className="size-4 animate-spin" />} Assign ticket
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button size="sm" variant="ghost" asChild>
                        <Link href={`/client/tickets/${t.ticket_code}`}>View</Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">No tickets match.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center gap-3 pt-6 text-sm text-muted-foreground">
          <Avatar><AvatarFallback>✓</AvatarFallback></Avatar>
          Review sets Under Review · Assign moves to Assigned · Priority can be changed any time.
        </CardContent>
      </Card>
    </div>
  );
}
