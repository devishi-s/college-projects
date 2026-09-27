"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

type Props = {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  style?: React.CSSProperties;
};

export function ClickableBanner({
  src,
  alt,
  className,
  imgClassName = "h-full w-full object-cover",
  style,
}: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const lightbox =
    mounted &&
    createPortal(
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--ink)]/70 p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Full banner"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <motion.img
              src={src}
              alt={alt}
              className="max-h-[min(90vh,900px)] max-w-[min(92vw,1100px)] rounded-2xl border-[3px] border-white object-contain"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.18 }}
              onClick={(e) => e.stopPropagation()}
              draggable={false}
            />
            <p className="pointer-events-none absolute bottom-6 left-0 right-0 text-center text-sm font-semibold text-white">
              Click outside or press Esc to close
            </p>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body,
    );

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        className={`block w-full cursor-zoom-in overflow-hidden p-0 text-left ${className ?? ""}`}
        style={style}
        aria-label={`View full banner: ${alt}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className={imgClassName} draggable={false} />
      </button>
      {lightbox}
    </>
  );
}
