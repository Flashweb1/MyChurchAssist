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
  Wallet,
  TrendingDown,
  Activity,
  MessageSquare,
  Building2,
  Church,
  Plus
} from "lucide-react";
import { collection, getDocs, query, orderBy, limit, doc, getDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Member, Transaction, type Message, type Wallet as WalletType } from "@/lib/types";
import AttendanceChart from "@/components/AttendanceChart";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useSettings } from "@/lib/settings-context";
import { formatCurrency } from "@/lib/currency";
import { useDarkMode } from "@/lib/dark-mode-context";

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
  const { user, churchId } = useAuth();
  const { settings } = useSettings();
  const { darkMode } = useDarkMode();
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    activeWorkers: 0,
    joinedThisYear: 0,
    attendanceTrend: 5.2,
  });
  const [recentMembers, setRecentMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [pendingFollowUps, setPendingFollowUps] = useState(0);
  const [financialSummary, setFinancialSummary] = useState({ income: 0, expenses: 0, net: 0 });
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [recentMessages, setRecentMessages] = useState<Message[]>([]);
  const [indexErrors, setIndexErrors] = useState<string[]>([]);

  const firstName = user?.displayName?.split(" ")[0] || user?.email?.split("@")[0] || "Admin";

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const fetchDashboardData = async () => {
    if (!churchId) return;
    try {
      setLoading(true);
      setIndexErrors([]);

      let membersSnapshot = null;
      let followUpsSnap = null;
      let recentSnapshot = null;
      let transactionsSnapshot = null;
      let walletSnap = null;
      let messagesSnap = null;

      const missingIndexes: string[] = [];

      try {
        membersSnapshot = await getDocs(query(collection(db, "members"), where("churchId", "==", churchId)));
      } catch (err: any) {
        console.warn("Failed to fetch members:", err);
      }

      try {
        followUpsSnap = await getDocs(query(collection(db, "followups"), where("churchId", "==", churchId)));
      } catch (err: any) {
        console.warn("Failed to fetch followups:", err);
      }

      try {
        recentSnapshot = await getDocs(query(collection(db, "members"), where("churchId", "==", churchId), orderBy("createdAt", "desc"), limit(5)));
      } catch (err: any) {
        console.warn("Failed to fetch recent members (may need index):", err);
        const match = err.message?.match(/https:\/\/console\.firebase\.google\.com[^\s]*/);
        if (match && !missingIndexes.includes(match[0])) missingIndexes.push(match[0]);
      }

      try {
        transactionsSnapshot = await getDocs(query(collection(db, "transactions"), where("churchId", "==", churchId), orderBy("createdAt", "desc"), limit(200)));
      } catch (err: any) {
        console.warn("Failed to fetch transactions (may need index):", err);
        const match = err.message?.match(/https:\/\/console\.firebase\.google\.com[^\s]*/);
        if (match && !missingIndexes.includes(match[0])) missingIndexes.push(match[0]);
      }

      try {
        walletSnap = await getDoc(doc(db, "wallets", churchId));
      } catch (err: any) {
        console.warn("Failed to fetch wallet:", err);
      }

      try {
        messagesSnap = await getDocs(query(collection(db, "messages"), where("churchId", "==", churchId), orderBy("createdAt", "desc"), limit(5)));
      } catch (err: any) {
        console.warn("Failed to fetch messages (may need index):", err);
        const match = err.message?.match(/https:\/\/console\.firebase\.google\.com[^\s]*/);
        if (match && !missingIndexes.includes(match[0])) missingIndexes.push(match[0]);
      }

      if (missingIndexes.length > 0) {
        setIndexErrors(missingIndexes);
      }

      const membersList = membersSnapshot
        ? membersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Member))
        : [];
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

      const pending = followUpsSnap
        ? followUpsSnap.docs.filter((d) => d.data().status === "Pending").length
        : 0;
      setPendingFollowUps(pending);

      const txList = transactionsSnapshot
        ? transactionsSnapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Transaction))
        : [];
      const income = txList.filter((t) => t.type === "Income").reduce((s, t) => s + t.amount, 0);
      const expenses = txList.filter((t) => t.type === "Expense").reduce((s, t) => s + t.amount, 0);
      setFinancialSummary({ income, expenses, net: income - expenses });

      if (walletSnap && walletSnap.exists()) {
        setWallet(walletSnap.data() as WalletType);
      }
      setRecentMessages(
        messagesSnap
          ? messagesSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Message))
          : []
      );

      setStats({ totalMembers: membersList.length, activeWorkers, joinedThisYear, attendanceTrend: 5.2 });
      setLastUpdated(new Date());

      const recentMembersList = recentSnapshot
        ? recentSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Member))
        : [...membersList].sort((a, b) => {
            const tsA = a.createdAt as unknown as { toDate?: () => Date };
            const tsB = b.createdAt as unknown as { toDate?: () => Date };
            const dateA = tsA?.toDate ? tsA.toDate() : new Date(a.createdAt);
            const dateB = tsB?.toDate ? tsB.toDate() : new Date(b.createdAt);
            return dateB.getTime() - dateA.getTime();
          }).slice(0, 5);
      setRecentMembers(recentMembersList);

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
    if (churchId) {
      fetchDashboardData();
    }
  }, [churchId]);

  const statCards = [
    {
      title: "Total Members",
      value: stats.totalMembers.toLocaleString(),
      icon: Users,
      gradient: "from-indigo-500 to-blue-600",
      bgLight: "bg-blue-50",
      change: "+12%",
      up: true
    },
    {
      title: "Active Workers",
      value: stats.activeWorkers.toLocaleString(),
      icon: Activity,
      gradient: "from-emerald-500 to-teal-600",
      bgLight: "bg-emerald-50",
      change: "+8%",
      up: true
    },
    {
      title: "Joined This Year",
      value: stats.joinedThisYear.toLocaleString(),
      icon: UserPlus,
      gradient: "from-purple-500 to-pink-600",
      bgLight: "bg-purple-50",
      change: "+24%",
      up: true
    },
    {
      title: "Pending Follow-Ups",
      value: pendingFollowUps.toLocaleString(),
      icon: CalendarCheck,
      gradient: pendingFollowUps > 0 ? "from-amber-500 to-orange-600" : "from-emerald-500 to-teal-600",
      bgLight: pendingFollowUps > 0 ? "bg-amber-50" : "bg-emerald-50",
      change: pendingFollowUps > 0 ? "Action needed" : "All clear",
      up: pendingFollowUps === 0
    },
  ];

  return (
    <div className="space-y-7 stagger-children">
      {/* Premium Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Church className="w-5 h-5 text-white" />
            </div>
            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'} font-medium`}>Welcome back,</p>
          </div>
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-slate-200' : 'text-slate-900'} mb-1`}>
            {getGreeting()}, {firstName}
          </h1>
          <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Here's what's happening at your church • Updated {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/members"
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
          >
            <Plus className="w-4.5 h-4.5" />
            <span className="text-sm">Add Member</span>
          </Link>
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className={`flex items-center gap-2 px-4 py-2.5 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'} border rounded-xl hover:shadow-md transition-all duration-300 disabled:opacity-50`}
          >
            <RefreshCw className={`w-4.5 h-4.5 ${loading ? "animate-spin" : ""}`} />
            <span className="text-sm font-medium">Refresh</span>
          </button>
        </div>
      </div>

      {/* Premium Index Errors Banner (if needed) */}
      {process.env.NODE_ENV === "development" && indexErrors.length > 0 && (
        <div className={`${darkMode ? 'bg-gradient-to-r from-amber-900/30 via-orange-900/30 to-amber-900/30 border-amber-700/50' : 'bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-amber-200'} border rounded-2xl p-6 shadow-sm space-y-4`}>
          <div className={`flex items-center gap-3 font-bold ${darkMode ? 'text-amber-300' : 'text-amber-800'}`}>
            <AlertTriangle className="w-6 h-6 text-amber-600" />
            <span>Resilient Mode: Some features need composite indexes in Firestore</span>
          </div>
          <p className={`text-sm ${darkMode ? 'text-amber-400' : 'text-amber-700'}`}>
            To view sorted lists (like recent members, financial histories, or announcements), please create the required indexes in your Firebase Console. Other parts of your dashboard are fully operational.
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-2 pt-1">
            {indexErrors.map((url, i) => (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:underline ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-amber-200'} border px-4 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all`}
              >
                Create Composite Index {i + 1}
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* AI Insights Banner */}
      {insights.length > 0 && (
        <div className="bg-gradient-to-b from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-lg border border-slate-700/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/80 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-200">AI Insights</h3>
              <p className="text-xs text-slate-500">Smart recommendations for your church</p>
            </div>
          </div>
          <div className="grid gap-2.5">
            {insights.map((insight, i) => (
              <div key={i} className="flex items-start justify-between gap-4 p-3.5 rounded-xl bg-white/5 border border-white/8 hover:bg-white/10 transition-all duration-200">
                <div className="flex items-start gap-3">
                  <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${insight.type === "warning" ? "bg-amber-400" : insight.type === "positive" ? "bg-emerald-400" : "bg-slate-500"}`} />
                  <p className={`text-sm leading-relaxed ${insight.type === "warning" ? "text-amber-200" : insight.type === "positive" ? "text-emerald-200" : "text-slate-300"}`}>
                    {insight.message}
                  </p>
                </div>
                {insight.action && insight.actionHref && (
                  <Link href={insight.actionHref} className="shrink-0 text-xs font-semibold px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors whitespace-nowrap">
                    {insight.action} <ArrowUpRight className="w-3 h-3 inline ml-0.5" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Grid — Total Members is the hero card */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Hero card — Total Members */}
        <div className="col-span-2 lg:col-span-1 bg-gradient-to-b from-indigo-600 to-indigo-800 rounded-2xl p-6 shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center mb-4">
            <Users className="w-5 h-5 text-white" />
          </div>
          <p className="text-xs font-medium text-indigo-300 uppercase tracking-widest mb-1">Total Members</p>
          <p className="text-4xl font-bold text-white mb-3">
            {loading ? <span className="skeleton inline-block w-20 h-9 rounded-lg bg-white/20" /> : stats.totalMembers.toLocaleString()}
          </p>
          <div className="flex items-center gap-1.5 text-xs font-medium text-indigo-200">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+12% this year</span>
          </div>
        </div>

        {/* Secondary cards */}
        {statCards.slice(1).map((stat, index) => (
          <div
            key={index}
            className={`group ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} p-5 rounded-2xl border shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300`}
            style={{ animationDelay: `${(index + 1) * 80}ms` }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${stat.up ? (darkMode ? "bg-emerald-900/40 text-emerald-400" : "bg-emerald-50 text-emerald-600") : (darkMode ? "bg-amber-900/40 text-amber-400" : "bg-amber-50 text-amber-600")}`}>
                {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                {stat.change}
              </span>
            </div>
            <p className={`text-xs font-medium uppercase tracking-wide mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{stat.title}</p>
            <p className={`text-2xl font-bold ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>
              {loading ? <span className="skeleton inline-block w-16 h-7 rounded-lg" /> : stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Premium Financial Overview */}
      <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-2xl border shadow-sm p-6`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className={`text-xl font-bold ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>Financial Overview</h2>
            <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Track your income and expenses</p>
          </div>
          <Link href="/finances" className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1.5 hover:gap-2 transition-all">
            View All
            <ArrowUpRight className="w-4.5 h-4.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className={`flex items-center gap-4 p-5 rounded-xl ${darkMode ? 'bg-emerald-900/30 border-emerald-800/50' : 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100'} border`}>
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-emerald-700 font-semibold mb-1">Total Income</p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>
                {loading ? <span className="skeleton inline-block w-28 h-7 rounded-lg" /> : formatCurrency(financialSummary.income, settings.currencySymbol)}
              </p>
            </div>
          </div>
          <div className={`flex items-center gap-4 p-5 rounded-xl ${darkMode ? 'bg-rose-900/30 border-rose-800/50' : 'bg-gradient-to-br from-rose-50 to-red-50 border-rose-100'} border`}>
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <TrendingDown className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-rose-700 font-semibold mb-1">Total Expenses</p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>
                {loading ? <span className="skeleton inline-block w-28 h-7 rounded-lg" /> : formatCurrency(financialSummary.expenses, settings.currencySymbol)}
              </p>
            </div>
          </div>
          <div className={`flex items-center gap-4 p-5 rounded-xl ${darkMode ? 'bg-indigo-900/30 border-indigo-800/50' : 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100'} border`}>
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${financialSummary.net >= 0 ? "bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20" : "bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20"}`}>
              <Wallet className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-indigo-700 font-semibold mb-1">Net Balance</p>
              <p className={`text-2xl font-bold ${financialSummary.net >= 0 ? (darkMode ? 'text-slate-200' : 'text-slate-900') : "text-rose-600"}`}>
                {loading ? <span className="skeleton inline-block w-28 h-7 rounded-lg" /> : formatCurrency(financialSummary.net, settings.currencySymbol)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Wallet + Recent Messages Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Link
          href="/wallet"
          className="group bg-gradient-to-b from-slate-900 to-slate-800 rounded-2xl p-7 shadow-lg border border-slate-700/50 hover:border-slate-600 hover:-translate-y-1 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-transform">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-lg text-white">Wallet Balance</h3>
                  <p className="text-xs text-slate-400">Manage your funds</p>
                </div>
              </div>
              <span className="text-sm text-slate-400 group-hover:text-white transition-colors flex items-center gap-1.5">
                Manage
                <ArrowUpRight className="w-4.5 h-4.5" />
              </span>
            </div>
            <p className="text-4xl font-bold text-white">
              {loading ? <span className="skeleton inline-block w-32 h-9 rounded-lg bg-slate-700" /> : formatCurrency(wallet?.balance ?? 0, settings.currencySymbol)}
            </p>
            <p className="text-sm text-slate-400 mt-2">
              Total funded: {loading ? <span className="skeleton inline-block w-24 h-4 rounded bg-slate-700" /> : formatCurrency(wallet?.totalFunded ?? 0, settings.currencySymbol)}
            </p>
        </Link>

        <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-2xl border shadow-sm p-6`}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <MessageSquare className="w-5.5 h-5.5 text-white" />
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>Recent Messages</h3>
                <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Latest communications</p>
              </div>
            </div>
            <Link href="/messages" className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1.5 hover:gap-2 transition-all">
              View All
              <ArrowUpRight className="w-4.5 h-4.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl skeleton" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 skeleton w-3/4 rounded-lg" />
                      <div className="h-3 skeleton w-1/2 rounded-lg" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentMessages.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-11 h-11 text-slate-300 mx-auto mb-2.5" />
                <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>No messages sent yet</p>
                <Link href="/messages" className="text-sm text-indigo-600 font-semibold mt-2 inline-flex items-center gap-1.5">
                  Send your first message
                  <Plus className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              recentMessages.map((msg) => (
                <div key={msg.id} className={`flex items-start gap-3.5 p-3.5 rounded-xl transition-all duration-200 ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-50'}`}>
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/20">
                    <MessageSquare className="w-5.5 h-5.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>{msg.title}</p>
                    <p className={`text-xs line-clamp-1 mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{msg.content}</p>
                  </div>
                  <span className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold ${msg.status === "Sent" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                    {msg.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Premium Chart + Recent Members */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-2 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-2xl border shadow-sm p-7`}>
          <div className="flex items-center justify-between mb-7">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <CalendarCheck className="w-5.5 h-5.5 text-white" />
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>Attendance Trend</h3>
                <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Weekly attendance overview</p>
              </div>
            </div>
          </div>
          <div className="h-72">
            <AttendanceChart />
          </div>
        </div>

        <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-2xl border shadow-sm p-7`}>
          <div className="flex items-center justify-between mb-7">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Users className="w-5.5 h-5.5 text-white" />
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>Recent Members</h3>
                <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Latest additions</p>
              </div>
            </div>
            <Link href="/members" className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1.5 hover:gap-2 transition-all">
              View All
              <ArrowUpRight className="w-4.5 h-4.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full skeleton" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 skeleton w-3/4 rounded-lg" />
                      <div className="h-3 skeleton w-1/2 rounded-lg" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentMembers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-11 h-11 text-slate-300 mx-auto mb-2.5" />
                <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>No members yet</p>
                <Link href="/members" className="text-sm text-indigo-600 font-semibold mt-2 inline-flex items-center gap-1.5">
                  Add your first member
                  <Plus className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              recentMembers.map((member: Member) => (
                <div key={member.id} className={`flex items-center gap-3.5 p-3.5 rounded-xl transition-all duration-200 group ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-50'}`}>
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-lg shadow-indigo-500/20">
                    {member.fullName?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate group-hover:text-indigo-600 transition-colors ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>{member.fullName}</p>
                    <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{member.branch}</p>
                  </div>
                  <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${member.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                    {member.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Premium Quick Actions Grid */}
      <div>
        <h2 className={`text-xl font-bold ${darkMode ? 'text-slate-200' : 'text-slate-900'} mb-5`}>Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { href: "/members", label: "Add Member", sub: "Register new member", Icon: Users, gradient: "from-indigo-500 to-blue-600" },
            { href: "/newcomers", label: "Log Newcomer", sub: "Record first-time visitor", Icon: UserPlus, gradient: "from-emerald-500 to-teal-600" },
            { href: "/attendance", label: "Take Attendance", sub: "Record today's attendance", Icon: CalendarCheck, gradient: "from-purple-500 to-pink-600" },
            { href: "/ai-assistant", label: "AI Assistant", sub: "Draft emails & sermons", Icon: Sparkles, gradient: "from-orange-500 to-red-600" },
          ].map(({ href, label, sub, Icon, gradient }) => (
            <Link
              key={href}
              href={href}
              className={`group flex items-center gap-4 p-6 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-2xl border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-400`}
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300 shrink-0`}>
                <Icon className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <p className={`font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>{label}</p>
                <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'} mt-0.5`}>{sub}</p>
              </div>
              <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all duration-300" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
