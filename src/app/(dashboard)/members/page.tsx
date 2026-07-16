"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Users, UserPlus, HeartHandshake, ShieldCheck, Search, MoreVertical,
  Edit2, Trash2, Eye, ChevronLeft, ChevronRight, Filter, X,
  CheckSquare, Square, Download, MessageSquare, Loader2, Upload,
} from "lucide-react";
import {
  collection, getDocs, query, orderBy, startAfter, limit,
  doc, deleteDoc, where, QueryDocumentSnapshot, DocumentData,
} from "firebase/firestore";
import { addDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Member } from "@/lib/types";
import ConfirmModal from "@/components/ConfirmModal";
import EmptyState from "@/components/EmptyState";
import MemberBulkUpload from "@/components/MemberBulkUpload";
import { useAuth } from "@/lib/auth";

const BRANCHES = ["Main Campus", "North Campus", "South Campus"];
const STATUSES: ("Active" | "Inactive")[] = ["Active", "Inactive"];
const PAGE_SIZE = 20;

const defaultFormData = {
  fullName: "", phone: "", email: "",
  branch: "Main Campus", department: "None",
  status: "Active" as "Active" | "Inactive",
};

type FormErrors = Partial<Record<keyof typeof defaultFormData, string>>;

function validateForm(data: typeof defaultFormData): FormErrors {
  const errors: FormErrors = {};
  if (!data.fullName.trim()) errors.fullName = "Full name is required.";
  else if (data.fullName.trim().length < 2) errors.fullName = "Name must be at least 2 characters.";
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    errors.email = "Enter a valid email address.";
  if (data.phone && !/^[+\d\s\-()]{7,15}$/.test(data.phone))
    errors.phone = "Enter a valid phone number.";
  return errors;
}

