import Link from "next/link";
import { notFound } from "next/navigation";
import {
  PresidentCharacter,
  VicePresidentCharacter,
} from "@/components/characters/LeaderPlaceholders";
import { JoinCommunityButton } from "@/components/communities/JoinCommunityButton";
import { InstagramIcon, LinkedInIcon } from "@/components/ui/SocialIcons";
import { getSociety } from "@/lib/societies";
import { createClient } from "@/lib/supabase/server";
import {
  isEventCompleted,
  publicStorageUrl,
  societyMemberTotal,
  type EventRow,
  type Society,
} from "@/lib/types";

type Props = { params: Promise<{ slug: string }> };

export default async function SocietyDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
  let memberCount = 0;
  let initiallyJoined = false;
  let members: {
    id: string;
    user_id: string;
    joined_at: string;
    full_name: string | null;
  }[] = [];

  if (dbSociety) {
    const [{ data }, { data: memberRows }, membership] = await Promise.all([
      supabase
        .from("events")
        .select("*")
        .eq("society_id", society.id)
        .order("starts_at", { ascending: true }),
      supabase
        .from("society_members")
        .select("id, user_id, joined_at")
        .eq("society_id", society.id)
        .order("joined_at", { ascending: true }),
      user
        ? supabase
            .from("society_members")
            .select("id")
            .eq("society_id", society.id)
            .eq("user_id", user.id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);
    events = (data as EventRow[]) ?? [];
    const rows = memberRows ?? [];
    memberCount = societyMemberTotal(rows.length);
    initiallyJoined = Boolean(membership.data);

    if (rows.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in(
          "id",
          rows.map((m) => m.user_id),
        );
      const nameById = new Map(
        (profiles ?? []).map((p) => [p.id, p.full_name] as const),
      );
      members = rows.map((m) => ({
        id: m.id,
        user_id: m.user_id,
        joined_at: m.joined_at,
        full_name: nameById.get(m.user_id) ?? null,
      }));
    }
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
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <p className="inline-block rounded-full border-[2px] border-[var(--ink)] bg-white px-4 py-1 text-xs font-bold">
              {events.length} event{events.length === 1 ? "" : "s"} hosted
            </p>
            <p className="inline-block rounded-full border-[2px] border-[var(--ink)] bg-white px-4 py-1 text-xs font-bold">
              {memberCount} member{memberCount === 1 ? "" : "s"}
            </p>
          </div>
          {dbSociety && (
            <div className="mt-4">
              <JoinCommunityButton
                societyId={society.id}
                societySlug={society.slug}
                isLoggedIn={Boolean(user)}
                initiallyJoined={initiallyJoined}
              />
            </div>
          )}
          <div className="mt-3 flex gap-2">
            {society.instagram_url && (
              <a
                href={society.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${society.name} on Instagram`}
                className="flex h-9 w-9 items-center justify-center rounded-full border-[2px] border-[var(--ink)] bg-white text-[var(--rose-deep)]"
              >
                <InstagramIcon className="h-5 w-5" />
              </a>
            )}
            {society.linkedin_url && (
              <a
                href={society.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${society.name} on LinkedIn`}
                className="flex h-9 w-9 items-center justify-center rounded-full border-[2px] border-[var(--ink)] bg-white text-[var(--rose-deep)]"
              >
                <LinkedInIcon className="h-5 w-5" />
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
          Members
        </h2>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">
          {memberCount} member{memberCount === 1 ? "" : "s"} including club
          leads
        </p>
        <ul className="mt-4 flex flex-col gap-2">
          <li className="rounded-2xl border-[2px] border-[var(--ink)] bg-white px-4 py-3">
            <p className="text-[10px] font-extrabold uppercase tracking-wide text-[var(--rose-deep)]">
              President
            </p>
            <p className="font-extrabold">
              {society.president_name ?? "President"}
            </p>
          </li>
          <li className="rounded-2xl border-[2px] border-[var(--ink)] bg-white px-4 py-3">
            <p className="text-[10px] font-extrabold uppercase tracking-wide text-[var(--rose-deep)]">
              Vice President
            </p>
            <p className="font-extrabold">
              {society.vice_president_name ?? "Vice President"}
            </p>
          </li>
          {members.length === 0 ? (
            <li className="px-1 text-sm text-[var(--ink-soft)]">
              No students have joined yet. Be the first!
            </li>
          ) : (
            members.map((m) => (
              <li
                key={m.id}
                className="rounded-2xl border-[2px] border-[var(--ink)] bg-white px-4 py-3"
              >
                <p className="text-[10px] font-extrabold uppercase tracking-wide text-[var(--ink-soft)]">
                  Member · joined{" "}
                  {new Date(m.joined_at).toLocaleDateString()}
                </p>
                <p className="font-extrabold">{m.full_name || "Student"}</p>
              </li>
            ))
          )}
        </ul>
      </section>

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
