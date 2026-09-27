# CampusHub — Delhi Technical Campus

An event management hub for CS clubs (Next.js + Supabase). Desktop-first; no deploy required for the college project.

## Quick start

1. **Env** — `.env.local` already should have:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

2. **SQL (once)**  
   - Run `supabase/schema.sql` in Supabase → SQL Editor (tables, RLS, seed societies).  
   - Run `supabase/stage6.sql` (capacity + Instagram/LinkedIn columns).

3. **Storage buckets** (public): `society-logos`, `event-banners`

4. **Run locally**

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

5. **Admin user**  
   - Sign up at `/login`  
   - Confirm user if needed (Auth → Users), or disable **Confirm email**  
   - Promote yourself:

```sql
update public.profiles
set is_admin = true
where id = '<uuid-from-Authentication-Users>';
```

## Features

| Area | What |
|------|------|
| Communities | 5 DTC societies, logos, social links, “X events hosted”, SVG leaders with hover |
| Events | Filter, search, sort, Completed badge, capacity `n/m registered`, banner lightbox |
| Event detail | Countdown, register interest (login required) |
| Admin | Dashboard counts, societies, events, registrants list |

## Stack

- Next.js App Router + Tailwind  
- Supabase Auth, Postgres, Storage  
- Framer Motion  

## Deferred

- Mobile layout  
- Production deployment  
