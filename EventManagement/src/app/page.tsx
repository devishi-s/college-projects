import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <section className="relative -m-8 min-h-[calc(100vh-4rem)] overflow-hidden">
      <Image
        src="/home-campus.jpg"
        alt="Students gathering on the Delhi Technical Campus lawn"
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-[var(--ink)]/75 via-[var(--ink)]/40 to-[var(--ink)]/15"
        aria-hidden
      />

      <div className="relative z-10 flex min-h-[calc(100vh-4rem)] flex-col justify-end px-8 pb-14 pt-20 sm:px-12 sm:pb-16">
        <div className="flex max-w-2xl items-center gap-4">
          <Image
            src="/dtc-logo.webp"
            alt="Delhi Technical Campus logo"
            width={72}
            height={72}
            className="rounded-full border-[3px] border-white/90 object-cover shadow-sm"
            priority
          />
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-5xl text-white drop-shadow-sm sm:text-6xl">
              CampusHub
            </h1>
            <p className="mt-1 text-sm font-semibold text-white/85">
              Delhi Technical Campus
            </p>
          </div>
        </div>

        <p className="mt-5 max-w-xl text-lg text-white/90">
          Discover CS societies at Delhi Technical Campus, meet their leads, and
          explore upcoming events — all in one place.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/communities" className="cute-btn">
            Explore Communities
          </Link>
          <Link
            href="/events"
            className="rounded-full border-[2.5px] border-white bg-white/15 px-5 py-2.5 font-bold text-white backdrop-blur-sm transition hover:bg-white/25"
          >
            See Events
          </Link>
        </div>
      </div>
    </section>
  );
}
