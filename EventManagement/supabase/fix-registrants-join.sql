-- Fix: let PostgREST join event_registrations → profiles
-- (user_id currently only FKs auth.users, so admin "profiles(...)" embed can fail)
-- Safe to re-run.

-- Prefer FK to profiles (profiles.id already references auth.users)
alter table public.event_registrations
  drop constraint if exists event_registrations_user_id_fkey;

alter table public.event_registrations
  add constraint event_registrations_user_id_fkey
  foreign key (user_id) references public.profiles (id) on delete cascade;

-- Ensure every auth user has a profile (covers accounts created before the trigger)
insert into public.profiles (id, full_name)
select u.id, coalesce(u.raw_user_meta_data->>'full_name', '')
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;
