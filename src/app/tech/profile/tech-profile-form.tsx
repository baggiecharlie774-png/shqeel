"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { updateAvailabilityAction, updateProfileAction } from "@/lib/actions/profile";
import type { Profile } from "@/lib/supabase/types";

export function TechProfileForm({ profile }: { profile: Profile }) {
  const [pending, setPending] = useState(false);
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [avatar, setAvatar] = useState(profile.avatar_url ?? "");
  const [status, setStatus] = useState(profile.status ?? "Available");

  async function save() {
    setPending(true);
    const res = await updateProfileAction({
      name: profile.name,
      phone,
      location: profile.location ?? "",
      address: profile.address ?? "",
      avatar_url: avatar,
      specialization: profile.specialization ?? "",
      status,
    });
    setPending(false);
    if (!res.ok) return toast.error(res.error);
    toast.success("Profile updated");
  }

  async function setAvailability(v: string) {
    setStatus(v);
    const res = await updateAvailabilityAction(v);
    if (!res.ok) return toast.error(res.error);
    toast.success(`Availability → ${v}`);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Card>
        <CardHeader><CardTitle>Technician profile</CardTitle></CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel>Name (managed by admin)</FieldLabel>
              <Input value={profile.name} disabled className="bg-muted" />
            </Field>
            <Field>
              <FieldLabel>Email (read-only)</FieldLabel>
              <Input value={profile.email} disabled className="bg-muted" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="phone">Phone</FieldLabel>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </Field>
              <Field>
                <FieldLabel htmlFor="status">Availability</FieldLabel>
                <NativeSelect id="status" value={status} onChange={(e) => setAvailability(e.target.value)}>
                  <NativeSelectOption value="Available">Available</NativeSelectOption>
                  <NativeSelectOption value="Busy">Busy</NativeSelectOption>
                  <NativeSelectOption value="Offline">Offline</NativeSelectOption>
                </NativeSelect>
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="avatar">Avatar URL</FieldLabel>
              <Input id="avatar" value={avatar} onChange={(e) => setAvatar(e.target.value)} />
            </Field>
            <div className="flex justify-end">
              <Button onClick={save} disabled={pending}>
                {pending && <Loader2 className="size-4 animate-spin" />} Save profile
              </Button>
            </div>
          </FieldGroup>
        </CardContent>
      </Card>
    </div>
  );
}
