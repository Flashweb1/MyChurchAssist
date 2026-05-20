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
import { Loader2 } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settings, setSettings] = useState<ChurchSettings | null>(null);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, "settings", "church"));
        if (snap.exists() && snap.data()?.churchName) {
          setSettings(snap.data() as ChurchSettings);
          setSettingsLoaded(true);
        } else {
          router.replace("/onboarding");
        }
      } catch {
        router.replace("/onboarding");
      }
    };
    load();
  }, [user, router]);

  if (loading || !settingsLoaded) {
    return (
      <div className="min-h-screen bg-[var(--brand-bg)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-[var(--brand-blue)]" />
          <p className="text-sm text-[var(--brand-muted)] font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <SettingsProvider settings={settings!}>
      <div className="flex h-screen bg-[var(--brand-bg)]">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <div className="flex flex-col flex-1 md:ml-64 overflow-hidden transition-all duration-300">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </SettingsProvider>
  );
}
