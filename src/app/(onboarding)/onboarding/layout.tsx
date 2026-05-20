"use client";

import { ReactNode } from "react";

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-[var(--brand-blue)]/5 flex items-center justify-center p-4">
      {children}
    </div>
  );
}
