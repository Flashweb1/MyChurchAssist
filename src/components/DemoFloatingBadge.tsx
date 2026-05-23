"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function DemoFloatingBadge() {
  return (
    <Link
      href="/login?demo=true"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-[var(--brand-blue)] to-[var(--brand-green)] text-white rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group"
    >
      <Sparkles className="w-4 h-4" />
      <span className="text-sm font-semibold">Try the demo</span>
    </Link>
  );
}
