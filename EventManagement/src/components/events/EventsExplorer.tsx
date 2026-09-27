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

type SortMode =
  | "upcoming"
  | "date-desc"
  | "date-asc"
  | "name-asc"
  | "popular";

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: "upcoming", label: "Upcoming first" },
  { value: "date-desc", label: "Date · newest first" },
  { value: "date-asc", label: "Date · oldest first" },
  { value: "name-asc", label: "Name · A to Z" },
  { value: "popular", label: "Most registered" },
];

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

      if (sort === "date-desc") return tb - ta;
      if (sort === "date-asc") return ta - tb;
      if (sort === "name-asc") {
        return a.title.localeCompare(b.title, undefined, {
          sensitivity: "base",
        });
      }
      if (sort === "popular") {
        const ca = a.registration_count ?? 0;
        const cb = b.registration_count ?? 0;
        if (cb !== ca) return cb - ca;
        return ta - tb;
      }

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
          Sort by
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortMode)}
            className="min-w-[11.5rem] rounded-2xl border-[2.5px] border-[var(--ink)] px-3 py-2 text-sm font-normal"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
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
