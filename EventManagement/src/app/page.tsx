import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8">
      <section className="cute-card relative overflow-hidden px-10 py-14">
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-[var(--mint)] opacity-70"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-10 left-20 h-28 w-28 rounded-full bg-[var(--rose)] opacity-30"
          aria-hidden
        />
        <div className="relative flex items-center gap-5">
          <Image
            src="/dtc-logo.webp"
            alt="Delhi Technical Campus logo"
            width={88}
            height={88}
            className="rounded-full border-[3px] border-[var(--ink)] object-cover"
            priority
          />
          <div>
            <p className="font-[family-name:var(--font-display)] text-5xl text-[var(--rose-deep)]">
              CampusHub
            </p>
            <p className="mt-1 text-sm font-semibold text-[var(--ink-soft)]">
              Delhi Technical Campus
            </p>
          </div>
        </div>
        <p className="relative mt-5 max-w-xl text-lg text-[var(--ink-soft)]">
          Discover CS societies at Delhi Technical Campus, meet their leads, and
          explore upcoming events - all in one place.
        </p>
        <div className="relative mt-8 flex gap-3">
          <Link href="/communities" className="cute-btn">
            Explore Communities
          </Link>
          <Link href="/events" className="cute-btn-outline">
            See Events
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-4">
        {[
          { title: "5 societies", body: "CESTA, Indus Rise, AI Renaissance, FOSS, GDG" },
          { title: "Admin panel", body: "Only admins upload logos and create events" },
          { title: "Supabase-backed", body: "Auth, Storage, and live community data" },
        ].map((card) => (
          <div key={card.title} className="cute-card p-5">
            <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--rose-deep)]">
              {card.title}
            </h2>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">{card.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
