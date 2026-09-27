"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  createEventAction,
  deleteEventAction,
  updateSocietyAction,
} from "@/app/admin/actions";
import type { EventRegistration, EventRow, Society } from "@/lib/types";
import { publicStorageUrl } from "@/lib/types";

type Stats = {
  societies: number;
  events: number;
  registrations: number;
};

type Props = {
  societies: Society[];
  events: EventRow[];
  registrations: (EventRegistration & {
    events?: { id: string; title: string } | null;
  })[];
  stats: Stats;
};

const TABS = ["dashboard", "societies", "events", "registrants"] as const;

export function AdminPanel({
  societies,
  events,
  registrations,
  stats,
}: Props) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("dashboard");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run(
    action: (fd: FormData) => Promise<{ error: string | null }>,
    formData: FormData,
    success: string,
  ) {
    startTransition(async () => {
      const result = await action(formData);
      setMessage(result.error ?? success);
    });
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`relative rounded-full px-5 py-2 text-sm font-bold capitalize ${
              tab === key ? "text-white" : "text-[var(--ink)]"
            }`}
          >
            {tab === key && (
              <motion.span
                layoutId="admin-tab"
                className="absolute inset-0 rounded-full border-[2.5px] border-[var(--ink)] bg-[var(--rose)]"
                transition={{ type: "spring", stiffness: 380, damping: 28 }}
              />
            )}
            <span className="relative z-10">{key}</span>
          </button>
        ))}
      </div>

      {message && (
        <p className="mb-4 rounded-2xl border-[2px] border-[var(--ink)] bg-[var(--sidebar)] px-4 py-2 text-sm font-semibold text-[var(--rose-deep)]">
          {message}
        </p>
      )}

      <AnimatePresence mode="wait">
        {tab === "dashboard" && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="grid grid-cols-3 gap-4"
          >
            {[
              { label: "Societies", value: stats.societies },
              { label: "Events", value: stats.events },
              { label: "Registrations", value: stats.registrations },
            ].map((s) => (
              <div key={s.label} className="cute-card p-6 text-center">
                <p className="font-[family-name:var(--font-display)] text-4xl text-[var(--rose-deep)]">
                  {s.value}
                </p>
                <p className="mt-1 text-sm font-bold text-[var(--ink-soft)]">
                  {s.label}
                </p>
              </div>
            ))}
          </motion.div>
        )}

        {tab === "societies" && (
          <motion.div
            key="societies"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex flex-col gap-5"
          >
            {societies.map((society) => {
              const logoUrl = publicStorageUrl(
                "society-logos",
                society.logo_path,
              );
              return (
                <form
                  key={society.id}
                  className="cute-card p-6"
                  onSubmit={(e) => {
                    e.preventDefault();
                    run(
                      updateSocietyAction,
                      new FormData(e.currentTarget),
                      `${society.name} updated.`,
                    );
                  }}
                >
                  <input type="hidden" name="id" value={society.id} />
                  <div className="mb-4 flex items-center gap-4">
                    <div
                      className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border-[2.5px] border-[var(--ink)]"
                      style={{ background: society.soft ?? "#fff" }}
                    >
                      {logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={logoUrl}
                          alt={`${society.name} society logo`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span
                          className="text-xs font-bold"
                          style={{ color: society.deep ?? undefined }}
                        >
                          Logo
                        </span>
                      )}
                    </div>
                    <div>
                      <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--rose-deep)]">
                        {society.name}
                      </h2>
                      <p className="text-sm text-[var(--ink-soft)]">
                        {society.tagline}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex flex-col gap-1 text-sm font-bold">
                      President name
                      <input
                        name="president_name"
                        defaultValue={society.president_name ?? "President"}
                        className="rounded-2xl border-[2.5px] border-[var(--ink)] px-3 py-2 font-normal"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-sm font-bold">
                      Vice president name
                      <input
                        name="vice_president_name"
                        defaultValue={
                          society.vice_president_name ?? "Vice President"
                        }
                        className="rounded-2xl border-[2.5px] border-[var(--ink)] px-3 py-2 font-normal"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-sm font-bold">
                      Instagram URL
                      <input
                        name="instagram_url"
                        type="url"
                        placeholder="https://instagram.com/…"
                        defaultValue={society.instagram_url ?? ""}
                        className="rounded-2xl border-[2.5px] border-[var(--ink)] px-3 py-2 font-normal"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-sm font-bold">
                      LinkedIn URL
                      <input
                        name="linkedin_url"
                        type="url"
                        placeholder="https://linkedin.com/…"
                        defaultValue={society.linkedin_url ?? ""}
                        className="rounded-2xl border-[2.5px] border-[var(--ink)] px-3 py-2 font-normal"
                      />
                    </label>
                  </div>

                  <label className="mt-4 flex flex-col gap-1 text-sm font-bold">
                    Description
                    <textarea
                      name="description"
                      rows={3}
                      defaultValue={society.description ?? ""}
                      className="rounded-2xl border-[2.5px] border-[var(--ink)] px-3 py-2 font-normal"
                    />
                  </label>

                  <label className="mt-4 flex flex-col gap-1 text-sm font-bold">
                    Upload logo
                    <input
                      type="file"
                      name="logo"
                      accept="image/*"
                      className="text-sm font-normal"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={pending}
                    className="cute-btn mt-4"
                  >
                    {pending ? "Saving…" : "Save society"}
                  </button>
                </form>
              );
            })}
          </motion.div>
        )}

        {tab === "events" && (
          <motion.div
            key="events"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex flex-col gap-6"
          >
            <form
              className="cute-card p-6"
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                run(createEventAction, new FormData(form), "Event created.");
                form.reset();
              }}
            >
              <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--rose-deep)]">
                Create event
              </h2>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <label className="flex flex-col gap-1 text-sm font-bold">
                  Society
                  <select
                    name="society_id"
                    required
                    className="rounded-2xl border-[2.5px] border-[var(--ink)] px-3 py-2 font-normal"
                  >
                    {societies.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-sm font-bold">
                  Starts at
                  <input
                    type="datetime-local"
                    name="starts_at"
                    required
                    className="rounded-2xl border-[2.5px] border-[var(--ink)] px-3 py-2 font-normal"
                  />
                </label>
                <label className="col-span-2 flex flex-col gap-1 text-sm font-bold">
                  Title
                  <input
                    name="title"
                    required
                    className="rounded-2xl border-[2.5px] border-[var(--ink)] px-3 py-2 font-normal"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm font-bold">
                  Venue
                  <input
                    name="venue"
                    className="rounded-2xl border-[2.5px] border-[var(--ink)] px-3 py-2 font-normal"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm font-bold">
                  Capacity (seats)
                  <input
                    name="capacity"
                    type="number"
                    min={1}
                    placeholder="e.g. 150"
                    defaultValue={150}
                    className="rounded-2xl border-[2.5px] border-[var(--ink)] px-3 py-2 font-normal"
                  />
                </label>
                <label className="col-span-2 flex flex-col gap-1 text-sm font-bold">
                  Description
                  <textarea
                    name="description"
                    rows={3}
                    className="rounded-2xl border-[2.5px] border-[var(--ink)] px-3 py-2 font-normal"
                  />
                </label>
                <label className="col-span-2 flex flex-col gap-1 text-sm font-bold">
                  Banner image
                  <input
                    type="file"
                    name="banner"
                    accept="image/*"
                    className="text-sm font-normal"
                  />
                </label>
              </div>
              <button
                type="submit"
                disabled={pending}
                className="cute-btn mt-4"
              >
                {pending ? "Creating…" : "Create event"}
              </button>
            </form>

            <div className="flex flex-col gap-3">
              <h3 className="font-[family-name:var(--font-display)] text-xl text-[var(--rose-deep)]">
                Existing events
              </h3>
              {events.length === 0 && (
                <p className="text-sm text-[var(--ink-soft)]">
                  No events yet — create your first one above.
                </p>
              )}
              {events.map((event) => {
                const bannerUrl = publicStorageUrl(
                  "event-banners",
                  event.banner_path,
                );
                return (
                  <div
                    key={event.id}
                    className="cute-card flex items-center gap-4 p-4"
                  >
                    <div className="h-16 w-24 overflow-hidden rounded-xl border-[2px] border-[var(--ink)] bg-[var(--sidebar)]">
                      {bannerUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={bannerUrl}
                          alt={`${event.title} event banner`}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-extrabold">{event.title}</p>
                      <p className="text-xs text-[var(--ink-soft)]">
                        {event.societies?.name ?? "Society"} ·{" "}
                        {new Date(event.starts_at).toLocaleString()}
                        {event.capacity != null
                          ? ` · capacity ${event.capacity}`
                          : ""}
                      </p>
                    </div>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        run(
                          deleteEventAction,
                          new FormData(e.currentTarget),
                          "Event deleted.",
                        );
                      }}
                    >
                      <input type="hidden" name="id" value={event.id} />
                      <button
                        type="submit"
                        className="rounded-full border-[2px] border-[var(--ink)] px-3 py-1 text-xs font-bold text-[var(--rose-deep)]"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {tab === "registrants" && (
          <motion.div
            key="registrants"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="cute-card p-6"
          >
            <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--rose-deep)]">
              Who registered
            </h2>
            {registrations.length === 0 ? (
              <p className="mt-3 text-sm text-[var(--ink-soft)]">
                No registrations yet.
              </p>
            ) : (
              <ul className="mt-4 flex flex-col gap-2">
                {registrations.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between rounded-2xl border-[2px] border-[var(--ink)] bg-white px-4 py-3 text-sm"
                  >
                    <div>
                      <p className="font-extrabold">
                        {r.profiles?.full_name || "Student"}
                      </p>
                      <p className="text-xs text-[var(--ink-soft)]">
                        {r.events?.title ?? "Event"} · user{" "}
                        {r.user_id.slice(0, 8)}…
                      </p>
                    </div>
                    <p className="text-xs text-[var(--ink-soft)]">
                      {new Date(r.created_at).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
