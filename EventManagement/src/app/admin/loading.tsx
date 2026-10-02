export default function AdminLoading() {
  return (
    <div className="mx-auto max-w-4xl animate-pulse">
      <div className="mb-6">
        <div className="h-10 w-56 rounded-2xl bg-[var(--sidebar)]" />
        <div className="mt-2 h-4 w-40 rounded-full bg-[var(--sidebar)]" />
      </div>
      <div className="mb-6 flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-9 w-24 rounded-full bg-[var(--sidebar)]"
          />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="cute-card h-28 bg-[var(--sidebar)]/60" />
        ))}
      </div>
    </div>
  );
}
