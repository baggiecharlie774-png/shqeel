import { createClient } from "@supabase/supabase-js";
import { serverEnv } from "@/lib/env";

/** Service-role client. Server-only. Bypasses RLS — callers must enforce RBAC. */
export function createAdminSupabase() {
  const { url, serviceRoleKey } = serverEnv();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createClient<any>(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
