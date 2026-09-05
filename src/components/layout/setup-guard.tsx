import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export function SetupScreen() {
  return (
    <div className="mx-auto max-w-xl py-16">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TriangleAlert className="size-5 text-amber-500" /> Supabase is not configured
          </CardTitle>
          <CardDescription>
            This workspace needs a Supabase project before it can load tickets.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <ol className="list-decimal space-y-1 pl-5">
            <li>Create a project at supabase.com</li>
            <li>
              Run <code>supabase/schema.sql</code> in the SQL editor
            </li>
            <li>
              Copy <code>.env.example</code> to <code>.env.local</code> and fill in keys
            </li>
            <li>
              Run <code>pnpm seed</code> then restart <code>pnpm dev</code>
            </li>
          </ol>
          <Button asChild>
            <Link href="/">Back to home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export async function SetupGuard({ children }: { children: React.ReactNode }) {
  if (isSupabaseConfigured()) return <>{children}</>;
  return <SetupScreen />;
}
