import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    db: isSupabaseConfigured() ? "configured" : "missing-env",
    service: "hypernetwork",
  });
}
