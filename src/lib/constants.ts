export const VALID_ROLES = ["client", "admin", "technician"] as const;
export type Role = (typeof VALID_ROLES)[number];

export const VALID_STATUSES = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "ASSIGNED",
  "IN_PROGRESS",
  "PENDING",
  "RESOLVED",
  "CLOSED",
] as const;
export type TicketStatus = (typeof VALID_STATUSES)[number];

export const VALID_PRIORITIES = ["LOW", "MEDIUM", "HIGH"] as const;
export type TicketPriority = (typeof VALID_PRIORITIES)[number];

export const VALID_CATEGORIES = [
  "computer",
  "network",
  "printer",
  "software",
  "email",
  "other",
] as const;
export type TicketCategory = (typeof VALID_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<TicketCategory, string> = {
  computer: "Computer Problems",
  network: "Network Problems",
  printer: "Printer Problems",
  software: "Software Problems",
  email: "Email Problems",
  other: "Other Issues",
};

export const STATUS_LABELS: Record<TicketStatus, string> = {
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  PENDING: "Pending",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

/** Allowed transitions. Mirrors backend/models.py TRANSITIONS. */
export const TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  SUBMITTED: ["UNDER_REVIEW"],
  UNDER_REVIEW: ["ASSIGNED"],
  ASSIGNED: ["IN_PROGRESS"],
  IN_PROGRESS: ["PENDING", "RESOLVED", "CLOSED"],
  PENDING: ["IN_PROGRESS"],
  RESOLVED: ["CLOSED", "IN_PROGRESS"],
  CLOSED: [],
};

export function canTransition(from: TicketStatus, to: TicketStatus): boolean {
  return (TRANSITIONS[from] ?? []).includes(to);
}

export function generateTicketCode(): string {
  return `TK-${Math.floor(10000 + Math.random() * 90000)}`;
}

export function statusToDb(label: string): TicketStatus | null {
  const normalized = label.trim().toUpperCase().replace(/[\s-]+/g, "_");
  return (VALID_STATUSES as readonly string[]).includes(normalized)
    ? (normalized as TicketStatus)
    : null;
}

export const DEMO_ACCOUNTS = [
  { role: "Admin", email: "admin@hypernetwork.com", password: "Admin123!" },
  { role: "Technician", email: "sarah.jenkins@hypernetwork.com", password: "Tech123!" },
  { role: "Client", email: "john.doe@example.com", password: "Client123!" },
] as const;
