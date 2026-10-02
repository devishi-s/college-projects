"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

type Props = {
  urls: string[];
  altPrefix: string;
  className?: string;
};

const PAGE_SIZE = 2;

export function PhotoGallery({ urls, altPrefix, className }: Props) {
  const [page, setPage] = useState(0);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  const pageCount = Math.max(1, Math.ceil(urls.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const start = safePage * PAGE_SIZE;
  const shown = urls.slice(start, start + PAGE_SIZE);
  const canPrev = safePage > 0;
  const canNext = safePage < pageCount - 1;
  const rangeEnd = start + shown.length;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (page > pageCount - 1) setPage(Math.max(0, pageCount - 1));
  }, [page, pageCount]);

  useEffect(() => {
    if (openIndex === null) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenIndex(null);
      if (e.key === "ArrowRight") {
        setOpenIndex((i) => (i === null ? i : (i + 1) % urls.length));
      }
      if (e.key === "ArrowLeft") {
        setOpenIndex((i) =>
          i === null ? i : (i - 1 + urls.length) % urls.length,
        );
      }
    }

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [openIndex, urls.length]);

  if (urls.length === 0) return null;

  const lightbox =
    mounted &&
    createPortal(
      <AnimatePresence>
        {openIndex !== null && urls[openIndex] && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--ink)]/70 p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setOpenIndex(null)}
            role="dialog"
            aria-modal="true"
            aria-label="Recap photo"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <motion.img
              key={urls[openIndex]}
              src={urls[openIndex]}
              alt={`${altPrefix} photo ${openIndex + 1}`}
              className="max-h-[min(90vh,900px)] max-w-[min(92vw,1100px)] rounded-2xl border-[3px] border-white object-contain"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.18 }}
              onClick={(e) => e.stopPropagation()}
              draggable={false}
            />
            <p className="pointer-events-none absolute bottom-6 left-0 right-0 text-center text-sm font-semibold text-white">
              {openIndex + 1} / {urls.length} · Esc to close
              {urls.length > 1 ? " · ← → to browse" : ""}
            </p>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body,
    );

  return (
    <div className={className}>
      <div className="relative">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={safePage}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.18 }}
            className={`grid gap-3 ${
              shown.length === 1 ? "grid-cols-1" : "grid-cols-2"
            }`}
          >
            {shown.map((url, i) => {
              const absoluteIndex = start + i;
              return (
                <button
                  key={`${url}-${absoluteIndex}`}
                  type="button"
                  onClick={() => setOpenIndex(absoluteIndex)}
                  className="relative aspect-[16/10] w-full cursor-zoom-in overflow-hidden rounded-2xl border-[2.5px] border-[var(--ink)] bg-[var(--sidebar)] p-0"
                  aria-label={`View ${altPrefix} photo ${absoluteIndex + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`${altPrefix} photo ${absoluteIndex + 1}`}
                    className="h-full w-full object-cover"
                    draggable={false}
                  />
                </button>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {canPrev && (
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            aria-label="Previous photos"
            className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border-[2.5px] border-[var(--ink)] bg-white text-xl font-extrabold text-[var(--rose-deep)] shadow-[2px_2px_0_var(--rose)]"
          >
            ‹
          </button>
        )}

        {canNext && (
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            aria-label="Next photos"
            className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border-[2.5px] border-[var(--ink)] bg-white text-xl font-extrabold text-[var(--rose-deep)] shadow-[2px_2px_0_var(--rose)]"
          >
            ›
          </button>
        )}
      </div>

      <p className="mt-2 text-center text-xs font-bold text-[var(--ink-soft)]">
        {urls.length === 1
          ? "1 photo"
          : `Photos ${start + 1}–${rangeEnd} of ${urls.length}`}
        {canNext ? " · use › for more" : ""}
      </p>

      {lightbox}
    </div>
  );
}
