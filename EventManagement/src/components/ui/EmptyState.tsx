export function EmptyState({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="cute-card mt-8 p-10 text-center">
      <div
        className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-[var(--ink)] bg-[var(--mint)] text-2xl font-bold text-[var(--ink)]"
        aria-hidden
      >
        ✦
      </div>
      <p className="font-[family-name:var(--font-display)] text-2xl text-[var(--rose-deep)]">
        {title}
      </p>
      <p className="mt-2 text-sm text-[var(--ink-soft)]">{body}</p>
    </div>
  );
}
