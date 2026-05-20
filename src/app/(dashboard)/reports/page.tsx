"use client";

import { useState, useEffect } from "react";
import {
  BarChart3,
  Users,
  UserPlus,
  CalendarCheck,
  Building2,
  Download,
  TrendingUp,
  TrendingDown,
  FileText,
  Loader2,
  UserCheck,
} from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import AttendanceChart from "@/components/AttendanceChart";
import { toast } from "sonner";

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [reportData, setReportData] = useState({
    totalMembers: 0,
    activeMembers: 0,
    inactiveMembers: 0,
    newcomers: 0,
    attendanceRecords: 0,
    departments: 0,
    followUps: 0,
    avgAttendance: 0,
    newcomerConversionRate: 0,
  });

  useEffect(() => {
    async function fetchReportData() {
      try {
        const [membersSnap, newcomersSnap, attendanceSnap, departmentsSnap, followUpsSnap] = await Promise.all([
          getDocs(collection(db, "members")),
          getDocs(collection(db, "newcomers")),
          getDocs(collection(db, "attendance")),
          getDocs(collection(db, "departments")),
          getDocs(collection(db, "followups")),
        ]);

        const members = membersSnap.docs.map((d) => d.data());
        const attendance = attendanceSnap.docs.map((d) => d.data());
        const newcomers = newcomersSnap.docs.map((d) => d.data());

        const activeMembers = members.filter((m) => m.status === "Active").length;
        const totalAttendance = attendance.reduce((sum, r) => sum + (r.total || 0), 0);
        
        const convertedNewcomers = newcomers.filter((n) => n.status === "Member").length;
        const newcomerConversionRate = newcomers.length > 0 ? Math.round((convertedNewcomers / newcomers.length) * 100) : 0;

        setReportData({
          totalMembers: members.length,
          activeMembers,
          inactiveMembers: members.length - activeMembers,
          newcomers: newcomersSnap.size,
          attendanceRecords: attendanceSnap.size,
          departments: departmentsSnap.size,
          followUps: followUpsSnap.size,
          avgAttendance: attendance.length > 0 ? Math.round(totalAttendance / attendance.length) : 0,
          newcomerConversionRate,
        });
      } catch (error) {
        console.error("Error fetching report data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchReportData();
  }, []);

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");
      const doc = new jsPDF();

      doc.setFontSize(20);
      doc.setTextColor(15, 23, 42);
      doc.text("Church Assist — Reports Summary", 14, 22);
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 30);

      autoTable(doc, {
        startY: 40,
        head: [["Metric", "Value"]],
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
        theme: "grid",
        headStyles: { fillColor: [10, 102, 255] },
      });

      doc.save("church-assist-report.pdf");
      toast.success("Report exported successfully!");
    } catch {
      toast.error("Failed to export report.");
    } finally {
      setExporting(false);
    }
  };

  const metrics = [
    { title: "Total Members", value: reportData.totalMembers, icon: Users, gradient: "from-blue-500 to-blue-600" },
    { title: "Active Members", value: reportData.activeMembers, icon: UserCheck, gradient: "from-emerald-500 to-emerald-600" },
    { title: "Inactive Members", value: reportData.inactiveMembers, icon: Users, gradient: "from-amber-500 to-amber-600" },
    { title: "Newcomers", value: reportData.newcomers, icon: UserPlus, gradient: "from-violet-500 to-violet-600" },
    { title: "Attendance Records", value: reportData.attendanceRecords, icon: CalendarCheck, gradient: "from-cyan-500 to-cyan-600" },
    { title: "Active Departments", value: reportData.departments, icon: Building2, gradient: "from-purple-500 to-purple-600" },
    { title: "Follow-Up Tasks", value: reportData.followUps, icon: FileText, gradient: "from-pink-500 to-pink-600" },
    { title: "Avg. Attendance", value: reportData.avgAttendance, icon: TrendingUp, gradient: "from-indigo-500 to-indigo-600" },
  ];

  return (
    <div className="space-y-6 stagger-children">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--brand-navy)]">Reports & Analytics</h1>
          <p className="text-[var(--brand-muted)] mt-1 text-sm">Comprehensive overview of your church&apos;s health and growth.</p>
        </div>
        <button
          onClick={handleExportPDF}
          disabled={exporting || loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-[var(--brand-navy)] text-white rounded-xl hover:bg-[var(--brand-navy-light)] transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 focus-ring"
        >
          {exporting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          <span className="text-sm font-medium">{exporting ? "Exporting..." : "Export PDF"}</span>
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-white p-5 rounded-2xl border border-[var(--brand-border)] shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
            <div className="flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${metric.gradient} flex items-center justify-center shadow-sm`}>
                <metric.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[var(--brand-muted)] text-xs font-medium">{metric.title}</p>
                <p className="text-xl font-bold text-[var(--brand-navy)]">
                  {loading ? (
                    <span className="skeleton inline-block w-12 h-6 rounded" />
                  ) : (
                    metric.value.toLocaleString()
                  )}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Chart */}
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

        {/* Conversion Rate */}
        <div className="bg-white rounded-2xl border border-[var(--brand-border)] shadow-sm p-6">
          <h2 className="text-lg font-semibold text-[var(--brand-navy)] mb-4">Newcomer Conversion</h2>
          <div className="flex flex-col items-center justify-center h-52">
            {loading ? (
              <div className="skeleton w-32 h-32 rounded-full" />
            ) : (
              <>
                <div className="relative w-32 h-32">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#E2E8F0" strokeWidth="12" />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="url(#conversionGradient)"
                      strokeWidth="12"
                      strokeDasharray={`${reportData.newcomerConversionRate * 2.51} 251`}
                      strokeLinecap="round"
                      className="progress-bar"
                    />
                    <defs>
                      <linearGradient id="conversionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#22C55E" />
                        <stop offset="100%" stopColor="#16A34A" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-[var(--brand-navy)]">{reportData.newcomerConversionRate}%</span>
                    <span className="text-xs text-[var(--brand-muted)]">Conversion</span>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm text-[var(--brand-muted)]">
                    {reportData.newcomers > 0 ? (
                      <>
                        <span className="font-semibold text-emerald-600">{reportData.newcomers - (reportData.newcomers - Math.round(reportData.newcomers * reportData.newcomerConversionRate / 100))}</span> of {reportData.newcomers} newcomers became members
                      </>
                    ) : (
                      "No newcomers logged yet"
                    )}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Summary Table */}
      <div className="bg-white rounded-2xl border border-[var(--brand-border)] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[var(--brand-border)]">
          <h2 className="text-lg font-semibold text-[var(--brand-navy)]">Summary Report</h2>
          <p className="text-sm text-[var(--brand-muted)] mt-1">Generated on {new Date().toLocaleDateString()}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--brand-bg)] text-[var(--brand-muted)] border-b border-[var(--brand-border)]">
              <tr>
                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider">Metric</th>
                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider">Value</th>
                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--brand-border-light)]">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><div className="h-4 skeleton w-32" /></td>
                    <td className="px-6 py-4"><div className="h-4 skeleton w-16" /></td>
                    <td className="px-6 py-4"><div className="h-6 skeleton w-20 rounded-full" /></td>
                  </tr>
                ))
              ) : (
                <>
                  <tr className="hover:bg-[var(--brand-bg)]/80 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">Total Members</td>
                    <td className="px-6 py-4 text-slate-600">{reportData.totalMembers.toLocaleString()}</td>
                    <td className="px-6 py-4"><span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" />Tracked</span></td>
                  </tr>
                  <tr className="hover:bg-[var(--brand-bg)]/80 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">Active vs Inactive</td>
                    <td className="px-6 py-4 text-slate-600">{reportData.activeMembers} active / {reportData.inactiveMembers} inactive</td>
                    <td className="px-6 py-4"><span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${reportData.activeMembers > reportData.inactiveMembers ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}><span className={`w-1.5 h-1.5 rounded-full ${reportData.activeMembers > reportData.inactiveMembers ? "bg-emerald-500" : "bg-amber-500"}`} />{reportData.activeMembers > reportData.inactiveMembers ? "Healthy" : "Review"}</span></td>
                  </tr>
                  <tr className="hover:bg-[var(--brand-bg)]/80 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">Newcomer Conversion</td>
                    <td className="px-6 py-4 text-slate-600">{reportData.newcomerConversionRate}%</td>
                    <td className="px-6 py-4"><span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${reportData.newcomerConversionRate >= 50 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}><span className={`w-1.5 h-1.5 rounded-full ${reportData.newcomerConversionRate >= 50 ? "bg-emerald-500" : "bg-amber-500"}`} />{reportData.newcomerConversionRate >= 50 ? "Good" : "Needs Work"}</span></td>
                  </tr>
                  <tr className="hover:bg-[var(--brand-bg)]/80 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">Average Attendance</td>
                    <td className="px-6 py-4 text-slate-600">{reportData.avgAttendance.toLocaleString()}</td>
                    <td className="px-6 py-4"><span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-violet-50 text-violet-700"><span className="w-1.5 h-1.5 rounded-full bg-violet-500" />Tracked</span></td>
                  </tr>
                  <tr className="hover:bg-[var(--brand-bg)]/80 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">Follow-Up Tasks</td>
                    <td className="px-6 py-4 text-slate-600">{reportData.followUps}</td>
                    <td className="px-6 py-4"><span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${reportData.followUps === 0 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}><span className={`w-1.5 h-1.5 rounded-full ${reportData.followUps === 0 ? "bg-emerald-500" : "bg-amber-500"}`} />{reportData.followUps === 0 ? "All Clear" : "Pending"}</span></td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
