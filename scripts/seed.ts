/**
 * Seed HyperNetwork Supabase project with demo users, tickets, messages, notifications.
 * Mirrors backend/seed.py from the Flask app.
 *
 * Usage:
 *   1. Create Supabase project, run supabase/schema.sql in SQL editor
 *   2. cp .env.example .env.local and fill keys (service role required)
 *   3. pnpm seed
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { createClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !SERVICE) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
const admin = createClient(URL, SERVICE, { auth: { autoRefreshToken: false, persistSession: false } });

const USERS = [
  { name: "Alex Morgan", email: "admin@hypernetwork.com", password: "Admin123!", role: "admin", phone: "+1 (555) 000-0001", location: "HQ, Silicon Valley" },
  { name: "Alex Morgan", email: "alex.morgan@hypernetwork.com", password: "Tech123!", role: "technician", phone: "+1 (555) 234-5678", location: "NY", specialization: "Senior System Engineer", status: "Busy" },
  { name: "Sarah Jenkins", email: "sarah.jenkins@hypernetwork.com", password: "Tech123!", role: "technician", phone: "+1 (555) 345-6789", location: "NY", specialization: "Network Specialist", status: "Available" },
  { name: "David Smith", email: "david.smith@hypernetwork.com", password: "Tech123!", role: "technician", phone: "+1 (555) 456-7890", location: "SF", specialization: "Helpdesk Support Tier 2", status: "Busy" },
  { name: "Jessica Taylor", email: "jessica.taylor@hypernetwork.com", password: "Tech123!", role: "technician", phone: "+1 (555) 567-8901", location: "Austin", specialization: "Cybersecurity Analyst", status: "Available" },
  { name: "Robert Chen", email: "robert.chen@hypernetwork.com", password: "Tech123!", role: "technician", phone: "+1 (555) 678-9012", location: "Boston", specialization: "Database Administrator", status: "Offline" },
  { name: "Emily Davis", email: "emily.davis@hypernetwork.com", password: "Tech123!", role: "technician", phone: "+1 (555) 789-0123", location: "Chicago", specialization: "Hardware Technician", status: "Available" },
  { name: "John Doe", email: "john.doe@example.com", password: "Client123!", role: "client", phone: "+1 (555) 019-2834", location: "New York, NY", address: "Building A, Room 302" },
  { name: "Global Logistics Ltd", email: "support@globallogistics.com", password: "Client123!", role: "client", phone: "+1 (555) 111-2233", location: "New York, USA" },
  { name: "Apex Financial Inc", email: "it@apexfinancial.com", password: "Client123!", role: "client", phone: "+1 (555) 222-3344", location: "Chicago, USA" },
  { name: "Summit Retail Group", email: "ops@summitretail.com", password: "Client123!", role: "client", phone: "+1 (555) 333-4455", location: "San Francisco, USA" },
  { name: "Metro Healthcare", email: "admin@metrohealth.org", password: "Client123!", role: "client", phone: "+1 (555) 444-5566", location: "Boston, USA" },
];

const TICKETS = [
  { code: "TK-84920", title: "Cannot connect office laptop to wireless network", category: "network", desc: "Office laptop dropped Wi-Fi; 'Can't connect to this network' after two restarts.", client: "john.doe@example.com", tech: "sarah.jenkins@hypernetwork.com", status: "IN_PROGRESS", priority: "HIGH" },
  { code: "TK-84812", title: "Main office printer showing paper jam error constantly", category: "printer", desc: "Printer tray 2 shows jam error even when clear.", client: "john.doe@example.com", tech: "sarah.jenkins@hypernetwork.com", status: "ASSIGNED", priority: "MEDIUM" },
  { code: "TK-84501", title: "Outlook email client crashes on startup", category: "email", desc: "Outlook crashes immediately after splash screen.", client: "john.doe@example.com", tech: null, status: "SUBMITTED", priority: null },
  { code: "TK-83921", title: "Computer blue screen error when opening CAD software", category: "computer", desc: "BSOD 0x0000007E on CAD launch.", client: "john.doe@example.com", tech: "alex.morgan@hypernetwork.com", status: "UNDER_REVIEW", priority: "HIGH" },
  { code: "TK-82109", title: "Password reset request for billing portal account", category: "software", desc: "Need password reset for billing portal.", client: "john.doe@example.com", tech: "jessica.taylor@hypernetwork.com", status: "CLOSED", priority: "LOW" },
  { code: "TCK-1092", title: "VPN Connection Failure", category: "network", desc: "VPN gateway timeout on Frankfurt node after security patch.", client: "support@globallogistics.com", tech: "alex.morgan@hypernetwork.com", status: "IN_PROGRESS", priority: "HIGH" },
  { code: "TCK-1091", title: "Outlook Email Sync Error", category: "email", desc: "Exchange sync error after certificate rotation - Chicago branch.", client: "it@apexfinancial.com", tech: "sarah.jenkins@hypernetwork.com", status: "ASSIGNED", priority: "MEDIUM" },
  { code: "TCK-1090", title: "Printer Driver Update", category: "printer", desc: "Update printer drivers for Summit Retail.", client: "ops@summitretail.com", tech: "david.smith@hypernetwork.com", status: "PENDING", priority: "LOW" },
  { code: "TCK-1089", title: "Server Storage Expansion", category: "computer", desc: "Expand server storage for Metro Healthcare.", client: "admin@metrohealth.org", tech: "alex.morgan@hypernetwork.com", status: "RESOLVED", priority: "HIGH" },
  { code: "TCK-1088", title: "New Workstation Setup", category: "computer", desc: "Setup new workstation for Vanguard Media.", client: "support@globallogistics.com", tech: "jessica.taylor@hypernetwork.com", status: "IN_PROGRESS", priority: "MEDIUM" },
];

async function upsertUser(u: (typeof USERS)[number]): Promise<string> {
  const { data: existing } = await admin.from("profiles").select("id").eq("email", u.email).maybeSingle();
  if (existing) {
    const id = (existing as { id: string }).id;
    await admin.from("profiles").update({
      name: u.name, role: u.role, phone: u.phone ?? null, location: u.location ?? null,
      address: (u as { address?: string }).address ?? null,
      specialization: (u as { specialization?: string }).specialization ?? null,
      status: (u as { status?: string }).status ?? "Available",
      avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=2563eb&color=fff`,
    }).eq("id", id);
    await admin.auth.admin.updateUserById(id, { password: u.password, email_confirm: true, user_metadata: { name: u.name, role: u.role } });
    return id;
  }
  const { data, error } = await admin.auth.admin.createUser({
    email: u.email, password: u.password, email_confirm: true,
    user_metadata: { name: u.name, role: u.role },
  });
  if (error || !data.user) throw new Error(`createUser ${u.email}: ${error?.message}`);
  const id = data.user.id;
  await admin.from("profiles").upsert({
    id, name: u.name, email: u.email.toLowerCase(), role: u.role,
    phone: u.phone ?? null, location: u.location ?? null,
    address: (u as { address?: string }).address ?? null,
    specialization: (u as { specialization?: string }).specialization ?? null,
    status: (u as { status?: string }).status ?? "Available",
    avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=2563eb&color=fff`,
  }, { onConflict: "id" });
  return id;
}

async function main() {
  console.log("[seed] upserting users…");
  const ids: Record<string, string> = {};
  for (const u of USERS) ids[u.email] = await upsertUser(u);
  console.log(`[seed] ${Object.keys(ids).length} users`);

  console.log("[seed] clearing tickets…");
  await admin.from("timeline_events").delete().neq("id", 0);
  await admin.from("work_notes").delete().neq("id", 0);
  await admin.from("messages").delete().neq("id", 0);
  await admin.from("notifications").delete().neq("id", 0);
  await admin.from("attachments").delete().neq("id", 0);
  await admin.from("tickets").delete().neq("id", 0);

  console.log("[seed] inserting tickets…");
  for (const t of TICKETS) {
    const clientId = ids[t.client];
    const techId = t.tech ? ids[t.tech] : null;
    const { data: ticket, error } = await admin.from("tickets").insert({
      ticket_code: t.code, title: t.title, category: t.category, description: t.desc,
      location: USERS.find((u) => u.email === t.client)?.location ?? null,
      priority: t.priority, status: t.status, client_id: clientId, technician_id: techId,
    }).select("id").single();
    if (error || !ticket) throw new Error(`ticket ${t.code}: ${error?.message}`);
    const tid = (ticket as { id: number }).id;
    const events: Array<[string, string]> = [["Ticket created", "Client submitted support request"]];
    if (t.status !== "SUBMITTED") events.push(["Admin reviewed request", `Priority set to ${t.priority ?? "Pending"}`]);
    if (["ASSIGNED", "IN_PROGRESS", "PENDING", "RESOLVED", "CLOSED"].includes(t.status) && techId)
      events.push(["Technician assigned", "Admin assigned a technician"]);
    if (["IN_PROGRESS", "PENDING", "RESOLVED", "CLOSED"].includes(t.status)) events.push(["Technician started work", "Diagnostics initiated"]);
    if (["RESOLVED", "CLOSED"].includes(t.status)) events.push(["Marked as Resolved", "Awaiting client confirmation"]);
    if (t.status === "CLOSED") events.push(["Client confirmed", "Ticket closed successfully"]);
    for (const [title, description] of events)
      await admin.from("timeline_events").insert({ ticket_id: tid, title, description });
    if (t.status === "RESOLVED")
      await admin.from("notifications").insert({ user_id: clientId, icon: "✅", message: `Ticket ${t.code} marked as resolved - please confirm`, link: `/client/tickets/${t.code}` });
    if (t.status === "IN_PROGRESS")
      await admin.from("notifications").insert({ user_id: clientId, icon: "⚙️", message: `Ticket ${t.code} status changed to In Progress`, link: `/client/tickets/${t.code}` });
  }
  const { data: tk } = await admin.from("tickets").select("id").eq("ticket_code", "TK-84920").single();
  if (tk) {
    const tid = (tk as { id: number }).id;
    await admin.from("messages").insert([
      { ticket_id: tid, sender_id: ids["sarah.jenkins@hypernetwork.com"], text: "Hello! I've been assigned to your Wi-Fi connectivity issue." },
      { ticket_id: tid, sender_id: ids["john.doe@example.com"], text: "Hi, thanks. It keeps disconnecting every 10 minutes." },
      { ticket_id: tid, sender_id: ids["sarah.jenkins@hypernetwork.com"], text: "I'm checking the adapter settings now." },
    ]);
  }
  console.log("[seed] DONE — admin@hypernetwork.com/Admin123!, sarah.jenkins@hypernetwork.com/Tech123!, john.doe@example.com/Client123!");
}

main().catch((e) => { console.error(e); process.exit(1); });
