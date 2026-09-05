"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Headset, Loader2 } from "lucide-react";
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
import { createClient } from "@/lib/supabase/client";
import { DEMO_ACCOUNTS } from "@/lib/constants";
import { dashboardForRole } from "@/lib/role-client";
import type { Role } from "@/lib/constants";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const next = useSearchParams().get("next");
  const [pending, setPending] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: FormValues) {
    setPending(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email.trim().toLowerCase(),
        password: values.password,
      });
      if (error) throw error;
      const userId = data.user?.id;
      if (!userId) throw new Error("Sign-in succeeded but no user returned.");
      const { data: profile, error: pErr } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();
      if (pErr || !profile) throw new Error("Account has no profile row. Run supabase/schema.sql and scripts/seed.ts.");
      toast.success("Signed in");
      router.replace(next || dashboardForRole((profile as { role: Role }).role));
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Sign-in failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <span className="mx-auto flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Headset className="size-5" />
        </span>
        <CardTitle className="mt-2 text-2xl">HyperNetwork login</CardTitle>
        <CardDescription>Sign in to your support workspace</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" {...form.register("email")} />
              <FieldError>{form.formState.errors.email?.message}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input id="password" type="password" autoComplete="current-password" placeholder="••••••••" {...form.register("password")} />
              <FieldError>{form.formState.errors.password?.message}</FieldError>
            </Field>
            <Button type="submit" className="w-full" disabled={pending}>
              {pending && <Loader2 className="size-4 animate-spin" />} Sign in
            </Button>
          </FieldGroup>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          No account?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Create one
          </Link>
        </p>
        <div className="mt-4 rounded-xl border bg-muted/50 p-3 text-xs">
          <p className="mb-1 font-semibold">Demo accounts</p>
          {DEMO_ACCOUNTS.map((a) => (
            <p key={a.email} className="font-mono">
              {a.role}: {a.email} / {a.password}
            </p>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
