"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/app/admin/actions";
import { Sidebar } from "@/components/layout/Sidebar";

type Props = {
  isLoggedIn: boolean;
  isAdmin: boolean;
  children: React.ReactNode;
};

/** Hides sidebar/header on blocking auth steps like /complete-profile. */
export function ShellChrome({ isLoggedIn, isAdmin, children }: Props) {
  const pathname = usePathname();

  if (pathname === "/complete-profile") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--blush)] p-8">
        {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[var(--blush)]">
      <Sidebar isLoggedIn={isLoggedIn} isAdmin={isAdmin} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b-[3px] border-[var(--ink)] bg-[var(--cream)] px-8">
          <p className="text-sm font-medium text-[var(--ink-soft)]">
            Event Management · Communities & campus events
          </p>
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <form action={signOutAction}>
                <button type="submit" className="cute-btn-outline text-sm">
                  Sign out
                </button>
              </form>
            ) : (
              <Link href="/login" className="cute-btn-outline text-sm">
                Login
              </Link>
            )}
            <Image
              src="/dtc-logo.webp"
              alt="Delhi Technical Campus"
              width={36}
              height={36}
              className="rounded-full border-[2.5px] border-[var(--ink)] object-cover"
            />
          </div>
        </header>
        <main className="flex-1 overflow-auto p-8">{children}</main>
      </div>
    </div>
  );
}
