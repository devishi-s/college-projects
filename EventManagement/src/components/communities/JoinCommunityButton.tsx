"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { motion } from "framer-motion";
import {
  joinSocietyAction,
  leaveSocietyAction,
} from "@/app/communities/actions";

type Props = {
  societyId: string;
  societySlug: string;
  isLoggedIn: boolean;
  initiallyJoined: boolean;
  className?: string;
  size?: "sm" | "md";
};

export function JoinCommunityButton({
  societyId,
  societySlug,
  isLoggedIn,
  initiallyJoined,
  className = "",
  size = "md",
}: Props) {
  const router = useRouter();
  const [joined, setJoined] = useState(initiallyJoined);
  const [bounceKey, setBounceKey] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setJoined(initiallyJoined);
  }, [initiallyJoined]);

  const sizeClass =
    size === "sm" ? "cute-btn-outline text-sm px-3 py-1.5" : "cute-btn";

  return (
    <div className={className}>
      <motion.button
        key={bounceKey}
        type="button"
        disabled={pending}
        initial={{ scale: 0.92 }}
        animate={{ scale: 1 }}
        whileTap={{ scale: 0.96 }}
        transition={{ type: "spring", stiffness: 420, damping: 16 }}
        className={
          joined
            ? `cute-btn-outline ${size === "sm" ? "text-sm px-3 py-1.5" : ""}`
            : sizeClass
        }
        onClick={() => {
          if (!isLoggedIn) {
            router.push(`/login?next=/communities/${societySlug}`);
            return;
          }

          startTransition(async () => {
            const result = joined
              ? await leaveSocietyAction(societyId)
              : await joinSocietyAction(societyId);

            if (result.error) {
              setMessage(result.error);
              return;
            }

            setJoined(!joined);
            setBounceKey((k) => k + 1);
            setMessage(null);
            router.refresh();
          });
        }}
      >
        {pending ? "Please wait…" : joined ? "Joined ✓" : "Join Community"}
      </motion.button>
      {message && (
        <p className="mt-1 text-xs font-semibold text-[var(--rose-deep)]">
          {message}
        </p>
      )}
    </div>
  );
}
