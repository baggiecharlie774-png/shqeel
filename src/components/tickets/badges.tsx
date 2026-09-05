import { Badge } from "@/components/ui/badge";
import { CATEGORY_LABELS, STATUS_LABELS } from "@/lib/constants";
import type { TicketCategory, TicketPriority, TicketStatus } from "@/lib/constants";
import { cn } from "@/lib/utils";

const STATUS_CLASS: Record<TicketStatus, string> = {
  SUBMITTED: "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200",
  UNDER_REVIEW: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  ASSIGNED: "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200",
  IN_PROGRESS: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  PENDING: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  RESOLVED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  CLOSED: "bg-muted text-muted-foreground",
};

export function StatusBadge({ status, className }: { status: TicketStatus; className?: string }) {
  return (
    <Badge variant="secondary" className={cn(STATUS_CLASS[status], className)}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}

export function PriorityBadge({ priority }: { priority: TicketPriority | null }) {
  if (!priority)
    return <span className="text-sm text-muted-foreground italic">Pending admin</span>;
  const color =
    priority === "HIGH"
      ? "text-red-600 dark:text-red-400"
      : priority === "MEDIUM"
        ? "text-amber-600 dark:text-amber-400"
        : "text-emerald-600 dark:text-emerald-400";
  return (
    <span className={`text-sm font-semibold ${color}`}>
      {priority.charAt(0) + priority.slice(1).toLowerCase()}
    </span>
  );
}

export function CategoryBadge({ category }: { category: TicketCategory }) {
  return <Badge variant="outline">{CATEGORY_LABELS[category] ?? category}</Badge>;
}
