import { NextResponse } from "next/server";
import { fetchClients } from "@/lib/data";

export async function GET() {
  try {
    return NextResponse.json(await fetchClients());
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
  }
}
