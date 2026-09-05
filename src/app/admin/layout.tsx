import { requireProfile } from "@/lib/auth";
import { AppShell } from "@/components/layout/app-shell";
import { NotificationBell } from "@/components/layout/notification-bell";
import { SetupScreen } from "@/components/layout/setup-guard";
import { isSupabaseConfigured } from "@/lib/supabase/server";

// Authenticated workspace — never prerender without a session.
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) {
    return (
      <div className="min-h-screen bg-muted/40 p-4">
        <SetupScreen />
      </div>
    );
  }
  const { profile, userId } = await requireProfile(["admin"]);
  return (
    <AppShell
      role="admin"
      profile={profile}
      title="Admin console"
      subtitle={`Signed in as ${profile.name}`}
      actions={<NotificationBell userId={userId} />}
    >
      {children}
    </AppShell>
  );
}
