"use client";

import { Bell, Search, Menu, LogOut, Sparkles, User, ChevronDown, Moon, Sun } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useDarkMode } from "@/lib/dark-mode-context";
import { openSearchModal } from "@/components/SearchModal";

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
  const { darkMode, toggleDarkMode } = useDarkMode();
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
    warning: "bg-amber-50 text-amber-600 border-amber-100",
    info: "bg-blue-50 text-blue-600 border-blue-100",
    success: "bg-emerald-50 text-emerald-600 border-emerald-100",
  };

  const typeIcons = {
    warning: "⚠️",
    info: "ℹ️",
    success: "✅",
  };

  return (
    <header className={`h-16 ${darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200/70'} backdrop-blur-2xl border-b flex items-center justify-between px-4 md:px-5 sticky top-0 z-30 shadow-sm transition-colors duration-300`}>
      {/* Left side */}
      <div className="flex items-center gap-3">
        <button
          className={`lg:hidden p-2 -ml-1 ${darkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'} rounded-xl transition-all duration-200`}
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search bar — hidden on mobile, visible md+ */}
        <button
          onClick={() => openSearchModal()}
          className={`hidden md:flex items-center gap-2.5 ${darkMode ? 'bg-slate-800 border-slate-700 hover:border-indigo-400' : 'bg-slate-50 border-slate-200 hover:border-indigo-400'} border px-4 py-2 rounded-xl w-72 lg:w-96 transition-all duration-200 cursor-pointer`}
        >
          <Search className={`w-4 h-4 shrink-0 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
          <span className={`text-sm flex-1 text-left ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>Search…</span>
          <kbd className={`hidden lg:inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold rounded border ${darkMode ? 'text-slate-500 bg-slate-900 border-slate-700' : 'text-slate-400 bg-white border-slate-200'}`}>⌘K</kbd>
        </button>

        {/* Mobile search icon */}
        <button
          onClick={() => openSearchModal()}
          className={`md:hidden p-2 ${darkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'} rounded-xl transition-all duration-200`}
          aria-label="Search"
        >
          <Search className="w-5 h-5" />
        </button>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-1.5 md:gap-2">
        {/* AI button — icon-only on small screens, label on sm+ */}
        <Link
          href="/ai-assistant"
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5 transition-all duration-200"
          aria-label="AI Assistant"
        >
          <Sparkles className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">AI Assistant</span>
        </Link>

        {/* Dark mode */}
        <button
          onClick={toggleDarkMode}
          className={`p-2 ${darkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'} rounded-xl transition-all duration-200`}
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
        </button>

        {/* Premium Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={handleBellClick}
            className={`relative p-2.5 ${darkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'} rounded-xl transition-all duration-200`}
          >
            <Bell className="w-5.5 h-5.5" />
            {!notifsRead && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-gradient-to-r from-rose-500 to-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-ping" />
            )}
            {!notifsRead && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-gradient-to-r from-rose-500 to-red-500 rounded-full border-2 border-white dark:border-slate-900" />
            )}
          </button>

          {showNotifs && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowNotifs(false)} />
              <div className={`absolute right-0 top-14 w-[calc(100vw-2rem)] sm:w-96 max-w-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} rounded-2xl shadow-2xl border z-20 overflow-hidden scale-in`}>
                <div className={`px-5 py-4 border-b ${darkMode ? 'border-slate-800 bg-gradient-to-br from-slate-800 to-slate-900' : 'border-slate-100 bg-gradient-to-br from-slate-50 to-white'} flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <h3 className={`font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>Notifications</h3>
                  </div>
                  <span className={`text-xs ${darkMode ? 'text-slate-400 bg-slate-800 border-slate-700' : 'text-slate-500 bg-white border-slate-200'} px-3 py-1.5 rounded-full border font-medium`}>
                    {notifications.length}
                  </span>
                </div>
                <div className={`divide-y ${darkMode ? 'divide-slate-800' : 'divide-slate-100'} max-h-96 overflow-y-auto`}>
                  {!notifLoaded ? (
                    <div className="p-8 text-center">
                      <div className="w-9 h-9 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                      <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Loading...</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <Link
                        key={notif.id}
                        href={notif.href}
                        onClick={() => setShowNotifs(false)}
                        className={`flex items-start gap-3 px-5 py-4 ${darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-50'} transition-colors group`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${typeStyles[notif.type]}`}>
                          <span className="text-base">{typeIcons[notif.type]}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold ${darkMode ? 'text-slate-200 group-hover:text-indigo-400' : 'text-slate-900 group-hover:text-indigo-600'} transition-colors`}>{notif.title}</p>
                          <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'} mt-0.5`}>{notif.description}</p>
                          <p className={`text-[11px] ${darkMode ? 'text-slate-500' : 'text-slate-400'} mt-1.5`}>{notif.time}</p>
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
            className={`flex items-center gap-2 p-1.5 rounded-xl border border-transparent ${darkMode ? 'hover:bg-slate-800 hover:border-slate-700' : 'hover:bg-slate-50 hover:border-slate-200'} transition-all duration-200`}
          >
            <div className="w-8 h-8 md:w-9 md:h-9 bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center rounded-xl font-bold text-xs md:text-sm shadow-md shadow-indigo-500/20 shrink-0">
              {initials}
            </div>
            <div className="text-left hidden md:block max-w-[120px]">
              <p className={`text-sm font-semibold truncate ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>{displayName}</p>
              <p className={`text-[10px] ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>Administrator</p>
            </div>
            <ChevronDown className={`hidden md:block w-3.5 h-3.5 ${darkMode ? 'text-slate-500' : 'text-slate-400'} transition-transform duration-300 ${showUserMenu ? "rotate-180" : ""}`} />
          </button>

          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
              <div className={`absolute right-0 top-12 w-64 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} rounded-2xl shadow-2xl border z-20 overflow-hidden scale-in`}>
                <div className={`px-5 py-4 border-b ${darkMode ? 'border-slate-800 bg-gradient-to-br from-indigo-900/30 via-slate-900 to-slate-800' : 'border-slate-100 bg-gradient-to-br from-indigo-50 via-white to-slate-50'}`}>
                  <p className={`text-sm font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>{displayName}</p>
                  <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'} truncate mt-0.5`}>{user?.email}</p>
                </div>
                <div className="p-1.5">
                  <Link
                    href="/settings"
                    onClick={() => setShowUserMenu(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 text-sm ${darkMode ? 'text-slate-300 hover:bg-slate-800 hover:text-indigo-400' : 'text-slate-700 hover:bg-slate-50 hover:text-indigo-600'} rounded-xl transition-all duration-200`}
                  >
                    <User className="w-4.5 h-4.5" />
                    Profile Settings
                  </Link>
                  <button
                    onClick={() => { setShowUserMenu(false); handleLogout(); }}
                    disabled={loggingOut}
                    className={`flex items-center gap-3 px-3 py-2.5 text-sm text-rose-600 ${darkMode ? 'hover:bg-rose-900/20' : 'hover:bg-rose-50'} rounded-xl transition-all duration-200 w-full disabled:opacity-50`}
                  >
                    <LogOut className="w-4.5 h-4.5" />
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
