import Link from "next/link";
import { notFound } from "next/navigation";
import { ClickableBanner } from "@/components/events/ClickableBanner";
import { EventCountdown } from "@/components/events/EventCountdown";
import { RegisterInterestButton } from "@/components/events/RegisterInterestButton";
import { createClient } from "@/lib/supabase/server";
import {
  isEventCompleted,
  publicStorageUrl,
  type EventRow,
} from "@/lib/types";

type Props = { params: Promise<{ id: string }> };

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("events")
    .select("*, societies(id, slug, name, soft, deep, accent)")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();
  const event = data as EventRow;
  const bannerUrl = publicStorageUrl("event-banners", event.banner_path);
  const completed = isEventCompleted(event.starts_at);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ count }, { data: mine }] = await Promise.all([
    supabase
      .from("event_registrations")
      .select("*", { count: "exact", head: true })
      .eq("event_id", id),
    user
      ? supabase
          .from("event_registrations")
          .select("id")
          .eq("event_id", id)
          .eq("user_id", user.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const registeredCount = count ?? 0;
  const capacity = event.capacity;
  const isFull = capacity != null && registeredCount >= capacity;

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/events" className="text-sm font-semibold text-[var(--rose-deep)]">
        ← All events
      </Link>

      <article className="cute-card mt-4 overflow-hidden">
        <div
          className="h-56 border-b-[3px] border-[var(--ink)]"
          style={{ background: event.societies?.soft ?? "var(--sidebar)" }}
        >
          {bannerUrl ? (
            <ClickableBanner
              src={bannerUrl}
              alt={`${event.title} event banner`}
              className="h-full"
              imgClassName="h-full w-full object-cover"
            />
          ) : null}
        </div>
        <div className="p-8">
          <div className="flex flex-wrap items-center gap-2">
            {event.societies && (
              <Link
                href={`/communities/${event.societies.slug}`}
                className="text-xs font-bold uppercase tracking-wide text-[var(--rose-deep)]"
              >
                {event.societies.name}
              </Link>
            )}
            {completed && (
              <span className="rounded-full border-[2px] border-[var(--ink)] bg-[var(--mint)] px-2 py-0.5 text-[10px] font-extrabold uppercase">
                Completed
              </span>
            )}
          </div>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl text-[var(--rose-deep)]">
            {event.title}
          </h1>
          <p className="mt-3 text-sm font-semibold text-[var(--ink-soft)]">
            {new Date(event.starts_at).toLocaleString()}
            {event.venue ? ` · ${event.venue}` : ""}
          </p>
          <p className="mt-2 text-sm font-bold text-[var(--ink)]">
            {capacity != null
              ? `${registeredCount}/${capacity} registered`
              : `${registeredCount} registered`}
          </p>

          {!completed && <EventCountdown startsAt={event.starts_at} />}

          {event.description && (
            <p className="mt-6 whitespace-pre-wrap text-[var(--ink)]">
              {event.description}
            </p>
          )}

          <RegisterInterestButton
            eventId={event.id}
            isLoggedIn={Boolean(user)}
            alreadyRegistered={Boolean(mine)}
            completed={completed}
            isFull={isFull}
          />
        </div>
      </article>
    </div>
  );
}
