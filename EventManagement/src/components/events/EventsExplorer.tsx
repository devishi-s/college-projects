"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ClickableBanner } from "@/components/events/ClickableBanner";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  isEventCompleted,
  publicStorageUrl,
  type EventRow,
  type Society,
} from "@/lib/types";

type Props = {
  events: EventRow[];
  societies: Pick<Society, "id" | "slug" | "name">[];
};

type SortMode = "upcoming" | "recent";

export function EventsExplorer({ events, societies }: Props) {
  const [societyId, setSocietyId] = useState<string>("all");
  const [sort, setSort] = useState<SortMode>("upcoming");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = events.filter((e) => {
      if (societyId !== "all" && e.society_id !== societyId) return false;
      if (!q) return true;
      const hay = `${e.title} ${e.societies?.name ?? ""}`.toLowerCase();
      return hay.includes(q);
    });

    list = [...list].sort((a, b) => {
      const ta = new Date(a.starts_at).getTime();
      const tb = new Date(b.starts_at).getTime();
      if (sort === "recent") return tb - ta;
      // upcoming first: future events soonest, then past (newest past last)
      const now = Date.now();
      const aPast = ta < now;
      const bPast = tb < now;
      if (aPast !== bPast) return aPast ? 1 : -1;
      return aPast ? tb - ta : ta - tb;
    });

    return list;
  }, [events, societyId, sort, query]);

  return (
    <div>
      <div className="cute-card mt-6 grid grid-cols-[1fr_auto_auto] gap-3 p-4">
        <label className="flex flex-col gap-1 text-xs font-bold">
          Search
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Society or event name…"
            className="rounded-2xl border-[2.5px] border-[var(--ink)] px-3 py-2 text-sm font-normal"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold">
          Society
          <select
            value={societyId}
            onChange={(e) => setSocietyId(e.target.value)}
            className="rounded-2xl border-[2.5px] border-[var(--ink)] px-3 py-2 text-sm font-normal"
          >
            <option value="all">All societies</option>
            {societies.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold">
          Sort
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortMode)}
            className="rounded-2xl border-[2.5px] border-[var(--ink)] px-3 py-2 text-sm font-normal"
          >
            <option value="upcoming">Upcoming first</option>
            <option value="recent">Most recent</option>
          </select>
        </label>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No matching events"
          body="Try another search, society filter, or clear filters."
        />
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {filtered.map((event) => {
            const bannerUrl = publicStorageUrl(
              "event-banners",
              event.banner_path,
            );
            const completed = isEventCompleted(event.starts_at);
            const count = event.registration_count ?? 0;
            const capacity = event.capacity;

            return (
              <div
                key={event.id}
                className="cute-card flex overflow-hidden transition-transform hover:-translate-y-0.5"
              >
                <div
                  className="h-32 w-48 shrink-0 border-r-[3px] border-[var(--ink)]"
                  style={{
                    background: event.societies?.soft ?? "var(--sidebar)",
                  }}
                >
                  {bannerUrl ? (
                    <ClickableBanner
                      src={bannerUrl}
                      alt={`${event.title} event banner`}
                      className="h-full"
                      imgClassName="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <Link
                  href={`/events/${event.id}`}
                  className="min-w-0 flex-1 p-5"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-bold uppercase tracking-wide text-[var(--rose-deep)]">
                      {event.societies?.name ?? "Society"}
                    </p>
                    {completed && (
                      <span className="rounded-full border-[2px] border-[var(--ink)] bg-[var(--mint)] px-2 py-0.5 text-[10px] font-extrabold uppercase">
                        Completed
                      </span>
                    )}
                  </div>
                  <h2 className="mt-1 text-xl font-extrabold">{event.title}</h2>
                  <p className="mt-1 text-sm text-[var(--ink-soft)]">
                    {new Date(event.starts_at).toLocaleString()}
                    {event.venue ? ` · ${event.venue}` : ""}
                  </p>
                  {capacity != null ? (
                    <p className="mt-2 text-xs font-bold text-[var(--ink)]">
                      {count}/{capacity} registered
                    </p>
                  ) : (
                    <p className="mt-2 text-xs font-bold text-[var(--ink)]">
                      {count} registered
                    </p>
                  )}
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
