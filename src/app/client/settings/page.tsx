import { requireProfile } from "@/lib/auth";
import { SettingsClient } from "./settings-client";

export default async function ClientSettingsPage() {
  const { profile } = await requireProfile(["client"]);
  return <SettingsClient email={profile.email} />;
}
