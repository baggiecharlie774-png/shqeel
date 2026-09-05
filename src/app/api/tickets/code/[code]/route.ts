import { NextResponse } from "next/server";
import { fetchTicketByCode } from "@/lib/data";

export async function GET(_: Request, ctx: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await ctx.params;
    const ticket = await fetchTicketByCode(decodeURIComponent(code));
    return NextResponse.json(ticket);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    const code = msg.includes("not found") ? 404 : msg.includes("Forbidden") ? 403 : 500;
    return NextResponse.json({ error: msg }, { status: code });
  }
}
