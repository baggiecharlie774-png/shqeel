import { Check } from "lucide-react";
import type { TicketStatus } from "@/lib/constants";
import { STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const STAGES: { key: TicketStatus; label: string }[] = [
  { key: "SUBMITTED", label: "Submitted" },
  { key: "UNDER_REVIEW", label: "Under Review" },
  { key: "ASSIGNED", label: "Assigned" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "RESOLVED", label: STATUS_LABELS.RESOLVED },
];

const ORDER: TicketStatus[] = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "ASSIGNED",
  "IN_PROGRESS",
  "PENDING",
  "RESOLVED",
  "CLOSED",
];

export function StatusStepper({ status }: { status: TicketStatus }) {
  const idx = ORDER.indexOf(status);
  const closed = status === "CLOSED";
  return (
    <div>
      <div className="flex items-start justify-between gap-2">
        {STAGES.map((s, i) => {
          const stageIdx = ORDER.indexOf(s.key);
          const done = closed || idx > stageIdx || status === s.key;
          const current = !closed && status === s.key;
          return (
            <div key={s.key} className="flex min-w-0 flex-1 flex-col items-center text-center">
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-full text-sm font-bold",
                  done && !current && "bg-emerald-600 text-white",
                  current && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                  !done && !current && "bg-muted text-muted-foreground"
                )}
              >
                {done && !current ? <Check className="size-4" /> : i + 1}
              </span>
              <span
                className={cn(
                  "mt-2 text-xs",
                  current ? "font-bold text-primary" : done ? "font-semibold" : "text-muted-foreground"
                )}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
      {status === "PENDING" && (
        <p className="mt-4 rounded-lg border-l-4 border-orange-500 bg-orange-500/5 p-3 text-sm">
          <strong>On hold:</strong> waiting on a response before work continues.
        </p>
      )}
      {closed && (
        <p className="mt-4 rounded-lg border-l-4 border-emerald-600 bg-emerald-600/5 p-3 text-sm">
          <strong>Closed:</strong> the client confirmed the resolution.
        </p>
      )}
    </div>
  );
}
