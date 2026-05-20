"use client";

import { useState, useEffect, useMemo } from "react";
import {
  UserPlus,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  UserCheck,
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
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Newcomer } from "@/lib/types";
import ConfirmModal from "@/components/ConfirmModal";
import { toast } from "sonner";

const NEWCOMER_STATUSES: Newcomer["status"][] = ["New", "Followed Up", "Member", "Lost Contact"];
const PAGE_SIZE = 10;

const defaultFormData = {
  fullName: "",
  phone: "",
  email: "",
  visitDate: new Date().toISOString().split("T")[0],
  serviceAttended: "Sunday Morning",
  invitedBy: "",
  bornAgain: false,
  wantsFollowUp: true,
  notes: "",
  status: "New" as Newcomer["status"],
};

export default function NewcomersPage() {
  const [, setIsModalOpen] = useState(false);
  const [newcomers, setNewcomers] = useState<Newcomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [, setEditingNewcomer] = useState<Newcomer | null>(null);
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [, setFormData] = useState(defaultFormData);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; itemId: string | null }>({
    isOpen: false,
    itemId: null,
  });

  const fetchNewcomers = async () => {
    try {
      const q = query(collection(db, "newcomers"), orderBy("createdAt", "desc"), limit(500));
      const snapshot = await getDocs(q);
      setNewcomers(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Newcomer[]);
    } catch (error) {
      console.error("Error fetching newcomers:", error);
      toast.error("Failed to load newcomers.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchNewcomers(); }, []);
  useEffect(() => { setCurrentPage(1); }, [searchQuery, statusFilter]);

  const filtered = useMemo(() => {
    return newcomers.filter((n) => {
      const matchSearch = searchQuery === "" || n.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || n.email?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === "All" || n.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [newcomers, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleDelete = async (id: string) => {
    try { await deleteDoc(doc(db, "newcomers", id)); fetchNewcomers(); toast.success("Newcomer record deleted."); } catch { toast.error("Failed to delete."); }
    setOpenActionId(null);
    setDeleteConfirm({ isOpen: false, itemId: null });
  };

  const openAdd = () => { setEditingNewcomer(null); setFormData(defaultFormData); setIsModalOpen(true); };
  const openEdit = (n: Newcomer) => {
    setEditingNewcomer(n);
    setFormData({ fullName: n.fullName, phone: n.phone, email: n.email, visitDate: n.visitDate, serviceAttended: n.serviceAttended, invitedBy: n.invitedBy, bornAgain: n.bornAgain, wantsFollowUp: n.wantsFollowUp, notes: n.notes, status: n.status });
    setIsModalOpen(true);
    setOpenActionId(null);
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "New": return "bg-blue-50 text-blue-700";
      case "Followed Up": return "bg-amber-50 text-amber-700";
      case "Member": return "bg-emerald-50 text-emerald-700";
      case "Lost Contact": return "bg-red-50 text-red-700";
      default: return "bg-slate-100 text-slate-600";
    }
  };

  const statusDot = (status: string) => {
    switch (status) {
      case "New": return "bg-blue-500";
      case "Followed Up": return "bg-amber-500";
      case "Member": return "bg-emerald-500";
      case "Lost Contact": return "bg-red-500";
      default: return "bg-slate-400";
    }
  };

  const stats = [
    { title: "Total Newcomers", value: newcomers.length, icon: UserPlus, gradient: "from-blue-500 to-blue-600" },
    { title: "New", value: newcomers.filter((n) => n.status === "New").length, icon: UserPlus, gradient: "from-violet-500 to-violet-600" },
    { title: "Converted", value: newcomers.filter((n) => n.status === "Member").length, icon: UserCheck, gradient: "from-emerald-500 to-emerald-600" },
    { title: "Lost Contact", value: newcomers.filter((n) => n.status === "Lost Contact").length, icon: UserPlus, gradient: "from-red-500 to-red-600" },
  ];

  const hasActiveFilters = statusFilter !== "All";
  const clearFilters = () => { setStatusFilter("All"); setSearchQuery(""); };

  return (
    <div className="space-y-6 stagger-children">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--brand-navy)]">Newcomers</h1>
          <p className="text-[var(--brand-muted)] mt-1 text-sm">Track first-time visitors and manage their journey to membership.</p>
        </div>
        <button onClick={openAdd} className="bg-[var(--brand-blue)] hover:bg-[var(--brand-blue-dark)] text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 w-fit focus-ring">
          <UserPlus className="w-4 h-4" />
          <span className="text-sm">Log Newcomer</span>
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
                    <span className="skeleton inline-block w-8 h-6 rounded" />
                  ) : (
                    stat.value
                  )}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[var(--brand-border)] shadow-sm overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 border-b border-[var(--brand-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--brand-bg)]">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[var(--brand-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by name or email..." className="pl-9 pr-4 py-2.5 border border-[var(--brand-border)] rounded-xl text-sm outline-none focus:border-[var(--brand-blue)] focus:ring-2 focus:ring-[var(--brand-blue)]/20 w-full bg-white transition-all" />
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Filter className="w-4 h-4 text-[var(--brand-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="pl-9 pr-8 py-2.5 border border-[var(--brand-border)] rounded-xl text-sm font-medium bg-white outline-none focus:border-[var(--brand-blue)] focus:ring-2 focus:ring-[var(--brand-blue)]/20 appearance-none cursor-pointer">
                <option value="All">All Status</option>
                {NEWCOMER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
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
                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider">Name</th>
                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider hidden md:table-cell">Contact</th>
                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider hidden lg:table-cell">Visit Date</th>
                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider hidden lg:table-cell">Service</th>
                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--brand-border-light)]">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full skeleton" /><div className="space-y-2"><div className="h-4 skeleton w-24" /><div className="h-3 skeleton w-16" /></div></div></td>
                    <td className="px-6 py-4 hidden md:table-cell"><div className="space-y-2"><div className="h-4 skeleton w-28" /><div className="h-3 skeleton w-20" /></div></td>
                    <td className="px-6 py-4 hidden lg:table-cell"><div className="h-4 skeleton w-20" /></td>
                    <td className="px-6 py-4 hidden lg:table-cell"><div className="h-4 skeleton w-24" /></td>
                    <td className="px-6 py-4"><div className="h-6 skeleton w-16 rounded-full" /></td>
                    <td className="px-6 py-4"><div className="h-8 skeleton w-8 rounded-lg ml-auto" /></td>
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <UserPlus className="w-12 h-12 text-[var(--brand-muted-light)] mx-auto mb-3" />
                    <p className="text-sm text-[var(--brand-muted)] font-medium">
                      {searchQuery || hasActiveFilters ? "No newcomers match your filters." : "No newcomers logged yet."}
                    </p>
                    {!hasActiveFilters && !searchQuery && (
                      <button onClick={openAdd} className="mt-4 text-sm text-[var(--brand-blue)] font-medium hover:underline">
                        Log your first newcomer →
                      </button>
                    )}
                  </td>
                </tr>
              ) : paginated.map((n) => (
                <tr key={n.id} className="hover:bg-[var(--brand-bg)]/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-violet-600 text-white flex items-center justify-center font-semibold text-sm shrink-0 shadow-sm">
                        {n.fullName?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{n.fullName}</p>
                        {n.invitedBy && <p className="text-xs text-[var(--brand-muted)]">Invited by {n.invitedBy}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <p className="text-sm text-slate-600">{n.email}</p>
                    <p className="text-xs text-[var(--brand-muted)]">{n.phone}</p>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell text-[var(--brand-muted)] text-sm">{n.visitDate}</td>
                  <td className="px-6 py-4 hidden lg:table-cell text-sm text-slate-600">{n.serviceAttended}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusColor(n.status)}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusDot(n.status)}`} />
                      {n.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right relative">
                    <button onClick={() => setOpenActionId(openActionId === n.id ? null : n.id)} className="p-2 hover:bg-[var(--brand-border)] rounded-lg text-[var(--brand-muted)] hover:text-[var(--brand-navy)] transition-colors opacity-0 group-hover:opacity-100">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {openActionId === n.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setOpenActionId(null)} />
                        <div className="absolute right-4 top-12 bg-white border border-[var(--brand-border)] rounded-xl shadow-xl py-1 z-20 min-w-[160px] scale-in">
                          <button onClick={() => openEdit(n)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-[var(--brand-bg)] w-full text-left transition-colors">
                            <Edit2 className="w-4 h-4 text-[var(--brand-muted)]" /> Edit
                          </button>
                          <div className="border-t border-[var(--brand-border-light)] my-1" />
                          <button onClick={() => { setDeleteConfirm({ isOpen: true, itemId: n.id }); setOpenActionId(null); }} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors">
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

      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        title="Delete Newcomer"
        message="Are you sure you want to delete this newcomer record? This cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => deleteConfirm.itemId && handleDelete(deleteConfirm.itemId)}
        onCancel={() => setDeleteConfirm({ isOpen: false, itemId: null })}
      />
    </div>
  );
}
