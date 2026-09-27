type IconProps = { className?: string };

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
    </svg>
  );
}

export function LinkedInIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M6.5 9.5H3.75v10.75H6.5V9.5zM5.12 4A1.62 1.62 0 1 0 5.13 7.24 1.62 1.62 0 0 0 5.12 4zM20.25 14.3c0-3.12-1.67-4.57-3.9-4.57a3.36 3.36 0 0 0-3.02 1.66h-.05V9.5H10.6v10.75h2.75v-5.32c0-1.4.27-2.76 2-2.76 1.71 0 1.74 1.6 1.74 2.85v5.23h2.75V14.3z" />
    </svg>
  );
}
