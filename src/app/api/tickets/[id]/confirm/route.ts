import { NextResponse } from "next/server";
import { confirmTicketAction } from "@/lib/actions/tickets";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  let confirmed = body.confirmed ?? true;
  if (typeof confirmed === "string") confirmed = ["true", "yes", "1"].includes(confirmed.toLowerCase());
  const res = await confirmTicketAction(Number(id), Boolean(confirmed), body.reason);
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
