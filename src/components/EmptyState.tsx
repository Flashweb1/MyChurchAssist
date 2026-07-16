"use client";

import React from "react";
import Link from "next/link";

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  secondaryLabel,
  secondaryHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mb-4 shadow-inner">
        <Icon className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-base font-semibold text-slate-800 mb-1.5">{title}</h3>
      <p className="text-sm text-slate-500 max-w-xs leading-relaxed mb-5">{description}</p>
      <div className="flex items-center gap-3 flex-wrap justify-center">
        {actionLabel && (
          actionHref ? (
            <Link
              href={actionHref}
              className="px-4 py-2.5 bg-[var(--brand-blue)] text-white rounded-xl text-sm font-semibold hover:bg-[var(--brand-blue-dark)] transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
            >
              {actionLabel}
            </Link>
          ) : (
            <button
              onClick={onAction}
              className="px-4 py-2.5 bg-[var(--brand-blue)] text-white rounded-xl text-sm font-semibold hover:bg-[var(--brand-blue-dark)] transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
            >
              {actionLabel}
            </button>
          )
        )}
        {secondaryLabel && secondaryHref && (
          <Link
            href={secondaryHref}
            className="px-4 py-2.5 bg-white border border-[var(--brand-border)] text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-all"
          >
            {secondaryLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
