"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Headset,
  LayoutDashboard,
  LogOut,
  MessagesSquare,
  Settings,
  Ticket,
  User,
  UserCog,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/supabase/types";

export interface NavItem {
  href: string;
  label: string;
  icon: typeof Ticket;
}

export const NAV: Record<string, NavItem[]> = {
  client: [
    { href: "/client", label: "Dashboard", icon: LayoutDashboard },
    { href: "/client/tickets", label: "My Tickets", icon: Ticket },
    { href: "/client/messages", label: "Messages", icon: MessagesSquare },
    { href: "/client/profile", label: "My Profile", icon: User },
    { href: "/client/settings", label: "Settings", icon: Settings },
  ],
  technician: [
    { href: "/tech", label: "Dashboard", icon: LayoutDashboard },
    { href: "/tech/assigned", label: "Assigned Tickets", icon: Ticket },
    { href: "/tech/completed", label: "Completed", icon: Ticket },
    { href: "/tech/messages", label: "Messages", icon: MessagesSquare },
    { href: "/tech/profile", label: "My Profile", icon: User },
    { href: "/tech/settings", label: "Settings", icon: Settings },
  ],
  admin: [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/tickets", label: "Tickets", icon: Ticket },
    { href: "/admin/technicians", label: "Technicians", icon: UserCog },
    { href: "/admin/clients", label: "Clients", icon: Users },
    { href: "/admin/messages", label: "Messages", icon: MessagesSquare },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ],
};

export function AppShell({
  role,
  profile,
  title,
  subtitle,
  actions,
  children,
}: {
  role: "client" | "admin" | "technician";
  profile: Profile;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const items = NAV[role];
  const brand = role === "admin" ? "HyperNetwork Admin" : role === "technician" ? "HyperNetwork Tech" : "HyperNetwork";

  async function signOut() {
    try {
      await createClient().auth.signOut();
      toast.success("Signed out");
      router.replace("/login");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Sign-out failed");
    }
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-1 font-semibold">
            <span className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Headset className="size-4" />
            </span>
            {brand}
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarMenu>
              {items.map((item) => {
                const active =
                  item.href === `/${role}` || item.href === "/client"
                    ? pathname === item.href
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={active}>
                      <Link href={item.href}>
                        <item.icon /> {item.label}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-2 rounded-xl border p-2">
            <Avatar className="size-8">
              <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.name} />
              <AvatarFallback>{profile.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{profile.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {profile.specialization ?? profile.role}
              </p>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start text-destructive" onClick={signOut}>
            <LogOut /> Sign out
          </Button>
        </SidebarFooter>
      </Sidebar>
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur">
          <SidebarTrigger />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-semibold">{title}</h1>
            {subtitle && <p className="truncate text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          {actions}
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </SidebarProvider>
  );
}
