"use client";

import { useEffect, useState } from "react";

type Props = { startsAt: string };

function parts(ms: number) {
  if (ms <= 0) return { d: 0, h: 0, m: 0, s: 0, done: true };
  const s = Math.floor(ms / 1000);
  return {
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
    done: false,
  };
}

export function EventCountdown({ startsAt }: Props) {
  // Avoid Date.now() during SSR — it causes hydration mismatches vs the client.
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (now === null) {
    return (
      <div className="cute-card mt-4 p-4">
        <p className="mb-3 text-center text-sm font-bold text-[var(--ink-soft)]">
          Starts in
        </p>
        <div className="grid grid-cols-4 gap-2">
          {["Days", "Hours", "Mins", "Secs"].map((label) => (
            <div
              key={label}
              className="rounded-2xl border-[2px] border-[var(--ink)] bg-[var(--sidebar)] py-3 text-center"
            >
              <p className="font-[family-name:var(--font-display)] text-2xl text-[var(--rose-deep)]">
                --
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--ink-soft)]">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const t = parts(new Date(startsAt).getTime() - now);

  if (t.done) {
    return (
      <div className="cute-card mt-4 bg-[var(--sidebar)] p-4 text-center">
        <p className="font-[family-name:var(--font-display)] text-xl text-[var(--rose-deep)]">
          Event started / completed
        </p>
      </div>
    );
  }

  const cells = [
    { label: "Days", value: t.d },
    { label: "Hours", value: t.h },
    { label: "Mins", value: t.m },
    { label: "Secs", value: t.s },
  ];

  return (
    <div className="cute-card mt-4 p-4">
      <p className="mb-3 text-center text-sm font-bold text-[var(--ink-soft)]">
        Starts in
      </p>
      <div className="grid grid-cols-4 gap-2">
        {cells.map((c) => (
          <div
            key={c.label}
            className="rounded-2xl border-[2px] border-[var(--ink)] bg-[var(--sidebar)] py-3 text-center"
          >
            <p className="font-[family-name:var(--font-display)] text-2xl text-[var(--rose-deep)]">
              {String(c.value).padStart(2, "0")}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--ink-soft)]">
              {c.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
