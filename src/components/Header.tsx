"use client";

import { Bell, Search, Menu, LogOut, Sparkles, User, ChevronDown, Moon, Sun } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, logout, churchId } = useAuth();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifLoaded, setNotifLoaded] = useState(false);
  const [notifications, setNotifications] = useState<
    { id: string; type: "warning" | "info" | "success"; title: string; description: string; time: string; href: string }[]
  >([]);
  const [notifsRead, setNotifsRead] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const loadingRef = useRef(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const displayName = user?.displayName || user?.email || "Admin User";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBellClick = async () => {
    const newShowState = !showNotifs;
    setShowNotifs(newShowState);
    setNotifsRead(true);

    if (newShowState && !notifLoaded && !loadingRef.current) {
      loadingRef.current = true;
      try {
        const { collection, getDocs, query, where, limit } = await import("firebase/firestore");
        const { db } = await import("@/lib/firebase");
        const notifs: typeof notifications = [];

        if (!churchId) return;
        const [followUpsSnap, newcomersSnap, membersSnap] = await Promise.all([
          getDocs(query(collection(db, "followups"), where("churchId", "==", churchId), where("status", "==", "Pending"), limit(10))),
          getDocs(query(collection(db, "newcomers"), where("churchId", "==", churchId))),
          getDocs(query(collection(db, "members"), where("churchId", "==", churchId))),
        ]);

        if (followUpsSnap.size > 0) {
          notifs.push({
            id: "followups",
            type: "warning",
            title: `${followUpsSnap.size} Pending Follow-Up${followUpsSnap.size > 1 ? "s" : ""}`,
            description: "Members are waiting for pastoral follow-up.",
            time: "Action required",
            href: "/follow-up",
          });
        }

        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const recentNewcomers = newcomersSnap.docs.filter((d) => {
          const created = d.data().createdAt?.toDate?.() ?? new Date(d.data().createdAt);
          return created >= weekAgo;
        });
        if (recentNewcomers.length > 0) {
          notifs.push({
            id: "newcomers",
            type: "info",
            title: `${recentNewcomers.length} New Visitor${recentNewcomers.length > 1 ? "s" : ""} This Week`,
            description: "New first-time visitors have been logged.",
            time: "This week",
            href: "/newcomers",
          });
        }

        const today = new Date();
        const birthdayCount = membersSnap.docs.filter((d) => {
          const bday = d.data().dateOfBirth;
          if (!bday) return false;
          const b = new Date(bday);
          return b.getMonth() === today.getMonth() && Math.abs(b.getDate() - today.getDate()) <= 7;
        }).length;
        if (birthdayCount > 0) {
          notifs.push({
            id: "birthdays",
            type: "success",
            title: `${birthdayCount} Birthday${birthdayCount > 1 ? "s" : ""} This Week`,
            description: "Don't forget to celebrate your members!",
            time: "This week",
            href: "/members",
          });
        }

        if (notifs.length === 0) {
          notifs.push({
            id: "all-clear",
            type: "success",
            title: "All caught up!",
            description: "No pending actions at this time.",
            time: "Just now",
            href: "/dashboard",
          });
        }

        setNotifications(notifs);
        setNotifLoaded(true);
      } catch {
        // fail silently
      } finally {
        loadingRef.current = false;
      }
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      router.replace("/login");
    } finally {
      setLoggingOut(false);
    }
  };

  const typeStyles = {
    warning: "bg-amber-100 text-amber-600",
    info: "bg-blue-100 text-blue-600",
    success: "bg-emerald-100 text-emerald-600",
  };

  const typeIcons = {
    warning: "⚠️",
    info: "ℹ️",
    success: "✅",
  };

  return (
    <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-[var(--brand-border)] flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          className="md:hidden p-2 -ml-2 text-[var(--brand-navy)] hover:bg-[var(--brand-border)] rounded-lg transition-colors"
          onClick={onMenuClick}
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden md:flex items-center bg-[var(--brand-bg)] border border-[var(--brand-border)] px-3 py-2 rounded-xl w-72 lg:w-96 focus-within:ring-2 focus-within:ring-[var(--brand-blue)]/20 focus-within:border-[var(--brand-blue)] transition-all">
          <Search className="w-4 h-4 text-[var(--brand-muted)] mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Search members, newcomers..."
            className="bg-transparent border-none outline-none text-sm w-full placeholder:text-[var(--brand-muted)] text-[var(--brand-navy)]"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.target as HTMLInputElement).value.trim()) {
                router.push(`/members?search=${encodeURIComponent((e.target as HTMLInputElement).value.trim())}`);
              }
            }}
          />
          <kbd className="hidden lg:flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-[var(--brand-muted)] bg-white border border-[var(--brand-border)] rounded">
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* AI Quick Access */}
        <Link
          href="/ai-assistant"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-[var(--brand-blue)] to-[var(--brand-purple)] text-white rounded-full hover:shadow-lg hover:shadow-[var(--brand-blue)]/25 hover:-translate-y-0.5 transition-all duration-200"
        >
          <Sparkles className="w-3.5 h-3.5" />
          AI Assistant
        </Link>

        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2.5 text-[var(--brand-muted)] hover:text-[var(--brand-navy)] hover:bg-[var(--brand-bg)] rounded-xl transition-all duration-200"
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={handleBellClick}
            className="relative p-2.5 text-[var(--brand-muted)] hover:text-[var(--brand-navy)] hover:bg-[var(--brand-bg)] rounded-xl transition-all duration-200"
          >
            <Bell className="w-5 h-5" />
            {!notifsRead && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
            )}
          </button>

          {showNotifs && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowNotifs(false)} />
              <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-[var(--brand-border)] z-20 overflow-hidden scale-in">
                <div className="px-4 py-3 border-b border-[var(--brand-border)] flex items-center justify-between bg-[var(--brand-bg)]">
                  <h3 className="font-semibold text-slate-900 text-sm">Notifications</h3>
                  <span className="text-xs text-[var(--brand-muted)] bg-white px-2 py-0.5 rounded-full border border-[var(--brand-border)]">{notifications.length}</span>
                </div>
                <div className="divide-y divide-[var(--brand-border-light)] max-h-80 overflow-y-auto">
                  {!notifLoaded ? (
                    <div className="p-8 text-center">
                      <div className="w-8 h-8 border-2 border-[var(--brand-blue)] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      <p className="text-sm text-[var(--brand-muted)]">Loading...</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <Link
                        key={notif.id}
                        href={notif.href}
                        onClick={() => setShowNotifs(false)}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-[var(--brand-bg)] transition-colors group"
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${typeStyles[notif.type]}`}>
                          <span className="text-sm">{typeIcons[notif.type]}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 group-hover:text-[var(--brand-blue)] transition-colors">{notif.title}</p>
                          <p className="text-xs text-[var(--brand-muted)] mt-0.5">{notif.description}</p>
                          <p className="text-xs text-[var(--brand-muted-light)] mt-1">{notif.time}</p>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl border border-transparent hover:bg-[var(--brand-bg)] hover:border-[var(--brand-border)] transition-all duration-200"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-[var(--brand-blue)] to-[var(--brand-blue-dark)] text-white flex items-center justify-center rounded-lg font-semibold text-sm shadow-sm">
              {initials}
            </div>
            <span className="text-sm font-medium text-[var(--brand-navy)] hidden sm:block max-w-[120px] truncate">
              {displayName}
            </span>
            <ChevronDown className={`w-4 h-4 text-[var(--brand-muted)] transition-transform duration-200 ${showUserMenu ? "rotate-180" : ""}`} />
          </button>

          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
              <div className="absolute right-0 top-12 w-56 bg-white rounded-xl shadow-xl border border-[var(--brand-border)] z-20 overflow-hidden scale-in">
                <div className="px-4 py-3 border-b border-[var(--brand-border)] bg-[var(--brand-bg)]">
                  <p className="text-sm font-semibold text-slate-900">{displayName}</p>
                  <p className="text-xs text-[var(--brand-muted)] truncate">{user?.email}</p>
                </div>
                <div className="p-1">
                  <Link
                    href="/settings"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-[var(--brand-bg)] rounded-lg transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Profile Settings
                  </Link>
                  <button
                    onClick={() => { setShowUserMenu(false); handleLogout(); }}
                    disabled={loggingOut}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full disabled:opacity-50"
                  >
                    <LogOut className="w-4 h-4" />
                    {loggingOut ? "Signing out..." : "Sign out"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
