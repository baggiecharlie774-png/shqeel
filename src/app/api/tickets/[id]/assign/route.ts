import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { assignTicketAction } from "@/lib/actions/tickets";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  let techId = String(body.technician_id ?? "");
  // Accept email or name like the Flask API did.
  if (!techId && (body.technician_email || body.technician_name)) {
    try {
      const admin = createAdminSupabase();
      const supabase = await createServerSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
      if (body.technician_email) {
        const { data } = await admin.from("profiles").select("id").eq("email", String(body.technician_email).toLowerCase()).eq("role", "technician").maybeSingle();
        if (data) techId = (data as { id: string }).id;
      } else {
        const { data } = await admin.from("profiles").select("id").eq("name", String(body.technician_name)).eq("role", "technician").maybeSingle();
        if (data) techId = (data as { id: string }).id;
      }
    } catch {
      // fall through to not-found below
    }
  }
  if (!techId) return NextResponse.json({ error: "technician_id (or email/name) required" }, { status: 400 });
  const res = await assignTicketAction(Number(id), techId);
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
