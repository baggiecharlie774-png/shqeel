import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 pt-6">
        <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </span>
        <span>
          <span className="block text-sm text-muted-foreground">{label}</span>
          <span className="block text-2xl font-bold">{value}</span>
          {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
        </span>
      </CardContent>
    </Card>
  );
}
