"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { createClient } from "@/lib/supabase/client";

export function SettingsClient({ email }: { email: string }) {
  const router = useRouter();
  const [ticketUpdates, setTicketUpdates] = useState(true);
  const [messageAlerts, setMessageAlerts] = useState(true);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [busy, setBusy] = useState(false);

  async function changePassword() {
    if (next.length < 6) return toast.error("New password needs at least 6 characters.");
    setBusy(true);
    try {
      const { error } = await createClient().auth.updateUser({ password: next });
      if (error) throw error;
      toast.success("Password updated");
      setCurrent("");
      setNext("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update password");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    await createClient().auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>{email}</CardDescription>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader><CardTitle>Notifications</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center justify-between text-sm">
            Ticket updates and status changes
            <Switch checked={ticketUpdates} onCheckedChange={setTicketUpdates} />
          </label>
          <label className="flex items-center justify-between text-sm">
            In-app message notifications
            <Switch checked={messageAlerts} onCheckedChange={setMessageAlerts} />
          </label>
          <Button onClick={() => toast.success("Notification preferences saved")}>Save preferences</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Change password</CardTitle></CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="current">Current password (for verification)</FieldLabel>
              <Input id="current" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="••••••••" />
            </Field>
            <Field>
              <FieldLabel htmlFor="next">New password</FieldLabel>
              <Input id="next" type="password" value={next} onChange={(e) => setNext(e.target.value)} placeholder="Min 6 characters" />
            </Field>
            <div className="flex justify-end">
              <Button onClick={changePassword} disabled={busy}>
                {busy && <Loader2 className="size-4 animate-spin" />} Update password
              </Button>
            </div>
          </FieldGroup>
        </CardContent>
      </Card>
      <Card className="border-destructive/40">
        <CardHeader><CardTitle className="text-destructive">Sign out</CardTitle></CardHeader>
        <CardContent>
          <Button variant="outline" onClick={signOut}>Sign out of this device</Button>
        </CardContent>
      </Card>
    </div>
  );
}
