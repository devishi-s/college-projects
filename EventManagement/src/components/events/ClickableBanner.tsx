"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`block w-full cursor-zoom-in overflow-hidden p-0 text-left ${className ?? ""}`}
        style={style}
        aria-label={`View full banner: ${alt}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className={imgClassName} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--ink)]/70 p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Full banner"
          >
            <motion.img
              src={src}
              alt={alt}
              className="max-h-full max-w-full rounded-2xl border-[3px] border-white object-contain shadow-lg"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            />
            <p className="absolute bottom-6 left-0 right-0 text-center text-sm font-semibold text-white">
              Click outside or press Esc to close
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
