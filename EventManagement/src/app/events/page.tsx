import { createClient } from "@/lib/supabase/server";
import { EventsExplorer } from "@/components/events/EventsExplorer";
import { EmptyState } from "@/components/ui/EmptyState";
import type { EventRow, Society } from "@/lib/types";

export default async function EventsPage() {
  const supabase = await createClient();

  const [{ data: eventsData }, { data: societiesData }, { data: regs }] =
    await Promise.all([
      supabase
        .from("events")
        .select("*, societies(id, slug, name, soft, deep, accent)")
        .order("starts_at", { ascending: true }),
      supabase.from("societies").select("id, slug, name").order("name"),
      supabase.from("event_registrations").select("event_id"),
    ]);

  const countMap = new Map<string, number>();
  for (const r of regs ?? []) {
    countMap.set(r.event_id, (countMap.get(r.event_id) ?? 0) + 1);
  }

  const events = ((eventsData as EventRow[] | null) ?? []).map((e) => ({
    ...e,
    registration_count: countMap.get(e.id) ?? 0,
  }));

  const societies =
    (societiesData as Pick<Society, "id" | "slug" | "name">[] | null) ?? [];

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-[family-name:var(--font-display)] text-4xl text-[var(--rose-deep)]">
        Events
      </h1>
      <p className="mt-2 text-[var(--ink-soft)]">
        Upcoming campus events from DTC CS communities. Click a banner for full
        size.
      </p>

      {events.length === 0 ? (
        <EmptyState
          title="No events yet"
          body="Admins can create events (with banners) in the Admin panel."
        />
      ) : (
        <EventsExplorer events={events} societies={societies} />
      )}
    </div>
  );
}
