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
    .select("is_admin, full_name")
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

  const [
    { data: societies },
    { data: events },
    { data: registrations },
    { count: societyCount },
    { count: eventCount },
    { count: regCount },
  ] = await Promise.all([
    supabase.from("societies").select("*").order("name"),
    supabase
      .from("events")
      .select("*, societies(id, slug, name, soft, deep, accent)")
      .order("starts_at", { ascending: true }),
    supabase
      .from("event_registrations")
      .select("*, profiles(id, full_name), events(id, title)")
      .order("created_at", { ascending: false }),
    supabase.from("societies").select("*", { count: "exact", head: true }),
    supabase.from("events").select("*", { count: "exact", head: true }),
    supabase
      .from("event_registrations")
      .select("*", { count: "exact", head: true }),
  ]);

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
        societies={(societies ?? []) as Society[]}
        events={(events ?? []) as EventRow[]}
        registrations={
          (registrations ?? []) as (EventRegistration & {
            events?: { id: string; title: string } | null;
          })[]
        }
        stats={{
          societies: societyCount ?? 0,
          events: eventCount ?? 0,
          registrations: regCount ?? 0,
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
