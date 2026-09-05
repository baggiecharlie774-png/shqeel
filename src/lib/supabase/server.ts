import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { isSupabaseConfigured, publicEnv } from "@/lib/env";

export { isSupabaseConfigured };

export async function createServerSupabase() {
  const { url, anonKey } = publicEnv();
  const cookieStore = await cookies();
  // Untyped: tables are created by supabase/schema.sql.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createServerClient<any>(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component — middleware refreshes the session.
        }
      },
    },
  });
}
