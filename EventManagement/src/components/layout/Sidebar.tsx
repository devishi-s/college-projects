"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/communities", label: "Communities" },
  { href: "/events", label: "Events" },
  { href: "/feed", label: "Feed" },
  { href: "/admin", label: "Admin" },
  { href: "/login", label: "Login" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r-[3px] border-[var(--ink)] bg-[var(--sidebar)] px-5 py-8">
      <Link href="/" className="mb-10 flex items-center gap-3">
        <Image
          src="/dtc-logo.webp"
          alt="Delhi Technical Campus logo"
          width={52}
          height={52}
          className="rounded-full border-[2.5px] border-[var(--ink)] object-cover"
          priority
        />
        <div>
          <p className="font-[family-name:var(--font-display)] text-2xl tracking-tight text-[var(--rose-deep)]">
            CampusHub
          </p>
          <p className="text-xs text-[var(--ink-soft)]">
            Delhi Technical Campus
          </p>
        </div>
      </Link>

      <nav className="flex flex-1 flex-col gap-2">
        {NAV.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link key={item.href} href={item.href} className="relative">
              {active && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-2xl border-[2.5px] border-[var(--ink)] bg-[var(--rose)]"
                  transition={{ type: "spring", stiffness: 380, damping: 28 }}
                />
              )}
              <span
                className={`relative z-10 block rounded-2xl px-4 py-2.5 text-sm font-semibold ${
                  active ? "text-white" : "text-[var(--ink)] hover:bg-white/50"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
