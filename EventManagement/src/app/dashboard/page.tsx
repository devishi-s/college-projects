import Link from "next/link";
import { redirect } from "next/navigation";
import { EmptyState } from "@/components/ui/EmptyState";
import { createClient } from "@/lib/supabase/server";
import {
  hasRecap,
  isEventCompleted,
  publicStorageUrl,
  type EventRow,
  type Society,
} from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard");

  const [{ data: regRows }, { data: memberRows }, { data: profile }] =
    await Promise.all([
      supabase
        .from("event_registrations")
        .select(
          "id, event_id, created_at, events(id, title, starts_at, venue, banner_path, society_id, recap_description, recap_photo_urls, recap_posted_at, societies(id, slug, name))",
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("society_members")
        .select(
          "id, society_id, joined_at, societies(id, slug, name, logo_path, soft, deep, accent)",
        )
        .eq("user_id", user.id)
        .order("joined_at", { ascending: false }),
      supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle(),
    ]);

  type RegEvent = EventRow & {
    societies?: Pick<Society, "id" | "slug" | "name"> | null;
  };

  const events = (regRows ?? [])
    .map((r) => {
      const raw = r.events as unknown;
      if (!raw) return null;
      return (Array.isArray(raw) ? raw[0] : raw) as RegEvent;
    })
    .filter((e): e is RegEvent => Boolean(e));

  const upcoming = events
    .filter((e) => !isEventCompleted(e.starts_at))
    .sort(
      (a, b) =>
        new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
    );
  const past = events
    .filter((e) => isEventCompleted(e.starts_at))
    .sort(
      (a, b) =>
        new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime(),
    );

  const societies = (memberRows ?? [])
    .map((m) => m.societies as unknown as Society | Society[] | null)
    .map((s) => (Array.isArray(s) ? s[0] : s))
    .filter((s): s is Society => Boolean(s));

  const displayName =
    profile?.full_name?.trim() || user.email?.split("@")[0] || "Student";

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-[family-name:var(--font-display)] text-4xl text-[var(--rose-deep)]">
        Dashboard
      </h1>
      <p className="mt-2 text-[var(--ink-soft)]">
        Hi {displayName} — your registrations and joined communities.
      </p>

      <section className="mt-8">
        <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--rose-deep)]">
          My Registrations
        </h2>

        {events.length === 0 ? (
          <EmptyState
            title="No event registrations yet"
            body="Browse Events and tap Register interest on something you like."
          />
        ) : (
          <div className="mt-4 flex flex-col gap-6">
            <div className="cute-card p-6">
              <h3 className="text-sm font-extrabold uppercase tracking-wide text-[var(--ink-soft)]">
                Upcoming
              </h3>
              {upcoming.length === 0 ? (
                <p className="mt-3 text-sm text-[var(--ink-soft)]">
                  No upcoming registered events.
                </p>
              ) : (
                <ul className="mt-3 flex flex-col gap-3">
                  {upcoming.map((event) => (
                    <li key={event.id}>
                      <Link
                        href={`/events/${event.id}`}
                        className="flex items-center justify-between rounded-2xl border-[2.5px] border-[var(--ink)] bg-white px-4 py-3 hover:bg-[var(--sidebar)]"
                      >
                        <div>
                          <p className="font-extrabold">{event.title}</p>
                          <p className="text-xs text-[var(--ink-soft)]">
                            {event.societies?.name ?? "Society"} ·{" "}
                            {new Date(event.starts_at).toLocaleString()}
                          </p>
                        </div>
                        <span className="text-xs font-bold text-[var(--rose-deep)]">
                          View →
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="cute-card p-6">
              <h3 className="text-sm font-extrabold uppercase tracking-wide text-[var(--ink-soft)]">
                Past
              </h3>
              {past.length === 0 ? (
                <p className="mt-3 text-sm text-[var(--ink-soft)]">
                  No past registered events yet.
                </p>
              ) : (
                <ul className="mt-3 flex flex-col gap-3">
                  {past.map((event) => {
                    const recap = hasRecap(event);
                    return (
                      <li
                        key={event.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border-[2.5px] border-[var(--ink)] bg-white px-4 py-3"
                      >
                        <div>
                          <p className="font-extrabold">{event.title}</p>
                          <p className="text-xs text-[var(--ink-soft)]">
                            {event.societies?.name ?? "Society"} ·{" "}
                            {new Date(event.starts_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Link
                            href={`/events/${event.id}`}
                            className="text-xs font-bold text-[var(--rose-deep)]"
                          >
                            Event
                          </Link>
                          {recap && (
                            <Link
                              href="/feed"
                              className="rounded-full border-[2px] border-[var(--ink)] bg-[var(--mint)] px-2 py-0.5 text-xs font-extrabold"
                            >
                              View recap →
                            </Link>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--rose-deep)]">
          My Societies
        </h2>

        {societies.length === 0 ? (
          <EmptyState
            title="You haven't joined a community yet"
            body="Open Communities and tap Join Community on a club you like."
          />
        ) : (
          <div className="mt-4 grid grid-cols-3 gap-4">
            {societies.map((society) => {
              const logoUrl = publicStorageUrl(
                "society-logos",
                society.logo_path,
              );
              return (
                <Link
                  key={society.id}
                  href={`/communities/${society.slug}`}
                  className="cute-card flex items-center gap-3 p-4 transition-transform hover:-translate-y-1"
                >
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-[2.5px] border-[var(--ink)]"
                    style={{ background: society.soft ?? "var(--sidebar)" }}
                  >
                    {logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={logoUrl}
                        alt={`${society.name} logo`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span
                        className="text-[10px] font-extrabold"
                        style={{ color: society.deep ?? undefined }}
                      >
                        {society.name.slice(0, 3)}
                      </span>
                    )}
                  </div>
                  <p className="min-w-0 truncate font-extrabold text-[var(--ink)]">
                    {society.name}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
