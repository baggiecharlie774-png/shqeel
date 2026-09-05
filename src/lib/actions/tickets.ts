"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminSupabase } from "@/lib/supabase/admin";
import {
  VALID_CATEGORIES,
  canTransition,
  generateTicketCode,
} from "@/lib/constants";
import type { TicketCategory, TicketPriority, TicketStatus } from "@/lib/constants";
import type { Profile } from "@/lib/supabase/types";

async function actor(allowed: Profile["role"][]) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Not signed in" };
  const admin = createAdminSupabase();
  const { data: profile } = await admin.from("profiles").select("*").eq("id", user.id).single();
  if (!profile) return { ok: false as const, error: "Profile not found" };
  const p = profile as Profile;
  if (!allowed.includes(p.role)) return { ok: false as const, error: "Forbidden for your role" };
  return { ok: true as const, user, profile: p, admin };
}

function revalidateTicket(code: string) {
  revalidatePath("/client/tickets");
  revalidatePath(`/client/tickets/${code}`);
  revalidatePath("/admin/tickets");
  revalidatePath("/tech");
  revalidatePath("/tech/assigned");
}

export async function createTicketAction(input: {
  title: string;
  category: string;
  description: string;
  location?: string;
}): Promise<{ ok: true; code: string } | { ok: false; error: string }> {
  const a = await actor(["client", "admin"]);
  if (!a.ok) return { ok: false, error: a.error };
  const title = input.title.trim();
  const category = input.category.trim().toLowerCase() as TicketCategory;
  const description = input.description.trim();
  if (!title || !description) return { ok: false, error: "Title and description are required." };
  if (!(VALID_CATEGORIES as readonly string[]).includes(category))
    return { ok: false, error: "Invalid category." };

  let code = generateTicketCode();
  for (let i = 0; i < 5; i++) {
    const { data } = await a.admin.from("tickets").select("id").eq("ticket_code", code).maybeSingle();
    if (!data) break;
    code = generateTicketCode();
  }
  const { data: ticket, error } = await a.admin
    .from("tickets")
    .insert({
      ticket_code: code,
      title,
      category,
      description,
      location: input.location?.trim() || null,
      status: "SUBMITTED",
      priority: null,
      client_id: a.user.id,
    })
    .select("id")
    .single();
  if (error || !ticket) return { ok: false, error: error?.message ?? "Could not create ticket." };
  const tid = (ticket as { id: number }).id;
  await a.admin.from("timeline_events").insert({
    ticket_id: tid,
    title: "Ticket created",
    description: `${a.profile.name} submitted a support request`,
  });
  const { data: admins } = await a.admin.from("profiles").select("id").eq("role", "admin");
  for (const adm of ((admins as unknown[]) ?? []) as Array<{ id: string }>) {
    await a.admin.from("notifications").insert({
      user_id: adm.id,
      icon: "🎫",
      message: `New ticket ${code} created by ${a.profile.name}`,
      link: "/admin/tickets",
    });
  }
  revalidateTicket(code);
  return { ok: true, code };
}

export async function reviewTicketAction(ticketId: number, priority: TicketPriority | null) {
  const a = await actor(["admin"]);
  if (!a.ok) return { ok: false as const, error: a.error };
  const { data: t } = await a.admin.from("tickets").select("*").eq("id", ticketId).single();
  if (!t) return { ok: false as const, error: "Ticket not found." };
  const row = t as { status: TicketStatus; ticket_code: string; client_id: string };
  if (row.status !== "SUBMITTED")
    return { ok: false as const, error: `Only SUBMITTED tickets can be reviewed (now ${row.status}).` };
  const { error } = await a.admin
    .from("tickets")
    .update({ priority, status: "UNDER_REVIEW" })
    .eq("id", ticketId);
  if (error) return { ok: false as const, error: error.message };
  await a.admin.from("timeline_events").insert({
    ticket_id: ticketId,
    title: "Admin reviewed request",
    description: `Priority set to ${priority ?? "PENDING"}; marked as Under Review`,
  });
  await a.admin.from("notifications").insert({
    user_id: row.client_id,
    icon: "🔍",
    message: `Ticket ${row.ticket_code} reviewed by admin`,
    link: `/client/tickets/${row.ticket_code}`,
  });
  revalidateTicket(row.ticket_code);
  return { ok: true as const };
}

export async function assignTicketAction(ticketId: number, technicianId: string) {
  const a = await actor(["admin"]);
  if (!a.ok) return { ok: false as const, error: a.error };
  const { data: tech } = await a.admin.from("profiles").select("*").eq("id", technicianId).single();
  if (!tech || (tech as Profile).role !== "technician")
    return { ok: false as const, error: "Technician not found." };
  const { data: t } = await a.admin.from("tickets").select("*").eq("id", ticketId).single();
  if (!t) return { ok: false as const, error: "Ticket not found." };
  const row = t as { status: TicketStatus; ticket_code: string; client_id: string; priority: TicketPriority | null };
  if (!["SUBMITTED", "UNDER_REVIEW", "ASSIGNED"].includes(row.status))
    return { ok: false as const, error: `Cannot assign while ${row.status}.` };
  const { error } = await a.admin
    .from("tickets")
    .update({ technician_id: technicianId, status: "ASSIGNED", priority: row.priority ?? "MEDIUM" })
    .eq("id", ticketId);
  if (error) return { ok: false as const, error: error.message };
  const techName = (tech as Profile).name;
  await a.admin.from("timeline_events").insert({
    ticket_id: ticketId,
    title: "Technician assigned",
    description: `Admin assigned ${techName}`,
  });
  await a.admin.from("notifications").insert([
    { user_id: technicianId, icon: "🎫", message: `New ticket assigned: ${row.ticket_code}`, link: "/tech/assigned" },
    { user_id: row.client_id, icon: "👨‍💻", message: `${techName} was assigned to ${row.ticket_code}`, link: `/client/tickets/${row.ticket_code}` },
  ]);
  revalidateTicket(row.ticket_code);
  return { ok: true as const };
}

