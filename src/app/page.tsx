import Link from "next/link";
import {
  ArrowRight,
  Headset,
  MessagesSquare,
  ShieldCheck,
  Ticket,
  Wrench,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DEMO_ACCOUNTS } from "@/lib/constants";

const WORKSPACES = [
  {
    icon: Ticket,
    title: "Client portal",
    desc: "Submit requests, track live status, confirm resolutions and chat with your technician.",
    href: "/client",
    cta: "Open client workspace",
  },
  {
    icon: Wrench,
    title: "Technician workspace",
    desc: "Work your queue, post work logs, move tickets through In Progress / Pending / Resolved.",
    href: "/tech",
    cta: "Open technician workspace",
  },
  {
    icon: ShieldCheck,
    title: "Admin console",
    desc: "Review submissions, set priority, assign technicians, monitor clients and workload.",
    href: "/admin",
    cta: "Open admin console",
  },
];

const STEPS = [
  { n: "1", t: "Submit problem", d: "Short summary, category and details with screenshots." },
  { n: "2", t: "Admin reviews", d: "Priority is set and the ticket moves to Under Review." },
  { n: "3", t: "Tech assigned", d: "A specialist takes charge and starts troubleshooting." },
  { n: "4", t: "Problem solved", d: "Client confirms the fix and the ticket closes." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/40">
      <header className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-2 font-semibold">
          <span className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Headset className="size-4" />
          </span>
          HyperNetwork
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/register">
              Create account <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-12 px-4 pb-16 pt-10">
        <section className="mx-auto max-w-3xl text-center">
          <Badge variant="secondary" className="mb-4">
            <MessagesSquare className="size-3" /> Client · Technician · Admin
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            IT support without the ticket black hole
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Fast, friendly help for computer, network, printer, software and
            email issues — with live status, direct messaging and a verified
            resolution flow.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/register">Get support</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Track my ticket</Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {WORKSPACES.map((w) => (
            <Card key={w.href}>
              <CardHeader>
                <w.icon className="size-6 text-primary" />
                <CardTitle className="mt-2">{w.title}</CardTitle>
                <CardDescription>{w.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" asChild>
                  <Link href={w.href}>
                    {w.cta} <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>

        <section>
          <h2 className="mb-4 text-center text-2xl font-semibold">How it works</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <Card key={s.n}>
                <CardHeader>
                  <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                    {s.n}
                  </span>
                  <CardTitle className="text-base">{s.t}</CardTitle>
                  <CardDescription>{s.d}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <Card>
            <CardHeader>
              <CardTitle>Demo accounts</CardTitle>
              <CardDescription>
                Seeded by <code>scripts/seed.ts</code>. Use these to explore every role.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 font-mono text-sm sm:grid-cols-3">
              {DEMO_ACCOUNTS.map((a) => (
                <div key={a.email} className="rounded-xl border p-3">
                  <div className="font-sans font-semibold">{a.role}</div>
                  <div className="break-all">{a.email}</div>
                  <div>{a.password}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
