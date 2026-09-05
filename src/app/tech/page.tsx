import Link from "next/link";
import { CheckCircle2, Inbox, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/layout/stat-card";
import { PriorityBadge, StatusBadge } from "@/components/tickets/badges";
import { fetchTickets } from "@/lib/data";
import { requireProfile } from "@/lib/auth";

export default async function TechDashboard() {
  const { profile } = await requireProfile(["technician"]);
  const tickets = await fetchTickets();
  const active = tickets.filter((t) => ["ASSIGNED", "IN_PROGRESS", "PENDING"].includes(t.status));
  const inProgress = tickets.filter((t) => t.status === "IN_PROGRESS").length;
  const done = tickets.filter((t) => ["RESOLVED", "CLOSED"].includes(t.status)).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Welcome back, {profile.name.split(" ")[0]}</h2>
        <p className="text-sm text-muted-foreground">Your queue overview and active troubleshooting tasks.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Inbox} label="Assigned tickets" value={active.length} />
        <StatCard icon={Zap} label="In progress" value={inProgress} />
        <StatCard icon={CheckCircle2} label="Resolved / closed" value={done} />
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Active queue</CardTitle>
            <CardDescription>Manage and update your ongoing tasks.</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild><Link href="/tech/assigned">View all</Link></Button>
        </CardHeader>
        <CardContent className="divide-y">
          {active.slice(0, 6).map((t) => (
            <Link key={t.id} href={`/tech/tickets/${t.ticket_code}`} className="flex flex-wrap items-center justify-between gap-2 py-3">
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
          {active.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">Queue is clear. Nice work.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
