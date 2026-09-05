"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminSupabase } from "@/lib/supabase/admin";

export async function sendMessageAction(ticketId: number, text: string) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Not signed in" };
  const clean = text.trim();
  if (!clean) return { ok: false as const, error: "Message is required." };
  const admin = createAdminSupabase();
  const { data: profile } = await admin.from("profiles").select("role,name").eq("id", user.id).single();
  const role = (profile as { role: string; name: string } | null)?.role;
  if (!role) return { ok: false as const, error: "Profile not found" };
  const { data: ticket } = await admin
    .from("tickets")
    .select("id,ticket_code,client_id,technician_id")
    .eq("id", ticketId)
    .single();
  if (!ticket) return { ok: false as const, error: "Ticket not found." };
  const row = ticket as { ticket_code: string; client_id: string; technician_id: string | null };
  if (role === "client" && row.client_id !== user.id) return { ok: false as const, error: "Not your ticket." };
  if (role === "technician" && row.technician_id !== user.id) return { ok: false as const, error: "Not your ticket." };

  const { error } = await admin.from("messages").insert({ ticket_id: ticketId, sender_id: user.id, text: clean });
  if (error) return { ok: false as const, error: error.message };

  const senderName = (profile as { name: string }).name;
  if (role === "client" && row.technician_id) {
    await admin.from("notifications").insert({
      user_id: row.technician_id,
      icon: "💬",
      message: `Client message on ${row.ticket_code}: ${clean.slice(0, 60)}`,
      link: `/tech/tickets/${row.ticket_code}`,
    });
  } else if (role === "technician") {
    await admin.from("notifications").insert({
      user_id: row.client_id,
      icon: "💬",
      message: `${senderName} replied on ${row.ticket_code}`,
      link: `/client/tickets/${row.ticket_code}`,
    });
  }
  revalidatePath("/client/messages");
  revalidatePath("/tech/messages");
  revalidatePath("/admin/messages");
  return { ok: true as const };
}

export async function markNotificationReadAction(id: number) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Not signed in" };
  const admin = createAdminSupabase();
  await admin.from("notifications").update({ read: true }).eq("id", id).eq("user_id", user.id);
  revalidatePath("/client");
  revalidatePath("/admin");
  revalidatePath("/tech");
  return { ok: true as const };
}

export async function markAllNotificationsReadAction() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Not signed in" };
  const admin = createAdminSupabase();
  await admin.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false);
  revalidatePath("/client");
  revalidatePath("/admin");
  revalidatePath("/tech");
  return { ok: true as const };
}

export async function clearNotificationsAction() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Not signed in" };
  const admin = createAdminSupabase();
  await admin.from("notifications").delete().eq("user_id", user.id);
  revalidatePath("/client");
  revalidatePath("/admin");
  revalidatePath("/tech");
  return { ok: true as const };
}
