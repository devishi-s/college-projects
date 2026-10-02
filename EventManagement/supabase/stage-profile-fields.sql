-- Stage Profile Fields — run in Supabase SQL Editor
-- Safe to re-run.
-- Completes student profile for non-admin users (gate before site access).

alter table public.profiles
  add column if not exists full_name text,
  add column if not exists enrollment_no text,
  add column if not exists batch text,
  add column if not exists course text,
  add column if not exists year text,
  add column if not exists profile_completed boolean not null default false;

comment on column public.profiles.enrollment_no is 'Student ID / enrollment number';
comment on column public.profiles.batch is 'Batch label (e.g. 2023-27)';
comment on column public.profiles.course is 'Course code (e.g. CSE, IT)';
comment on column public.profiles.year is 'Year of study (e.g. 2nd Year)';
comment on column public.profiles.profile_completed is 'Non-admins must complete profile before using the site';

-- Existing admins should not be blocked by the gate
update public.profiles
set profile_completed = true
where is_admin = true and profile_completed = false;
