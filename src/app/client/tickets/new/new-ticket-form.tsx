"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { createTicketAction } from "@/lib/actions/tickets";
import { CATEGORY_LABELS, VALID_CATEGORIES } from "@/lib/constants";

const schema = z.object({
  title: z.string().min(4, "Give a short summary (min 4 chars)"),
  category: z.enum(VALID_CATEGORIES),
  description: z.string().min(10, "Describe the problem (min 10 chars)"),
  location: z.string().optional(),
});

type Values = z.infer<typeof schema>;

export function NewTicketForm({ presetCategory }: { presetCategory?: string }) {
  const router = useRouter();
  const preset = presetCategory;
  const [pending, setPending] = useState(false);
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      category: (VALID_CATEGORIES as readonly string[]).includes(preset ?? "") ? (preset as Values["category"]) : "computer",
      description: "",
      location: "",
    },
  });

  async function onSubmit(v: Values) {
    setPending(true);
    const res = await createTicketAction(v);
    setPending(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success(`Ticket ${res.code} created`);
    router.push(`/client/tickets/${res.code}`);
  }

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>Create support ticket</CardTitle>
        <CardDescription>An admin will review and assign a technician shortly.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="title">Problem summary *</FieldLabel>
              <Input id="title" placeholder="e.g. Cannot connect laptop to Wi-Fi" {...form.register("title")} />
              <FieldError>{form.formState.errors.title?.message}</FieldError>
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="category">Category *</FieldLabel>
                <NativeSelect id="category" {...form.register("category")}>
                  {VALID_CATEGORIES.map((c) => (
                    <NativeSelectOption key={c} value={c}>{CATEGORY_LABELS[c]}</NativeSelectOption>
                  ))}
                </NativeSelect>
              </Field>
              <Field>
                <FieldLabel htmlFor="location">Location</FieldLabel>
                <Input id="location" placeholder="New York, NY" {...form.register("location")} />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="description">Details *</FieldLabel>
              <Textarea id="description" rows={6} placeholder="What happens, error messages, steps you tried…" {...form.register("description")} />
              <FieldError>{form.formState.errors.description?.message}</FieldError>
            </Field>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" disabled={pending}>
                {pending && <Loader2 className="size-4 animate-spin" />} Submit ticket
              </Button>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
