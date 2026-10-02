import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { signOutAction } from "@/app/admin/actions";
import { createClient } from "@/lib/supabase/server";
import type { EventRegistration, EventRow, Society } from "@/lib/types";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/admin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    return (
      <div className="cute-card mx-auto max-w-lg p-8 text-center">
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--rose-deep)]">
          Admin only
        </h1>
        <p className="mt-3 text-sm text-[var(--ink-soft)]">
          You&apos;re signed in as {user.email}, but{" "}
          <code>is_admin</code> is not true on your profile.
        </p>
        <form action={signOutAction} className="mt-6">
          <button type="submit" className="cute-btn-outline">
            Sign out
          </button>
        </form>
      </div>
    );
  }

  // One parallel round-trip: drop separate count queries (use array lengths)
  // and fetch profiles alongside registrations (no sequential second hop).
  const [
    { data: societies },
    { data: events },
    { data: registrationRows },
    { data: profileRows },
  ] = await Promise.all([
    supabase.from("societies").select("*").order("name"),
    supabase
      .from("events")
      .select(
        "id, society_id, title, description, venue, starts_at, banner_path, capacity, created_at, recap_description, recap_photo_urls, recap_posted_at, societies(id, slug, name, soft, deep, accent)",
      )
      .order("starts_at", { ascending: true }),
    supabase
      .from("event_registrations")
      .select("id, event_id, user_id, created_at, events(id, title)")
      .order("created_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("id, full_name, enrollment_no, batch, course, year"),
  ]);

  const profileMap = new Map(
    (profileRows ?? []).map((p) => [p.id, p] as const),
  );

  const registrations = (registrationRows ?? []).map((r) => ({
    ...r,
    profiles: profileMap.get(r.user_id) ?? null,
  }));

  const societyList = (societies ?? []) as unknown as Society[];
  const eventList = (events ?? []) as unknown as EventRow[];

  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-4xl text-[var(--rose-deep)]">
            Admin Panel
          </h1>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">
            Signed in as {user.email}
          </p>
        </div>
        <form action={signOutAction}>
          <button type="submit" className="cute-btn-outline text-sm">
            Sign out
          </button>
        </form>
      </div>

      <AdminPanel
        societies={societyList}
        events={eventList}
        registrations={
          registrations as unknown as (EventRegistration & {
            events?: { id: string; title: string } | null;
          })[]
        }
        stats={{
          societies: societyList.length,
          events: eventList.length,
          registrations: registrations.length,
        }}
      />

      <p className="mt-8 text-center text-sm text-[var(--ink-soft)]">
        <Link href="/communities" className="font-bold text-[var(--rose-deep)]">
          View public communities →
        </Link>
      </p>
    </div>
  );
}
