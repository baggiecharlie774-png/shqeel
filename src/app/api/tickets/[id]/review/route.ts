import { NextResponse } from "next/server";
import { reviewTicketAction } from "@/lib/actions/tickets";
import type { TicketPriority } from "@/lib/constants";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const p = String(body.priority ?? "").toUpperCase() as TicketPriority | "";
  const res = await reviewTicketAction(Number(id), p === "" ? null : (p as TicketPriority));
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
