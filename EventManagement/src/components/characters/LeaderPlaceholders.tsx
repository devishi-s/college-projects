"use client";

import { motion } from "framer-motion";

type CharacterProps = {
  accent: string;
  soft: string;
  deep: string;
  className?: string;
};

function HoverWrap({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      whileHover={{ y: -8, rotate: -2, scale: 1.04 }}
      transition={{ type: "spring", stiffness: 320, damping: 18 }}
    >
      {children}
    </motion.div>
  );
}

/** Flat unDraw-style placeholder leader mascot */
export function PresidentCharacter({
  accent,
  soft,
  deep,
  className,
}: CharacterProps) {
  return (
    <HoverWrap className={className}>
      <svg
        viewBox="0 0 160 180"
        className="h-full w-full"
        role="img"
        aria-label="President illustration"
      >
        <circle cx="80" cy="150" r="28" fill={soft} />
        <ellipse cx="80" cy="118" rx="36" ry="42" fill={accent} />
        <circle cx="80" cy="52" r="28" fill="#f6d5c8" />
        <path
          d="M52 48c4-22 52-22 56 0v8c-8 14-40 14-56 0z"
          fill={deep}
        />
        <circle cx="70" cy="54" r="3" fill={deep} />
        <circle cx="90" cy="54" r="3" fill={deep} />
        <path
          d="M72 66c4 6 12 6 16 0"
          fill="none"
          stroke={deep}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <rect x="55" y="95" width="18" height="40" rx="8" fill="#f6d5c8" />
        <rect x="87" y="95" width="18" height="40" rx="8" fill="#f6d5c8" />
      </svg>
    </HoverWrap>
  );
}

export function VicePresidentCharacter({
  accent,
  soft,
  deep,
  className,
}: CharacterProps) {
  return (
    <HoverWrap className={className}>
      <svg
        viewBox="0 0 160 180"
        className="h-full w-full"
        role="img"
        aria-label="Vice president illustration"
      >
        <circle cx="80" cy="152" r="26" fill={soft} />
        <path
          d="M48 150c0-40 14-62 32-62s32 22 32 62"
          fill={accent}
        />
        <circle cx="80" cy="56" r="26" fill="#f6d5c8" />
        <path
          d="M56 50c6-18 42-18 48 0-10 10-28 12-48 0z"
          fill={deep}
        />
        <circle cx="71" cy="58" r="3" fill={deep} />
        <circle cx="89" cy="58" r="3" fill={deep} />
        <path
          d="M74 70c3 4 9 4 12 0"
          fill="none"
          stroke={deep}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <rect x="42" y="100" width="16" height="36" rx="8" fill="#f6d5c8" />
        <rect x="102" y="100" width="16" height="36" rx="8" fill="#f6d5c8" />
        <circle
          cx="118"
          cy="88"
          r="10"
          fill={soft}
          stroke={deep}
          strokeWidth="2"
        />
      </svg>
    </HoverWrap>
  );
}
