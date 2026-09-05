"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminSupabase } from "@/lib/supabase/admin";
import type {
  Conversation,
  Message,
  Notification,
  Profile,
  Stats,
  Ticket,
  TicketDetails,
} from "@/lib/supabase/types";
import { canTransition } from "@/lib/constants";
import type { Role, TicketStatus } from "@/lib/constants";

async function ctx(allowed: Role[]) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  const admin = createAdminSupabase();
  const { data: profile, error } = await admin
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  if (error || !profile) throw new Error("Profile not found");
  if (!allowed.includes((profile as Profile).role))
    throw new Error("Forbidden for your role");
  return { userId: user.id, profile: profile as Profile, admin };
}

async function ticketDetails(admin: ReturnType<typeof createAdminSupabase>, id: number): Promise<TicketDetails | null> {
  const { data: t } = await admin.from("tickets").select("*").eq("id", id).single();
  if (!t) return null;
  const ticket = t as Ticket;
  const [{ data: notes }, { data: msgs }, { data: atts }, { data: events }] = await Promise.all([
    admin.from("work_notes").select("*, author:profiles!work_notes_author_id_fkey(id,name,role)").eq("ticket_id", id).order("created_at", { ascending: false }),
    admin.from("messages").select("*, sender:profiles!messages_sender_id_fkey(id,name,role)").eq("ticket_id", id).order("created_at", { ascending: true }),
    admin.from("attachments").select("*").eq("ticket_id", id),
    admin.from("timeline_events").select("*").eq("ticket_id", id).order("created_at", { ascending: true }),
  ]);
  let client: Ticket["client"] = null;
  let technician: Ticket["technician"] = null;
  const { data: c } = await admin.from("profiles").select("id,name,email").eq("id", ticket.client_id).single();
  if (c) client = c as Ticket["client"];
  if (ticket.technician_id) {
    const { data: tech } = await admin.from("profiles").select("id,name,email").eq("id", ticket.technician_id).single();
    if (tech) technician = tech as Ticket["technician"];
  }
  return {
    ...ticket,
    client,
    technician,
    work_notes: ((notes as unknown[]) ?? []) as TicketDetails["work_notes"],
    messages: ((msgs as unknown[]) ?? []) as TicketDetails["messages"],
    attachments: ((atts as unknown[]) ?? []) as TicketDetails["attachments"],
    timeline: ((events as unknown[]) ?? []) as TicketDetails["timeline"],
  };
}

export async function fetchTickets(opts?: {
  status?: string;
  priority?: string;
  search?: string;
  scope?: "mine" | "assigned" | "all";
}): Promise<Ticket[]> {
  const { userId, profile, admin } = await ctx(["client", "admin", "technician"]);
  let q = admin.from("tickets").select("*").order("created_at", { ascending: false });
  if (profile.role === "client" || opts?.scope === "mine") q = q.eq("client_id", userId);
  if (profile.role === "technician" && opts?.scope !== "all") q = q.eq("technician_id", userId);
  if (opts?.status) q = q.eq("status", opts.status);
  if (opts?.priority) q = q.eq("priority", opts.priority);
  if (opts?.search) q = q.or(`ticket_code.ilike.%${opts.search}%,title.ilike.%${opts.search}%,description.ilike.%${opts.search}%`);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as Ticket[];
}

export async function fetchAllTicketsAdmin(): Promise<Ticket[]> {
  const { admin } = await ctx(["admin"]);
  const { data } = await admin.from("tickets").select("*").order("created_at", { ascending: false });
  return (data ?? []) as Ticket[];
}

export async function fetchTicketByCode(code: string): Promise<TicketDetails> {
  const { userId, profile, admin } = await ctx(["client", "admin", "technician"]);
  const { data: t } = await admin.from("tickets").select("*").eq("ticket_code", code).single();
  if (!t) throw new Error("Ticket not found");
  const ticket = t as Ticket;
  if (profile.role === "client" && ticket.client_id !== userId) throw new Error("Forbidden");
  if (profile.role === "technician" && ticket.technician_id && ticket.technician_id !== userId)
    throw new Error("Not your ticket");
  const full = await ticketDetails(admin, ticket.id);
  if (!full) throw new Error("Ticket not found");
  return full;
}

export async function fetchTicketById(id: number): Promise<TicketDetails> {
  const { userId, profile, admin } = await ctx(["client", "admin", "technician"]);
  const full = await ticketDetails(admin, id);
  if (!full) throw new Error("Ticket not found");
  if (profile.role === "client" && full.client_id !== userId) throw new Error("Forbidden");
  if (profile.role === "technician" && full.technician_id && full.technician_id !== userId)
    throw new Error("Not your ticket");
  return full;
}

export async function fetchMessages(ticketId: number): Promise<Message[]> {
  const { userId, profile, admin } = await ctx(["client", "admin", "technician"]);
  const { data: t } = await admin.from("tickets").select("client_id,technician_id").eq("id", ticketId).single();
  if (!t) throw new Error("Ticket not found");
  const row = t as { client_id: string; technician_id: string | null };
  if (profile.role === "client" && row.client_id !== userId) throw new Error("Forbidden");
  if (profile.role === "technician" && row.technician_id && row.technician_id !== userId)
    throw new Error("Forbidden");
  const { data } = await admin
    .from("messages")
    .select("*, sender:profiles!messages_sender_id_fkey(id,name,role)")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true });
  return ((data as unknown[]) ?? []) as Message[];
}

