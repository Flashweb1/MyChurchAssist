"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, UserPlus, CalendarCheck, ClipboardList,
  Building2, MessageSquare, Wallet, BarChart3, Settings, Sparkles,
  X, ChevronLeft, ChevronRight, BookOpen, DollarSign, Church,
} from "lucide-react";
import { useState, useEffect } from "react";

type NavItem = {
  name: string;
  href: string;
  icon: React.ElementType;
  accent?: boolean;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Getting Started", href: "/getting-started", icon: BookOpen },
    ],
  },
  {
    label: "People",
    items: [
      { name: "Members", href: "/members", icon: Users },
      { name: "Newcomers", href: "/newcomers", icon: UserPlus },
      { name: "Attendance", href: "/attendance", icon: CalendarCheck },
      { name: "Follow-Up", href: "/follow-up", icon: ClipboardList },
      { name: "Departments", href: "/departments", icon: Building2 },
    ],
  },
  {
    label: "Communication",
    items: [
      { name: "Messages", href: "/messages", icon: MessageSquare },
      { name: "AI Assistant", href: "/ai-assistant", icon: Sparkles, accent: true },
    ],
  },
  {
    label: "Finance",
    items: [
      { name: "Finances", href: "/finances", icon: DollarSign },
      { name: "Wallet", href: "/wallet", icon: Wallet },
      { name: "Reports", href: "/reports", icon: BarChart3 },
    ],
  },
  {
    label: "System",
    items: [
      { name: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export default function Sidebar({ isOpen, setIsOpen }: { isOpen?: boolean; setIsOpen?: (v: boolean) => void }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const NavLink = ({ item, idx }: { item: NavItem; idx: number }) => {
    const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
    return (
      <Link
        href={item.href}
        onClick={() => setIsOpen && setIsOpen(false)}
        className={`
          group relative flex items-center gap-3 px-3 py-2.5
          rounded-xl transition-all duration-200
          ${collapsed ? "justify-center" : ""}
          ${isActive
            ? "bg-gradient-to-r from-indigo-600/25 to-purple-600/15 text-white border border-indigo-500/30 shadow-lg shadow-indigo-500/10"
            : "text-slate-400 hover:text-white hover:bg-white/5"}
        `}
        style={{ animationDelay: `${idx * 30}ms`, animation: mounted ? "fadeInUp 0.4s ease-out both" : "none" }}
      >
        {isActive && (
          <div className="absolute -left-0.5 w-0.5 h-6 bg-gradient-to-b from-indigo-400 via-purple-400 to-emerald-400 rounded-r-full" />
        )}

        <div className={`
          w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200
          ${isActive
            ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/30"
            : item.accent
              ? "text-emerald-400 group-hover:bg-emerald-500/10"
              : "text-slate-500 group-hover:text-slate-200 group-hover:bg-white/5"}
        `}>
          <item.icon className="w-4 h-4" />
        </div>

        {!collapsed && (
          <span className={`text-sm font-medium whitespace-nowrap flex-1 ${isActive ? "text-white" : ""}`}>
            {item.name}
            {item.accent && (
              <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">
                AI
              </span>
            )}
          </span>
        )}

        {isActive && !collapsed && (
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 ml-auto" />
        )}

        {collapsed && (
          <div className="absolute left-full ml-3 px-3 py-2 bg-slate-800 text-white text-xs font-medium rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50 whitespace-nowrap border border-slate-700/50 pointer-events-none">
            {item.name}
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-t-4 border-t-transparent border-r-6 border-r-slate-800 border-b-4 border-b-transparent" />
          </div>
        )}
      </Link>
    );
  };

  let itemIdx = 0;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen && setIsOpen(false)}
        />
      )}

      <aside className={`
        fixed left-0 top-0 z-50 h-full flex flex-col
        bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950
        border-r border-slate-800/50
        transition-all duration-300 ease-in-out
        ${collapsed ? "w-[72px]" : "w-64"}
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>

        {/* Brand Header */}
        <div className="relative overflow-hidden px-4 py-5 border-b border-slate-800/60 shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/15 via-purple-600/8 to-transparent" />
          <div className="relative flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 shrink-0">
              <Church className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">Church Assist</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Ministry Platform</p>
              </div>
            )}
            <button
              className="hidden lg:flex ml-auto p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white transition-all"
              onClick={() => setCollapsed(!collapsed)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
            <button
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              onClick={() => setIsOpen && setIsOpen(false)}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-700">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-5">
              {/* Group label */}
              {!collapsed && (
                <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-600 select-none">
                  {group.label}
                </p>
              )}
              {collapsed && (
                <div className="my-2 mx-auto w-5 border-t border-slate-700/60" />
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavLink key={item.href} item={item} idx={itemIdx++} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800/60 shrink-0">
          <div className={`flex items-center gap-3 px-2 py-2.5 rounded-xl bg-slate-800/40 ${collapsed ? "justify-center" : ""}`}>
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white">Church Assist</p>
                <p className="text-[10px] text-slate-500">v1.0.0 • Stable</p>
              </div>
            )}
            {!collapsed && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />}
          </div>
        </div>
      </aside>
    </>
  );
}
