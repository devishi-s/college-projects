-- Stage Membership — run in Supabase SQL Editor
-- Safe to re-run.
-- Adds society_members for Join Community + User Dashboard.

create table if not exists public.society_members (
  id uuid primary key default gen_random_uuid(),
  society_id uuid not null references public.societies (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  joined_at timestamptz not null default now(),
  unique (society_id, user_id)
);

create index if not exists society_members_society_id_idx
  on public.society_members (society_id);

create index if not exists society_members_user_id_idx
  on public.society_members (user_id);

alter table public.society_members enable row level security;

-- Anyone can read memberships (for live member counts)
drop policy if exists "Memberships are publicly readable" on public.society_members;
create policy "Memberships are publicly readable"
  on public.society_members for select
  using (true);

-- Logged-in users join as themselves only
drop policy if exists "Users can join societies" on public.society_members;
create policy "Users can join societies"
  on public.society_members for insert
  with check (auth.uid() = user_id);

-- Logged-in users leave their own memberships only
drop policy if exists "Users can leave societies" on public.society_members;
create policy "Users can leave societies"
  on public.society_members for delete
  using (auth.uid() = user_id);

comment on table public.society_members is 'CampusHub Join Community memberships';
