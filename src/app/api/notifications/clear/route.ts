import { NextResponse } from "next/server";
import { clearNotificationsAction } from "@/lib/actions/messaging";

export async function DELETE() {
  const res = await clearNotificationsAction();
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 401 });
  return NextResponse.json({ ok: true });
}

// Some clients use POST for clear; accept both.
export async function POST() {
  const res = await clearNotificationsAction();
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 401 });
  return NextResponse.json({ ok: true });
}
