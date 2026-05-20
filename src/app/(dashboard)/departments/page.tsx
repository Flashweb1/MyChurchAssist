"use client";

import { useState, useEffect } from "react";
import {
  Building2,
  Search,
  MoreVertical,
  X,
  Loader2,
  Edit2,
  Trash2,
  Users,
  Plus,
  Filter,
} from "lucide-react";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Department } from "@/lib/types";
import ConfirmModal from "@/components/ConfirmModal";
import { toast } from "sonner";

const defaultFormData = {
  name: "",
  head: "",
  description: "",
  memberCount: 0,
  status: "Active" as Department["status"],
};

export default function DepartmentsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; itemId: string | null }>({
    isOpen: false,
    itemId: null,
  });

  const fetchDepartments = async () => {
    try {
      const q = query(collection(db, "departments"), orderBy("createdAt", "desc"), limit(200));
      const snapshot = await getDocs(q);
      setDepartments(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Department[]);
    } catch (error) {
      console.error("Error fetching departments:", error);
      toast.error("Failed to load departments.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchDepartments(); }, []);

  const filtered = departments.filter((d) =>
    searchQuery === "" || d.name?.toLowerCase().includes(searchQuery.toLowerCase()) || d.head?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingDept) {
        await updateDoc(doc(db, "departments", editingDept.id), { ...formData });
      } else {
        await addDoc(collection(db, "departments"), { ...formData, createdAt: new Date() });
      }
      setIsModalOpen(false);
      setFormData(defaultFormData);
      setEditingDept(null);
      fetchDepartments();
    } catch (error) {
      console.error("Error saving department:", error);
      toast.error("Failed to save department.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try { await deleteDoc(doc(db, "departments", id)); fetchDepartments(); toast.success("Department deleted."); } catch { toast.error("Failed to delete."); }
    setOpenActionId(null);
    setDeleteConfirm({ isOpen: false, itemId: null });
  };

  const openAdd = () => { setEditingDept(null); setFormData(defaultFormData); setIsModalOpen(true); };
  const openEdit = (d: Department) => {
    setEditingDept(d);
    setFormData({ name: d.name, head: d.head, description: d.description, memberCount: d.memberCount, status: d.status });
    setIsModalOpen(true);
    setOpenActionId(null);
  };

  const activeCount = departments.filter((d) => d.status === "Active").length;
  const totalMembers = departments.reduce((sum, d) => sum + (d.memberCount || 0), 0);

  const stats = [
    { title: "Total Departments", value: departments.length, icon: Building2, gradient: "from-purple-500 to-purple-600" },
    { title: "Active", value: activeCount, icon: Building2, gradient: "from-emerald-500 to-emerald-600" },
    { title: "Total Members", value: totalMembers, icon: Users, gradient: "from-blue-500 to-blue-600" },
  ];

  const gradients = [
    "from-purple-500 to-purple-600",
    "from-blue-500 to-blue-600",
    "from-emerald-500 to-emerald-600",
    "from-amber-500 to-amber-600",
    "from-pink-500 to-pink-600",
    "from-teal-500 to-teal-600",
    "from-violet-500 to-violet-600",
    "from-cyan-500 to-cyan-600",
  ];

  return (
    <div className="space-y-6 stagger-children">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--brand-navy)]">Departments</h1>
          <p className="text-[var(--brand-muted)] mt-1 text-sm">Manage church departments, teams, and their leadership.</p>
        </div>
        <button onClick={openAdd} className="bg-[var(--brand-blue)] hover:bg-[var(--brand-blue-dark)] text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 w-fit focus-ring">
          <Plus className="w-4 h-4" />
          <span className="text-sm">Add Department</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
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
                    stat.value.toLocaleString()
                  )}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-80">
        <Search className="w-4 h-4 text-[var(--brand-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search departments..." className="pl-9 pr-4 py-2.5 border border-[var(--brand-border)] rounded-xl text-sm outline-none focus:border-[var(--brand-blue)] focus:ring-2 focus:ring-[var(--brand-blue)]/20 w-full bg-white transition-all" />
      </div>

      {/* Department Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[var(--brand-border)] shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl skeleton" />
                <div className="w-8 h-8 rounded-lg skeleton" />
              </div>
              <div className="h-5 skeleton w-3/4 mb-2" />
              <div className="h-4 skeleton w-full mb-1" />
              <div className="h-4 skeleton w-1/2" />
              <div className="mt-4 pt-4 border-t border-[var(--brand-border-light)] flex justify-between">
                <div className="h-4 skeleton w-24" />
                <div className="h-4 skeleton w-12" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[var(--brand-border)] shadow-sm p-16 text-center">
          <Building2 className="w-12 h-12 text-[var(--brand-muted-light)] mx-auto mb-3" />
          <p className="text-sm text-[var(--brand-muted)] font-medium">
            {searchQuery ? "No departments match your search." : "No departments found yet."}
          </p>
          {!searchQuery && (
            <button onClick={openAdd} className="mt-4 text-sm text-[var(--brand-blue)] font-medium hover:underline">
              Create your first department →
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((dept, index) => (
            <div key={dept.id} className="bg-white rounded-2xl border border-[var(--brand-border)] shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 p-6 relative group">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradients[index % gradients.length]} flex items-center justify-center font-bold text-lg text-white shadow-sm`}>
                  {dept.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="relative">
                  <button onClick={() => setOpenActionId(openActionId === dept.id ? null : dept.id)} className="p-2 hover:bg-[var(--brand-border)] rounded-lg text-[var(--brand-muted)] hover:text-[var(--brand-navy)] transition-colors opacity-0 group-hover:opacity-100">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {openActionId === dept.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setOpenActionId(null)} />
                      <div className="absolute right-0 top-10 bg-white border border-[var(--brand-border)] rounded-xl shadow-xl py-1 z-20 min-w-[160px] scale-in">
                        <button onClick={() => openEdit(dept)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-[var(--brand-bg)] w-full text-left transition-colors">
                          <Edit2 className="w-4 h-4 text-[var(--brand-muted)]" /> Edit
                        </button>
                        <div className="border-t border-[var(--brand-border-light)] my-1" />
                        <button onClick={() => { setDeleteConfirm({ isOpen: true, itemId: dept.id }); setOpenActionId(null); }} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors">
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <h3 className="font-semibold text-slate-900 text-lg">{dept.name}</h3>
              <p className="text-sm text-[var(--brand-muted)] mt-1 line-clamp-2">{dept.description || "No description"}</p>
              <div className="mt-4 pt-4 border-t border-[var(--brand-border-light)] flex items-center justify-between text-sm">
                <div className="text-slate-600">
                  <span className="font-medium">Head:</span> {dept.head || "Unassigned"}
                </div>
                <div className="flex items-center gap-1.5 text-[var(--brand-muted)]">
                  <Users className="w-4 h-4" />
                  {dept.memberCount || 0}
                </div>
              </div>
              <div className="mt-3">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${dept.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${dept.status === "Active" ? "bg-emerald-500" : "bg-slate-400"}`} />
                  {dept.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto scale-in">
            <div className="sticky top-0 bg-white border-b border-[var(--brand-border)] px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-semibold text-[var(--brand-navy)]">{editingDept ? "Edit Department" : "Add Department"}</h2>
              <button onClick={() => { setIsModalOpen(false); setEditingDept(null); }} className="p-2 hover:bg-[var(--brand-bg)] rounded-lg text-[var(--brand-muted)] transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Department Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="w-full px-3.5 py-2.5 border border-[var(--brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/20 focus:border-[var(--brand-blue)] transition-all" placeholder="e.g. Media & Tech" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Department Head</label>
                <input type="text" value={formData.head} onChange={(e) => setFormData({ ...formData, head: e.target.value })} className="w-full px-3.5 py-2.5 border border-[var(--brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/20 focus:border-[var(--brand-blue)] transition-all" placeholder="Name of department head" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full px-3.5 py-2.5 border border-[var(--brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/20 focus:border-[var(--brand-blue)] transition-all resize-none" placeholder="Brief description of department" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Member Count</label>
                  <input type="number" min={0} value={formData.memberCount} onChange={(e) => setFormData({ ...formData, memberCount: parseInt(e.target.value) || 0 })} className="w-full px-3.5 py-2.5 border border-[var(--brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/20 focus:border-[var(--brand-blue)] transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as Department["status"] })} className="w-full px-3.5 py-2.5 border border-[var(--brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/20 focus:border-[var(--brand-blue)] bg-white appearance-none cursor-pointer">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[var(--brand-border)]">
                <button type="button" onClick={() => { setIsModalOpen(false); setEditingDept(null); }} className="px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-[var(--brand-bg)] rounded-xl transition-colors focus-ring">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2.5 bg-[var(--brand-blue)] text-white text-sm font-medium hover:bg-[var(--brand-blue-dark)] rounded-xl flex items-center gap-2 disabled:opacity-70 transition-all shadow-sm">
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? "Saving..." : editingDept ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        title="Delete Department"
        message="Are you sure you want to delete this department? This cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => deleteConfirm.itemId && handleDelete(deleteConfirm.itemId)}
        onCancel={() => setDeleteConfirm({ isOpen: false, itemId: null })}
      />
    </div>
  );
}
