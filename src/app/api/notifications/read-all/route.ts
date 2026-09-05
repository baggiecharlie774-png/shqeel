import { NextResponse } from "next/server";
import { markAllNotificationsReadAction } from "@/lib/actions/messaging";

export async function POST() {
  const res = await markAllNotificationsReadAction();
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 401 });
  return NextResponse.json({ ok: true });
}