export async function updateTicketStatusAction(ticketId: number, next: TicketStatus) {
  const a = await actor(["technician", "admin"]);
  if (!a.ok) return { ok: false as const, error: a.error };
  const { data: t } = await a.admin.from("tickets").select("*").eq("id", ticketId).single();
  if (!t) return { ok: false as const, error: "Ticket not found." };
  const row = t as { status: TicketStatus; ticket_code: string; client_id: string; technician_id: string | null };
  if (a.profile.role === "technician") {
    if (row.technician_id !== a.user.id) return { ok: false as const, error: "Not your ticket." };
    if (!["IN_PROGRESS", "PENDING", "RESOLVED"].includes(next))
      return { ok: false as const, error: "Technicians can only set In Progress / Pending / Resolved." };
  }
  if (!canTransition(row.status, next))
    return { ok: false as const, error: `Invalid transition ${row.status} → ${next}.` };
  const { error } = await a.admin.from("tickets").update({ status: next }).eq("id", ticketId);
  if (error) return { ok: false as const, error: error.message };
  await a.admin.from("timeline_events").insert({
    ticket_id: ticketId,
    title: `Status changed to ${next}`,
    description: `Changed from ${row.status} by ${a.profile.role} ${a.profile.name}`,
  });
  const icon = next === "RESOLVED" ? "✅" : next === "PENDING" ? "⏳" : "⚙️";
  const msg =
    next === "RESOLVED"
      ? `Ticket ${row.ticket_code} marked as resolved — please confirm`
      : `Ticket ${row.ticket_code} is now ${next}`;
  await a.admin.from("notifications").insert({
    user_id: row.client_id,
    icon,
    message: msg,
    link: `/client/tickets/${row.ticket_code}`,
  });
  revalidateTicket(row.ticket_code);
  return { ok: true as const };
}

export async function confirmTicketAction(ticketId: number, confirmed: boolean, reason?: string) {
  const a = await actor(["client"]);
  if (!a.ok) return { ok: false as const, error: a.error };
  const { data: t } = await a.admin.from("tickets").select("*").eq("id", ticketId).single();
  if (!t) return { ok: false as const, error: "Ticket not found." };
  const row = t as { status: TicketStatus; ticket_code: string; client_id: string; technician_id: string | null };
  if (row.client_id !== a.user.id) return { ok: false as const, error: "Not your ticket." };
  if (row.status !== "RESOLVED") return { ok: false as const, error: "Only resolved tickets can be confirmed." };
  const next: TicketStatus = confirmed ? "CLOSED" : "IN_PROGRESS";
  await a.admin.from("tickets").update({ status: next }).eq("id", ticketId);
  await a.admin.from("timeline_events").insert({
    ticket_id: ticketId,
    title: confirmed ? "Client confirmed resolution" : "Client reopened ticket",
    description: confirmed ? "Ticket closed successfully" : reason || "Client reported it is not resolved",
  });
  if (row.technician_id) {
    await a.admin.from("notifications").insert({
      user_id: row.technician_id,
      icon: confirmed ? "✅" : "🔄",
      message: confirmed
        ? `Ticket ${row.ticket_code} confirmed closed by client`
        : `Ticket ${row.ticket_code} reopened by client`,
      link: `/tech/tickets/${row.ticket_code}`,
    });
  }
  revalidateTicket(row.ticket_code);
  return { ok: true as const };
}

export async function addWorkNoteAction(ticketId: number, note: string) {
  const a = await actor(["client", "admin", "technician"]);
  if (!a.ok) return { ok: false as const, error: a.error };
  const text = note.trim();
  if (!text) return { ok: false as const, error: "Note is required." };
  const { data: t } = await a.admin.from("tickets").select("client_id,technician_id,ticket_code").eq("id", ticketId).single();
  if (!t) return { ok: false as const, error: "Ticket not found." };
  const row = t as { client_id: string; technician_id: string | null; ticket_code: string };
  if (a.profile.role === "client" && row.client_id !== a.user.id)
    return { ok: false as const, error: "Not your ticket." };
  if (a.profile.role === "technician" && row.technician_id !== a.user.id)
    return { ok: false as const, error: "Not your ticket." };
  const { error } = await a.admin.from("work_notes").insert({ ticket_id: ticketId, author_id: a.user.id, note: text });
  if (error) return { ok: false as const, error: error.message };
  await a.admin.from("timeline_events").insert({
    ticket_id: ticketId,
    title: `${a.profile.role} note`,
    description: text.slice(0, 120),
  });
  revalidateTicket(row.ticket_code);
  return { ok: true as const };
}

export async function setPriorityAction(ticketId: number, priority: TicketPriority) {
  const a = await actor(["admin"]);
  if (!a.ok) return { ok: false as const, error: a.error };
  const { data: t } = await a.admin.from("tickets").select("ticket_code").eq("id", ticketId).single();
  if (!t) return { ok: false as const, error: "Ticket not found." };
  await a.admin.from("tickets").update({ priority }).eq("id", ticketId);
  await a.admin.from("timeline_events").insert({
    ticket_id: ticketId,
    title: "Priority updated",
    description: `Priority set to ${priority}`,
  });
  revalidateTicket((t as { ticket_code: string }).ticket_code);
  return { ok: true as const };
}
