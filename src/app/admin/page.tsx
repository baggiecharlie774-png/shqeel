import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock, Flame, Inbox, Zap } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/layout/stat-card";
import { PriorityBadge, StatusBadge } from "@/components/tickets/badges";
import { fetchAllTicketsAdmin, fetchStats, fetchTechnicians } from "@/lib/data";
import { requireProfile } from "@/lib/auth";

export default async function AdminDashboard() {
  await requireProfile(["admin"]);
  const [stats, tickets, techs] = await Promise.all([
    fetchStats(),
    fetchAllTicketsAdmin(),
    fetchTechnicians(),
  ]);
  const recent = tickets.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={Inbox} label="Total tickets" value={stats.tickets.total} hint={`${stats.tickets.new} new awaiting review`} />
        <StatCard icon={Zap} label="In progress" value={stats.tickets.in_progress} hint="Technicians actively working" />
        <StatCard icon={Clock} label="Pending" value={stats.tickets.pending} hint="Waiting on client response" />
        <StatCard icon={CheckCircle2} label="Resolved" value={stats.tickets.resolved} hint={`${stats.tickets.closed} closed`} />
        <StatCard icon={Flame} label="High priority" value={stats.tickets.high_priority} hint="Needs attention" />
        <StatCard icon={AlertTriangle} label="Under review" value={stats.tickets.under_review} hint={`${stats.tickets.assigned} assigned`} />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent tickets</CardTitle>
            <CardDescription>Latest customer requests and assignments.</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild><Link href="/admin/tickets">View all</Link></Button>
        </CardHeader>
        <CardContent className="divide-y">
          {recent.map((t) => (
            <Link key={t.id} href="/admin/tickets" className="flex flex-wrap items-center justify-between gap-2 py-3">
              <div className="min-w-0">
                <p className="font-mono text-xs text-primary">{t.ticket_code}</p>
                <p className="truncate font-medium">{t.title}</p>
              </div>
              <div className="flex items-center gap-2">
                <PriorityBadge priority={t.priority} />
                <StatusBadge status={t.status} />
              </div>
            </Link>
          ))}
          {recent.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No tickets yet.</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Technician workload</CardTitle>
            <CardDescription>{stats.users.available} available · {stats.users.busy} busy · {stats.users.offline} offline</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild><Link href="/admin/technicians">Manage</Link></Button>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {techs.map((t) => (
            <div key={t.id} className="flex items-center gap-3 rounded-xl border p-3">
              <Avatar>
                <AvatarImage src={t.avatar_url ?? undefined} alt={t.name} />
                <AvatarFallback>{t.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{t.name}</p>
                <p className="truncate text-xs text-muted-foreground">{t.specialization} · {t.assigned_tickets} active</p>
              </div>
              <StatusBadge status={t.status === "Available" ? "RESOLVED" : t.status === "Busy" ? "IN_PROGRESS" : "CLOSED"} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
