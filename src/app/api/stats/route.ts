import { NextResponse } from "next/server";
import { fetchClients, fetchStats, fetchTechnicians } from "@/lib/data";

export async function GET() {
  try {
    return NextResponse.json(await fetchStats());
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    const code = msg.includes("Forbidden") ? 403 : 500;
    return NextResponse.json({ error: msg }, { status: code });
  }
}
