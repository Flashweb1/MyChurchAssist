"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import { ChurchSettings, UserRole } from "@/lib/types";
import { COUNTRIES, CountryConfig } from "@/lib/currency";
import { toast } from "sonner";
import { Loader2, Check, ArrowLeft, ArrowRight, Church, User, Building2, Globe, Sparkles } from "lucide-react";
import Link from "next/link";

const STEPS = [
  { title: "Your Profile", icon: User, desc: "Tell us about yourself" },
  { title: "Church Details", icon: Church, desc: "About your church" },
  { title: "Branches & Times", icon: Building2, desc: "Campus & service info" },
  { title: "Country & Currency", icon: Globe, desc: "Localize your setup" },
  { title: "All Set!", icon: Sparkles, desc: "You're ready to go" },
];

interface OnboardingForm {
  displayName: string;
  phone: string;
  churchName: string;
  address: string;
  churchPhone: string;
  churchEmail: string;
  website: string;
  branches: string[];
  branchInput: string;
  serviceTimes: string[];
  serviceInput: string;
  country: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(true);
  const [form, setForm] = useState<OnboardingForm>({
    displayName: "",
    phone: "",
    churchName: "",
    address: "",
    churchPhone: "",
    churchEmail: "",
    website: "",
    branches: ["Main Campus"],
    branchInput: "",
    serviceTimes: ["Sunday 9:00 AM", "Sunday 11:00 AM"],
    serviceInput: "",
    country: "GH",
  });

  // Populate displayName once user is available
  useEffect(() => {
    if (user?.displayName && !form.displayName) {
      setForm((f) => ({ ...f, displayName: user.displayName! }));
    }
  }, [user?.displayName]);

  useEffect(() => {
    if (!user) { router.replace("/login"); return; }
    const check = async () => {
      try {
        console.log("[Onboarding] check starting for user.uid:", user.uid);
        const { collection, query, where, getDocs, limit } = await import("firebase/firestore");
        
        // 1. Check if there is a pending invitation for this user's email
        if (user.email) {
          const inviteQuery = query(
            collection(db, "invitations"),
            where("email", "==", user.email),
            where("status", "==", "pending"),
            limit(1)
          );
          const inviteSnap = await getDocs(inviteQuery);
          
          if (!inviteSnap.empty) {
            console.log("[Onboarding] invitation found!");
            const inviteDoc = inviteSnap.docs[0];
            const inviteData = inviteDoc.data();
            
            // Accept the invitation
            // Create user profile
            await setDoc(doc(db, "users", user.uid), {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || inviteData.displayName || "Team Member",
              role: inviteData.role,
              churchId: inviteData.churchId,
              invitedBy: inviteData.invitedBy || null,
              status: "active",
              createdAt: new Date(),
            });
            
            // Set custom claims (roles) via the backend
            const token = await user.getIdToken();
            await fetch("/api/users/set-role", {
              method: "POST",
              headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
              body: JSON.stringify({ uid: user.uid, role: inviteData.role }),
            }).catch((err) => console.error("Error invoking set-role:", err));
            
            // Mark invitation as accepted
            await setDoc(doc(db, "invitations", inviteDoc.id), { status: "accepted" }, { merge: true });
            
            // Refresh local auth context and redirect to dashboard
            await refreshProfile();
            console.log("[Onboarding] redirecting to dashboard after invitation accept");
            router.replace("/dashboard");
            return;
          }
        }

        // 2. Check if user profile already exists
        const userDoc = await getDoc(doc(db, "users", user.uid));
        console.log("[Onboarding] userDoc exists:", userDoc.exists(), "data:", userDoc.data());
        if (userDoc.exists()) {
          const profile = userDoc.data();
          const cId = profile?.churchId || user.uid;
          console.log("[Onboarding] Fetching settings for cId:", cId);
          const settingsDoc = await getDoc(doc(db, "settings", cId));
          console.log("[Onboarding] settingsDoc exists:", settingsDoc.exists(), "data:", settingsDoc.data());
          if (settingsDoc.exists() && settingsDoc.data()?.churchName?.trim()) {
            console.log("[Onboarding] settingsDoc has churchName! Redirecting to dashboard");
            router.replace("/dashboard");
            return;
          }
        }
      } catch (error) {
        console.error("Onboarding check error:", error);
      }
      setChecking(false);
    };
    check();
  }, [user, router, refreshProfile]);

