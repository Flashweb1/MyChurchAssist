import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-slate-200 mb-4">404</h1>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Page Not Found</h2>
        <p className="text-slate-500 mb-6">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link
          href="/dashboard"
          className="px-4 py-2 bg-[var(--brand-blue)] text-white font-medium rounded-lg hover:bg-[#0955db] transition-colors shadow-sm shadow-[var(--brand-blue)]/20"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
