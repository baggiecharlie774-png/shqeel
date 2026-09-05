import { fetchConversations } from "@/lib/data";
import { requireProfile } from "@/lib/auth";
import { MessagesClient } from "@/app/client/messages/messages-client";

export default async function AdminMessagesPage() {
  const { userId } = await requireProfile(["admin"]);
  const convs = await fetchConversations();
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Support messages</h2>
        <p className="text-sm text-muted-foreground">Every ticket conversation across clients and technicians.</p>
      </div>
      <MessagesClient initial={convs} userId={userId} />
    </div>
  );
}
