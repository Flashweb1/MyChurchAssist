"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useAuth } from "@/lib/auth";
import { SettingsProvider } from "@/lib/settings-context";
import { ChurchSettings } from "@/lib/types";
import { Loader2, MailWarning, X } from "lucide-react";
import { useDarkMode } from "@/lib/dark-mode-context";
import SearchModal from "@/components/SearchModal";
import PageTransition from "@/components/PageTransition";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settings, setSettings] = useState<ChurchSettings | null>(null);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [showVerifyBanner, setShowVerifyBanner] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);
  const { user, loading, churchId } = useAuth();
  const { darkMode } = useDarkMode();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
    // Show email verification banner for unverified email/password users
    if (user && !user.emailVerified) {
      setShowVerifyBanner(true);
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || !churchId) {
      console.log("[DashboardLayout] No user or churchId:", { user: !!user, churchId });
      return;
    }
    const load = async () => {
      try {
        console.log("[DashboardLayout] Fetching settings for churchId:", churchId);
        const snap = await getDoc(doc(db, "settings", churchId));
        console.log("[DashboardLayout] Settings snap exists:", snap.exists(), "data:", snap.data());
        if (snap.exists() && snap.data()?.churchName) {
          setSettings(snap.data() as ChurchSettings);
          setSettingsLoaded(true);
        } else {
          console.warn("[DashboardLayout] Settings empty or name missing, redirecting to onboarding");
          router.replace("/onboarding");
        }
      } catch (err) {
        console.error("[DashboardLayout] Failed to load church settings:", err);
        router.replace("/onboarding");
      }
    };
    load();
  }, [user, churchId, router]);

  if (loading || !settingsLoaded) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-slate-900' : 'bg-slate-50'} flex items-center justify-center`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-emerald-500 flex items-center justify-center shadow-xl shadow-indigo-500/25">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'} font-medium`}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const handleResendVerification = async () => {
    if (!user || resendingVerification) return;
    setResendingVerification(true);
    try {
      const { sendEmailVerification } = await import("firebase/auth");
      await sendEmailVerification(user);
      alert("Verification email sent! Please check your inbox.");
    } catch {
      alert("Failed to send verification email. Please try again.");
    } finally {
      setResendingVerification(false);
    }
  };

  return (
    <SettingsProvider settings={settings!}>
      <SearchModal />
      <div className={`flex h-screen ${darkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <div className="flex flex-col flex-1 lg:ml-64 overflow-hidden">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          {/* Email verification banner */}
          {showVerifyBanner && !user.emailVerified && (
            <div className="bg-amber-50 border-b border-amber-200 px-5 py-3 flex items-center gap-3 text-sm text-amber-800 shrink-0">
              <MailWarning className="w-4 h-4 shrink-0" />
              <span className="flex-1">
                Please verify your email address to keep your account secure.{" "}
                <button
                  onClick={handleResendVerification}
                  disabled={resendingVerification}
                  className="font-semibold underline hover:no-underline disabled:opacity-50"
                >
                  {resendingVerification ? "Sending..." : "Resend email"}
                </button>
              </span>
              <button onClick={() => setShowVerifyBanner(false)} className="p-1 hover:bg-amber-100 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          <PageTransition>{children}</PageTransition>
        </div>
      </div>
    </SettingsProvider>
  );
}