export async function fetchConversations(): Promise<Conversation[]> {
  const { userId, profile, admin } = await ctx(["client", "admin", "technician"]);
  let q = admin.from("tickets").select("id,ticket_code,title,status,client_id,technician_id,updated_at").order("updated_at", { ascending: false });
  if (profile.role === "client") q = q.eq("client_id", userId);
  if (profile.role === "technician") q = q.eq("technician_id", userId);
  const { data: tickets } = await q;
  const out: Conversation[] = [];
  for (const t of ((tickets as unknown[]) ?? []) as Array<{
    id: number; ticket_code: string; title: string; status: TicketStatus;
    client_id: string; technician_id: string | null; updated_at: string;
  }>) {
    const [{ data: last }, { data: c }, { data: tech }] = await Promise.all([
      admin.from("messages").select("text,created_at").eq("ticket_id", t.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      admin.from("profiles").select("name").eq("id", t.client_id).single(),
      t.technician_id
        ? admin.from("profiles").select("name").eq("id", t.technician_id).single()
        : Promise.resolve({ data: null }),
    ]);
    const lm = last as { text: string; created_at: string } | null;
    out.push({
      ticket_id: t.id,
      ticket_code: t.ticket_code,
      title: t.title,
      status: t.status,
      client_name: (c as { name: string } | null)?.name ?? null,
      technician_name: (tech as { name: string } | null)?.name ?? null,
      last_message: lm?.text ?? null,
      last_message_time: lm?.created_at ?? t.updated_at,
    });
  }
  return out;
}

export async function fetchNotifications(): Promise<Notification[]> {
  const { userId, admin } = await ctx(["client", "admin", "technician"]);
  const { data } = await admin
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  return (data ?? []) as Notification[];
}

export async function fetchStats(): Promise<Stats> {
  const { admin } = await ctx(["admin"]);
  const [total, sub, rev, asg, prog, pend, res, closed, high, clients, techs, avail, busy, off] =
    await Promise.all([
      admin.from("tickets").select("id", { count: "exact", head: true }),
      admin.from("tickets").select("id", { count: "exact", head: true }).eq("status", "SUBMITTED"),
      admin.from("tickets").select("id", { count: "exact", head: true }).eq("status", "UNDER_REVIEW"),
      admin.from("tickets").select("id", { count: "exact", head: true }).eq("status", "ASSIGNED"),
      admin.from("tickets").select("id", { count: "exact", head: true }).eq("status", "IN_PROGRESS"),
      admin.from("tickets").select("id", { count: "exact", head: true }).eq("status", "PENDING"),
      admin.from("tickets").select("id", { count: "exact", head: true }).eq("status", "RESOLVED"),
      admin.from("tickets").select("id", { count: "exact", head: true }).eq("status", "CLOSED"),
      admin.from("tickets").select("id", { count: "exact", head: true }).eq("priority", "HIGH"),
      admin.from("profiles").select("id", { count: "exact", head: true }).eq("role", "client"),
      admin.from("profiles").select("id", { count: "exact", head: true }).eq("role", "technician"),
      admin.from("profiles").select("id", { count: "exact", head: true }).eq("role", "technician").eq("status", "Available"),
      admin.from("profiles").select("id", { count: "exact", head: true }).eq("role", "technician").eq("status", "Busy"),
      admin.from("profiles").select("id", { count: "exact", head: true }).eq("role", "technician").eq("status", "Offline"),
    ]);
  return {
    tickets: {
      total: total.count ?? 0,
      new: sub.count ?? 0,
      under_review: rev.count ?? 0,
      assigned: asg.count ?? 0,
      in_progress: prog.count ?? 0,
      pending: pend.count ?? 0,
      resolved: res.count ?? 0,
      closed: closed.count ?? 0,
      high_priority: high.count ?? 0,
    },
    users: {
      total_clients: clients.count ?? 0,
      total_technicians: techs.count ?? 0,
      available: avail.count ?? 0,
      busy: busy.count ?? 0,
      offline: off.count ?? 0,
    },
  };
}

export async function fetchTechnicians() {
  const { admin } = await ctx(["admin"]);
  const { data: techs } = await admin
    .from("profiles")
    .select("*")
    .eq("role", "technician")
    .order("created_at", { ascending: false });
  const out = [];
  for (const t of ((techs as unknown[]) ?? []) as Profile[]) {
    const [{ count: active }, { count: done }] = await Promise.all([
      admin.from("tickets").select("id", { count: "exact", head: true }).eq("technician_id", t.id).in("status", ["ASSIGNED", "IN_PROGRESS", "PENDING"]),
      admin.from("tickets").select("id", { count: "exact", head: true }).eq("technician_id", t.id).eq("status", "CLOSED"),
    ]);
    out.push({ ...t, assigned_tickets: active ?? 0, completed_tickets: done ?? 0 });
  }
  return out;
}

export async function fetchClients() {
  const { admin } = await ctx(["admin"]);
  const { data: clients } = await admin
    .from("profiles")
    .select("*")
    .eq("role", "client")
    .order("created_at", { ascending: false });
  const out = [];
  for (const c of ((clients as unknown[]) ?? []) as Profile[]) {
    const { count } = await admin.from("tickets").select("id", { count: "exact", head: true }).eq("client_id", c.id);
    const { data: latest } = await admin
      .from("tickets")
      .select("ticket_code")
      .eq("client_id", c.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    out.push({
      ...c,
      total_tickets: count ?? 0,
      latest_ticket: (latest as { ticket_code: string } | null)?.ticket_code ?? null,
    });
  }
  return out;
}

export { canTransition };
export type { TicketStatus };
