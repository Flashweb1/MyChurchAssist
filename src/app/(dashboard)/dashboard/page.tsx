"use client";

import { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  CalendarCheck,
  TrendingUp,
  ArrowUpRight,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  Wallet as WalletIcon,
  TrendingDown,
  Activity,
  MessageSquare,
} from "lucide-react";
import { collection, getDocs, query, orderBy, limit, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Member, Transaction, type Message, type Wallet } from "@/lib/types";
import AttendanceChart from "@/components/AttendanceChart";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useSettings } from "@/lib/settings-context";
import { formatCurrency } from "@/lib/currency";

interface DashboardStats {
  totalMembers: number;
  activeWorkers: number;
  joinedThisYear: number;
  attendanceTrend: number;
}

interface AIInsight {
  type: "positive" | "warning" | "neutral";
  message: string;
  action?: string;
  actionHref?: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { settings } = useSettings();
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    activeWorkers: 0,
    joinedThisYear: 0,
    attendanceTrend: 0,
  });
  const [recentMembers, setRecentMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [pendingFollowUps, setPendingFollowUps] = useState(0);
  const [financialSummary, setFinancialSummary] = useState({ income: 0, expenses: 0, net: 0 });
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [recentMessages, setRecentMessages] = useState<Message[]>([]);

  const firstName = user?.displayName?.split(" ")[0] || user?.email?.split("@")[0] || "Admin";

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [membersSnapshot, followUpsSnap, recentSnapshot, transactionsSnapshot, walletSnap, messagesSnap] = await Promise.all([
        getDocs(collection(db, "members")),
        getDocs(collection(db, "followups")),
        getDocs(query(collection(db, "members"), orderBy("createdAt", "desc"), limit(5))),
        getDocs(query(collection(db, "transactions"), orderBy("createdAt", "desc"), limit(200))),
        getDoc(doc(db, "wallets", user?.uid || "demo-church")),
        getDocs(query(collection(db, "messages"), orderBy("createdAt", "desc"), limit(5))),
      ]);

      const membersList = membersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Member));
      const now = new Date();
      const yearStart = new Date(now.getFullYear(), 0, 1);

      const activeWorkers = membersList.filter(
        (m: Member) => m.department && m.department !== "None" && m.status === "Active"
      ).length;
      const joinedThisYear = membersList.filter((m: Member) => {
        const ts = m.createdAt as unknown as { toDate?: () => Date };
        const created = ts?.toDate ? ts.toDate() : new Date(m.createdAt);
        return created >= yearStart;
      }).length;

      const pending = followUpsSnap.docs.filter((d) => d.data().status === "Pending").length;
      setPendingFollowUps(pending);

      const txList = transactionsSnapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Transaction));
      const income = txList.filter((t) => t.type === "Income").reduce((s, t) => s + t.amount, 0);
      const expenses = txList.filter((t) => t.type === "Expense").reduce((s, t) => s + t.amount, 0);
      setFinancialSummary({ income, expenses, net: income - expenses });

      if (walletSnap.exists()) {
        setWallet(walletSnap.data() as Wallet);
      }
      setRecentMessages(messagesSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Message)));

      setStats({ totalMembers: membersList.length, activeWorkers, joinedThisYear, attendanceTrend: 5.2 });
      setLastUpdated(new Date());
      setRecentMembers(recentSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Member)));

      const builtInsights: AIInsight[] = [];
      if (membersList.length > 0) {
        const activeRate = Math.round((activeWorkers / membersList.length) * 100);
        if (activeRate >= 70) {
          builtInsights.push({ type: "positive", message: `Great health! ${activeRate}% of your members are active workers.` });
        } else {
          builtInsights.push({ type: "warning", message: `Only ${activeRate}% of members are active. Consider a volunteer engagement drive.`, action: "View Members", actionHref: "/members" });
        }
        if (joinedThisYear > 0) {
          builtInsights.push({ type: "positive", message: `${joinedThisYear} members joined this year. Your church is growing!` });
        }
      }
      if (pending > 0) {
        builtInsights.push({ type: "warning", message: `${pending} follow-up${pending > 1 ? "s" : ""} still pending. Don't let anyone fall through the cracks.`, action: "View Follow-Ups", actionHref: "/follow-up" });
      }
      if (builtInsights.length === 0) {
        builtInsights.push({ type: "neutral", message: "Start adding members to unlock AI-powered insights about your church health." });
      }
      setInsights(builtInsights);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const statCards = [
    { title: "Total Members", value: stats.totalMembers.toLocaleString(), icon: Users, gradient: "from-blue-500 to-blue-600", bgLight: "bg-blue-50", change: "+12%", up: true },
    { title: "Active Workers", value: stats.activeWorkers.toLocaleString(), icon: Activity, gradient: "from-emerald-500 to-emerald-600", bgLight: "bg-emerald-50", change: "+8%", up: true },
    { title: "Joined This Year", value: stats.joinedThisYear.toLocaleString(), icon: UserPlus, gradient: "from-violet-500 to-violet-600", bgLight: "bg-violet-50", change: "+24%", up: true },
    { title: "Pending Follow-Ups", value: pendingFollowUps.toLocaleString(), icon: CalendarCheck, gradient: pendingFollowUps > 0 ? "from-amber-500 to-amber-600" : "from-emerald-500 to-emerald-600", bgLight: pendingFollowUps > 0 ? "bg-amber-50" : "bg-emerald-50", change: pendingFollowUps > 0 ? "Action needed" : "All clear", up: pendingFollowUps === 0 },
  ];

  return (
    <div className="space-y-6 stagger-children">
      {/* Greeting Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--brand-navy)]">
            {getGreeting()}, {firstName}
          </h1>
          <p className="text-[var(--brand-muted)] mt-1 text-sm">
            Here&apos;s an overview of your church &middot; Updated {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-[var(--brand-navy)] text-white rounded-xl hover:bg-[var(--brand-navy-light)] transition-all duration-200 disabled:opacity-50 self-start sm:self-auto shadow-sm hover:shadow-md focus-ring"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span className="text-sm font-medium">Refresh</span>
        </button>
      </div>

      {/* AI Insights Banner */}
      {insights.length > 0 && (
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-5 text-white shadow-lg">
          <div className="absolute inset-0 pattern-dots opacity-5" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-purple-400" />
              </div>
              <span className="text-xs font-bold text-purple-300 uppercase tracking-widest">AI Insights</span>
            </div>
            <div className="space-y-2.5">
              {insights.map((insight, i) => (
                <div key={i} className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <span className={`mt-0.5 w-1.5 h-1.5 rounded-full shrink-0 ${insight.type === "warning" ? "bg-amber-400" : insight.type === "positive" ? "bg-emerald-400" : "bg-slate-400"}`} />
                    <p className={`text-sm leading-relaxed ${insight.type === "warning" ? "text-amber-100" : insight.type === "positive" ? "text-emerald-100" : "text-slate-300"}`}>
                      {insight.message}
                    </p>
                  </div>
                  {insight.action && insight.actionHref && (
                    <Link href={insight.actionHref} className="shrink-0 text-xs font-semibold px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors whitespace-nowrap">
                      {insight.action} →
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-5 rounded-2xl border border-[var(--brand-border)] shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${stat.up ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                {stat.change}
              </span>
            </div>
            <p className="text-[var(--brand-muted)] text-xs font-medium uppercase tracking-wide">{stat.title}</p>
            <p className="text-2xl font-bold text-[var(--brand-navy)] mt-1 counter">
              {loading ? (
                <span className="skeleton inline-block w-16 h-7 rounded" />
              ) : (
                stat.value
              )}
            </p>
          </div>
        ))}
      </div>

      {/* Financial Overview */}
      <div className="bg-white rounded-2xl border border-[var(--brand-border)] shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold text-[var(--brand-navy)]">Financial Overview</h2>
            <p className="text-sm text-[var(--brand-muted)]">Income vs Expenses</p>
          </div>
          <Link href="/finances" className="text-sm text-[var(--brand-blue)] hover:text-[var(--brand-blue-dark)] font-medium flex items-center gap-1 hover:gap-2 transition-all">
            View All <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-50/50 border border-emerald-100">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-emerald-600 font-medium">Total Income</p>
              <p className="text-xl font-bold text-slate-900">
                {loading ? <span className="skeleton inline-block w-20 h-6 rounded" /> : formatCurrency(financialSummary.income, settings.currencySymbol)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-red-50 to-red-50/50 border border-red-100">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-red-600 font-medium">Total Expenses</p>
              <p className="text-xl font-bold text-slate-900">
                {loading ? <span className="skeleton inline-block w-20 h-6 rounded" /> : formatCurrency(financialSummary.expenses, settings.currencySymbol)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-50/50 border border-blue-100">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${financialSummary.net >= 0 ? "bg-blue-100" : "bg-amber-100"}`}>
              <WalletIcon className={`w-6 h-6 ${financialSummary.net >= 0 ? "text-blue-600" : "text-amber-600"}`} />
            </div>
            <div>
              <p className="text-xs text-blue-600 font-medium">Net Balance</p>
              <p className={`text-xl font-bold ${financialSummary.net >= 0 ? "text-slate-900" : "text-red-600"}`}>
                {loading ? <span className="skeleton inline-block w-20 h-6 rounded" /> : formatCurrency(financialSummary.net, settings.currencySymbol)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet + Recent Messages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Link
          href="/wallet"
          className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <WalletIcon className="w-5 h-5 text-emerald-400" />
              </div>
              <h2 className="text-white font-semibold">Wallet Balance</h2>
            </div>
            <span className="text-xs text-slate-400 group-hover:text-white transition-colors">
              Manage →
            </span>
          </div>
          <p className="text-3xl font-bold text-white">
            {loading ? <span className="skeleton inline-block w-24 h-8 rounded bg-slate-600" /> : formatCurrency(wallet?.balance ?? 0, settings.currencySymbol)}
          </p>
          <p className="text-sm text-slate-400 mt-1">
            Total funded: {loading ? <span className="skeleton inline-block w-16 h-4 rounded bg-slate-600" /> : formatCurrency(wallet?.totalFunded ?? 0, settings.currencySymbol)}
          </p>
        </Link>

        <div className="bg-white rounded-2xl border border-[var(--brand-border)] shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--brand-navy)]">Recent Messages</h2>
            <Link href="/messages" className="text-sm text-[var(--brand-blue)] hover:text-[var(--brand-blue-dark)] font-medium flex items-center gap-1 hover:gap-2 transition-all">
              View All <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full skeleton" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 skeleton w-3/4" />
                      <div className="h-3 skeleton w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentMessages.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-10 h-10 text-[var(--brand-muted-light)] mx-auto mb-2" />
                <p className="text-sm text-[var(--brand-muted)]">No messages sent yet</p>
                <Link href="/messages" className="text-sm text-[var(--brand-blue)] font-medium mt-2 inline-block">
                  Send your first message →
                </Link>
              </div>
            ) : (
              recentMessages.map((msg) => (
                <div key={msg.id} className="flex items-start gap-3 p-2 rounded-xl hover:bg-[var(--brand-bg)] transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{msg.title}</p>
                    <p className="text-xs text-[var(--brand-muted)] line-clamp-1">{msg.content}</p>
                  </div>
                  <span className={`shrink-0 px-2 py-1 rounded-lg text-xs font-medium ${msg.status === "Sent" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                    {msg.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Chart + Recent Members */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[var(--brand-border)] shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-[var(--brand-navy)]">Attendance Trend</h2>
              <p className="text-sm text-[var(--brand-muted)]">Weekly attendance overview</p>
            </div>
          </div>
          <div className="h-72">
            <AttendanceChart />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[var(--brand-border)] shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[var(--brand-navy)]">Recent Members</h2>
            <Link href="/members" className="text-sm text-[var(--brand-blue)] hover:text-[var(--brand-blue-dark)] font-medium flex items-center gap-1 hover:gap-2 transition-all">
              View All <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full skeleton" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 skeleton w-3/4" />
                      <div className="h-3 skeleton w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentMembers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-10 h-10 text-[var(--brand-muted-light)] mx-auto mb-2" />
                <p className="text-sm text-[var(--brand-muted)]">No members yet</p>
                <Link href="/members" className="text-sm text-[var(--brand-blue)] font-medium mt-2 inline-block">
                  Add your first member →
                </Link>
              </div>
            ) : (
              recentMembers.map((member: Member) => (
                <div key={member.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--brand-bg)] transition-colors group">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--brand-blue)] to-[var(--brand-blue-dark)] text-white flex items-center justify-center font-semibold text-sm shrink-0 shadow-sm">
                    {member.fullName?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{member.fullName}</p>
                    <p className="text-xs text-[var(--brand-muted)]">{member.branch}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${member.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                    {member.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-[var(--brand-navy)] mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { href: "/members", label: "Add Member", sub: "Register new member", Icon: Users, gradient: "from-blue-500 to-blue-600" },
            { href: "/newcomers", label: "Log Newcomer", sub: "Record first-time visitor", Icon: UserPlus, gradient: "from-emerald-500 to-emerald-600" },
            { href: "/attendance", label: "Take Attendance", sub: "Record today's attendance", Icon: CalendarCheck, gradient: "from-violet-500 to-violet-600" },
            { href: "/ai-assistant", label: "AI Assistant", sub: "Draft emails & sermons", Icon: Sparkles, gradient: "from-purple-500 to-pink-500" },
          ].map(({ href, label, sub, Icon, gradient }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-[var(--brand-border)] shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow shrink-0`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">{label}</p>
                <p className="text-xs text-[var(--brand-muted)]">{sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
