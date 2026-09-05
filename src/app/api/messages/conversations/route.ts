import { NextResponse } from "next/server";
import { fetchConversations } from "@/lib/data";

export async function GET() {
  try {
    return NextResponse.json(await fetchConversations());
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
  }
}
