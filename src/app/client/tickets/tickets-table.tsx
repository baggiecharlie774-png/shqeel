"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CategoryBadge, PriorityBadge, StatusBadge } from "@/components/tickets/badges";
import type { Ticket } from "@/lib/supabase/types";
import { STATUS_LABELS } from "@/lib/constants";

export function TicketsTable({ initial }: { initial: Ticket[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return initial.filter((t) => {
      const matchQ =
        !q ||
        t.ticket_code.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q);
      const matchS = status === "all" || STATUS_LABELS[t.status] === status;
      return matchQ && matchS;
    });
  }, [initial, query, status]);

  const total = initial.length;
  const open = initial.filter((t) => ["SUBMITTED", "UNDER_REVIEW"].includes(t.status)).length;
  const prog = initial.filter((t) => ["ASSIGNED", "IN_PROGRESS", "PENDING"].includes(t.status)).length;
  const res = initial.filter((t) => ["RESOLVED", "CLOSED"].includes(t.status)).length;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-4">
        {[["Total", total], ["Open", open], ["In progress", prog], ["Resolved", res]].map(([l, v]) => (
          <Card key={l as string}>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{l}</p>
              <p className="text-2xl font-bold">{v as number}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by ticket ID or title…" className="pl-9" />
          </div>
          <NativeSelect value={status} onChange={(e) => setStatus(e.target.value)} className="sm:w-56">
            <NativeSelectOption value="all">All statuses</NativeSelectOption>
            {Object.values(STATUS_LABELS).map((s) => (
              <NativeSelectOption key={s} value={s}>{s}</NativeSelectOption>
            ))}
          </NativeSelect>
          <Button asChild><Link href="/client/tickets/new"><Plus /> New ticket</Link></Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-mono font-semibold text-primary">{t.ticket_code}</TableCell>
                  <TableCell className="max-w-64 truncate font-medium">{t.title}</TableCell>
                  <TableCell><CategoryBadge category={t.category} /></TableCell>
                  <TableCell><PriorityBadge priority={t.priority} /></TableCell>
                  <TableCell><StatusBadge status={t.status} /></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{new Date(t.updated_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/client/tickets/${t.ticket_code}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                    No tickets match your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
