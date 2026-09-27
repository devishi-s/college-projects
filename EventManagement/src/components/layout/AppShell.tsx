import Image from "next/image";
import { Sidebar } from "@/components/layout/Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[var(--blush)]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b-[3px] border-[var(--ink)] bg-[var(--cream)] px-8">
          <p className="text-sm font-medium text-[var(--ink-soft)]">
            Event Management · Communities & campus events
          </p>
          <Image
            src="/dtc-logo.webp"
            alt="Delhi Technical Campus"
            width={36}
            height={36}
            className="rounded-full border-[2.5px] border-[var(--ink)] object-cover"
          />
        </header>
        <main className="flex-1 overflow-auto p-8">{children}</main>
      </div>
    </div>
  );
}
