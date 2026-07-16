"use client";

import { useDarkMode } from "@/lib/dark-mode-context";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  const { darkMode } = useDarkMode();
  return (
    <div
      className={`animate-pulse rounded ${darkMode ? "bg-slate-700" : "bg-slate-200"} ${className}`}
    />
  );
}

/** Full stat card skeleton — matches the 4-up grid used on most pages */
export function StatCardSkeleton() {
  const { darkMode } = useDarkMode();
  return (
    <div className={`p-5 rounded-2xl border ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"} shadow-sm`}>
      <div className="flex items-center gap-4">
        <Skeleton className="w-11 h-11 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>
    </div>
  );
}

/** Full-page stats + table skeleton */
export function PageSkeleton({ rows = 6 }: { rows?: number }) {
  const { darkMode } = useDarkMode();
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Table card */}
      <div className={`rounded-2xl border ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"} shadow-sm overflow-hidden`}>
        {/* Filter bar */}
        <div className={`p-4 border-b ${darkMode ? "border-slate-700" : "border-slate-100"} flex gap-3`}>
          <Skeleton className="h-10 w-64 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>

        {/* Table rows */}
        <div className={`divide-y ${darkMode ? "divide-slate-700" : "divide-slate-100"}`}>
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="px-6 py-4 flex items-center gap-4">
              <Skeleton className="w-10 h-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-28" />
              </div>
              <Skeleton className="h-4 w-24 hidden md:block" />
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-lg ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Dashboard overview skeleton */
export function DashboardSkeleton() {
  const { darkMode } = useDarkMode();
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-80" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </div>

      {/* Two-column section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-2 rounded-2xl border ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"} p-6 space-y-4`}>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
        <div className={`rounded-2xl border ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"} p-6 space-y-4`}>
          <Skeleton className="h-5 w-32" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Finance page skeleton */
export function FinanceSkeleton() {
  const { darkMode } = useDarkMode();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-44" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-2 rounded-2xl border ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"} p-6 space-y-4`}>
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-72 w-full rounded-xl" />
        </div>
        <div className={`rounded-2xl border ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"} p-6 space-y-4`}>
          <Skeleton className="h-5 w-28" />
          <Skeleton className="w-36 h-36 rounded-full mx-auto" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </div>

      <PageSkeleton rows={5} />
    </div>
  );
}
