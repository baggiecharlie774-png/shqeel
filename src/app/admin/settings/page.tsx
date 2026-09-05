import { requireProfile } from "@/lib/auth";
import { ProfileForm } from "@/app/client/profile/profile-form";
import { fetchTickets } from "@/lib/data";

export default async function AdminSettingsPage() {
  const { profile } = await requireProfile(["admin"]);
  const tickets = await fetchTickets({ scope: "all" });
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Settings</h2>
        <p className="text-sm text-muted-foreground">Admin profile and console preferences.</p>
      </div>
      <ProfileForm
        profile={profile}
        stats={{
          total: tickets.length,
          open: tickets.filter((t) => t.status === "SUBMITTED").length,
          resolved: tickets.filter((t) => t.status === "CLOSED").length,
        }}
      />
    </div>
  );
}
