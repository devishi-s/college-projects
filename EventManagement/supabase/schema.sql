-- Run this in Supabase Dashboard → SQL Editor → New query → Run
-- Safe to re-run: uses IF NOT EXISTS where possible.

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update own profile (not is_admin)"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper: is current user admin?
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select is_admin from public.profiles where id = auth.uid()),
    false
  );
$$;

-- Societies
create table if not exists public.societies (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  tagline text,
  description text,
  focus text[] default '{}',
  logo_path text,
  accent text,
  soft text,
  deep text,
  president_name text default 'President',
  vice_president_name text default 'Vice President',
  created_at timestamptz not null default now()
);

alter table public.societies enable row level security;

create policy "Societies are public read"
  on public.societies for select
  using (true);

create policy "Admins manage societies"
  on public.societies for all
  using (public.is_admin())
  with check (public.is_admin());

-- Events
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  society_id uuid not null references public.societies (id) on delete cascade,
  title text not null,
  description text,
  venue text,
  starts_at timestamptz not null,
  banner_path text,
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now()
);

alter table public.events enable row level security;

create policy "Events are public read"
  on public.events for select
  using (true);

create policy "Admins manage events"
  on public.events for all
  using (public.is_admin())
  with check (public.is_admin());

-- Interest registrations
create table if not exists public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (event_id, user_id)
);

-- Prefer profiles FK so PostgREST can embed profiles(...) from registrations.
-- profiles.id already references auth.users, so cascade still applies.
do $$
begin
  alter table public.event_registrations
    drop constraint if exists event_registrations_user_id_fkey;
  alter table public.event_registrations
    add constraint event_registrations_user_id_fkey
    foreign key (user_id) references public.profiles (id) on delete cascade;
exception
  when others then null;
end $$;

alter table public.event_registrations enable row level security;

create policy "Users see own registrations"
  on public.event_registrations for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Logged-in users can register"
  on public.event_registrations for insert
  with check (auth.uid() = user_id);

create policy "Users can cancel own registration"
  on public.event_registrations for delete
  using (auth.uid() = user_id or public.is_admin());

-- Seed 5 DTC societies
insert into public.societies (slug, name, tagline, description, focus, accent, soft, deep)
values
  (
    'cesta',
    'CESTA',
    'Code, create, and collaborate.',
    'CESTA is the hands-on tech club at Delhi Technical Campus — competitive DSA, game & app development, UI/UX design, and a welcoming open-source culture.',
    array['DSA','Gaming','Development','Design','Open Source'],
    '#e8917a', '#ffe8df', '#b85a45'
  ),
  (
    'indus-rise',
    'Indus Rise',
    'Forging futures, building industries.',
    'Indus Rise explores AI, blockchain, and the metaverse to revive economies and build industry-ready ventures.',
    array['AI','Blockchain','Metaverse','Industry','Ventures'],
    '#c97b8a', '#fce8ec', '#8a4555'
  ),
  (
    'ai-renaissance',
    'AI Renaissance',
    'AIML, tech, and innovation.',
    'AI Renaissance is the campus hub for machine learning, applied AI, and innovation projects.',
    array['AIML','Tech','Innovation','Research','Projects'],
    '#9b8ec4', '#efeaf8', '#5f4f8a'
  ),
  (
    'foss',
    'FOSS',
    'Open source & hacker culture.',
    'FOSS champions free and open-source software at DTC — contribution drives, hackathons, and building in public.',
    array['Open Source','Hackathons','Linux','Community','Contribute'],
    '#6fae8f', '#e5f5eb', '#3d6b52'
  ),
  (
    'gdg',
    'Google Developer Group',
    'AIML, data science & Google tech.',
    'GDG at Delhi Technical Campus runs workshops and solution challenges around AIML, data science, and Google developer tools.',
    array['AIML','Data Science','GDSC Solutions','Workshops','Google Tech'],
    '#6a9fbf', '#e5f2f8', '#3d6a82'
  )
on conflict (slug) do nothing;

-- Storage policies (buckets society-logos & event-banners must already exist as public)
-- Public read
create policy "Public read society logos"
  on storage.objects for select
  using (bucket_id = 'society-logos');

create policy "Public read event banners"
  on storage.objects for select
  using (bucket_id = 'event-banners');

-- Admin write
create policy "Admins upload society logos"
  on storage.objects for insert
  with check (bucket_id = 'society-logos' and public.is_admin());

create policy "Admins update society logos"
  on storage.objects for update
  using (bucket_id = 'society-logos' and public.is_admin());

create policy "Admins upload event banners"
  on storage.objects for insert
  with check (bucket_id = 'event-banners' and public.is_admin());

create policy "Admins update event banners"
  on storage.objects for update
  using (bucket_id = 'event-banners' and public.is_admin());

-- AFTER you create your first Auth user via the app Login page, promote them:
-- update public.profiles set is_admin = true where id = '<your-user-uuid>';
-- Find uuid in Authentication → Users.
