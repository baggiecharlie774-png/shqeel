import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import type { Profile } from "@/lib/supabase/types";
import type { Role } from "@/lib/constants";

export async function getSessionUser() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function getCurrentProfile(): Promise<{
  supabase: Awaited<ReturnType<typeof createServerSupabase>>;
  user: NonNullable<Awaited<ReturnType<typeof getSessionUser>>["user"]>;
  profile: Profile;
} | null> {
  const { supabase, user } = await getSessionUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  if (!profile) return null;
  return { supabase, user, profile: profile as Profile };
}

export async function requireProfile(allowed: Role[]): Promise<{
  profile: Profile;
  userId: string;
}> {
  const ctx = await getCurrentProfile();
  if (!ctx) redirect("/login");
  if (!allowed.includes(ctx.profile.role)) {
    const fallback =
      ctx.profile.role === "admin"
        ? "/admin"
        : ctx.profile.role === "technician"
          ? "/tech"
          : "/client";
    redirect(fallback);
  }
  return { profile: ctx.profile, userId: ctx.user.id };
}

export function dashboardForRole(role: Role): string {
  if (role === "admin") return "/admin";
  if (role === "technician") return "/tech";
  return "/client";
}
