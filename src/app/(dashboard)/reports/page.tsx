"use client";

import { useState, useEffect } from "react";
import {
  Users, UserPlus, CalendarCheck, Building2,
  Download, TrendingUp, TrendingDown, FileText,
  Loader2, UserCheck, BarChart3,
} from "lucide-react";
import {
  collection, getDocs, query, where, orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { useSettings } from "@/lib/settings-context";
import { formatCurrency } from "@/lib/currency";

/* ── helpers ───────────────────────────────────────────── */
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function monthKey(d: Date) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`; }
function monthLabel(key: string) { const [,m] = key.split("-"); return MONTHS[parseInt(m)-1]; }

function last12Months(): string[] {
  const keys: string[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(monthKey(d));
  }
  return keys;
}

/* ── types ──────────────────────────────────────────────── */
interface ReportData {
  totalMembers: number; activeMembers: number; inactiveMembers: number;
  newcomers: number; attendanceRecords: number; departments: number;
  followUps: number; avgAttendance: number; newcomerConversionRate: number;
}
interface GrowthPoint { month: string; members: number; }
interface GivingPoint { month: string; income: number; expenses: number; }
interface AttendancePoint { name: string; attendance: number; }

/* ── component ──────────────────────────────────────────── */
export default function ReportsPage() {
  const { churchId } = useAuth();
  const { settings } = useSettings();
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const [reportData, setReportData] = useState<ReportData>({
    totalMembers: 0, activeMembers: 0, inactiveMembers: 0,
    newcomers: 0, attendanceRecords: 0, departments: 0,
    followUps: 0, avgAttendance: 0, newcomerConversionRate: 0,
  });
  const [growthData, setGrowthData] = useState<GrowthPoint[]>([]);
  const [givingData, setGivingData] = useState<GivingPoint[]>([]);
  const [attendanceData, setAttendanceData] = useState<AttendancePoint[]>([]);

  useEffect(() => {
    if (!churchId) return;
    const months = last12Months();

    async function fetchAll() {
      try {
        const [membersSnap, newcomersSnap, attendanceSnap, deptSnap, followSnap, txSnap] =
          await Promise.all([
            getDocs(query(collection(db, "members"), where("churchId", "==", churchId))),
            getDocs(query(collection(db, "newcomers"), where("churchId", "==", churchId))),
            getDocs(query(collection(db, "attendance"), where("churchId", "==", churchId))),
            getDocs(query(collection(db, "departments"), where("churchId", "==", churchId))),
            getDocs(query(collection(db, "followups"), where("churchId", "==", churchId))),
            getDocs(query(collection(db, "transactions"), where("churchId", "==", churchId))),
          ]);

        /* ── scalar metrics ── */
        const members = membersSnap.docs.map(d => d.data());
        const attendance = attendanceSnap.docs.map(d => d.data());
        const newcomers = newcomersSnap.docs.map(d => d.data());
        const activeMembers = members.filter(m => m.status === "Active").length;
        const totalAtt = attendance.reduce((s, r) => s + (r.total || 0), 0);
        const converted = newcomers.filter(n => n.status === "Member").length;

        setReportData({
          totalMembers: members.length,
          activeMembers,
          inactiveMembers: members.length - activeMembers,
          newcomers: newcomersSnap.size,
          attendanceRecords: attendanceSnap.size,
          departments: deptSnap.size,
          followUps: followSnap.size,
          avgAttendance: attendance.length > 0 ? Math.round(totalAtt / attendance.length) : 0,
          newcomerConversionRate: newcomers.length > 0 ? Math.round((converted / newcomers.length) * 100) : 0,
        });

        /* ── member growth: cumulative by join month ── */
        const membersByMonth: Record<string, number> = {};
        months.forEach(m => (membersByMonth[m] = 0));
        members.forEach(m => {
          const ts = m.createdAt as { toDate?: () => Date } | string | undefined;
          const d = ts && (ts as { toDate?: () => Date }).toDate
            ? (ts as { toDate: () => Date }).toDate()
            : ts ? new Date(ts as string) : null;
          if (d) { const k = monthKey(d); if (k in membersByMonth) membersByMonth[k]++; }
        });
        // cumulative
        let cumulative = members.filter(m => {
          const ts = m.createdAt as { toDate?: () => Date } | string | undefined;
          const d = ts && (ts as { toDate?: () => Date }).toDate
            ? (ts as { toDate: () => Date }).toDate()
            : ts ? new Date(ts as string) : null;
          return d && monthKey(d) < months[0];
        }).length;
        setGrowthData(months.map(k => {
          cumulative += membersByMonth[k];
          return { month: monthLabel(k), members: cumulative };
        }));

        /* ── giving trend: income + expenses per month ── */
        const incomeByMonth: Record<string, number> = {};
        const expByMonth: Record<string, number> = {};
        months.forEach(m => { incomeByMonth[m] = 0; expByMonth[m] = 0; });
        txSnap.docs.forEach(d => {
          const tx = d.data();
          const date = tx.date ? new Date(tx.date) : null;
          if (!date) return;
          const k = monthKey(date);
          if (!(k in incomeByMonth)) return;
          if (tx.type === "Income") incomeByMonth[k] += tx.amount || 0;
          else expByMonth[k] += tx.amount || 0;
        });
        setGivingData(months.map(k => ({
          month: monthLabel(k),
          income: Math.round(incomeByMonth[k]),
          expenses: Math.round(expByMonth[k]),
        })));

        /* ── attendance trend: last 8 records ── */
        const sorted = [...attendance]
          .filter(r => r.date)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(-8);
        setAttendanceData(sorted.map(r => ({ name: r.date, attendance: r.total || 0 })));

      } catch (e) {
        console.error("Report fetch error:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, [churchId]);

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");
      const doc = new jsPDF();
      doc.setFontSize(20); doc.setTextColor(15, 23, 42);
      doc.text("Church Assist — Reports Summary", 14, 22);
      doc.setFontSize(10); doc.setTextColor(100, 116, 139);
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 30);
      autoTable(doc, {
        startY: 40, head: [["Metric", "Value"]],
        body: [
          ["Total Members", reportData.totalMembers],
          ["Active Members", reportData.activeMembers],
          ["Inactive Members", reportData.inactiveMembers],
          ["Newcomers", reportData.newcomers],
          ["Attendance Records", reportData.attendanceRecords],
          ["Active Departments", reportData.departments],
          ["Follow-Up Tasks", reportData.followUps],
          ["Avg. Attendance", reportData.avgAttendance],
          ["Newcomer Conversion Rate", `${reportData.newcomerConversionRate}%`],
        ],
        theme: "grid", headStyles: { fillColor: [10, 102, 255] },
      });
      doc.save("church-assist-report.pdf");
      toast.success("Report exported!");
    } catch { toast.error("Failed to export."); }
    finally { setExporting(false); }
  };

  const metrics = [
    { title: "Total Members",      value: reportData.totalMembers,      icon: Users,     gradient: "from-blue-500 to-blue-600" },
    { title: "Active Members",     value: reportData.activeMembers,     icon: UserCheck, gradient: "from-emerald-500 to-emerald-600" },
    { title: "Inactive Members",   value: reportData.inactiveMembers,   icon: Users,     gradient: "from-amber-500 to-amber-600" },
    { title: "Newcomers",          value: reportData.newcomers,         icon: UserPlus,  gradient: "from-violet-500 to-violet-600" },
    { title: "Attendance Records", value: reportData.attendanceRecords, icon: CalendarCheck, gradient: "from-cyan-500 to-cyan-600" },
    { title: "Active Departments", value: reportData.departments,       icon: Building2, gradient: "from-purple-500 to-purple-600" },
    { title: "Follow-Up Tasks",    value: reportData.followUps,         icon: FileText,  gradient: "from-pink-500 to-pink-600" },
    { title: "Avg. Attendance",    value: reportData.avgAttendance,     icon: TrendingUp, gradient: "from-indigo-500 to-indigo-600" },
  ];

  const tooltipStyle = {
    borderRadius: "10px", border: "none",
    boxShadow: "0 4px 20px rgba(0,0,0,0.12)", backgroundColor: "#fff",
  };
  const fmt = (v: number) => formatCurrency(v, settings.currencySymbol);

  return (
    <div className="space-y-6 stagger-children">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--brand-navy)]">Reports & Analytics</h1>
          <p className="text-[var(--brand-muted)] mt-1 text-sm">Comprehensive overview of your church&apos;s health and growth.</p>
        </div>
        <button onClick={handleExportPDF} disabled={exporting || loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-[var(--brand-navy)] text-white rounded-xl hover:opacity-90 transition-all shadow-sm disabled:opacity-50">
          {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          <span className="text-sm font-medium">{exporting ? "Exporting…" : "Export PDF"}</span>
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-[var(--brand-border)] shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${m.gradient} flex items-center justify-center shadow-sm shrink-0`}>
                <m.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[var(--brand-muted)] text-xs font-medium leading-tight">{m.title}</p>
                <p className="text-xl font-bold text-[var(--brand-navy)]">
                  {loading ? <span className="skeleton inline-block w-12 h-6 rounded" /> : m.value.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Row 1: Member Growth + Attendance Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Member Growth */}
        <div className="bg-white rounded-2xl border border-[var(--brand-border)] shadow-sm p-6">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-[var(--brand-navy)]">Member Growth</h2>
            <p className="text-xs text-[var(--brand-muted)] mt-0.5">Cumulative membership over the last 12 months</p>
          </div>
          {loading ? (
            <div className="h-60 skeleton rounded-xl" />
          ) : (
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [v, "Members"]} />
                  <Area type="monotone" dataKey="members" stroke="#6366f1" strokeWidth={2.5}
                    fill="url(#growthGrad)" dot={{ r: 3, fill: "#6366f1" }} activeDot={{ r: 5 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Attendance Trend */}
        <div className="bg-white rounded-2xl border border-[var(--brand-border)] shadow-sm p-6">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-[var(--brand-navy)]">Attendance Trend</h2>
            <p className="text-xs text-[var(--brand-muted)] mt-0.5">Last 8 service records</p>
          </div>
          {loading ? (
            <div className="h-60 skeleton rounded-xl" />
          ) : (
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={attendanceData.length ? attendanceData : [{ name: "No data", attendance: 0 }]}
                  margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#0ea5e9" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [v, "Attendees"]} />
                  <Area type="monotone" dataKey="attendance" stroke="#0ea5e9" strokeWidth={2.5}
                    fill="url(#attGrad)" dot={{ r: 3, fill: "#0ea5e9" }} activeDot={{ r: 5 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Giving Trend + Newcomer Conversion */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Giving Trend (wide) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[var(--brand-border)] shadow-sm p-6">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-[var(--brand-navy)]">Giving Trend</h2>
            <p className="text-xs text-[var(--brand-muted)] mt-0.5">Monthly income vs expenses over the last 12 months</p>
          </div>
          {loading ? (
            <div className="h-60 skeleton rounded-xl" />
          ) : (
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={givingData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }} barGap={3}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }}
                    tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                  <Tooltip contentStyle={tooltipStyle}
                    formatter={(v: number, name: string) => [fmt(v), name === "income" ? "Income" : "Expenses"]} />
                  <Legend formatter={(v) => v === "income" ? "Income" : "Expenses"} />
                  <Bar dataKey="income"   fill="#22c55e" radius={[4,4,0,0]} maxBarSize={28} />
                  <Bar dataKey="expenses" fill="#f87171" radius={[4,4,0,0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Newcomer Conversion (narrow) */}
        <div className="bg-white rounded-2xl border border-[var(--brand-border)] shadow-sm p-6">
          <h2 className="text-base font-semibold text-[var(--brand-navy)] mb-4">Newcomer Conversion</h2>
          <div className="flex flex-col items-center justify-center h-52">
            {loading ? <div className="skeleton w-32 h-32 rounded-full" /> : (
              <>
                <div className="relative w-32 h-32">
                  <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#E2E8F0" strokeWidth="12" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="url(#cg)" strokeWidth="12"
                      strokeDasharray={`${reportData.newcomerConversionRate * 2.51} 251`} strokeLinecap="round" />
                    <defs>
                      <linearGradient id="cg" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#22C55E" /><stop offset="100%" stopColor="#16A34A" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-[var(--brand-navy)]">{reportData.newcomerConversionRate}%</span>
                    <span className="text-xs text-[var(--brand-muted)]">Conversion</span>
                  </div>
                </div>
                <p className="text-sm text-[var(--brand-muted)] text-center mt-4">
                  {reportData.newcomers > 0
                    ? <><span className="font-semibold text-emerald-600">{Math.round(reportData.newcomers * reportData.newcomerConversionRate / 100)}</span> of {reportData.newcomers} became members</>
                    : "No newcomers logged yet"}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Summary Table */}
      <div className="bg-white rounded-2xl border border-[var(--brand-border)] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--brand-border)]">
          <h2 className="text-base font-semibold text-[var(--brand-navy)]">Summary Report</h2>
          <p className="text-xs text-[var(--brand-muted)] mt-0.5">Generated on {new Date().toLocaleDateString()}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--brand-bg)] text-[var(--brand-muted)] border-b border-[var(--brand-border)]">
              <tr>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">Metric</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">Value</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--brand-border-light)]">
              {loading ? Array.from({length:5}).map((_,i) => (
                <tr key={i}>
                  <td className="px-6 py-4"><div className="h-4 skeleton w-32" /></td>
                  <td className="px-6 py-4"><div className="h-4 skeleton w-16" /></td>
                  <td className="px-6 py-4"><div className="h-6 skeleton w-20 rounded-full" /></td>
                </tr>
              )) : (
                <>
                  {[
                    { label: "Total Members",        val: reportData.totalMembers.toLocaleString(),                        status: "Tracked",    color: "blue" },
                    { label: "Active vs Inactive",   val: `${reportData.activeMembers} active / ${reportData.inactiveMembers} inactive`, status: reportData.activeMembers > reportData.inactiveMembers ? "Healthy" : "Review", color: reportData.activeMembers > reportData.inactiveMembers ? "emerald" : "amber" },
                    { label: "Newcomer Conversion",  val: `${reportData.newcomerConversionRate}%`,                         status: reportData.newcomerConversionRate >= 50 ? "Good" : "Needs Work", color: reportData.newcomerConversionRate >= 50 ? "emerald" : "amber" },
                    { label: "Average Attendance",   val: reportData.avgAttendance.toLocaleString(),                       status: "Tracked",    color: "violet" },
                    { label: "Follow-Up Tasks",      val: String(reportData.followUps),                                    status: reportData.followUps === 0 ? "All Clear" : "Pending", color: reportData.followUps === 0 ? "emerald" : "amber" },
                  ].map(row => (
                    <tr key={row.label} className="hover:bg-[var(--brand-bg)]/70 transition-colors">
                      <td className="px-6 py-3.5 font-medium text-slate-900">{row.label}</td>
                      <td className="px-6 py-3.5 text-slate-600">{row.val}</td>
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-${row.color}-50 text-${row.color}-700`}>
                          <span className={`w-1.5 h-1.5 rounded-full bg-${row.color}-500`} />{row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
