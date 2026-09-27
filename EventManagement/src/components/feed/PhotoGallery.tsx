"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

type Props = {
  urls: string[];
  altPrefix: string;
  className?: string;
};

export function PhotoGallery({ urls, altPrefix, className }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (openIndex === null) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenIndex(null);
      if (e.key === "ArrowRight" && openIndex !== null) {
        setOpenIndex((i) => (i === null ? i : (i + 1) % urls.length));
      }
      if (e.key === "ArrowLeft" && openIndex !== null) {
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

  const shown = urls.slice(0, 4);
  const cols =
    shown.length === 1
      ? "grid-cols-1"
      : shown.length === 2
        ? "grid-cols-2"
        : "grid-cols-2";

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
    <>
      <div className={`grid gap-2 ${cols} ${className ?? ""}`}>
        {shown.map((url, i) => (
          <button
            key={`${url}-${i}`}
            type="button"
            onClick={() => setOpenIndex(i)}
            className="relative aspect-[4/3] cursor-zoom-in overflow-hidden rounded-2xl border-[2.5px] border-[var(--ink)] bg-[var(--sidebar)] p-0"
            aria-label={`View ${altPrefix} photo ${i + 1}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`${altPrefix} photo ${i + 1}`}
              className="h-full w-full object-cover"
              draggable={false}
            />
            {i === 3 && urls.length > 4 && (
              <span className="absolute inset-0 flex items-center justify-center bg-[var(--ink)]/55 text-sm font-extrabold text-white">
                +{urls.length - 4}
              </span>
            )}
          </button>
        ))}
      </div>
      {lightbox}
    </>
  );
}
