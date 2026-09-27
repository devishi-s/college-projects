"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PhotoGallery } from "@/components/feed/PhotoGallery";
import {
  publicStorageUrl,
  type EventRow,
} from "@/lib/types";

type Props = {
  event: EventRow;
};

export function FeedCard({ event }: Props) {
  const society = event.societies;
  const logoUrl = publicStorageUrl("society-logos", society?.logo_path);
  const photos = event.recap_photo_urls ?? [];
  const posted =
    event.recap_posted_at ?? event.starts_at;

  return (
    <motion.article
      className="cute-card overflow-hidden p-6"
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-[2.5px] border-[var(--ink)]"
          style={{ background: society?.soft ?? "var(--sidebar)" }}
        >
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={`${society?.name ?? "Society"} logo`}
              className="h-full w-full object-cover"
            />
          ) : (
            <span
              className="text-[10px] font-extrabold"
              style={{ color: society?.deep ?? undefined }}
            >
              {(society?.name ?? "?").slice(0, 3)}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          {society ? (
            <Link
              href={`/communities/${society.slug}`}
              className="text-xs font-bold uppercase tracking-wide text-[var(--rose-deep)]"
            >
              {society.name}
            </Link>
          ) : (
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--rose-deep)]">
              Society
            </p>
          )}
          <Link href={`/events/${event.id}`}>
            <h2 className="mt-0.5 truncate text-xl font-extrabold text-[var(--ink)] hover:text-[var(--rose-deep)]">
              {event.title}
            </h2>
          </Link>
        </div>
        <p className="shrink-0 text-right text-xs font-bold text-[var(--ink-soft)]">
          {new Date(event.starts_at).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>

      <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-[var(--ink)]">
        {event.recap_description}
      </p>

      {photos.length > 0 && (
        <PhotoGallery
          urls={photos}
          altPrefix={`${event.title} recap`}
          className="mt-4"
        />
      )}

      <p className="mt-4 text-[10px] font-bold uppercase tracking-wide text-[var(--ink-soft)]">
        Posted{" "}
        {new Date(posted).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </p>
    </motion.article>
  );
}
