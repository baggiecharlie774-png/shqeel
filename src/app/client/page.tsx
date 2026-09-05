import Link from "next/link";
import { ArrowRight, Inbox, Loader, MessageSquare, Plus, TicketCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/layout/stat-card";
import { StatusBadge, CategoryBadge } from "@/components/tickets/badges";
import { CATEGORY_LABELS } from "@/lib/constants";
import { fetchTickets } from "@/lib/data";
import { requireProfile } from "@/lib/auth";

const CATEGORY_ICONS = ["🖥️", "🌐", "🖨️", "⚙️", "📧", "❓"];

export default async function ClientDashboard() {
  const { profile } = await requireProfile(["client"]);
  const tickets = await fetchTickets({ scope: "mine" });
  const open = tickets.filter((t) => ["SUBMITTED", "UNDER_REVIEW"].includes(t.status)).length;
  const progress = tickets.filter((t) => ["ASSIGNED", "IN_PROGRESS", "PENDING"].includes(t.status)).length;
  const resolved = tickets.filter((t) => ["RESOLVED", "CLOSED"].includes(t.status)).length;
  const recent = tickets.slice(0, 5);

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden bg-primary text-primary-foreground">
        <CardHeader>
          <CardTitle className="text-2xl">We are here to fix your tech problems, {profile.name.split(" ")[0]}</CardTitle>
          <CardDescription className="text-primary-foreground/80">
            Fast, friendly IT support for computer, network and software issues.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="secondary" asChild>
            <Link href="/client/tickets/new"><Plus /> Get support</Link>
          </Button>
          <Button variant="outline" className="bg-transparent text-primary-foreground hover:text-primary-foreground" asChild>
            <Link href="/client/tickets">Track my ticket <ArrowRight /></Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Inbox} label="Total tickets" value={tickets.length} />
        <StatCard icon={Loader} label="Open" value={open} />
        <StatCard icon={TicketCheck} label="In progress" value={progress} />
        <StatCard icon={MessageSquare} label="Resolved" value={resolved} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-3">
            <Button asChild><Link href="/client/tickets/new"><Plus /> New ticket</Link></Button>
            <Button variant="outline" asChild><Link href="/client/tickets">View status</Link></Button>
            <Button variant="outline" asChild><Link href="/client/messages">Messages</Link></Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Support categories</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
            {Object.entries(CATEGORY_LABELS).map(([key, label], i) => (
              <Link key={key} href={`/client/tickets/new?category=${key}`} className="rounded-xl border p-3 text-center hover:bg-muted">
                <div className="text-xl">{CATEGORY_ICONS[i]}</div>
                <div className="mt-1 font-medium">{label}</div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent tickets</CardTitle>
            <CardDescription>Your latest requests and their live status.</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/client/tickets">View all</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No tickets yet. <Link href="/client/tickets/new" className="text-primary hover:underline">Create your first request</Link>.
            </p>
          ) : (
            <div className="divide-y">
              {recent.map((t) => (
                <Link key={t.id} href={`/client/tickets/${t.ticket_code}`} className="flex items-center justify-between gap-3 py-3 hover:bg-muted/40">
                  <div className="min-w-0">
                    <p className="font-mono text-xs text-primary">{t.ticket_code}</p>
                    <p className="truncate font-medium">{t.title}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <CategoryBadge category={t.category} />
                    <StatusBadge status={t.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How it works</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-4">
          {["Submit problem", "Admin reviews", "Tech assigned", "Problem solved"].map((s, i) => (
            <div key={s} className="rounded-xl border p-3">
              <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">{i + 1}</span>
              <p className="mt-2 font-semibold">{s}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
