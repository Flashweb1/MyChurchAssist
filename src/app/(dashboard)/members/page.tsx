"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Users,
  UserPlus,
  HeartHandshake,
  ShieldCheck,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
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
import { addDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Member } from "@/lib/types";
import ConfirmModal from "@/components/ConfirmModal";

const BRANCHES = ["Main Campus", "North Campus", "South Campus"];
const STATUSES: ("Active" | "Inactive")[] = ["Active", "Inactive"];
const PAGE_SIZE = 10;

const defaultFormData = {
  fullName: "",
  phone: "",
  email: "",
  branch: "Main Campus",
  department: "None",
  status: "Active" as "Active" | "Inactive",
};

export default function MembersPage() {
  const searchParams = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [branchFilter, setBranchFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [viewingMember, setViewingMember] = useState<Member | null>(null);
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; itemId: string | null }>({
    isOpen: false,
    itemId: null,
  });

  const fetchMembers = async () => {
    try {
      const q = query(collection(db, "members"), orderBy("createdAt", "desc"), limit(500));
      const querySnapshot = await getDocs(q);
      const membersData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Member[];
      setMembers(membersData);
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, branchFilter, statusFilter]);

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const matchesSearch =
        searchQuery === "" ||
        member.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.phone?.includes(searchQuery);
      const matchesBranch = branchFilter === "All" || member.branch === branchFilter;
      const matchesStatus = statusFilter === "All" || member.status === statusFilter;
      return matchesSearch && matchesBranch && matchesStatus;
    });
  }, [members, searchQuery, branchFilter, statusFilter]);

  const totalPages = Math.ceil(filteredMembers.length / PAGE_SIZE);
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const openAddModal = () => {
    setEditingMember(null);
    setFormData(defaultFormData);
    setIsModalOpen(true);
  };

  const openEditModal = (member: Member) => {
    setEditingMember(member);
    setFormData({
      fullName: member.fullName,
      phone: member.phone,
      email: member.email,
      branch: member.branch,
      department: member.department,
      status: member.status,
    });
    setIsModalOpen(true);
    setOpenActionId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingMember) {
        await updateDoc(doc(db, "members", editingMember.id), {
          ...formData,
        });
        toast.success("Member updated successfully.");
      } else {
        await addDoc(collection(db, "members"), {
          ...formData,
          createdAt: new Date(),
        });
        toast.success("Member added successfully.");
      }

      setIsModalOpen(false);
      setEditingMember(null);
      setFormData(defaultFormData);
      fetchMembers();
    } catch (error) {
      console.error("Error saving member:", error);
      toast.error("Failed to save member.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMember(null);
    setFormData(defaultFormData);
  };

  const handleCloseViewer = () => {
    setViewingMember(null);
  };

  const handleDelete = async (memberId: string) => {
    try {
      await deleteDoc(doc(db, "members", memberId));
      fetchMembers();
      toast.success("Member deleted successfully");
    } catch (error) {
      console.error("Error deleting member:", error);
      toast.error("Failed to delete member.");
    }
    setOpenActionId(null);
    setDeleteConfirm({ isOpen: false, itemId: null });
  };

  const activeCount = members.filter((m) => m.status === "Active").length;
  const workersCount = members.filter((m) => m.department && m.department !== "None" && m.status === "Active").length;

  const stats = [
    { title: "Total Members", value: members.length, icon: Users, gradient: "from-blue-500 to-blue-600", bgLight: "bg-blue-50" },
    { title: "Active Workers", value: workersCount, icon: ShieldCheck, gradient: "from-violet-500 to-violet-600", bgLight: "bg-violet-50" },
    { title: "Active Members", value: activeCount, icon: HeartHandshake, gradient: "from-emerald-500 to-emerald-600", bgLight: "bg-emerald-50" },
    { title: "Inactive", value: members.length - activeCount, icon: Users, gradient: "from-amber-500 to-amber-600", bgLight: "bg-amber-50" },
  ];

  const hasActiveFilters = branchFilter !== "All" || statusFilter !== "All";

  const clearFilters = () => {
    setBranchFilter("All");
    setStatusFilter("All");
    setSearchQuery("");
  };

  return (
    <div className="space-y-6 stagger-children">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--brand-navy)]">Members Directory</h1>
          <p className="text-[var(--brand-muted)] mt-1 text-sm">Manage congregation profiles, departments, and worker statuses.</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-[var(--brand-blue)] hover:bg-[var(--brand-blue-dark)] text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 w-fit focus-ring"
        >
          <UserPlus className="w-4 h-4" />
          <span className="text-sm">Add Member</span>
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
                  {isLoadingMembers ? (
                    <span className="skeleton inline-block w-12 h-6 rounded" />
                  ) : (
                    stat.value.toLocaleString()
                  )}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-[var(--brand-border)] shadow-sm overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 border-b border-[var(--brand-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--brand-bg)]">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[var(--brand-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, phone..."
              className="pl-9 pr-4 py-2.5 border border-[var(--brand-border)] rounded-xl text-sm outline-none focus:border-[var(--brand-blue)] focus:ring-2 focus:ring-[var(--brand-blue)]/20 w-full transition-all bg-white"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Filter className="w-4 h-4 text-[var(--brand-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="pl-9 pr-8 py-2.5 border border-[var(--brand-border)] rounded-xl text-sm font-medium hover:bg-white text-slate-700 transition-colors bg-white outline-none focus:border-[var(--brand-blue)] focus:ring-2 focus:ring-[var(--brand-blue)]/20 appearance-none cursor-pointer"
              >
                <option value="All">All Branches</option>
                {BRANCHES.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 pr-8 py-2.5 border border-[var(--brand-border)] rounded-xl text-sm font-medium hover:bg-white text-slate-700 transition-colors bg-white outline-none focus:border-[var(--brand-blue)] focus:ring-2 focus:ring-[var(--brand-blue)]/20 appearance-none cursor-pointer"
              >
                <option value="All">All Status</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--brand-bg)] text-[var(--brand-muted)] border-b border-[var(--brand-border)]">
              <tr>
                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider">Member</th>
                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider hidden md:table-cell">Contact</th>
                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider">Department</th>
                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--brand-border-light)]">
              {isLoadingMembers ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="hover:bg-[var(--brand-bg)]/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full skeleton" />
                        <div className="space-y-2">
                          <div className="h-4 skeleton w-24" />
                          <div className="h-3 skeleton w-16" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="space-y-2">
                        <div className="h-4 skeleton w-32" />
                        <div className="h-3 skeleton w-24" />
                      </div>
                    </td>
                    <td className="px-6 py-4"><div className="h-4 skeleton w-20" /></td>
                    <td className="px-6 py-4"><div className="h-6 skeleton w-16 rounded-full" /></td>
                    <td className="px-6 py-4"><div className="h-8 skeleton w-8 rounded-lg ml-auto" /></td>
                  </tr>
                ))
              ) : paginatedMembers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <Users className="w-12 h-12 text-[var(--brand-muted-light)] mx-auto mb-3" />
                    <p className="text-sm text-[var(--brand-muted)] font-medium">
                      {searchQuery || branchFilter !== "All" || statusFilter !== "All"
                        ? "No members match your filters."
                        : "No members found yet."}
                    </p>
                    {!hasActiveFilters && !searchQuery && (
                      <button
                        onClick={openAddModal}
                        className="mt-4 text-sm text-[var(--brand-blue)] font-medium hover:underline"
                      >
                        Add your first member →
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-[var(--brand-bg)]/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--brand-blue)] to-[var(--brand-blue-dark)] text-white flex items-center justify-center font-semibold text-sm shrink-0 shadow-sm">
                          {member.fullName?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{member.fullName}</p>
                          <p className="text-xs text-[var(--brand-muted)]">{member.branch}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <p className="text-slate-600 text-sm">{member.email}</p>
                      <p className="text-[var(--brand-muted)] text-xs">{member.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">{member.department}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          member.status === "Active"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${member.status === "Active" ? "bg-emerald-500" : "bg-slate-400"}`} />
                        {member.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <button
                        onClick={() => setOpenActionId(openActionId === member.id ? null : member.id)}
                        className="p-2 hover:bg-[var(--brand-border)] rounded-lg text-[var(--brand-muted)] hover:text-[var(--brand-navy)] transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {openActionId === member.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setOpenActionId(null)} />
                          <div className="absolute right-4 top-12 bg-white border border-[var(--brand-border)] rounded-xl shadow-xl py-1 z-20 min-w-[160px] scale-in">
                            <button
                              onClick={() => { setViewingMember(member); setOpenActionId(null); }}
                              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-[var(--brand-bg)] w-full text-left transition-colors"
                            >
                              <Eye className="w-4 h-4 text-[var(--brand-muted)]" /> View Details
                            </button>
                            <button
                              onClick={() => { openEditModal(member); setOpenActionId(null); }}
                              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-[var(--brand-bg)] w-full text-left transition-colors"
                            >
                              <Edit2 className="w-4 h-4 text-[var(--brand-muted)]" /> Edit Member
                            </button>
                            <div className="border-t border-[var(--brand-border-light)] my-1" />
                            <button
                              onClick={() => { setDeleteConfirm({ isOpen: true, itemId: member.id }); setOpenActionId(null); }}
                              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors"
                            >
                              <Trash2 className="w-4 h-4" /> Delete
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-[var(--brand-border)] flex items-center justify-between text-sm bg-[var(--brand-bg)]">
            <p className="text-[var(--brand-muted)]">
              Showing <span className="font-medium text-slate-900">{(currentPage - 1) * PAGE_SIZE + 1}</span>–<span className="font-medium text-slate-900">{Math.min(currentPage * PAGE_SIZE, filteredMembers.length)}</span> of <span className="font-medium text-slate-900">{filteredMembers.length}</span> members
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                    page === currentPage
                      ? "bg-[var(--brand-blue)] text-white shadow-sm"
                      : "hover:bg-white text-slate-600"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
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
                  {editingMember ? "Edit Member" : "Add Member"}
                </h2>
                <p className="text-sm text-[var(--brand-muted)]">
                  {editingMember ? "Update your member’s profile." : "Create a new congregation member record."}
                </p>
              </div>
              <button onClick={handleCloseModal} className="rounded-full p-2 text-[var(--brand-muted)] hover:bg-[var(--brand-bg)] hover:text-[var(--brand-navy)] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm">
                  <span className="font-medium text-slate-700">Full Name</span>
                  <input type="text" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} required className="w-full rounded-2xl border border-[var(--brand-border)] px-4 py-3 text-sm outline-none focus:border-[var(--brand-blue)] focus:ring-2 focus:ring-[var(--brand-blue)]/20" placeholder="e.g. Richard Nwosu" />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="font-medium text-slate-700">Email</span>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full rounded-2xl border border-[var(--brand-border)] px-4 py-3 text-sm outline-none focus:border-[var(--brand-blue)] focus:ring-2 focus:ring-[var(--brand-blue)]/20" placeholder="member@example.com" />
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm">
                  <span className="font-medium text-slate-700">Phone</span>
                  <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full rounded-2xl border border-[var(--brand-border)] px-4 py-3 text-sm outline-none focus:border-[var(--brand-blue)] focus:ring-2 focus:ring-[var(--brand-blue)]/20" placeholder="e.g. +2348123456789" />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="font-medium text-slate-700">Branch</span>
                  <select value={formData.branch} onChange={(e) => setFormData({ ...formData, branch: e.target.value })} className="w-full rounded-2xl border border-[var(--brand-border)] px-4 py-3 text-sm outline-none focus:border-[var(--brand-blue)] focus:ring-2 focus:ring-[var(--brand-blue)]/20 bg-white">
                    {BRANCHES.map((branch) => (
                      <option key={branch} value={branch}>{branch}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm">
                  <span className="font-medium text-slate-700">Department</span>
                  <input type="text" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="w-full rounded-2xl border border-[var(--brand-border)] px-4 py-3 text-sm outline-none focus:border-[var(--brand-blue)] focus:ring-2 focus:ring-[var(--brand-blue)]/20" placeholder="e.g. Worship" />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="font-medium text-slate-700">Status</span>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as "Active" | "Inactive" })} className="w-full rounded-2xl border border-[var(--brand-border)] px-4 py-3 text-sm outline-none focus:border-[var(--brand-blue)] focus:ring-2 focus:ring-[var(--brand-blue)]/20 bg-white">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </label>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button type="button" onClick={handleCloseModal} className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="rounded-2xl bg-[var(--brand-blue)] px-5 py-3 text-sm font-semibold text-white hover:bg-[var(--brand-blue-dark)] transition-all disabled:opacity-60">
                  {isSubmitting ? "Saving..." : editingMember ? "Update Member" : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50">
          <div className="w-full max-w-xl overflow-hidden rounded-[2rem] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--brand-border)] px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-[var(--brand-navy)]">Member Details</h2>
                <p className="text-sm text-[var(--brand-muted)]">Review member profile information.</p>
              </div>
              <button onClick={handleCloseViewer} className="rounded-full p-2 text-[var(--brand-muted)] hover:bg-[var(--brand-bg)] hover:text-[var(--brand-navy)] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4 p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-[var(--brand-muted)]">Full Name</p>
                  <p className="mt-1 text-sm text-slate-900">{viewingMember.fullName}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-[var(--brand-muted)]">Email</p>
                  <p className="mt-1 text-sm text-slate-900">{viewingMember.email || "—"}</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-[var(--brand-muted)]">Phone</p>
                  <p className="mt-1 text-sm text-slate-900">{viewingMember.phone || "—"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-[var(--brand-muted)]">Branch</p>
                  <p className="mt-1 text-sm text-slate-900">{viewingMember.branch}</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-[var(--brand-muted)]">Department</p>
                  <p className="mt-1 text-sm text-slate-900">{viewingMember.department}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-[var(--brand-muted)]">Status</p>
                  <p className="mt-1 text-sm text-slate-900">{viewingMember.status}</p>
                </div>
              </div>
              <div className="flex justify-end">
                <button onClick={handleCloseViewer} className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        title="Delete Member"
        message="Are you sure you want to delete this member? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => deleteConfirm.itemId && handleDelete(deleteConfirm.itemId)}
        onCancel={() => setDeleteConfirm({ isOpen: false, itemId: null })}
      />
    </div>
  );
}
