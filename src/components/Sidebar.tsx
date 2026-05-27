"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  CalendarCheck,
  ClipboardList,
  Building2,
  MessageSquare,
  Wallet,
  BarChart3,
  Settings,
  Sparkles,
  X,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  DollarSign,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Getting Started", href: "/getting-started", icon: BookOpen },
  { name: "Members", href: "/members", icon: Users },
  { name: "Newcomers", href: "/newcomers", icon: UserPlus },
  { name: "Attendance", href: "/attendance", icon: CalendarCheck },
  { name: "Follow-Up", href: "/follow-up", icon: ClipboardList },
  { name: "Departments", href: "/departments", icon: Building2 },
  { name: "Messages", href: "/messages", icon: MessageSquare },
  { name: "Finances", href: "/finances", icon: DollarSign },
  { name: "Wallet", href: "/wallet", icon: Wallet },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "AI Assistant", href: "/ai-assistant", icon: Sparkles },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar({ isOpen, setIsOpen }: { isOpen?: boolean; setIsOpen?: (v: boolean) => void }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-40 md:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsOpen && setIsOpen(false)}
        />
      )}

      <aside
        className={`
          bg-[var(--brand-navy)] text-white flex flex-col h-screen fixed left-0 top-0 z-50
          transition-all duration-300 ease-in-out
          ${collapsed ? "w-[72px]" : "w-64"}
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Logo Area - White background for contrast with blue/green logo */}
        <div className="bg-white px-4 py-4 flex items-center justify-between border-b border-slate-800">
          <div className={`flex items-center gap-3 overflow-hidden transition-all duration-300 ${collapsed ? "w-0 opacity-0" : "w-auto opacity-100"}`}>
            <Image src="/logo-church-assist.png" alt="Church Assist" width={2000} height={581} className="h-8 w-auto" />
          </div>
          {collapsed && (
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-green-500 flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">CA</span>
            </div>
          )}
          <button
            className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
          <button className="md:hidden text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors" onClick={() => setIsOpen && setIsOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen && setIsOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative
                  ${collapsed ? "justify-center" : ""}
                  ${isActive
                    ? "bg-gradient-to-r from-[var(--brand-blue)]/20 to-[var(--brand-blue)]/5 text-white border-l-2 border-[var(--brand-blue)]"
                    : "hover:bg-white/5 text-slate-300 hover:text-white"
                  }
                `}
              >
                <item.icon className={`w-5 h-5 shrink-0 transition-colors duration-200 ${isActive ? "text-[var(--brand-blue)]" : "text-slate-400 group-hover:text-white"}`} />
                <span className={`font-medium text-sm whitespace-nowrap transition-all duration-300 ${collapsed ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100"}`}>
                  {item.name}
                </span>
                {isActive && !collapsed && (
                  <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-[var(--brand-blue)]" />
                )}
                {/* Tooltip for collapsed state */}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800">
          <p className={`text-xs text-slate-500 text-center transition-all duration-300 ${collapsed ? "opacity-0" : "opacity-100"}`}>
            Church Assist v0.1.0
          </p>
        </div>
      </aside>
    </>
  );
}
