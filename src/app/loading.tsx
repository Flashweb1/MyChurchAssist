export default function Loading() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-[var(--brand-border)] border-t-[var(--brand-blue)] rounded-full animate-spin" />
        <p className="text-sm text-[var(--brand-muted)]">Loading...</p>
      </div>
    </div>
  );
}
