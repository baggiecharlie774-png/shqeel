import { fetchTickets } from "@/lib/data";
import { requireProfile } from "@/lib/auth";
import { ProfileForm } from "./profile-form";

export default async function ClientProfilePage() {
  const { profile } = await requireProfile(["client"]);
  const tickets = await fetchTickets({ scope: "mine" });
  return (
    <ProfileForm
      profile={profile}
      stats={{
        total: tickets.length,
        open: tickets.filter((t) => ["SUBMITTED", "UNDER_REVIEW", "ASSIGNED", "IN_PROGRESS", "PENDING"].includes(t.status)).length,
        resolved: tickets.filter((t) => ["RESOLVED", "CLOSED"].includes(t.status)).length,
      }}
    />
  );
}
