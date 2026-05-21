"use client";

import { useState, useEffect, useMemo } from "react";
import {
  CalendarCheck,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Users,
  UserCheck,
  Hash,
  Filter,
  X,
} from "lucide-react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AttendanceRecord, AttendanceMode, Member } from "@/lib/types";
import AttendanceChart from "@/components/AttendanceChart";
import ConfirmModal from "@/components/ConfirmModal";
import { toast } from "sonner";

const BRANCHES = ["Main Campus", "North Campus", "South Campus"];
const PAGE_SIZE = 10;

const defaultHeadCountForm = {
  date: new Date().toISOString().split("T")[0],
  service: "Sunday Morning",
  branch: "Main Campus",
  mode: "headcount" as AttendanceMode,
  maleCount: 0,
  femaleCount: 0,
  childrenCount: 0,
  firstTimersCount: 0,
  checkedInMemberIds: [] as string[],
  notes: "",
};

export default function AttendancePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [formData, setFormData] = useState(defaultHeadCountForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; itemId: string | null }>({
    isOpen: false,
    itemId: null,
  });

  const [, setActiveMode] = useState<AttendanceMode>("headcount");

  const fetchRecords = async () => {
    try {
      const q = query(collection(db, "attendance"), orderBy("createdAt", "desc"), limit(500));
      const snapshot = await getDocs(q);
      setRecords(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as AttendanceRecord[]);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      toast.error("Failed to load attendance records.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const snapshot = await getDocs(query(collection(db, "members"), limit(500)));
      setMembers(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Member[]);
    } catch (error) {
      console.error("Error fetching members for check-in:", error);
      toast.error("Failed to load members for check-in.");
    }
  };

  useEffect(() => { fetchRecords(); fetchMembers(); }, []);
  useEffect(() => { setCurrentPage(1); }, [searchQuery, branchFilter]);

  const filtered = useMemo(() => {
    return records.filter((r) => {
      const matchSearch = searchQuery === "" || r.service?.toLowerCase().includes(searchQuery.toLowerCase()) || r.branch?.toLowerCase().includes(searchQuery.toLowerCase()) || r.date?.includes(searchQuery);
      const matchBranch = branchFilter === "All" || r.branch === branchFilter;
      return matchSearch && matchBranch;
    });
  }, [records, searchQuery, branchFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleDelete = async (id: string) => {
    try { await deleteDoc(doc(db, "attendance", id)); fetchRecords(); toast.success("Attendance record deleted."); } catch { toast.error("Failed to delete."); }
    setOpenActionId(null);
    setDeleteConfirm({ isOpen: false, itemId: null });
  };

  const openAdd = () => { setEditingRecord(null); setFormData(defaultHeadCountForm); setIsModalOpen(true); };
  const openEdit = (r: AttendanceRecord) => {
    setEditingRecord(r);
    setFormData({ date: r.date, service: r.service, branch: r.branch, mode: r.mode, maleCount: r.maleCount, femaleCount: r.femaleCount, childrenCount: r.childrenCount, firstTimersCount: r.firstTimersCount, checkedInMemberIds: r.checkedInMemberIds || [], notes: r.notes });
    setIsModalOpen(true);
    setOpenActionId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        total: formData.maleCount + formData.femaleCount + formData.childrenCount,
      };

      if (editingRecord) {
        await updateDoc(doc(db, "attendance", editingRecord.id), payload);
        toast.success("Attendance record updated successfully.");
      } else {
        await addDoc(collection(db, "attendance"), {
          ...payload,
          createdAt: new Date(),
        });
        toast.success("Attendance record saved successfully.");
      }

      setIsModalOpen(false);
      setEditingRecord(null);
      setFormData(defaultHeadCountForm);
      fetchRecords();
    } catch (error) {
      console.error("Error saving attendance record:", error);
      toast.error("Failed to save attendance record.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAttendance = records.reduce((sum, r) => sum + (r.total || 0), 0);
  const avgAttendance = records.length > 0 ? Math.round(totalAttendance / records.length) : 0;
  const lastRecord = records[0];

  const stats = [
    { title: "Total Records", value: records.length, icon: CalendarCheck, gradient: "from-blue-500 to-blue-600" },
    { title: "Total Attendance", value: totalAttendance, icon: Users, gradient: "from-emerald-500 to-emerald-600" },
    { title: "Average", value: avgAttendance, icon: Hash, gradient: "from-violet-500 to-violet-600" },
    { title: "Last Service", value: lastRecord?.total || 0, icon: UserCheck, gradient: "from-amber-500 to-amber-600", sub: lastRecord?.date || "—" },
  ];

  const hasActiveFilters = branchFilter !== "All";
  const clearFilters = () => { setBranchFilter("All"); setSearchQuery(""); };

  return (
    <div className="space-y-6 stagger-children">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--brand-navy)]">Attendance</h1>
          <p className="text-[var(--brand-muted)] mt-1 text-sm">Track weekly attendance and monitor church growth.</p>
        </div>
        <button onClick={openAdd} className="bg-[var(--brand-blue)] hover:bg-[var(--brand-blue-dark)] text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 w-fit focus-ring">
          <CalendarCheck className="w-4 h-4" />
          <span className="text-sm">Record Attendance</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-5 rounded-2xl border border-[var(--brand-border)] shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
            <div className="flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-sm`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[var(--brand-muted)] text-xs font-medium">{stat.title}</p>
                <p className="text-xl font-bold text-[var(--brand-navy)]">
                  {isLoading ? (
                    <span className="skeleton inline-block w-12 h-6 rounded" />
                  ) : (
                    stat.value.toLocaleString()
                  )}
                </p>
                {stat.sub && <p className="text-xs text-[var(--brand-muted)]">{stat.sub}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl border border-[var(--brand-border)] shadow-sm p-6">
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

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[var(--brand-border)] shadow-sm overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 border-b border-[var(--brand-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--brand-bg)]">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[var(--brand-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by date, service, branch..." className="pl-9 pr-4 py-2.5 border border-[var(--brand-border)] rounded-xl text-sm outline-none focus:border-[var(--brand-blue)] focus:ring-2 focus:ring-[var(--brand-blue)]/20 w-full bg-white transition-all" />
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Filter className="w-4 h-4 text-[var(--brand-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)} className="pl-9 pr-8 py-2.5 border border-[var(--brand-border)] rounded-xl text-sm font-medium bg-white outline-none focus:border-[var(--brand-blue)] focus:ring-2 focus:ring-[var(--brand-blue)]/20 appearance-none cursor-pointer">
                <option value="All">All Branches</option>
                {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1.5 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                <X className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--brand-bg)] text-[var(--brand-muted)] border-b border-[var(--brand-border)]">
              <tr>
                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider">Date</th>
                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider">Service</th>
                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider hidden md:table-cell">Branch</th>
                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider">Total</th>
                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider hidden lg:table-cell">Breakdown</th>
                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--brand-border-light)]">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><div className="h-4 skeleton w-20" /></td>
                    <td className="px-6 py-4"><div className="h-4 skeleton w-24" /></td>
                    <td className="px-6 py-4 hidden md:table-cell"><div className="h-4 skeleton w-20" /></td>
                    <td className="px-6 py-4"><div className="h-4 skeleton w-12" /></td>
                    <td className="px-6 py-4 hidden lg:table-cell"><div className="h-4 skeleton w-32" /></td>
                    <td className="px-6 py-4"><div className="h-8 skeleton w-8 rounded-lg ml-auto" /></td>
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <CalendarCheck className="w-12 h-12 text-[var(--brand-muted-light)] mx-auto mb-3" />
                    <p className="text-sm text-[var(--brand-muted)] font-medium">
                      {searchQuery || hasActiveFilters ? "No records match your filters." : "No attendance records yet."}
                    </p>
                    {!hasActiveFilters && !searchQuery && (
                      <button onClick={openAdd} className="mt-4 text-sm text-[var(--brand-blue)] font-medium hover:underline">
                        Record your first attendance →
                      </button>
                    )}
                  </td>
                </tr>
              ) : paginated.map((r) => (
                <tr key={r.id} className="hover:bg-[var(--brand-bg)]/80 transition-colors group">
                  <td className="px-6 py-4 text-sm text-slate-900 font-medium">{r.date}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{r.service}</td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--brand-bg)] text-slate-600 border border-[var(--brand-border)]">{r.branch}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-[var(--brand-navy)]">{r.total || 0}</span>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <div className="flex items-center gap-3 text-xs text-[var(--brand-muted)]">
                      <span>M: {r.maleCount || 0}</span>
                      <span>F: {r.femaleCount || 0}</span>
                      <span>C: {r.childrenCount || 0}</span>
                      {r.firstTimersCount > 0 && <span className="text-blue-600 font-medium">New: {r.firstTimersCount}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right relative">
                    <button onClick={() => setOpenActionId(openActionId === r.id ? null : r.id)} className="p-2 hover:bg-[var(--brand-border)] rounded-lg text-[var(--brand-muted)] hover:text-[var(--brand-navy)] transition-colors opacity-0 group-hover:opacity-100">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {openActionId === r.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setOpenActionId(null)} />
                        <div className="absolute right-4 top-12 bg-white border border-[var(--brand-border)] rounded-xl shadow-xl py-1 z-20 min-w-[160px] scale-in">
                          <button onClick={() => openEdit(r)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-[var(--brand-bg)] w-full text-left transition-colors">
                            <Edit2 className="w-4 h-4 text-[var(--brand-muted)]" /> Edit
                          </button>
                          <div className="border-t border-[var(--brand-border-light)] my-1" />
                          <button onClick={() => { setDeleteConfirm({ isOpen: true, itemId: r.id }); setOpenActionId(null); }} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors">
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-[var(--brand-border)] flex items-center justify-between text-sm bg-[var(--brand-bg)]">
            <p className="text-[var(--brand-muted)]">
              Showing <span className="font-medium text-slate-900">{(currentPage - 1) * PAGE_SIZE + 1}</span>–<span className="font-medium text-slate-900">{Math.min(currentPage * PAGE_SIZE, filtered.length)}</span> of <span className="font-medium text-slate-900">{filtered.length}</span>
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${page === currentPage ? "bg-[var(--brand-blue)] text-white shadow-sm" : "hover:bg-white text-slate-600"}`}
                >
                  {page}
                </button>
              ))}
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50">
          <div className="w-full max-w-2xl overflow-hidden rounded-[2rem] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--brand-border)] px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-[var(--brand-navy)]">
                  {editingRecord ? "Edit Attendance" : "Record Attendance"}
                </h2>
                <p className="text-sm text-[var(--brand-muted)]">
                  {editingRecord ? "Adjust attendance numbers for this service." : "Add a new attendance summary for your church service."}
                </p>
              </div>
              <button onClick={() => { setIsModalOpen(false); setEditingRecord(null); setFormData(defaultHeadCountForm); }} className="rounded-full p-2 text-[var(--brand-muted)] hover:bg-[var(--brand-bg)] hover:text-[var(--brand-navy)] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm">
                  <span className="font-medium text-slate-700">Date</span>
                  <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full rounded-2xl border border-[var(--brand-border)] px-4 py-3 text-sm outline-none focus:border-[var(--brand-blue)] focus:ring-2 focus:ring-[var(--brand-blue)]/20" />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="font-medium text-slate-700">Service</span>
                  <input type="text" value={formData.service} onChange={(e) => setFormData({ ...formData, service: e.target.value })} className="w-full rounded-2xl border border-[var(--brand-border)] px-4 py-3 text-sm outline-none focus:border-[var(--brand-blue)] focus:ring-2 focus:ring-[var(--brand-blue)]/20" placeholder="Sunday Morning" />
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm">
                  <span className="font-medium text-slate-700">Branch</span>
                  <select value={formData.branch} onChange={(e) => setFormData({ ...formData, branch: e.target.value })} className="w-full rounded-2xl border border-[var(--brand-border)] px-4 py-3 text-sm outline-none focus:border-[var(--brand-blue)] focus:ring-2 focus:ring-[var(--brand-blue)]/20 bg-white">
                    {BRANCHES.map((branch) => <option key={branch} value={branch}>{branch}</option>)}
                  </select>
                </label>
                <label className="space-y-2 text-sm">
                  <span className="font-medium text-slate-700">Mode</span>
                  <select value={formData.mode} onChange={(e) => setFormData({ ...formData, mode: e.target.value as AttendanceMode })} className="w-full rounded-2xl border border-[var(--brand-border)] px-4 py-3 text-sm outline-none focus:border-[var(--brand-blue)] focus:ring-2 focus:ring-[var(--brand-blue)]/20 bg-white">
                    <option value="headcount">Headcount</option>
                    <option value="checkin">Check-in</option>
                  </select>
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-4">
                <label className="space-y-2 text-sm">
                  <span className="font-medium text-slate-700">Male</span>
                  <input type="number" min={0} value={formData.maleCount} onChange={(e) => setFormData({ ...formData, maleCount: parseInt(e.target.value) || 0 })} className="w-full rounded-2xl border border-[var(--brand-border)] px-4 py-3 text-sm outline-none focus:border-[var(--brand-blue)] focus:ring-2 focus:ring-[var(--brand-blue)]/20" />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="font-medium text-slate-700">Female</span>
                  <input type="number" min={0} value={formData.femaleCount} onChange={(e) => setFormData({ ...formData, femaleCount: parseInt(e.target.value) || 0 })} className="w-full rounded-2xl border border-[var(--brand-border)] px-4 py-3 text-sm outline-none focus:border-[var(--brand-blue)] focus:ring-2 focus:ring-[var(--brand-blue)]/20" />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="font-medium text-slate-700">Children</span>
                  <input type="number" min={0} value={formData.childrenCount} onChange={(e) => setFormData({ ...formData, childrenCount: parseInt(e.target.value) || 0 })} className="w-full rounded-2xl border border-[var(--brand-border)] px-4 py-3 text-sm outline-none focus:border-[var(--brand-blue)] focus:ring-2 focus:ring-[var(--brand-blue)]/20" />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="font-medium text-slate-700">First Timers</span>
                  <input type="number" min={0} value={formData.firstTimersCount} onChange={(e) => setFormData({ ...formData, firstTimersCount: parseInt(e.target.value) || 0 })} className="w-full rounded-2xl border border-[var(--brand-border)] px-4 py-3 text-sm outline-none focus:border-[var(--brand-blue)] focus:ring-2 focus:ring-[var(--brand-blue)]/20" />
                </label>
              </div>
              <div>
                <label className="space-y-2 text-sm">
                  <span className="font-medium text-slate-700">Notes</span>
                  <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={4} className="w-full rounded-2xl border border-[var(--brand-border)] px-4 py-3 text-sm outline-none focus:border-[var(--brand-blue)] focus:ring-2 focus:ring-[var(--brand-blue)]/20 resize-none" placeholder="Optional service notes" />
                </label>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => { setIsModalOpen(false); setEditingRecord(null); setFormData(defaultHeadCountForm); }} className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="rounded-2xl bg-[var(--brand-blue)] px-5 py-3 text-sm font-semibold text-white hover:bg-[var(--brand-blue-dark)] transition-all disabled:opacity-60">
                  {isSubmitting ? "Saving..." : editingRecord ? "Update Record" : "Save Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        title="Delete Attendance Record"
        message="Are you sure you want to delete this attendance record? This cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => deleteConfirm.itemId && handleDelete(deleteConfirm.itemId)}
        onCancel={() => setDeleteConfirm({ isOpen: false, itemId: null })}
      />
    </div>
  );
}
