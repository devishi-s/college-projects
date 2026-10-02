import { FeedCard } from "@/components/feed/FeedCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { createClient } from "@/lib/supabase/server";
import { hasRecap, type EventRow } from "@/lib/types";

export default async function FeedPage() {
  const supabase = await createClient();
  const nowIso = new Date().toISOString();

  const { data } = await supabase
    .from("events")
    .select(
      "*, societies(id, slug, name, soft, deep, accent, logo_path)",
    )
    .not("recap_description", "is", null)
    .lt("starts_at", nowIso)
    .order("recap_posted_at", { ascending: false, nullsFirst: false });

  const events = ((data as EventRow[] | null) ?? [])
    .filter(hasRecap)
    .sort((a, b) => {
      const ta = new Date(a.recap_posted_at ?? a.starts_at).getTime();
      const tb = new Date(b.recap_posted_at ?? b.starts_at).getTime();
      return tb - ta;
    });

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="font-[family-name:var(--font-display)] text-4xl text-[var(--rose-deep)]">
        Feed
      </h1>
      <p className="mt-2 text-[var(--ink-soft)]">
        Recaps and photos from completed campus events.
      </p>

      {events.length === 0 ? (
        <EmptyState
          title="No recaps yet"
          body="After an event ends, admins can add a recap with photos from the Admin → Events tab."
        />
      ) : (
        <div className="mt-8 flex flex-col gap-5">
          {events.map((event) => (
            <FeedCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
