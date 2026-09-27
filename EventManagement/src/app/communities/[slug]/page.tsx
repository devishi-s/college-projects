import Link from "next/link";
import { notFound } from "next/navigation";
import {
  PresidentCharacter,
  VicePresidentCharacter,
} from "@/components/characters/LeaderPlaceholders";
import { getSociety } from "@/lib/societies";
import { createClient } from "@/lib/supabase/server";
import {
  isEventCompleted,
  publicStorageUrl,
  type EventRow,
  type Society,
} from "@/lib/types";

type Props = { params: Promise<{ slug: string }> };

export default async function SocietyDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: dbSociety } = await supabase
    .from("societies")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  const seed = getSociety(slug);
  if (!dbSociety && !seed) notFound();

  const society = (dbSociety as Society | null) ?? {
    id: seed!.slug,
    slug: seed!.slug,
    name: seed!.name,
    tagline: seed!.tagline,
    description: seed!.description,
    focus: seed!.focus,
    logo_path: null,
    accent: seed!.palette.accent,
    soft: seed!.palette.soft,
    deep: seed!.palette.deep,
    president_name: seed!.presidentLabel,
    vice_president_name: seed!.vicePresidentLabel,
    instagram_url: null,
    linkedin_url: null,
  };

  const accent = society.accent ?? seed?.palette.accent ?? "#d97b8c";
  const soft = society.soft ?? seed?.palette.soft ?? "#fceef2";
  const deep = society.deep ?? seed?.palette.deep ?? "#a84d5e";
  const logoUrl = publicStorageUrl("society-logos", society.logo_path);

  let events: EventRow[] = [];
  if (dbSociety) {
    const { data } = await supabase
      .from("events")
      .select("*")
      .eq("society_id", society.id)
      .order("starts_at", { ascending: true });
    events = (data as EventRow[]) ?? [];
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/communities"
        className="text-sm font-semibold text-[var(--rose-deep)]"
      >
        ← All communities
      </Link>

      <div className="cute-card mt-4 overflow-hidden">
        <div
          className="relative border-b-[3px] border-[var(--ink)] px-8 py-10"
          style={{ background: soft }}
        >
          {logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={`${society.name} society logo`}
              className="mb-4 h-20 w-20 rounded-2xl border-[2.5px] border-[var(--ink)] object-cover"
            />
          )}
          <h1
            className="font-[family-name:var(--font-display)] text-4xl"
            style={{ color: deep }}
          >
            {society.name}
          </h1>
          <p className="mt-2 max-w-2xl text-[var(--ink-soft)]">
            {society.description}
          </p>
          <p className="mt-4 inline-block rounded-full border-[2px] border-[var(--ink)] bg-white px-4 py-1 text-xs font-bold">
            {events.length} event{events.length === 1 ? "" : "s"} hosted
          </p>
          <div className="mt-3 flex gap-2">
            {society.instagram_url && (
              <a
                href={society.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${society.name} on Instagram`}
                className="flex h-9 w-9 items-center justify-center rounded-full border-[2px] border-[var(--ink)] bg-white text-xs font-extrabold"
              >
                IG
              </a>
            )}
            {society.linkedin_url && (
              <a
                href={society.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${society.name} on LinkedIn`}
                className="flex h-9 w-9 items-center justify-center rounded-full border-[2px] border-[var(--ink)] bg-white text-xs font-extrabold"
              >
                in
              </a>
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {(society.focus ?? []).map((tag) => (
              <span
                key={tag}
                className="rounded-full border-[2px] border-[var(--ink)] bg-white px-3 py-1 text-xs font-bold"
                style={{ color: deep }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 p-8">
          <div className="rounded-3xl border-[2.5px] border-[var(--ink)] bg-white p-5 text-center">
            <PresidentCharacter
              accent={accent}
              soft={soft}
              deep={deep}
              className="mx-auto h-40 w-36"
            />
            <p className="mt-2 font-extrabold">
              {society.president_name ?? "President"}
            </p>
          </div>
          <div className="rounded-3xl border-[2.5px] border-[var(--ink)] bg-white p-5 text-center">
            <VicePresidentCharacter
              accent={accent}
              soft={soft}
              deep={deep}
              className="mx-auto h-40 w-36"
            />
            <p className="mt-2 font-extrabold">
              {society.vice_president_name ?? "Vice President"}
            </p>
          </div>
        </div>
      </div>

      <section className="cute-card mt-6 p-6">
        <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--rose-deep)]">
          Events
        </h2>
        {events.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--ink-soft)]">
            No events yet for this society. Admins can add them in the Admin
            panel.
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {events.map((event) => {
              const bannerUrl = publicStorageUrl(
                "event-banners",
                event.banner_path,
              );
              const completed = isEventCompleted(event.starts_at);
              return (
                <li key={event.id}>
                  <Link
                    href={`/events/${event.id}`}
                    className="flex items-center gap-4 rounded-2xl border-[2.5px] border-[var(--ink)] bg-white p-3 hover:bg-[var(--sidebar)]"
                  >
                    <div className="h-14 w-20 overflow-hidden rounded-xl bg-[var(--sidebar)]">
                      {bannerUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={bannerUrl}
                          alt={`${event.title} event banner`}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-extrabold">{event.title}</p>
                        {completed && (
                          <span className="rounded-full border-[2px] border-[var(--ink)] bg-[var(--mint)] px-2 py-0.5 text-[10px] font-extrabold uppercase">
                            Completed
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--ink-soft)]">
                        {new Date(event.starts_at).toLocaleString()}
                        {event.venue ? ` · ${event.venue}` : ""}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
