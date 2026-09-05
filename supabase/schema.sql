-- HyperNetwork schema for Supabase Postgres.
-- Run in Supabase Dashboard → SQL Editor (in order), or `supabase db push`.
-- Mirrors backend/models.py: users→profiles, tickets, timeline_events, work_notes,
-- messages, notifications, attachments.

-- ── helpers ────────────────────────────────────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── profiles (1 row per auth.users row) ────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  role text not null check (role in ('client','admin','technician')),
  phone text,
  location text,
  address text,
  avatar_url text,
  specialization text,
  status text not null default 'Available',
  created_at timestamptz not null default now()
);

-- ── tickets ────────────────────────────────────────────────────────────────
create table if not exists public.tickets (
  id bigint generated always as identity primary key,
  ticket_code text not null unique,
  title text not null,
  category text not null check (category in ('computer','network','printer','software','email','other')),
  description text not null,
  location text,
  priority text check (priority in ('LOW','MEDIUM','HIGH')),
  status text not null default 'SUBMITTED'
    check (status in ('SUBMITTED','UNDER_REVIEW','ASSIGNED','IN_PROGRESS','PENDING','RESOLVED','CLOSED')),
  client_id uuid not null references public.profiles(id) on delete cascade,
  technician_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_tickets_updated on public.tickets;
create trigger trg_tickets_updated before update on public.tickets
  for each row execute function public.handle_updated_at();

create index if not exists idx_tickets_client on public.tickets(client_id);
create index if not exists idx_tickets_tech on public.tickets(technician_id);
create index if not exists idx_tickets_status on public.tickets(status);
create index if not exists idx_tickets_code on public.tickets(ticket_code);

-- ── timeline ───────────────────────────────────────────────────────────────
create table if not exists public.timeline_events (
  id bigint generated always as identity primary key,
  ticket_id bigint not null references public.tickets(id) on delete cascade,
  title text not null,
  description text,
  created_at timestamptz not null default now()
);
create index if not exists idx_timeline_ticket on public.timeline_events(ticket_id);

-- ── work notes ─────────────────────────────────────────────────────────────
create table if not exists public.work_notes (
  id bigint generated always as identity primary key,
  ticket_id bigint not null references public.tickets(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  note text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_notes_ticket on public.work_notes(ticket_id);

-- ── messages ───────────────────────────────────────────────────────────────
create table if not exists public.messages (
  id bigint generated always as identity primary key,
  ticket_id bigint not null references public.tickets(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_messages_ticket on public.messages(ticket_id);

-- ── notifications ──────────────────────────────────────────────────────────
create table if not exists public.notifications (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  icon text not null default '🎫',
  message text not null,
  link text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_notif_user on public.notifications(user_id);

-- ── attachments (metadata; bytes live in Storage bucket `tickets`) ─────────
create table if not exists public.attachments (
  id bigint generated always as identity primary key,
  ticket_id bigint not null references public.tickets(id) on delete cascade,
  filename text not null,
  filepath text not null,
  uploaded_at timestamptz not null default now()
);

-- ── auto-create profile on signup ──────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'client')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Row Level Security ─────────────────────────────────────────────────────
-- App enforces RBAC in server code; RLS blocks anonymous access and lets any
-- signed-in user work with tickets/messages (client sees own via queries).
alter table public.profiles enable row level security;
alter table public.tickets enable row level security;
alter table public.timeline_events enable row level security;
alter table public.work_notes enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.attachments enable row level security;

drop policy if exists "authenticated read profiles" on public.profiles;
create policy "authenticated read profiles" on public.profiles
  for select to authenticated using (true);
drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile" on public.profiles
  for update to authenticated using (auth.uid() = id);
drop policy if exists "users insert own profile" on public.profiles;
create policy "users insert own profile" on public.profiles
  for insert to authenticated with check (auth.uid() = id);

drop policy if exists "authenticated all tickets" on public.tickets;
create policy "authenticated all tickets" on public.tickets
  for all to authenticated using (true) with check (true);
drop policy if exists "authenticated all timeline" on public.timeline_events;
create policy "authenticated all timeline" on public.timeline_events
  for all to authenticated using (true) with check (true);
drop policy if exists "authenticated all notes" on public.work_notes;
create policy "authenticated all notes" on public.work_notes
  for all to authenticated using (true) with check (true);
drop policy if exists "authenticated all messages" on public.messages;
create policy "authenticated all messages" on public.messages
  for all to authenticated using (true) with check (true);
drop policy if exists "authenticated all notifications" on public.notifications;
create policy "authenticated all notifications" on public.notifications
  for all to authenticated using (true) with check (true);
drop policy if exists "authenticated all attachments" on public.attachments;
create policy "authenticated all attachments" on public.attachments
  for all to authenticated using (true) with check (true);

-- ── Storage bucket for ticket attachments ──────────────────────────────────
insert into storage.buckets (id, name, public)
values ('tickets', 'tickets', false)
on conflict (id) do nothing;

drop policy if exists "authenticated upload tickets" on storage.objects;
create policy "authenticated upload tickets" on storage.objects
  for insert to authenticated with check (bucket_id = 'tickets');
drop policy if exists "authenticated read tickets" on storage.objects;
create policy "authenticated read tickets" on storage.objects
  for select to authenticated using (bucket_id = 'tickets');
drop policy if exists "authenticated delete tickets" on storage.objects;
create policy "authenticated delete tickets" on storage.objects
  for delete to authenticated using (bucket_id = 'tickets');
