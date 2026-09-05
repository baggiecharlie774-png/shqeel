/**
 * Centralized environment access for HyperNetwork.
 * - `publicEnv()` reads NEXT_PUBLIC_* vars (safe in browser).
 * - `serverEnv()` additionally requires the service-role key (server only).
 * Both throw a single actionable error naming exactly which vars are missing,
 * instead of failing later inside Supabase calls.
 */

function missing(names: string[]): string {
  return (
    `Missing environment variables: ${names.join(", ")}. ` +
    `Copy .env.example to .env.local and fill them from ` +
    `Supabase Dashboard → Project Settings → API, then restart the dev server.`
  );
}

export interface PublicEnv {
  url: string;
  anonKey: string;
}

export function publicEnv(): PublicEnv {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const absent: string[] = [];
  if (!url) absent.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!anonKey) absent.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (absent.length > 0) throw new Error(missing(absent));
  return { url: url as string, anonKey: anonKey as string };
}

export interface ServerEnv extends PublicEnv {
  serviceRoleKey: string;
}

export function serverEnv(): ServerEnv {
  const pub = publicEnv();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) throw new Error(missing(["SUPABASE_SERVICE_ROLE_KEY"]));
  if (typeof window !== "undefined") {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY must only be used on the server.");
  }
  return { ...pub, serviceRoleKey };
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
