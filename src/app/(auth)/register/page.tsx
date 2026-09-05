"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { createClient } from "@/lib/supabase/client";
import { VALID_ROLES } from "@/lib/constants";

const schema = z.object({
  name: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Minimum 6 characters"),
  phone: z.string().optional(),
  location: z.string().optional(),
  role: z.enum(VALID_ROLES),
});

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: "client", name: "", email: "", password: "", phone: "", location: "" },
  });

  async function onSubmit(values: FormValues) {
    setPending(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: values.email.trim().toLowerCase(),
        password: values.password,
        options: { data: { name: values.name.trim(), role: values.role } },
      });
      if (error) throw error;
      const userId = data.user?.id;
      if (!userId) throw new Error("Sign-up succeeded — check your email to confirm, then sign in.");
      // The handle_new_user trigger creates the profile; backfill contact fields.
      const { error: upErr } = await supabase.from("profiles").upsert(
        {
          id: userId,
          name: values.name.trim(),
          email: values.email.trim().toLowerCase(),
          role: values.role,
          phone: values.phone?.trim() || null,
          location: values.location?.trim() || null,
          avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(values.name.trim())}&background=2563eb&color=fff`,
          status: values.role === "technician" ? "Available" : "Available",
          specialization: values.role === "technician" ? "General Support" : null,
        },
        { onConflict: "id" }
      );
      if (upErr) throw upErr;
      toast.success("Account created — signing you in");
      router.replace("/login");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Registration failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Create account</CardTitle>
        <CardDescription>Join HyperNetwork — choose your role</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Full name *</FieldLabel>
              <Input id="name" {...form.register("name")} placeholder="John Doe" />
              <FieldError>{form.formState.errors.name?.message}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email *</FieldLabel>
              <Input id="email" type="email" {...form.register("email")} placeholder="john@example.com" />
              <FieldError>{form.formState.errors.email?.message}</FieldError>
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="phone">Phone</FieldLabel>
                <Input id="phone" {...form.register("phone")} placeholder="+1 (555) 000-0000" />
              </Field>
              <Field>
                <FieldLabel htmlFor="role">Role *</FieldLabel>
                <NativeSelect id="role" {...form.register("role")}>
                  <NativeSelectOption value="client">Client</NativeSelectOption>
                  <NativeSelectOption value="technician">Technician</NativeSelectOption>
                  <NativeSelectOption value="admin">Admin</NativeSelectOption>
                </NativeSelect>
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="location">Location</FieldLabel>
              <Input id="location" {...form.register("location")} placeholder="New York, NY" />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password *</FieldLabel>
              <Input id="password" type="password" autoComplete="new-password" placeholder="Min 6 characters" {...form.register("password")} />
              <FieldError>{form.formState.errors.password?.message}</FieldError>
            </Field>
            <Button type="submit" className="w-full" disabled={pending}>
              {pending && <Loader2 className="size-4 animate-spin" />} Create account
            </Button>
          </FieldGroup>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
