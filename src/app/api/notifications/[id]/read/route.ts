import { NextResponse } from "next/server";
import { markNotificationReadAction } from "@/lib/actions/messaging";

export async function PATCH(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const res = await markNotificationReadAction(Number(id));
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 401 });
  return NextResponse.json({ ok: true });
}
