"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const supabase = createClient();
    const result =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setLoading(false);

    if (result.error) {
      const msg = result.error.message;
      if (/email not confirmed/i.test(msg)) {
        setMessage(
          "Email not confirmed. In Supabase: Authentication → Users → open your user → Confirm user (or turn off Confirm email under Auth → Providers → Email). Then sign in again.",
        );
      } else {
        setMessage(msg);
      }
      return;
    }

    if (mode === "signup") {
      // If email confirmation is off, session exists — go straight in.
      if (result.data.session) {
        router.push(next);
        router.refresh();
        return;
      }
      setMessage(
        "Account created, but email confirmation is still required. Confirm the user in Supabase (Authentication → Users) or disable Confirm email, then sign in.",
      );
      return;
    }

    router.push(next);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="font-[family-name:var(--font-display)] text-4xl text-[var(--rose-deep)]">
        {mode === "signin" ? "Login" : "Sign up"}
      </h1>
      <p className="mt-2 text-sm text-[var(--ink-soft)]">
        Admin access is required to manage societies and events.
      </p>

      <form
        onSubmit={onSubmit}
        className="cute-card mt-6 flex flex-col gap-4 p-6"
      >
        <label className="flex flex-col gap-1 text-sm font-bold">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-2xl border-[2.5px] border-[var(--ink)] bg-white px-4 py-2.5 font-normal outline-none focus:border-[var(--rose)]"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-bold">
          Password
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-2xl border-[2.5px] border-[var(--ink)] bg-white px-4 py-2.5 font-normal outline-none focus:border-[var(--rose)]"
          />
        </label>

        {message && (
          <p className="rounded-2xl bg-[var(--sidebar)] px-3 py-2 text-sm text-[var(--rose-deep)]">
            {message}
          </p>
        )}

        <button type="submit" disabled={loading} className="cute-btn mt-2">
          {loading
            ? "Please wait…"
            : mode === "signin"
              ? "Sign in"
              : "Create account"}
        </button>

        <button
          type="button"
          className="text-sm font-semibold text-[var(--rose-deep)]"
          onClick={() =>
            setMode((m) => (m === "signin" ? "signup" : "signin"))
          }
        >
          {mode === "signin"
            ? "Need an account? Sign up"
            : "Already have an account? Sign in"}
        </button>
      </form>
    </div>
  );
}
