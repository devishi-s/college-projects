-- Stage Feed — run in Supabase SQL Editor
-- Safe to re-run.
-- Prerequisite: public storage bucket "event-recap-photos" already created.

alter table public.events
  add column if not exists recap_description text,
  add column if not exists recap_photo_urls text[],
  add column if not exists recap_posted_at timestamptz;

comment on column public.events.recap_description is 'Post-event recap blurb; required for Feed visibility';
comment on column public.events.recap_photo_urls is 'Public URLs in event-recap-photos bucket';
comment on column public.events.recap_posted_at is 'When the recap was first published (or last major update)';

-- Storage: public read + admin write for event-recap-photos
drop policy if exists "Public read event recap photos" on storage.objects;
create policy "Public read event recap photos"
  on storage.objects for select
  using (bucket_id = 'event-recap-photos');

drop policy if exists "Admins upload event recap photos" on storage.objects;
create policy "Admins upload event recap photos"
  on storage.objects for insert
  with check (bucket_id = 'event-recap-photos' and public.is_admin());

drop policy if exists "Admins update event recap photos" on storage.objects;
create policy "Admins update event recap photos"
  on storage.objects for update
  using (bucket_id = 'event-recap-photos' and public.is_admin());

drop policy if exists "Admins delete event recap photos" on storage.objects;
create policy "Admins delete event recap photos"
  on storage.objects for delete
  using (bucket_id = 'event-recap-photos' and public.is_admin());
