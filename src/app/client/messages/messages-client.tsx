"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Paperclip, Send } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/tickets/badges";
import { createClient } from "@/lib/supabase/client";
import { sendMessageAction } from "@/lib/actions/messaging";
import type { Conversation, Message } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

export function MessagesClient({ initial, userId }: { initial: Conversation[]; userId: string }) {
  const [convs] = useState(initial);
  const [activeId, setActiveId] = useState<number | null>(initial[0]?.ticket_id ?? null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const active = useMemo(() => convs.find((c) => c.ticket_id === activeId) ?? null, [convs, activeId]);

  async function load(ticketId: number) {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("messages")
        .select("*, sender:profiles!messages_sender_id_fkey(id,name,role)")
        .eq("ticket_id", ticketId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      setMessages((data as unknown as Message[]) ?? []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not load messages");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (activeId) load(activeId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  useEffect(() => {
    if (!activeId) return;
    let channel: ReturnType<ReturnType<typeof createClient>["channel"]> | null = null;
    try {
      channel = createClient()
        .channel(`msg-${activeId}`)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `ticket_id=eq.${activeId}` }, () => load(activeId))
        .subscribe();
    } catch {
      channel = null;
    }
    return () => {
      try {
        if (channel) createClient().removeChannel(channel);
      } catch { /* noop */ }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    if (!draft.trim() || !activeId) return;
    setSending(true);
    const res = await sendMessageAction(activeId, draft);
    setSending(false);
    if (!res.ok) return toast.error(res.error);
    setDraft("");
    load(activeId);
  }

  if (convs.length === 0) {
    return (
      <Card className="p-10 text-center text-sm text-muted-foreground">
        No conversations yet — messages appear here once a ticket has replies.
      </Card>
    );
  }

  return (
    <Card className="grid min-h-[600px] overflow-hidden p-0 md:grid-cols-[320px_1fr]">
      <div className="border-b bg-muted/40 md:border-b-0 md:border-r">
        <p className="border-b p-4 font-semibold">Conversations</p>
        <div className="max-h-64 overflow-y-auto md:max-h-none">
          {convs.map((c) => (
            <button
              key={c.ticket_id}
              onClick={() => setActiveId(c.ticket_id)}
              className={cn(
                "block w-full border-b border-l-4 p-4 text-left hover:bg-background",
                c.ticket_id === activeId ? "border-l-primary bg-background" : "border-l-transparent"
              )}
            >
              <span className="flex items-center justify-between gap-2">
                <strong className="truncate text-sm">{c.technician_name ?? c.client_name ?? c.title}</strong>
                <StatusBadge status={c.status} />
              </span>
              <span className="mt-0.5 block font-mono text-xs text-primary">{c.ticket_code}</span>
              <span className="block truncate text-sm text-muted-foreground">{c.last_message ?? c.title}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-3 border-b p-4">
          <Avatar><AvatarFallback>{(active?.technician_name ?? "IT").slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
          <div>
            <p className="font-semibold">{active?.technician_name ?? "Support team"}</p>
            <p className="font-mono text-xs text-muted-foreground">{active?.ticket_code} · {active?.title}</p>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto bg-muted/30 p-4" style={{ minHeight: 380 }}>
          {loading ? (
            <p className="m-auto flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Loading…</p>
          ) : messages.length === 0 ? (
            <p className="m-auto text-sm text-muted-foreground">No messages yet — say hello.</p>
          ) : (
            messages.map((m) => {
              const mine = m.sender_id === userId;
              return (
                <div key={m.id} className={cn("flex flex-col", mine ? "items-end" : "items-start")}>
                  <span className={cn("max-w-[75%] rounded-2xl px-3 py-2 text-sm", mine ? "bg-primary text-primary-foreground" : "border bg-background")}>
                    {m.text}
                  </span>
                  <span className="mt-0.5 text-xs text-muted-foreground">
                    {m.sender?.name ?? ""} · {new Date(m.created_at).toLocaleString()}
                  </span>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>
        <form
          className="flex gap-2 border-t p-3"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <Button type="button" variant="outline" size="icon" title="Attachments are added from the ticket page" onClick={() => toast.info("Open the ticket to attach screenshots or files.")}>
            <Paperclip />
          </Button>
          <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Type your message…" />
          <Button type="submit" disabled={sending || !draft.trim()}>
            {sending ? <Loader2 className="size-4 animate-spin" /> : <Send />} Send
          </Button>
        </form>
      </div>
    </Card>
  );
}
