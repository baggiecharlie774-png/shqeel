# HyperNetwork — Next.js Full-Stack (TypeScript + shadcn/ui + Supabase)

Complete rebuild of the Hyper Network IT support system. One codebase, 100% TS/TSX:
Next.js App Router frontend + API, Supabase Postgres + Auth + Storage + Realtime backend,
shadcn/ui components throughout. No Python, no vanilla HTML pages.

## Workspaces

| URL | Role | Pages |
|-----|------|-------|
| `/client` | client | Dashboard, My Tickets, New Ticket, Ticket Details (`/client/tickets/[code]`), Messages, Profile, Settings |
| `/tech` | technician | Dashboard, Assigned Queue, Completed, Workstation (`/tech/tickets/[code]`), Messages, Profile, Settings |
| `/admin` | admin | Dashboard, Tickets (review/assign/priority), Technicians, Clients, Messages, Settings |
| `/login`, `/register` | public | Supabase Auth, role auto-detect + redirect |

Ticket lifecycle (enforced server-side in `src/lib/actions/tickets.ts`):

```
SUBMITTED → UNDER_REVIEW → ASSIGNED → IN_PROGRESS ⇄ PENDING → RESOLVED → CLOSED
```

## Setup (5 minutes)

1. **Supabase project** — create one at [supabase.com](https://supabase.com), then open
   SQL Editor and run the whole `supabase/schema.sql` (tables, RLS, `tickets` storage
   bucket, auto-profile trigger).

2. **Env** —
   ```bash
   cp .env.example .env.local
   # fill NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
   # SUPABASE_SERVICE_ROLE_KEY from Project Settings → API
   ```

3. **Install + seed + run** —
   ```bash
   pnpm install
   pnpm seed     # 12 users, 10 tickets, messages, notifications
   pnpm dev      # http://localhost:3000
   ```

## Demo accounts (seeded)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hypernetwork.com | Admin123! |
| Technician | sarah.jenkins@hypernetwork.com | Tech123! |
| Technician | alex.morgan@hypernetwork.com | Tech123! |
| Client | john.doe@example.com | Client123! |
| Client | support@globallogistics.com | Client123! |

## API (compat with the old Flask contracts)

`GET /api/health` · `GET/POST /api/tickets` · `GET /api/tickets/[id]` ·
`GET /api/tickets/code/[code]` · `POST …/[id]/review` · `POST …/[id]/assign` ·
`PATCH …/[id]/status` · `POST …/[id]/confirm` · `GET/POST …/[id]/notes` ·
`PATCH …/[id]/priority` · `GET/POST /api/messages` · `GET /api/messages/conversations` ·
`GET /api/notifications` (+ `[id]/read`, `read-all`, `clear`) · `GET /api/stats|technicians|clients`

The UI itself uses Server Actions (`src/lib/actions/`) + Realtime subscriptions;
the REST layer exists for integrations and the handoff client.

## Project layout

```
supabase/schema.sql        # Postgres schema + RLS + storage (run once per project)
scripts/seed.ts            # demo data (pnpm seed)
src/lib/constants.ts       # roles, statuses, TRANSITIONS, labels
src/lib/env.ts             # validated env access (publicEnv/serverEnv)
src/lib/supabase/          # browser/server/admin clients, middleware helper, types
src/lib/auth.ts            # getCurrentProfile / requireProfile / dashboardForRole
src/lib/data.ts            # server-side reads (tickets, conversations, stats…)
src/lib/actions/           # mutations: tickets lifecycle, messaging, profile
src/components/layout/     # AppShell sidebar, NotificationBell, StatCard, SetupScreen
src/components/tickets/    # StatusBadge, PriorityBadge, StatusStepper
src/app/(auth)/            # login, register
src/app/client|admin|tech/ # the three workspaces
src/app/api/               # REST compat layer
```

## Vercel handoff (prepared, not deployed)

- No local sockets, no filesystem uploads (attachments → Supabase Storage `tickets` bucket).
- Add the three env vars in Vercel Project Settings → Environment Variables.
- Run `supabase/schema.sql` + `pnpm seed` against the Supabase project first.
- `pnpm build` passes clean; authenticated routes are `force-dynamic`, public pages static.
- Supabase Auth free tier: 50,000 MAU, unlimited total users, 2 active projects
  (projects pause after 1 week idle — use Pro $25/mo for always-on client work).
