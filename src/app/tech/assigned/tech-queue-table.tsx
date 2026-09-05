"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PriorityBadge } from "@/components/tickets/badges";
import { updateTicketStatusAction } from "@/lib/actions/tickets";
import type { TicketStatus } from "@/lib/constants";
import type { Ticket } from "@/lib/supabase/types";

const NEXT_ACTIONS: Record<string, TicketStatus[]> = {
  ASSIGNED: ["IN_PROGRESS"],
  IN_PROGRESS: ["PENDING", "RESOLVED"],
  PENDING: ["IN_PROGRESS"],
};

export function TechQueueTable({ tickets }: { tickets: Ticket[] }) {
  const [busy, setBusy] = useState<number | null>(null);

  async function move(t: Ticket, next: TicketStatus) {
    setBusy(t.id);
    const res = await updateTicketStatusAction(t.id, next);
    setBusy(null);
    if (!res.ok) return toast.error(res.error);
    toast.success(`${t.ticket_code} → ${next}`);
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket</TableHead>
              <TableHead>Issue</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Move to</TableHead>
              <TableHead className="text-right">Open</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-mono font-semibold text-primary">{t.ticket_code}</TableCell>
                <TableCell className="max-w-72">
                  <p className="truncate font-medium">{t.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{t.description}</p>
                </TableCell>
                <TableCell><PriorityBadge priority={t.priority} /></TableCell>
                <TableCell>
                  <div className="flex gap-1.5">
                    {(NEXT_ACTIONS[t.status] ?? []).map((n) => (
                      <Button key={n} size="sm" variant="outline" disabled={busy === t.id} onClick={() => move(t, n)}>
                        {busy === t.id && <Loader2 className="size-3 animate-spin" />}{n.replace("_", " ")}
                      </Button>
                    ))}
                    <NativeSelect
                      className="w-36"
                      value=""
                      onChange={(e) => { if (e.target.value) move(t, e.target.value as TicketStatus); }}
                      disabled={busy === t.id}
                    >
                      <NativeSelectOption value="">More…</NativeSelectOption>
                      <NativeSelectOption value="IN_PROGRESS">In Progress</NativeSelectOption>
                      <NativeSelectOption value="PENDING">Pending</NativeSelectOption>
                      <NativeSelectOption value="RESOLVED">Resolved</NativeSelectOption>
                    </NativeSelect>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" asChild>
                    <Link href={`/tech/tickets/${t.ticket_code}`}>Workstation</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {tickets.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">Nothing here.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
