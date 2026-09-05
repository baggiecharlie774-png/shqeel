import { fetchConversations } from "@/lib/data";
import { requireProfile } from "@/lib/auth";
import { MessagesClient } from "@/app/client/messages/messages-client";

export default async function TechMessagesPage() {
  const { userId } = await requireProfile(["technician"]);
  const convs = await fetchConversations();
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Client chats</h2>
        <p className="text-sm text-muted-foreground">Direct messages about your assigned tickets.</p>
      </div>
      <MessagesClient initial={convs} userId={userId} />
    </div>
  );
}
