"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  registerInterestAction,
  unregisterInterestAction,
} from "@/app/events/actions";

type Props = {
  eventId: string;
  isLoggedIn: boolean;
  alreadyRegistered: boolean;
  completed: boolean;
  isFull: boolean;
};

export function RegisterInterestButton({
  eventId,
  isLoggedIn,
  alreadyRegistered,
  completed,
  isFull,
}: Props) {
  const [registered, setRegistered] = useState(alreadyRegistered);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (completed) {
    return (
      <p className="mt-4 text-sm font-semibold text-[var(--ink-soft)]">
        Registration closed — event completed.
      </p>
    );
  }

  if (!isLoggedIn) {
    return (
      <p className="mt-4 text-sm">
        <Link
          href={`/login?next=/events/${eventId}`}
          className="cute-btn inline-block"
        >
          Sign in to register interest
        </Link>
      </p>
    );
  }

  if (isFull && !registered) {
    return (
      <p className="mt-4 text-sm font-semibold text-[var(--rose-deep)]">
        This event is full.
      </p>
    );
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        disabled={pending}
        className={registered ? "cute-btn-outline" : "cute-btn"}
        onClick={() => {
          startTransition(async () => {
            const result = registered
              ? await unregisterInterestAction(eventId)
              : await registerInterestAction(eventId);
            if (result.error) {
              setMessage(result.error);
              return;
            }
            setRegistered(!registered);
            setMessage(
              registered
                ? "Registration removed."
                : "You're registered — see you there!",
            );
          });
        }}
      >
        {pending
          ? "Please wait…"
          : registered
            ? "Cancel registration"
            : "Register interest"}
      </button>
      {message && (
        <p className="mt-2 text-sm font-semibold text-[var(--rose-deep)]">
          {message}
        </p>
      )}
    </div>
  );
}
