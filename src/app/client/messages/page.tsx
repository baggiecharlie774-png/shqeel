import { fetchConversations } from "@/lib/data";
import { requireProfile } from "@/lib/auth";
import { MessagesClient } from "./messages-client";

export default async function ClientMessagesPage() {
  const { userId } = await requireProfile(["client"]);
  const convs = await fetchConversations();
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Support messages</h2>
        <p className="text-sm text-muted-foreground">Talk directly with your technician about active tickets.</p>
      </div>
      <MessagesClient initial={convs} userId={userId} />
    </div>
  );
}
