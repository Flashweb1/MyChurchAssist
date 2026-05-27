"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Church,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Loader2,
  Save,
  Plus,
  X,
  Building2,
  Calendar,
  CreditCard,
  Shield,
} from "lucide-react";
import { collection, doc, setDoc, getDoc, getDocs, deleteDoc, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { updateProfile } from "firebase/auth";
import { useAuth } from "@/lib/auth";
import { ChurchSettings } from "@/lib/types";
import { COUNTRIES } from "@/lib/currency";
import { toast } from "sonner";
import { User as UserIcon } from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";

const defaultSettings: ChurchSettings = {
  churchName: "",
  address: "",
  phone: "",
  email: "",
  website: "",
  branches: ["Main Campus"],
  serviceTimes: ["Sunday 9:00 AM", "Sunday 11:00 AM"],
  country: "GH",
  currency: "GHS",
  currencySymbol: "GH₵",
  locale: "en-GH",
  timezone: "Africa/Accra",
};

type TabKey = "general" | "branches" | "services" | "team" | "billing";

export default function SettingsPage() {
  const { user, userProfile, churchId } = useAuth();
  const [settings, setSettings] = useState<ChurchSettings>(defaultSettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [seedConfirm, setSeedConfirm] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [adminName, setAdminName] = useState("");
  const [newBranch, setNewBranch] = useState("");
  const [newService, setNewService] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("general");

  // Team states
  const [members, setMembers] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("editor");
  const [inviting, setInviting] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);

  const isSuperAdmin = userProfile?.role === "super_admin";

  const fetchTeam = async () => {
    if (!churchId) return;
    setLoadingTeam(true);
    try {
      const usersQuery = query(collection(db, "users"), where("churchId", "==", churchId));
      const usersSnap = await getDocs(usersQuery);
      setMembers(usersSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const invitesQuery = query(
        collection(db, "invitations"),
        where("churchId", "==", churchId),
        where("status", "==", "pending")
      );
      const invitesSnap = await getDocs(invitesQuery);
      setInvitations(invitesSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error("Error loading team:", error);
    } finally {
      setLoadingTeam(false);
    }
  };

  useEffect(() => {
    if (activeTab === "team" && churchId) {
      fetchTeam();
    }
  }, [activeTab, churchId]);

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    try {
      const token = await user?.getIdToken();
      const res = await fetch("/api/users/set-role", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uid: memberId, role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update role");
      toast.success("Role updated successfully!");
      fetchTeam();
    } catch (err: any) {
      toast.error(err.message || "Failed to update role");
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      await deleteDoc(doc(db, "users", memberId));
      toast.success("Member removed successfully!");
      fetchTeam();
    } catch {
      toast.error("Failed to remove member.");
    }
  };

  const handleInviteUser = async () => {
    if (!inviteName.trim() || !inviteEmail.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    setInviting(true);
    try {
      const inviteRef = doc(collection(db, "invitations"));
      await setDoc(inviteRef, {
        email: inviteEmail.trim().toLowerCase(),
        displayName: inviteName.trim(),
        role: inviteRole,
        churchId,
        status: "pending",
        invitedBy: user?.uid || null,
        createdAt: new Date(),
      });
      toast.success("Invitation sent successfully!");
      setShowInviteModal(false);
      setInviteName("");
      setInviteEmail("");
      setInviteRole("editor");
      fetchTeam();
    } catch (err: any) {
      console.error("Invite error:", err);
      toast.error("Failed to send invitation.");
    } finally {
      setInviting(false);
    }
  };

  const handleRevokeInvite = async (inviteId: string) => {
    try {
      await deleteDoc(doc(db, "invitations", inviteId));
      toast.success("Invitation revoked successfully!");
      fetchTeam();
    } catch {
      toast.error("Failed to revoke invitation.");
    }
  };

  useEffect(() => {
    async function loadSettings() {
      if (!churchId) return;
      try {
        const docRef = doc(db, "settings", churchId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSettings({ ...defaultSettings, ...docSnap.data() } as ChurchSettings);
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, [churchId]);

  const handleSave = async () => {
    if (!churchId) return;
    setSaving(true);
    setSaved(false);
    try {
      await setDoc(doc(db, "settings", churchId), settings);
      
      if (user && adminName !== user.displayName) {
        await updateProfile(user, { displayName: adminName });
      }

      setSaved(true);
      toast.success("Settings saved successfully!");
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const addBranch = () => {
    if (newBranch.trim() && !settings.branches.includes(newBranch.trim())) {
      setSettings({ ...settings, branches: [...settings.branches, newBranch.trim()] });
      setNewBranch("");
    }
  };

  const removeBranch = (branch: string) => {
    setSettings({ ...settings, branches: settings.branches.filter((b) => b !== branch) });
  };

  const addService = () => {
    if (newService.trim() && !settings.serviceTimes.includes(newService.trim())) {
      setSettings({ ...settings, serviceTimes: [...settings.serviceTimes, newService.trim()] });
      setNewService("");
    }
  };

  const removeService = (service: string) => {
    setSettings({ ...settings, serviceTimes: settings.serviceTimes.filter((s) => s !== service) });
  };

  const handleReset = async () => {
    if (!churchId) return;
    setResetting(true);
    try {
      await setDoc(doc(db, "settings", churchId), defaultSettings);
      setSettings(defaultSettings);
      toast.success("Settings reset to defaults.");
    } catch {
      toast.error("Failed to reset settings.");
    } finally {
      setResetting(false);
      setResetConfirm(false);
    }
  };

  const handleSeedDemo = async () => {
    setSeeding(true);
    try {
      const { seedDemoData } = await import("@/lib/demo-seed");
      await seedDemoData(adminName || "Admin", churchId || undefined);
      toast.success("Demo data seeded successfully!");
    } catch {
      toast.error("Failed to seed demo data.");
    } finally {
      setSeeding(false);
      setSeedConfirm(false);
    }
  };

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: "general", label: "General", icon: <Settings className="w-4 h-4" /> },
    { key: "branches", label: "Branches", icon: <Building2 className="w-4 h-4" /> },
    { key: "services", label: "Service Times", icon: <Calendar className="w-4 h-4" /> },
    { key: "team", label: "Team", icon: <UserIcon className="w-4 h-4" /> },
    { key: "billing", label: "Billing", icon: <CreditCard className="w-4 h-4" /> },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--brand-blue)]" />
          <p className="text-sm text-[var(--brand-muted)]">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 stagger-children">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--brand-navy)]">Settings</h1>
          <p className="text-[var(--brand-muted)] mt-1 text-sm">Manage your church profile, branches, and preferences.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setResetConfirm(true)}
            className="px-4 py-2.5 border border-[var(--brand-border)] text-slate-600 rounded-xl hover:bg-[var(--brand-bg)] transition-colors text-sm font-medium focus-ring"
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 bg-[var(--brand-blue)] text-white rounded-xl hover:bg-[var(--brand-blue-dark)] transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 focus-ring"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saved ? (
              <Save className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">{saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-[var(--brand-border)] shadow-sm overflow-hidden">
        <div className="border-b border-[var(--brand-border)] bg-[var(--brand-bg)]">
          <nav className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.key
                    ? "border-[var(--brand-blue)] text-[var(--brand-blue)] bg-white"
                    : "border-transparent text-[var(--brand-muted)] hover:text-[var(--brand-navy)] hover:bg-white/50"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* General Tab */}
          {activeTab === "general" && (
            <div className="space-y-6">
              {/* Church Info */}
              <div>
                <h3 className="text-sm font-semibold text-[var(--brand-navy)] uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Church className="w-4 h-4 text-[var(--brand-blue)]" />
                  Church Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Church Name</label>
                    <input
                      type="text"
                      value={settings.churchName}
                      onChange={(e) => setSettings({ ...settings, churchName: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-[var(--brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/20 focus:border-[var(--brand-blue)] transition-all"
                      placeholder="e.g., Grace Community Church"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Admin Name</label>
                    <input
                      type="text"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-[var(--brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/20 focus:border-[var(--brand-blue)] transition-all"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                    <input
                      type="email"
                      value={settings.email}
                      onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-[var(--brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/20 focus:border-[var(--brand-blue)] transition-all"
                      placeholder="church@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
                    <input
                      type="tel"
                      value={settings.phone}
                      onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-[var(--brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/20 focus:border-[var(--brand-blue)] transition-all"
                      placeholder="+234 XXX XXX XXXX"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Address</label>
                    <input
                      type="text"
                      value={settings.address}
                      onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-[var(--brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/20 focus:border-[var(--brand-blue)] transition-all"
                      placeholder="Full church address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Website</label>
                    <input
                      type="url"
                      value={settings.website}
                      onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-[var(--brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/20 focus:border-[var(--brand-blue)] transition-all"
                      placeholder="https://church.com"
                    />
                  </div>
                </div>
              </div>

              {/* Location & Currency */}
              <div>
                <h3 className="text-sm font-semibold text-[var(--brand-navy)] uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[var(--brand-blue)]" />
                  Location & Currency
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Country</label>
                    <select
                      value={settings.country}
                      onChange={(e) => {
                        const code = e.target.value;
                        const config = COUNTRIES[code];
                        if (config) {
                          setSettings({ ...settings, country: code, currency: config.currency, currencySymbol: config.symbol, locale: config.locale, timezone: config.timezone });
                        }
                      }}
                      className="w-full px-3.5 py-2.5 border border-[var(--brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/20 focus:border-[var(--brand-blue)] bg-white appearance-none cursor-pointer"
                    >
                      {Object.entries(COUNTRIES).map(([code, c]) => (
                        <option key={code} value={code}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Currency</label>
                    <input
                      type="text"
                      value={settings.currencySymbol}
                      readOnly
                      className="w-full px-3.5 py-2.5 border border-[var(--brand-border)] rounded-xl text-sm bg-[var(--brand-bg)] text-[var(--brand-muted)]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Timezone</label>
                    <input
                      type="text"
                      value={settings.timezone}
                      readOnly
                      className="w-full px-3.5 py-2.5 border border-[var(--brand-border)] rounded-xl text-sm bg-[var(--brand-bg)] text-[var(--brand-muted)]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Branches Tab */}
          {activeTab === "branches" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-[var(--brand-navy)] uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[var(--brand-blue)]" />
                  Church Branches
                </h3>
                <div className="space-y-3">
                  {settings.branches.map((branch) => (
                    <div key={branch} className="flex items-center justify-between p-4 bg-[var(--brand-bg)] rounded-xl border border-[var(--brand-border)]">
                      <span className="text-sm font-medium text-slate-900">{branch}</span>
                      <button
                        onClick={() => removeBranch(branch)}
                        disabled={settings.branches.length <= 1}
                        className="p-2 text-[var(--brand-muted)] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-4">
                  <input
                    type="text"
                    value={newBranch}
                    onChange={(e) => setNewBranch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addBranch()}
                    placeholder="New branch name"
                    className="flex-1 px-3.5 py-2.5 border border-[var(--brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/20 focus:border-[var(--brand-blue)] transition-all"
                  />
                  <button
                    onClick={addBranch}
                    className="px-4 py-2.5 bg-[var(--brand-blue)] text-white rounded-xl hover:bg-[var(--brand-blue-dark)] transition-colors flex items-center gap-2 text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Service Times Tab */}
          {activeTab === "services" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-[var(--brand-navy)] uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[var(--brand-blue)]" />
                  Service Times
                </h3>
                <div className="space-y-3">
                  {settings.serviceTimes.map((service) => (
                    <div key={service} className="flex items-center justify-between p-4 bg-[var(--brand-bg)] rounded-xl border border-[var(--brand-border)]">
                      <span className="text-sm font-medium text-slate-900">{service}</span>
                      <button
                        onClick={() => removeService(service)}
                        disabled={settings.serviceTimes.length <= 1}
                        className="p-2 text-[var(--brand-muted)] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-4">
                  <input
                    type="text"
                    value={newService}
                    onChange={(e) => setNewService(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addService()}
                    placeholder="e.g., Sunday 9:00 AM"
                    className="flex-1 px-3.5 py-2.5 border border-[var(--brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/20 focus:border-[var(--brand-blue)] transition-all"
                  />
                  <button
                    onClick={addService}
                    className="px-4 py-2.5 bg-[var(--brand-blue)] text-white rounded-xl hover:bg-[var(--brand-blue-dark)] transition-colors flex items-center gap-2 text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Billing Tab */}
          {activeTab === "billing" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-[var(--brand-navy)] uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[var(--brand-blue)]" />
                  Data Management
                </h3>
                <div className="space-y-3">
                  <div className="p-4 bg-[var(--brand-bg)] rounded-xl border border-[var(--brand-border)]">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-900">Seed Demo Data</p>
                        <p className="text-xs text-[var(--brand-muted)] mt-1">Populate your database with sample data for testing.</p>
                      </div>
                      <button
                        onClick={() => setSeedConfirm(true)}
                        disabled={seeding}
                        className="px-4 py-2 bg-[var(--brand-blue)] text-white rounded-xl hover:bg-[var(--brand-blue-dark)] transition-colors text-sm font-medium disabled:opacity-50"
                      >
                        {seeding ? "Seeding..." : "Seed Data"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Team Tab */}
          {activeTab === "team" && (
            <div className="space-y-6">
              {!isSuperAdmin ? (
                <div className="p-6 text-center border border-[var(--brand-border)] bg-[var(--brand-bg)] rounded-xl">
                  <p className="text-slate-600 font-medium">Only the Super Admin can manage team members and invites.</p>
                </div>
              ) : (
                <>
                  {/* Active Team Members */}
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                      <div>
                        <h3 className="text-sm font-semibold text-[var(--brand-navy)] uppercase tracking-wider flex items-center gap-2">
                          <UserIcon className="w-4 h-4 text-[var(--brand-blue)]" />
                          Team Members
                        </h3>
                        <p className="text-xs text-[var(--brand-muted)] mt-1">Users with active access to your church data.</p>
                      </div>
                      <button
                        onClick={() => setShowInviteModal(true)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-[var(--brand-blue)] text-white rounded-xl hover:bg-[var(--brand-blue-dark)] transition-colors text-sm font-medium shadow-sm hover:shadow-md hover:-translate-y-0.5 focus-ring"
                      >
                        <Plus className="w-4 h-4" />
                        Invite Member
                      </button>
                    </div>

                    <div className="border border-[var(--brand-border)] rounded-xl overflow-hidden bg-white shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-[var(--brand-bg)] text-[var(--brand-muted)] border-b border-[var(--brand-border)]">
                            <tr>
                              <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider">Name</th>
                              <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider">Email</th>
                              <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider">Role</th>
                              <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[var(--brand-border-light)]">
                            {loadingTeam ? (
                              <tr>
                                <td colSpan={4} className="px-6 py-8 text-center">
                                  <Loader2 className="w-6 h-6 animate-spin text-[var(--brand-blue)] mx-auto" />
                                </td>
                              </tr>
                            ) : members.length === 0 ? (
                              <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-[var(--brand-muted)]">
                                  No active team members found.
                                </td>
                              </tr>
                            ) : (
                              members.map((member) => (
                                <tr key={member.id} className="hover:bg-[var(--brand-bg)]/30 transition-colors">
                                  <td className="px-6 py-4 font-medium text-slate-900">{member.displayName}</td>
                                  <td className="px-6 py-4 text-slate-600">{member.email}</td>
                                  <td className="px-6 py-4">
                                    {member.uid === user?.uid ? (
                                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-wider">
                                        Super Admin
                                      </span>
                                    ) : (
                                      <select
                                        value={member.role || "viewer"}
                                        onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                                        className="px-2.5 py-1.5 border border-[var(--brand-border)] rounded-xl text-xs font-semibold bg-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/20"
                                      >
                                        <option value="admin">Admin</option>
                                        <option value="editor">Editor</option>
                                        <option value="finance">Finance</option>
                                        <option value="viewer">Viewer</option>
                                      </select>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    {member.uid !== user?.uid && (
                                      <button
                                        onClick={() => setMemberToRemove(member.id)}
                                        className="text-xs text-red-500 hover:text-red-700 font-semibold transition-colors"
                                      >
                                        Remove
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Pending Invitations */}
                  <div className="pt-6 border-t border-[var(--brand-border-light)]">
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-[var(--brand-navy)] uppercase tracking-wider flex items-center gap-2">
                        <Mail className="w-4 h-4 text-[var(--brand-blue)]" />
                        Pending Invites
                      </h3>
                      <p className="text-xs text-[var(--brand-muted)] mt-1">Invitations sent to team members who haven't completed registration.</p>
                    </div>

                    <div className="border border-[var(--brand-border)] rounded-xl overflow-hidden bg-white shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-[var(--brand-bg)] text-[var(--brand-muted)] border-b border-[var(--brand-border)]">
                            <tr>
                              <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider">Name</th>
                              <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider">Email</th>
                              <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider">Role</th>
                              <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[var(--brand-border-light)]">
                            {loadingTeam ? (
                              <tr>
                                <td colSpan={4} className="px-6 py-8 text-center">
                                  <Loader2 className="w-6 h-6 animate-spin text-[var(--brand-blue)] mx-auto" />
                                </td>
                              </tr>
                            ) : invitations.length === 0 ? (
                              <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-[var(--brand-muted)]">
                                  No pending invitations.
                                </td>
                              </tr>
                            ) : (
                              invitations.map((invite) => (
                                <tr key={invite.id} className="hover:bg-[var(--brand-bg)]/30 transition-colors">
                                  <td className="px-6 py-4 font-medium text-slate-900">{invite.displayName}</td>
                                  <td className="px-6 py-4 text-slate-600">{invite.email}</td>
                                  <td className="px-6 py-4">
                                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100 uppercase tracking-wider">
                                      {invite.role}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <button
                                      onClick={() => handleRevokeInvite(invite.id)}
                                      className="text-xs text-red-500 hover:text-red-700 font-semibold transition-colors"
                                    >
                                      Revoke
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Reset Confirmation */}
      <ConfirmModal
        isOpen={resetConfirm}
        title="Reset Settings"
        message="Are you sure you want to reset all settings to defaults? This cannot be undone."
        confirmLabel="Reset"
        variant="danger"
        onConfirm={handleReset}
        onCancel={() => setResetConfirm(false)}
      />

      {/* Seed Confirmation */}
      <ConfirmModal
        isOpen={seedConfirm}
        title="Seed Demo Data"
        message="This will populate your database with sample data. Continue?"
        confirmLabel="Seed Data"
        variant="primary"
        onConfirm={handleSeedDemo}
        onCancel={() => setSeedConfirm(false)}
      />

      {/* Remove Member Confirmation */}
      <ConfirmModal
        isOpen={!!memberToRemove}
        title="Remove Team Member"
        message="Are you sure you want to remove this team member? They will instantly lose all access to this church dashboard."
        confirmLabel="Remove"
        variant="danger"
        onConfirm={() => {
          if (memberToRemove) {
            handleRemoveMember(memberToRemove);
            setMemberToRemove(null);
          }
        }}
        onCancel={() => setMemberToRemove(null)}
      />

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !inviting && setShowInviteModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10 scale-in border border-[var(--brand-border)]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[var(--brand-navy)]">Invite Team Member</h2>
              <button onClick={() => !inviting && setShowInviteModal(false)} className="p-2 hover:bg-[var(--brand-bg)] rounded-lg transition-colors">
                <X className="w-5 h-5 text-[var(--brand-muted)]" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[var(--brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/20 focus:border-[var(--brand-blue)] transition-all"
                  placeholder="e.g., Brother Jude"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[var(--brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/20 focus:border-[var(--brand-blue)] transition-all"
                  placeholder="e.g., jude@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Dashboard Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[var(--brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/20 focus:border-[var(--brand-blue)] bg-white appearance-none cursor-pointer"
                >
                  <option value="admin">Admin (Full Access)</option>
                  <option value="editor">Editor (Ushers, Secretary, Departments)</option>
                  <option value="finance">Finance (Finance Department only)</option>
                  <option value="viewer">Viewer (Read-only dashboard/reports)</option>
                </select>
                <p className="text-[11px] text-[var(--brand-muted)] mt-2 leading-relaxed">
                  {inviteRole === "admin" && "Has access to modify settings and view/edit all data, but cannot invite team members."}
                  {inviteRole === "editor" && "Can view and edit members, attendance, newcomers, tasks, departments, and messages. Cannot see finances."}
                  {inviteRole === "finance" && "Can view and edit finances/transactions. Can view members and departments. Cannot access other sections."}
                  {inviteRole === "viewer" && "Has read-only view of dashboard statistics, members list, and reports."}
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowInviteModal(false)}
                  disabled={inviting}
                  className="flex-1 px-4 py-2.5 border border-[var(--brand-border)] rounded-xl text-sm font-medium text-slate-700 hover:bg-[var(--brand-bg)] transition-colors focus-ring"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInviteUser}
                  disabled={inviting}
                  className="flex-1 px-4 py-2.5 bg-[var(--brand-blue)] text-white rounded-xl text-sm font-semibold hover:bg-[var(--brand-blue-dark)] transition-all disabled:opacity-50 focus-ring shadow-sm"
                >
                  {inviting ? "Inviting..." : "Send Invite"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
