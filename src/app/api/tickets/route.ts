import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { VALID_CATEGORIES, generateTicketCode } from "@/lib/constants";

export async function GET(req: Request) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    const admin = createAdminSupabase();
    const { data: profile } = await admin.from("profiles").select("role").eq("id", user.id).single();
    const role = (profile as { role: string } | null)?.role;
    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const priority = url.searchParams.get("priority");
    const search = url.searchParams.get("search") ?? "";
    let q = admin.from("tickets").select("*").order("created_at", { ascending: false });
    if (role === "client") q = q.eq("client_id", user.id);
    if (role === "technician") q = q.eq("technician_id", user.id);
    if (status) q = q.eq("status", status);
    if (priority) q = q.eq("priority", priority.toUpperCase());
    if (search) q = q.or(`ticket_code.ilike.%${search}%,title.ilike.%${search}%,description.ilike.%${search}%`);
    const { data, error } = await q;
    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    const admin = createAdminSupabase();
    const { data: profile } = await admin.from("profiles").select("role,name").eq("id", user.id).single();
    const p = profile as { role: string; name: string } | null;
    if (!p || !["client", "admin"].includes(p.role))
      return NextResponse.json({ error: "Only clients/admins can create tickets" }, { status: 403 });
    const body = await req.json();
    const title = String(body.title ?? "").trim();
    const category = String(body.category ?? "").trim().toLowerCase();
    const description = String(body.description ?? "").trim();
    const location = String(body.location ?? body.hometown ?? "").trim() || null;
    if (!title || !description || !category)
      return NextResponse.json({ error: "title, category, description required" }, { status: 400 });
    if (!(VALID_CATEGORIES as readonly string[]).includes(category))
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    let code = generateTicketCode();
    for (let i = 0; i < 5; i++) {
      const { data } = await admin.from("tickets").select("id").eq("ticket_code", code).maybeSingle();
      if (!data) break;
      code = generateTicketCode();
    }
    const { data: ticket, error } = await admin
      .from("tickets")
      .insert({ ticket_code: code, title, category, description, location, status: "SUBMITTED", client_id: user.id })
      .select("*")
      .single();
    if (error || !ticket) return NextResponse.json({ error: error?.message ?? "Create failed" }, { status: 500 });
    const tid = (ticket as { id: number }).id;
    await admin.from("timeline_events").insert({ ticket_id: tid, title: "Ticket created", description: `${p.name} submitted a support request` });
    return NextResponse.json(ticket, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
  }
}
