"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import type { Notification } from "@/lib/supabase/types";

export function NotificationBell({ userId }: { userId: string }) {
  const [items, setItems] = useState<Notification[]>([]);

  async function load() {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);
      setItems((data as Notification[]) ?? []);
    } catch {
      // Supabase not configured — bell stays empty.
    }
  }

  useEffect(() => {
    load();
    let channel: ReturnType<ReturnType<typeof createClient>["channel"]> | null = null;
    try {
      const supabase = createClient();
      channel = supabase
        .channel(`notif-${userId}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
          () => load()
        )
        .subscribe();
    } catch {
      channel = null;
    }
    return () => {
      try {
        if (channel) createClient().removeChannel(channel);
      } catch {
        // ignore
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const unread = items.filter((n) => !n.read).length;

  async function markAllRead() {
    try {
      const supabase = createClient();
      await supabase.from("notifications").update({ read: true }).eq("user_id", userId).eq("read", false);
      load();
    } catch {
      // ignore
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="size-4" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          Notifications
          <button onClick={markAllRead} className="text-xs font-medium text-primary hover:underline">
            Mark all read
          </button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.length === 0 && (
          <p className="px-2 py-6 text-center text-sm text-muted-foreground">No notifications</p>
        )}
        {items.map((n) => (
          <DropdownMenuItem key={n.id} asChild>
            <Link href={n.link || "#"} className="flex items-start gap-2">
              <span className="text-base">{n.icon}</span>
              <span className="min-w-0">
                <span className={`block truncate text-sm ${n.read ? "" : "font-semibold"}`}>
                  {n.message}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(n.created_at).toLocaleString()}
                </span>
              </span>
              {!n.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