export default function MembersPage() {
  const { churchId } = useAuth();
  const searchParams = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [branchFilter, setBranchFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [viewingMember, setViewingMember] = useState<Member | null>(null);
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; itemId: string | null }>({ isOpen: false, itemId: null });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const fetchMembers = useCallback(async () => {
    if (!churchId) return;
    setIsLoadingMembers(true);
    try {
      const q = query(
        collection(db, "members"),
        where("churchId", "==", churchId),
        orderBy("createdAt", "desc"),
        limit(200)
      );
      const snap = await getDocs(q);
      setMembers(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Member[]);
      setLastDoc(snap.docs[snap.docs.length - 1] ?? null);
      setHasMore(snap.size === 200);
    } catch (error) {
      console.error("Error fetching members:", error);
      toast.error("Failed to load members.");
    } finally {
      setIsLoadingMembers(false);
    }
  }, [churchId]);

  useEffect(() => { if (churchId) fetchMembers(); }, [churchId, fetchMembers]);
  useEffect(() => { setCurrentPage(1); setSelectedIds(new Set()); }, [searchQuery, branchFilter, statusFilter]);

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || m.fullName?.toLowerCase().includes(q) || m.email?.toLowerCase().includes(q) || m.phone?.includes(q);
      const matchesBranch = branchFilter === "All" || m.branch === branchFilter;
      const matchesStatus = statusFilter === "All" || m.status === statusFilter;
      return matchesSearch && matchesBranch && matchesStatus;
    });
  }, [members, searchQuery, branchFilter, statusFilter]);

  const totalPages = Math.ceil(filteredMembers.length / PAGE_SIZE);
  const paginatedMembers = filteredMembers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const openAddModal = () => { setEditingMember(null); setFormData(defaultFormData); setFormErrors({}); setIsModalOpen(true); };
  const openEditModal = (member: Member) => {
    setEditingMember(member);
    setFormData({ fullName: member.fullName, phone: member.phone, email: member.email, branch: member.branch, department: member.department, status: member.status });
    setFormErrors({});
    setIsModalOpen(true);
    setOpenActionId(null);
  };

  const handleFieldChange = (field: keyof typeof defaultFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) setFormErrors((prev) => { const e = { ...prev }; delete e[field]; return e; });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }
    setIsSubmitting(true);
    try {
      if (editingMember) {
        await updateDoc(doc(db, "members", editingMember.id), { ...formData });
        toast.success("Member updated successfully.");
      } else {
        if (!churchId) return;
        await addDoc(collection(db, "members"), { ...formData, churchId, createdAt: new Date() });
        toast.success("Member added successfully.");
      }
      setIsModalOpen(false); setEditingMember(null); setFormData(defaultFormData); setFormErrors({});
      fetchMembers();
    } catch { toast.error("Failed to save member."); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (memberId: string) => {
    try { await deleteDoc(doc(db, "members", memberId)); fetchMembers(); toast.success("Member deleted."); }
    catch { toast.error("Failed to delete member."); }
    setOpenActionId(null); setDeleteConfirm({ isOpen: false, itemId: null });
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.size) return;
    setBulkDeleting(true);
    try {
      await Promise.all([...selectedIds].map((id) => deleteDoc(doc(db, "members", id))));
      toast.success(`${selectedIds.size} member${selectedIds.size > 1 ? "s" : ""} deleted.`);
      setSelectedIds(new Set()); fetchMembers();
    } catch { toast.error("Some deletions failed."); }
    finally { setBulkDeleting(false); }
  };

  const exportCSV = () => {
    const rows = [["Name", "Email", "Phone", "Branch", "Department", "Status"]];
    (selectedIds.size > 0 ? filteredMembers.filter((m) => selectedIds.has(m.id)) : filteredMembers)
      .forEach((m) => rows.push([m.fullName, m.email, m.phone, m.branch, m.department, m.status]));
    const csv = rows.map((r) => r.map((v) => `"${v ?? ""}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "members.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported.");
  };

  const toggleSelect = (id: string) => setSelectedIds((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const toggleAll = () => setSelectedIds(selectedIds.size === paginatedMembers.length ? new Set() : new Set(paginatedMembers.map((m) => m.id)));
  const allSelected = paginatedMembers.length > 0 && selectedIds.size === paginatedMembers.length;

  const activeCount = members.filter((m) => m.status === "Active").length;
  const workersCount = members.filter((m) => m.department && m.department !== "None" && m.status === "Active").length;
  const hasActiveFilters = branchFilter !== "All" || statusFilter !== "All";
  const clearFilters = () => { setBranchFilter("All"); setStatusFilter("All"); setSearchQuery(""); };

  const stats = [
    { title: "Total Members", value: members.length, icon: Users, gradient: "from-indigo-500 to-blue-600", primary: true },
    { title: "Active Workers", value: workersCount, icon: ShieldCheck, gradient: "from-violet-500 to-violet-600" },
    { title: "Active Members", value: activeCount, icon: HeartHandshake, gradient: "from-emerald-500 to-emerald-600" },
    { title: "Inactive", value: members.length - activeCount, icon: Users, gradient: "from-amber-500 to-amber-600" },
  ];

  const Field = ({ label, field, type = "text", placeholder, required }: { label: string; field: keyof typeof defaultFormData; type?: string; placeholder?: string; required?: boolean }) => (
    <label className="space-y-1.5 text-sm">
      <span className="font-medium text-slate-700">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</span>
      <input
        type={type} value={formData[field] as string}
        onChange={(e) => handleFieldChange(field, e.target.value)}
        required={required}
        placeholder={placeholder}
        className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all
          ${formErrors[field] ? "border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200" : "border-[var(--brand-border)] focus:border-[var(--brand-blue)] focus:ring-2 focus:ring-[var(--brand-blue)]/20"}`}
      />
      {formErrors[field] && <p className="text-xs text-red-600 flex items-center gap-1 mt-0.5">⚠ {formErrors[field]}</p>}
    </label>
  );

  return (
    <div className="space-y-6 stagger-children">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--brand-navy)]">Members Directory</h1>
          <p className="text-[var(--brand-muted)] mt-1 text-sm">Manage congregation profiles, departments, and worker statuses.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsImportModalOpen(true)} className="bg-white hover:bg-slate-50 text-slate-700 border border-[var(--brand-border)] px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 w-fit">
            <Upload className="w-4 h-4" /><span className="text-sm">Import</span>
          </button>
          <button onClick={openAddModal} className="bg-[var(--brand-blue)] hover:bg-[var(--brand-blue-dark)] text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 w-fit">
            <UserPlus className="w-4 h-4" /><span className="text-sm">Add Member</span>
          </button>
        </div>
      </div>

      {/* Stats — first card is visually dominant */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className={`p-5 rounded-2xl border shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5
            ${stat.primary ? "bg-gradient-to-br from-indigo-600 to-blue-700 border-indigo-500/20 text-white col-span-2 lg:col-span-1" : "bg-white border-[var(--brand-border)]"}`}>
            <div className="flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-sm ${stat.primary ? "bg-white/20" : `bg-gradient-to-br ${stat.gradient}`}`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className={`text-xs font-medium ${stat.primary ? "text-indigo-200" : "text-[var(--brand-muted)]"}`}>{stat.title}</p>
                <p className={`text-xl font-bold ${stat.primary ? "text-white" : "text-[var(--brand-navy)]"}`}>
                  {isLoadingMembers ? <span className="skeleton inline-block w-12 h-6 rounded" /> : stat.value.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-indigo-50 border border-indigo-200 rounded-xl text-sm">
          <span className="font-semibold text-indigo-700">{selectedIds.size} selected</span>
          <div className="flex items-center gap-2 ml-auto">
            <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[var(--brand-border)] rounded-lg text-slate-700 hover:bg-slate-50 transition-colors">
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
            <button onClick={handleBulkDelete} disabled={bulkDeleting} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50">
              {bulkDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              Delete
            </button>
            <button onClick={() => setSelectedIds(new Set())} className="p-1.5 text-slate-500 hover:text-slate-700 transition-colors"><X className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-[var(--brand-border)] shadow-sm overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 border-b border-[var(--brand-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--brand-bg)]">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[var(--brand-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by name, email, phone..." className="pl-9 pr-4 py-2.5 border border-[var(--brand-border)] rounded-xl text-sm outline-none focus:border-[var(--brand-blue)] focus:ring-2 focus:ring-[var(--brand-blue)]/20 w-full transition-all bg-white" />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Filter className="w-4 h-4 text-[var(--brand-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)} className="pl-9 pr-8 py-2.5 border border-[var(--brand-border)] rounded-xl text-sm font-medium bg-white outline-none focus:border-[var(--brand-blue)] appearance-none cursor-pointer">
                <option value="All">All Branches</option>
                {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 pr-8 py-2.5 border border-[var(--brand-border)] rounded-xl text-sm font-medium bg-white outline-none focus:border-[var(--brand-blue)] appearance-none cursor-pointer">
              <option value="All">All Status</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <button onClick={exportCSV} title="Export CSV" className="p-2.5 border border-[var(--brand-border)] rounded-xl text-slate-500 hover:bg-slate-50 transition-colors">
              <Download className="w-4 h-4" />
            </button>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1.5 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                <X className="w-3.5 h-3.5" /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--brand-bg)] text-[var(--brand-muted)] border-b border-[var(--brand-border)]">
              <tr>
                <th className="px-4 py-3.5 w-10">
                  <button onClick={toggleAll} className="text-slate-400 hover:text-indigo-600 transition-colors">
                    {allSelected ? <CheckSquare className="w-4 h-4 text-indigo-600" /> : <Square className="w-4 h-4" />}
                  </button>
                </th>
                <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-wider">Member</th>
                <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-wider hidden md:table-cell">Contact</th>
                <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-wider hidden lg:table-cell">Branch</th>
                <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-wider hidden lg:table-cell">Department</th>
                <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-wider">Status</th>
                <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--brand-border-light)]">
              {isLoadingMembers ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3"><div className="w-4 h-4 skeleton rounded" /></td>
                    <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full skeleton" /><div className="space-y-1.5"><div className="h-3.5 skeleton w-28 rounded" /><div className="h-3 skeleton w-20 rounded" /></div></div></td>
                    <td className="px-4 py-3 hidden md:table-cell"><div className="space-y-1.5"><div className="h-3.5 skeleton w-32 rounded" /><div className="h-3 skeleton w-24 rounded" /></div></td>
                    <td className="px-4 py-3 hidden lg:table-cell"><div className="h-3.5 skeleton w-24 rounded" /></td>
                    <td className="px-4 py-3 hidden lg:table-cell"><div className="h-3.5 skeleton w-20 rounded" /></td>
                    <td className="px-4 py-3"><div className="h-6 skeleton w-16 rounded-full" /></td>
                    <td className="px-4 py-3"><div className="h-7 skeleton w-7 rounded-lg ml-auto" /></td>
                  </tr>
                ))
              ) : paginatedMembers.length === 0 ? (
                <tr><td colSpan={7}>
                  <EmptyState
                    icon={Users}
                    title={searchQuery || hasActiveFilters ? "No members match your filters" : "No members yet"}
                    description={searchQuery || hasActiveFilters ? "Try adjusting your search or clearing your filters." : "Start building your congregation by adding your first member. Their profile will appear here."}
                    actionLabel={!searchQuery && !hasActiveFilters ? "Add First Member" : undefined}
                    onAction={openAddModal}
                    secondaryLabel={hasActiveFilters ? "Clear Filters" : undefined}
                    secondaryHref={hasActiveFilters ? "#" : undefined}
                  />
                </td></tr>
              ) : paginatedMembers.map((member) => (
                <tr key={member.id} className={`hover:bg-[var(--brand-bg)]/80 transition-colors group ${selectedIds.has(member.id) ? "bg-indigo-50/50" : ""}`}>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleSelect(member.id)} className="text-slate-400 hover:text-indigo-600 transition-colors">
                      {selectedIds.has(member.id) ? <CheckSquare className="w-4 h-4 text-indigo-600" /> : <Square className="w-4 h-4" />}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-semibold text-xs shrink-0 shadow-sm">
                        {member.fullName?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 text-sm leading-tight">{member.fullName}</p>
                        <p className="text-xs text-[var(--brand-muted)] mt-0.5 md:hidden">{member.email || member.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="text-sm text-slate-600">{member.email}</p>
                    <p className="text-xs text-[var(--brand-muted)]">{member.phone}</p>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-sm text-slate-600">{member.branch}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-sm text-slate-600">{member.department === "None" ? "—" : member.department}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${member.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${member.status === "Active" ? "bg-emerald-500" : "bg-slate-400"}`} />
                      {member.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right relative">
                    <button onClick={() => setOpenActionId(openActionId === member.id ? null : member.id)} className="p-1.5 hover:bg-slate-100 rounded-lg text-[var(--brand-muted)] hover:text-slate-700 transition-colors opacity-0 group-hover:opacity-100">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {openActionId === member.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setOpenActionId(null)} />
                        <div className="absolute right-4 top-10 bg-white border border-[var(--brand-border)] rounded-xl shadow-xl py-1 z-20 min-w-[160px] scale-in">
                          <button onClick={() => { setViewingMember(member); setOpenActionId(null); }} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-[var(--brand-bg)] w-full text-left">
                            <Eye className="w-4 h-4 text-[var(--brand-muted)]" /> View
                          </button>
                          <button onClick={() => openEditModal(member)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-[var(--brand-bg)] w-full text-left">
                            <Edit2 className="w-4 h-4 text-[var(--brand-muted)]" /> Edit
                          </button>
                          <div className="border-t border-[var(--brand-border-light)] my-1" />
                          <button onClick={() => { setDeleteConfirm({ isOpen: true, itemId: member.id }); setOpenActionId(null); }} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full text-left">
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
          <div className="px-5 py-3.5 border-t border-[var(--brand-border)] flex items-center justify-between text-sm bg-[var(--brand-bg)]">
            <p className="text-[var(--brand-muted)] text-xs">
              {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredMembers.length)} of {filteredMembers.length}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 rounded-lg hover:bg-white disabled:opacity-40 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const page = totalPages <= 5 ? i + 1 : currentPage <= 3 ? i + 1 : currentPage >= totalPages - 2 ? totalPages - 4 + i : currentPage - 2 + i;
                return (
                  <button key={page} onClick={() => setCurrentPage(page)} className={`w-7 h-7 rounded-lg text-xs font-medium transition-all ${page === currentPage ? "bg-[var(--brand-blue)] text-white" : "hover:bg-white text-slate-600"}`}>
                    {page}
                  </button>
                );
              })}
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1.5 rounded-lg hover:bg-white disabled:opacity-40 transition-colors"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--brand-border)] px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-[var(--brand-navy)]">{editingMember ? "Edit Member" : "Add Member"}</h2>
                <p className="text-xs text-[var(--brand-muted)] mt-0.5">{editingMember ? "Update member profile details." : "Add a new member to your congregation."}</p>
              </div>
              <button onClick={() => { setIsModalOpen(false); setFormErrors({}); }} className="p-2 rounded-xl text-[var(--brand-muted)] hover:bg-slate-100 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full Name" field="fullName" placeholder="Jane Doe" required />
                <Field label="Phone" field="phone" type="tel" placeholder="+234 800 000 0000" />
              </div>
              <Field label="Email" field="email" type="email" placeholder="jane@example.com" />
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium text-slate-700">Branch</span>
                  <select value={formData.branch} onChange={(e) => handleFieldChange("branch", e.target.value)} className="w-full rounded-xl border border-[var(--brand-border)] px-4 py-2.5 text-sm outline-none focus:border-[var(--brand-blue)] focus:ring-2 focus:ring-[var(--brand-blue)]/20 bg-white">
                    {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </label>
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium text-slate-700">Status</span>
                  <select value={formData.status} onChange={(e) => handleFieldChange("status", e.target.value)} className="w-full rounded-xl border border-[var(--brand-border)] px-4 py-2.5 text-sm outline-none focus:border-[var(--brand-blue)] focus:ring-2 focus:ring-[var(--brand-blue)]/20 bg-white">
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </label>
              </div>
              <label className="space-y-1.5 text-sm block">
                <span className="font-medium text-slate-700">Department</span>
                <input type="text" value={formData.department} onChange={(e) => handleFieldChange("department", e.target.value)} placeholder="e.g. Choir, Ushering, None" className="w-full rounded-xl border border-[var(--brand-border)] px-4 py-2.5 text-sm outline-none focus:border-[var(--brand-blue)] focus:ring-2 focus:ring-[var(--brand-blue)]/20" />
              </label>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => { setIsModalOpen(false); setFormErrors({}); }} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2.5 bg-[var(--brand-blue)] text-white rounded-xl text-sm font-semibold hover:bg-[var(--brand-blue-dark)] transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                  {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : editingMember ? "Update Member" : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm" onClick={() => setViewingMember(null)}>
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-6 text-white text-center">
              <div className="w-16 h-16 rounded-full bg-white/20 text-white flex items-center justify-center font-bold text-2xl mx-auto mb-3">
                {viewingMember.fullName?.charAt(0)?.toUpperCase()}
              </div>
              <h3 className="text-lg font-bold">{viewingMember.fullName}</h3>
              <p className="text-indigo-200 text-sm">{viewingMember.branch}</p>
            </div>
            <div className="p-5 space-y-3 text-sm">
              {[["Email", viewingMember.email], ["Phone", viewingMember.phone], ["Department", viewingMember.department], ["Status", viewingMember.status]].map(([label, val]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-[var(--brand-muted)]">{label}</span>
                  <span className="font-medium text-slate-800">{val || "—"}</span>
                </div>
              ))}
            </div>
            <div className="px-5 pb-5 flex gap-3">
              <button onClick={() => { openEditModal(viewingMember); setViewingMember(null); }} className="flex-1 px-4 py-2.5 bg-[var(--brand-blue)] text-white rounded-xl text-sm font-medium hover:bg-[var(--brand-blue-dark)] transition-colors">Edit</button>
              <button onClick={() => setViewingMember(null)} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
          <div className="w-full max-w-4xl max-h-[85vh] overflow-y-auto rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[var(--brand-border)] px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-[var(--brand-navy)]">Import Members</h2>
                <p className="text-xs text-[var(--brand-muted)] mt-0.5">Upload a CSV or Excel file with your member data.</p>
              </div>
              <button onClick={() => setIsImportModalOpen(false)} className="p-2 rounded-xl text-[var(--brand-muted)] hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <MemberBulkUpload
                churchId={churchId || ""}
                onSuccess={() => { fetchMembers(); }}
                onClose={() => setIsImportModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        title="Delete Member"
        message="Are you sure you want to delete this member? This cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => deleteConfirm.itemId && handleDelete(deleteConfirm.itemId)}
        onCancel={() => setDeleteConfirm({ isOpen: false, itemId: null })}
      />
    </div>
  );
}
