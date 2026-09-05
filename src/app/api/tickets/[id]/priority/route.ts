import { NextResponse } from "next/server";
import { setPriorityAction } from "@/lib/actions/tickets";
import type { TicketPriority } from "@/lib/constants";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const res = await setPriorityAction(Number(id), String(body.priority ?? "").toUpperCase() as TicketPriority);
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
