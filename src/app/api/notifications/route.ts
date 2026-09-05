import { NextResponse } from "next/server";
import { fetchNotifications } from "@/lib/data";
import { clearNotificationsAction, markAllNotificationsReadAction } from "@/lib/actions/messaging";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET() {
  try {
    return NextResponse.json(await fetchNotifications());
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
  }
}

export async function DELETE() {
  const res = await clearNotificationsAction();
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 401 });
  return NextResponse.json({ ok: true });
}

export async function POST(req: Request) {
  // Compat: POST /api/notifications/read-all and POST /api/notifications/clear
  const url = new URL(req.url);
  if (url.pathname.endsWith("/read-all")) {
    const res = await markAllNotificationsReadAction();
    if (!res.ok) return NextResponse.json({ error: res.error }, { status: 401 });
    return NextResponse.json({ ok: true });
  }
  if (url.pathname.endsWith("/clear")) {
    const res = await clearNotificationsAction();
    if (!res.ok) return NextResponse.json({ error: res.error }, { status: 401 });
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Unknown action" }, { status: 404 });
}

export async function PATCH(req: Request) {
  // Compat helper (canonical route is /api/notifications/[id]/read)
  const body = await req.json().catch(() => ({}));
  const id = Number(body.id);
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  await createAdminSupabase().from("notifications").update({ read: true }).eq("id", id).eq("user_id", user.id);
  return NextResponse.json({ ok: true });
}
