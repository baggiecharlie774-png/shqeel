import { NextResponse } from "next/server";
import { updateTicketStatusAction } from "@/lib/actions/tickets";
import type { TicketStatus } from "@/lib/constants";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const status = String(body.status ?? "").toUpperCase() as TicketStatus;
  const res = await updateTicketStatusAction(Number(id), status);
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
