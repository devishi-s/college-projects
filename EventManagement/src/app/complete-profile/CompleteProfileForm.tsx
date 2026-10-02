"use client";

import { FormEvent, useState, useTransition } from "react";
import { completeProfileAction } from "@/app/complete-profile/actions";

const COURSES = ["CST", "CSE", "BCA", "BARCH", "BBA"];
const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

export function CompleteProfileForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await completeProfileAction(fd);
      if (result?.error) setMessage(result.error);
    });
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <h1 className="font-[family-name:var(--font-display)] text-4xl text-[var(--rose-deep)]">
        Complete Profile
      </h1>
      <p className="mt-2 text-sm text-[var(--ink-soft)]">
        Tell us a bit about yourself before exploring CampusHub.
      </p>

      <form
        onSubmit={onSubmit}
        className="cute-card mt-6 flex flex-col gap-4 p-6"
      >
        <label className="flex flex-col gap-1 text-sm font-bold">
          Full Name
          <input
            name="full_name"
            type="text"
            required
            autoComplete="name"
            placeholder="Your name"
            className="rounded-2xl border-[2.5px] border-[var(--ink)] bg-white px-4 py-2.5 font-normal outline-none focus:border-[var(--rose)]"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-bold">
          Student ID
          <input
            name="enrollment_no"
            type="text"
            required
            placeholder="Enrollment / college ID"
            className="rounded-2xl border-[2.5px] border-[var(--ink)] bg-white px-4 py-2.5 font-normal outline-none focus:border-[var(--rose)]"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-bold">
          Batch
          <input
            name="batch"
            type="text"
            required
            placeholder="e.g. 2023–27"
            className="rounded-2xl border-[2.5px] border-[var(--ink)] bg-white px-4 py-2.5 font-normal outline-none focus:border-[var(--rose)]"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-bold">
          Course
          <select
            name="course"
            required
            defaultValue=""
            className="rounded-2xl border-[2.5px] border-[var(--ink)] bg-white px-4 py-2.5 font-normal outline-none focus:border-[var(--rose)]"
          >
            <option value="" disabled>
              Select course
            </option>
            {COURSES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm font-bold">
          Year
          <select
            name="year"
            required
            defaultValue=""
            className="rounded-2xl border-[2.5px] border-[var(--ink)] bg-white px-4 py-2.5 font-normal outline-none focus:border-[var(--rose)]"
          >
            <option value="" disabled>
              Select year
            </option>
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>

        {message && (
          <p className="rounded-2xl bg-[var(--sidebar)] px-3 py-2 text-sm text-[var(--rose-deep)]">
            {message}
          </p>
        )}

        <button type="submit" disabled={pending} className="cute-btn mt-2">
          {pending ? "Saving…" : "Save & continue"}
        </button>
      </form>
    </div>
  );
}
