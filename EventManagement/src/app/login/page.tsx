import { Suspense } from "react";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <p className="text-[var(--ink-soft)]">Loading login…</p>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
