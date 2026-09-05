"use client";

import { createBrowserClient } from "@supabase/ssr";
import { publicEnv } from "@/lib/env";

export function createClient() {
  const { url, anonKey } = publicEnv();
  // Untyped client: schema is created by supabase/schema.sql at setup time.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createBrowserClient<any>(url, anonKey);
}
