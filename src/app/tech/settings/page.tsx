import { requireProfile } from "@/lib/auth";
import { SettingsClient } from "@/app/client/settings/settings-client";

export default async function TechSettingsPage() {
  const { profile } = await requireProfile(["technician"]);
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Settings</h2>
        <p className="text-sm text-muted-foreground">Notifications, password and session.</p>
      </div>
      <SettingsClient email={profile.email} />
    </div>
  );
}
