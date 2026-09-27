import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SOCIETIES } from "@/lib/societies";
import { EmptyState } from "@/components/ui/EmptyState";
import { InstagramIcon, LinkedInIcon } from "@/components/ui/SocialIcons";
import { publicStorageUrl, type Society } from "@/lib/types";

export default async function CommunitiesPage() {
  const supabase = await createClient();
  const [{ data }, { data: eventRows }] = await Promise.all([
    supabase.from("societies").select("*").order("name"),
    supabase.from("events").select("society_id"),
  ]);

  const societies = (data as Society[] | null) ?? [];
  const hosted = new Map<string, number>();
  for (const e of eventRows ?? []) {
    hosted.set(e.society_id, (hosted.get(e.society_id) ?? 0) + 1);
  }

  const list =
    societies.length > 0
      ? societies
      : SOCIETIES.map((s) => ({
          id: s.slug,
          slug: s.slug,
          name: s.name,
          tagline: s.tagline,
          description: s.description,
          focus: s.focus,
          logo_path: null,
          accent: s.palette.accent,
          soft: s.palette.soft,
          deep: s.palette.deep,
          president_name: s.presidentLabel,
          vice_president_name: s.vicePresidentLabel,
          instagram_url: null,
          linkedin_url: null,
        }));

  if (list.length === 0) {
    return (
      <div className="mx-auto max-w-5xl">
        <h1 className="font-[family-name:var(--font-display)] text-4xl text-[var(--rose-deep)]">
          Communities
        </h1>
        <EmptyState
          title="No societies yet"
          body="Run the Supabase schema seed, then refresh."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-[family-name:var(--font-display)] text-4xl text-[var(--rose-deep)]">
        Communities
      </h1>
      <p className="mt-2 text-[var(--ink-soft)]">
        CS clubs and developer communities at Delhi Technical Campus.
      </p>

      <div className="mt-8 grid grid-cols-3 gap-6">
        {list.map((society) => {
          const logoUrl = publicStorageUrl("society-logos", society.logo_path);
          const eventsHosted = hosted.get(society.id) ?? 0;
          return (
            <article
              key={society.slug}
              className="cute-card overflow-hidden transition-transform hover:-translate-y-1"
            >
              <Link href={`/communities/${society.slug}`} className="block">
                <div
                  className="flex h-36 items-center justify-center overflow-hidden border-b-[3px] border-[var(--ink)]"
                  style={{ background: society.soft ?? "#fceef2" }}
                >
                  {logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={logoUrl}
                      alt={`${society.name} society logo`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span
                      className="font-[family-name:var(--font-display)] text-3xl"
                      style={{ color: society.deep ?? undefined }}
                    >
                      {society.name}
                    </span>
                  )}
                </div>
                <div className="p-5 pb-2">
                  <h2 className="text-lg font-extrabold text-[var(--ink)]">
                    {society.name}
                  </h2>
                  <p className="mt-1 line-clamp-2 text-sm text-[var(--ink-soft)]">
                    {society.tagline}
                  </p>
                  <p className="mt-3 rounded-full border-[2px] border-[var(--ink)] bg-[var(--sidebar)] px-3 py-1 text-center text-xs font-bold">
                    {eventsHosted} event{eventsHosted === 1 ? "" : "s"} hosted
                  </p>
                </div>
              </Link>
              <div className="flex items-center justify-center gap-2 px-5 pb-5">
                {society.instagram_url && (
                  <a
                    href={society.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${society.name} on Instagram`}
                    className="flex h-8 w-8 items-center justify-center rounded-full border-[2px] border-[var(--ink)] bg-white text-[var(--rose-deep)]"
                  >
                    <InstagramIcon className="h-4 w-4" />
                  </a>
                )}
                {society.linkedin_url && (
                  <a
                    href={society.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${society.name} on LinkedIn`}
                    className="flex h-8 w-8 items-center justify-center rounded-full border-[2px] border-[var(--ink)] bg-white text-[var(--rose-deep)]"
                  >
                    <LinkedInIcon className="h-4 w-4" />
                  </a>
                )}
                <Link
                  href={`/communities/${society.slug}`}
                  className="cute-btn-outline text-sm"
                >
                  View Society
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
