"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { updateProfileAction } from "@/lib/actions/profile";
import type { Profile } from "@/lib/supabase/types";

export function ProfileForm({ profile, stats }: { profile: Profile; stats: { total: number; open: number; resolved: number } }) {
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState({
    name: profile.name,
    phone: profile.phone ?? "",
    location: profile.location ?? "",
    address: profile.address ?? "",
    avatar_url: profile.avatar_url ?? "",
  });

  async function save() {
    setPending(true);
    const res = await updateProfileAction(form);
    setPending(false);
    if (!res.ok) return toast.error(res.error);
    toast.success("Profile updated");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {[["Total", stats.total], ["Open", stats.open], ["Resolved", stats.resolved]].map(([l, v]) => (
          <Card key={l as string}>
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-muted-foreground">{l}</p>
              <p className="text-2xl font-bold">{v as number}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader><CardTitle>Edit profile</CardTitle></CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Full name</FieldLabel>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field>
              <FieldLabel>Email (read-only)</FieldLabel>
              <Input value={profile.email} disabled className="bg-muted" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="phone">Phone</FieldLabel>
                <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </Field>
              <Field>
                <FieldLabel htmlFor="location">Location</FieldLabel>
                <Input id="location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="address">Address</FieldLabel>
              <Input id="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </Field>
            <Field>
              <FieldLabel htmlFor="avatar">Avatar URL</FieldLabel>
              <Input id="avatar" value={form.avatar_url} onChange={(e) => setForm({ ...form, avatar_url: e.target.value })} />
            </Field>
            <div className="flex justify-end">
              <Button onClick={save} disabled={pending}>
                {pending && <Loader2 className="size-4 animate-spin" />} Save changes
              </Button>
            </div>
          </FieldGroup>
        </CardContent>
      </Card>
    </div>
  );
}
