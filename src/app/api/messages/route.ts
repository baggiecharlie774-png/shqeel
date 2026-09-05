import { NextResponse } from "next/server";
import { fetchConversations, fetchMessages } from "@/lib/data";
import { sendMessageAction } from "@/lib/actions/messaging";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const ticketId = url.searchParams.get("ticket_id");
    if (ticketId) return NextResponse.json(await fetchMessages(Number(ticketId)));
    return NextResponse.json(await fetchConversations());
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const res = await sendMessageAction(Number(body.ticket_id), String(body.text ?? body.message ?? ""));
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 400 });
  return NextResponse.json({ ok: true }, { status: 201 });
}