  if (checking) {
    return (
      <div className="flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--brand-blue)]" />
      </div>
    );
  }

  const countryConfig = COUNTRIES[form.country] || COUNTRIES.GH;

  const handleSave = async () => {
    if (!user) {
      toast.error("User session not found. Please log in again.");
      return;
    }
    setSaving(true);
    try {
      if (form.displayName) {
        await updateProfile(user, { displayName: form.displayName });
      }
      const settings: ChurchSettings = {
        churchName: form.churchName,
        address: form.address,
        phone: form.churchPhone,
        email: form.churchEmail,
        website: form.website,
        branches: form.branches,
        serviceTimes: form.serviceTimes,
        country: form.country,
        currency: countryConfig.currency,
        currencySymbol: countryConfig.symbol,
        locale: countryConfig.locale,
        timezone: countryConfig.timezone,
      };
      await setDoc(doc(db, "settings", user.uid), settings);

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        churchId: user.uid, // Explicitly set churchId for the new church admin
        email: user.email,
        displayName: form.displayName || user.email?.split("@")[0] || "Admin",
        role: "super_admin" as UserRole,
        invitedBy: null,
        status: "active",
        createdAt: new Date(),
      });
      // Non-blocking: set custom claims (fails gracefully without admin SDK credentials)
      user.getIdToken().then((token) =>
        fetch("/api/users/set-role", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ uid: user.uid, role: "super_admin" }),
        }).catch(() => {})
      ).catch(() => {});

      toast.success("Church setup complete! Welcome aboard.");
      await refreshProfile(); // Refresh local auth context before redirecting
      router.push("/dashboard");
    } catch (error) {
      console.error("Onboarding save error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return form.displayName.trim().length > 0;
      case 2: return form.churchName.trim().length > 0;
      case 3: return form.branches.length > 0 && form.serviceTimes.length > 0;
      case 4: return true;
      case 5: return true;
      default: return false;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1: return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input type="text" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/20 focus:border-[var(--brand-blue)] transition-all"
              placeholder="John Doe" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
            <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/20 focus:border-[var(--brand-blue)] transition-all"
              placeholder="+233 55 123 4567" />
          </div>
          {user?.email && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <p className="px-4 py-3 bg-slate-50 rounded-xl text-sm text-slate-500 border border-slate-200">{user.email}</p>
            </div>
          )}
        </div>
      );
      case 2: return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Church Name *</label>
            <input type="text" value={form.churchName} onChange={(e) => setForm({ ...form, churchName: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/20 focus:border-[var(--brand-blue)] transition-all"
              placeholder="Grace Community Church" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
            <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/20 focus:border-[var(--brand-blue)] transition-all"
              placeholder="123 Main Street" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
              <input type="tel" value={form.churchPhone} onChange={(e) => setForm({ ...form, churchPhone: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/20 focus:border-[var(--brand-blue)] transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input type="email" value={form.churchEmail} onChange={(e) => setForm({ ...form, churchEmail: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/20 focus:border-[var(--brand-blue)] transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Website</label>
            <input type="url" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/20 focus:border-[var(--brand-blue)] transition-all"
              placeholder="https://church.org" />
          </div>
        </div>
      );
      case 3: return (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Branches / Campuses</label>
            <div className="space-y-2 mb-2">
              {form.branches.map((b, i) => (
                <div key={i} className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="flex-1 text-sm text-slate-700">{b}</span>
                  <button onClick={() => setForm({ ...form, branches: form.branches.filter((_, j) => j !== i) })}
                    className="text-red-400 hover:text-red-600 text-xs font-medium">Remove</button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" value={form.branchInput} onChange={(e) => setForm({ ...form, branchInput: e.target.value })}
                onKeyDown={(e) => { if (e.key === "Enter" && form.branchInput.trim()) { setForm({ ...form, branches: [...form.branches, form.branchInput.trim()], branchInput: "" }); }}}
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/20"
                placeholder="Add branch..." />
              <button onClick={() => { if (form.branchInput.trim()) setForm({ ...form, branches: [...form.branches, form.branchInput.trim()], branchInput: "" }); }}
                className="px-3 py-2 bg-[var(--brand-blue)] text-white rounded-lg text-sm hover:bg-blue-700">Add</button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Service Times</label>
            <div className="space-y-2 mb-2">
              {form.serviceTimes.map((t, i) => (
                <div key={i} className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="flex-1 text-sm text-slate-700">{t}</span>
                  <button onClick={() => setForm({ ...form, serviceTimes: form.serviceTimes.filter((_, j) => j !== i) })}
                    className="text-red-400 hover:text-red-600 text-xs font-medium">Remove</button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" value={form.serviceInput} onChange={(e) => setForm({ ...form, serviceInput: e.target.value })}
                onKeyDown={(e) => { if (e.key === "Enter" && form.serviceInput.trim()) { setForm({ ...form, serviceTimes: [...form.serviceTimes, form.serviceInput.trim()], serviceInput: "" }); }}}
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/20"
                placeholder="e.g. Sunday 9:00 AM" />
              <button onClick={() => { if (form.serviceInput.trim()) setForm({ ...form, serviceTimes: [...form.serviceTimes, form.serviceInput.trim()], serviceInput: "" }); }}
                className="px-3 py-2 bg-[var(--brand-blue)] text-white rounded-lg text-sm hover:bg-blue-700">Add</button>
            </div>
          </div>
        </div>
      );
      case 4: return (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Country</label>
            <select value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/20 focus:border-[var(--brand-blue)]">
              {Object.entries(COUNTRIES).map(([code, cfg]) => (
                <option key={code} value={code}>{cfg.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <p className="text-xs text-slate-500 font-medium">Currency</p>
              <p className="text-lg font-bold text-slate-900">{countryConfig.currency} ({countryConfig.symbol})</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Locale</p>
              <p className="text-lg font-bold text-slate-900">{countryConfig.locale}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Timezone</p>
              <p className="text-lg font-bold text-slate-900">{countryConfig.timezone}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Format</p>
              <p className="text-lg font-bold text-slate-900">{countryConfig.symbol} 1,234.56</p>
            </div>
          </div>
        </div>
      );
      case 5: return (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
            <Check className="w-10 h-10 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">You're all set, {form.displayName.split(" ")[0]}!</h3>
            <p className="text-slate-500 mt-2">Your church <strong>{form.churchName}</strong> is ready. Here's a summary:</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 text-left space-y-2 border border-slate-200">
            <div className="flex justify-between text-sm"><span className="text-slate-500">Branches</span><span className="font-medium">{form.branches.length}</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-500">Service Times</span><span className="font-medium">{form.serviceTimes.length}</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-500">Country</span><span className="font-medium">{(COUNTRIES[form.country] as CountryConfig)?.name || "Ghana"}</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-500">Currency</span><span className="font-medium">{countryConfig.symbol} ({countryConfig.currency})</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-500">Your Role</span><span className="font-medium text-[var(--brand-blue)]">Super Admin</span></div>
          </div>
          <p className="text-xs text-slate-400">You can always change these later in Settings.</p>
        </div>
      );
    }
  };

  return (
    <div className="w-full max-w-lg">
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 mb-6">
          <span className="text-2xl font-bold text-[var(--brand-navy)]">Church<span className="text-[var(--brand-blue)]">Assist</span></span>
        </Link>
        <div className="flex items-center justify-center gap-1 mb-2">
          {STEPS.map((s, i) => (
            <div key={i} className={`flex items-center gap-1 ${i > 0 ? "ml-1" : ""}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i + 1 < step ? "bg-emerald-500 text-white" : i + 1 === step ? "bg-[var(--brand-blue)] text-white" : "bg-slate-200 text-slate-400"
              }`}>
                {i + 1 < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && <div className={`w-8 h-0.5 ${i + 1 < step ? "bg-emerald-500" : "bg-slate-200"}`} />}
            </div>
          ))}
        </div>
        <h2 className="text-lg font-semibold text-slate-900 mt-4">{STEPS[step - 1].title}</h2>
        <p className="text-sm text-slate-500">{STEPS[step - 1].desc}</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 mb-4">
        <div className="min-h-[280px]">{renderStep()}</div>
      </div>

      <div className="flex items-center justify-between gap-3">
        {step > 1 ? (
          <button onClick={() => setStep(step - 1)} disabled={saving}
            className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        ) : <div />}
        {step < 5 ? (
          <button onClick={() => setStep(step + 1)} disabled={!canProceed()}
            className="px-5 py-2.5 bg-[var(--brand-blue)] text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-40 flex items-center gap-2">
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={handleSave} disabled={saving}
            className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {saving ? "Setting up..." : "Go to Dashboard"}
          </button>
        )}
      </div>
    </div>
  );
}
