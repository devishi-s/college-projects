-- Stage 6 additions — run in Supabase SQL Editor
-- Safe to re-run.

alter table public.events
  add column if not exists capacity integer;

alter table public.societies
  add column if not exists instagram_url text,
  add column if not exists linkedin_url text;

-- Optional: give existing events a default capacity so seat counts work
update public.events
set capacity = 150
where capacity is null;

comment on column public.events.capacity is 'Max registrations; null = unlimited';
comment on column public.societies.instagram_url is 'Optional Instagram profile URL';
comment on column public.societies.linkedin_url is 'Optional LinkedIn page URL';

-- Allow public read of registrations so live "n/m registered" counts work.
-- Insert/delete policies stay restricted to the signed-in user (or admin).
drop policy if exists "Users see own registrations" on public.event_registrations;

create policy "Registrations are publicly readable"
  on public.event_registrations for select
  using (true);
