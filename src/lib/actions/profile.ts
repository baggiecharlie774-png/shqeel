"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminSupabase } from "@/lib/supabase/admin";

export async function updateProfileAction(input: {
  name: string;
  phone?: string;
  location?: string;
  address?: string;
  avatar_url?: string;
  specialization?: string;
  status?: string;
}) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Not signed in" };
  if (!input.name.trim()) return { ok: false as const, error: "Name is required." };
  const admin = createAdminSupabase();
  const { error } = await admin
    .from("profiles")
    .update({
      name: input.name.trim(),
      phone: input.phone?.trim() || null,
      location: input.location?.trim() || null,
      address: input.address?.trim() || null,
      avatar_url: input.avatar_url?.trim() || null,
      specialization: input.specialization?.trim() || null,
      status: input.status || undefined,
    })
    .eq("id", user.id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/client/profile");
  revalidatePath("/tech/profile");
  return { ok: true as const };
}

export async function updateAvailabilityAction(status: string) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Not signed in" };
  if (!["Available", "Busy", "Offline"].includes(status))
    return { ok: false as const, error: "Invalid status." };
  const admin = createAdminSupabase();
  const { error } = await admin.from("profiles").update({ status }).eq("id", user.id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/tech");
  revalidatePath("/tech/profile");
  revalidatePath("/admin/technicians");
  return { ok: true as const };
}
