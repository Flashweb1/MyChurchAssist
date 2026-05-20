"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">!</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Something went wrong</h2>
        <p className="text-slate-500 mb-6">{error.message || "An unexpected error occurred."}</p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-[var(--brand-blue)] text-white font-medium rounded-lg hover:bg-[#0955db] transition-colors shadow-sm shadow-[var(--brand-blue)]/20"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
