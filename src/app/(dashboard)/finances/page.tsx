"use client";

import { useState, useEffect, useMemo } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  Plus,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  X,
  Receipt,
} from "lucide-react";
import { collection, getDocs, query, orderBy, limit, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Transaction, TransactionCategory, TransactionType, PaymentMethod } from "@/lib/types";
import { toast } from "sonner";
import { useSettings } from "@/lib/settings-context";
import { formatCurrency } from "@/lib/currency";

const INCOME_CATEGORIES: TransactionCategory[] = [
  "Tithe", "Offering", "Donation", "Miscellaneous Income",
];
const EXPENSE_CATEGORIES: TransactionCategory[] = [
  "Utilities", "Maintenance", "Salary", "Outreach", "Miscellaneous Expense",
];
const PAYMENT_METHODS: PaymentMethod[] = ["Cash", "Bank Transfer", "Mobile Money", "Cheque"];

const emptyForm = {
  date: new Date().toISOString().split("T")[0],
  description: "",
  category: "Offering" as TransactionCategory,
  type: "Income" as TransactionType,
  amount: 0,
  paymentMethod: "Cash" as PaymentMethod,
  recordedBy: "",
  notes: "",
};

export default function FinancesPage() {
  const { settings } = useSettings();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"All" | TransactionType>("All");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "transactions"), orderBy("createdAt", "desc"), limit(200));
      const snap = await getDocs(q);
      setTransactions(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Transaction[]);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTransactions(); }, []);

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const matchSearch = searchQuery === "" || t.description.toLowerCase().includes(searchQuery.toLowerCase()) || t.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = typeFilter === "All" || t.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [transactions, searchQuery, typeFilter]);

  const totalIncome = filtered.filter((t) => t.type === "Income").reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = filtered.filter((t) => t.type === "Expense").reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalIncome - totalExpenses;

  const categoryTotals = useMemo(() => {
    const map: Record<string, { income: number; expense: number }> = {};
    for (const t of transactions) {
      if (!map[t.category]) map[t.category] = { income: 0, expense: 0 };
      if (t.type === "Income") map[t.category].income += t.amount;
      else map[t.category].expense += t.amount;
    }
    return map;
  }, [transactions]);

  const handleAddTransaction = async () => {
    if (!form.description || form.amount <= 0) {
      toast.error("Please fill in description and amount.");
      return;
    }
    setSaving(true);
    try {
      await addDoc(collection(db, "transactions"), {
        ...form,
        amount: form.amount,
        createdAt: new Date(),
      });
      toast.success("Transaction added successfully");
      setShowModal(false);
      setForm(emptyForm);
      fetchTransactions();
    } catch {
      toast.error("Failed to add transaction.");
    } finally {
      setSaving(false);
    }
  };

  const fmt = (amount: number) => formatCurrency(amount, settings.currencySymbol);

  const stats = [
    { title: "Total Income", value: totalIncome, icon: TrendingUp, gradient: "from-emerald-500 to-emerald-600", positive: true },
    { title: "Total Expenses", value: totalExpenses, icon: TrendingDown, gradient: "from-red-500 to-red-600", positive: false },
    { title: "Net Balance", value: netBalance, icon: Wallet, gradient: netBalance >= 0 ? "from-blue-500 to-blue-600" : "from-amber-500 to-amber-600", positive: netBalance >= 0 },
    { title: "Transactions", value: filtered.length, icon: Receipt, gradient: "from-violet-500 to-violet-600", positive: true },
  ];

  return (
    <div className="space-y-6 stagger-children">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--brand-navy)]">Finances</h1>
          <p className="text-[var(--brand-muted)] mt-1 text-sm">Track income, expenses, and manage church finances.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => toast.info("Paystack Integration Placeholder: Please configure your API Keys in settings to process real transactions.", { duration: 5000 })}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md hover:-translate-y-0.5 focus-ring">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm">Online Giving (Paystack)</span>
          </button>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[var(--brand-blue)] text-white rounded-xl hover:bg-[var(--brand-blue-dark)] transition-all duration-200 font-medium shadow-sm hover:shadow-md hover:-translate-y-0.5 focus-ring">
            <Plus className="w-4 h-4" />
            <span className="text-sm">Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-5 rounded-2xl border border-[var(--brand-border)] shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
            <div className="flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-sm`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[var(--brand-muted)] text-xs font-medium">{stat.title}</p>
                <p className={`text-xl font-bold ${stat.positive ? "text-[var(--brand-navy)]" : "text-red-600"}`}>
                  {loading ? (
                    <span className="skeleton inline-block w-20 h-6 rounded" />
                  ) : (
                    stat.title === "Transactions" ? stat.value.toLocaleString() : fmt(stat.value)
                  )}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-[var(--brand-border)] shadow-sm p-6">
          <h2 className="text-lg font-semibold text-[var(--brand-navy)] mb-5">Income by Category</h2>
          <div className="space-y-4">
            {INCOME_CATEGORIES.map((cat) => {
              const val = categoryTotals[cat]?.income || 0;
              const pct = totalIncome > 0 ? (val / totalIncome) * 100 : 0;
              return (
                <div key={cat}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-slate-700">{cat}</span>
                    <span className="text-[var(--brand-muted)]">{fmt(val)}</span>
                  </div>
                  <div className="w-full bg-[var(--brand-border-light)] rounded-full h-2.5">
                    <div className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-2.5 rounded-full progress-bar transition-all duration-700" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-[var(--brand-border)] shadow-sm p-6">
          <h2 className="text-lg font-semibold text-[var(--brand-navy)] mb-5">Expenses by Category</h2>
          <div className="space-y-4">
            {EXPENSE_CATEGORIES.map((cat) => {
              const val = categoryTotals[cat]?.expense || 0;
              const pct = totalExpenses > 0 ? (val / totalExpenses) * 100 : 0;
              return (
                <div key={cat}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-slate-700">{cat}</span>
                    <span className="text-[var(--brand-muted)]">{fmt(val)}</span>
                  </div>
                  <div className="w-full bg-[var(--brand-border-light)] rounded-full h-2.5">
                    <div className="bg-gradient-to-r from-red-500 to-red-400 h-2.5 rounded-full progress-bar transition-all duration-700" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-2xl border border-[var(--brand-border)] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[var(--brand-border)] flex flex-col sm:flex-row sm:items-center gap-3 bg-[var(--brand-bg)]">
          <h2 className="text-lg font-semibold text-[var(--brand-navy)]">Transaction History</h2>
          <div className="flex-1 flex flex-col sm:flex-row gap-3 sm:justify-end">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--brand-muted)]" />
              <input
                type="text" placeholder="Search transactions..." value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-56 pl-9 pr-3 py-2.5 border border-[var(--brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/20 focus:border-[var(--brand-blue)] bg-white transition-all"
              />
            </div>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as "All" | TransactionType)}
              className="px-3 py-2.5 border border-[var(--brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/20 bg-white appearance-none cursor-pointer">
              <option value="All">All Types</option>
              <option value="Income">Income</option>
              <option value="Expense">Expense</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--brand-bg)] text-[var(--brand-muted)] border-b border-[var(--brand-border)]">
              <tr>
                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider">Date</th>
                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider">Description</th>
                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider">Category</th>
                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider">Type</th>
                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--brand-border-light)]">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><div className="h-4 skeleton w-20" /></td>
                    <td className="px-6 py-4"><div className="h-4 skeleton w-32" /></td>
                    <td className="px-6 py-4"><div className="h-6 skeleton w-20 rounded-full" /></td>
                    <td className="px-6 py-4"><div className="h-6 skeleton w-16 rounded-full" /></td>
                    <td className="px-6 py-4"><div className="h-4 skeleton w-24 ml-auto" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <Receipt className="w-12 h-12 text-[var(--brand-muted-light)] mx-auto mb-3" />
                    <p className="text-sm text-[var(--brand-muted)] font-medium">No transactions found.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[var(--brand-bg)]/80 transition-colors">
                    <td className="px-6 py-4 text-[var(--brand-muted)] whitespace-nowrap text-sm">{tx.date}</td>
                    <td className="px-6 py-4 font-medium text-slate-900 text-sm">{tx.description}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--brand-bg)] text-slate-600 border border-[var(--brand-border)]">
                        {tx.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${tx.type === "Income" ? "text-emerald-600" : "text-red-600"}`}>
                        {tx.type === "Income" ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        {tx.type}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-right font-semibold text-sm ${tx.type === "Income" ? "text-emerald-600" : "text-red-600"}`}>
                      {tx.type === "Income" ? "+" : "-"}{fmt(tx.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !saving && setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 z-10 scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[var(--brand-navy)]">Add Transaction</h2>
              <button onClick={() => !saving && setShowModal(false)} className="p-2 hover:bg-[var(--brand-bg)] rounded-lg transition-colors">
                <X className="w-5 h-5 text-[var(--brand-muted)]" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-[var(--brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/20 focus:border-[var(--brand-blue)] transition-all"
                  placeholder="e.g., Sunday Offering" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Type</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as TransactionType })}
                    className="w-full px-3.5 py-2.5 border border-[var(--brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/20 focus:border-[var(--brand-blue)] bg-white appearance-none cursor-pointer">
                    <option value="Income">Income</option>
                    <option value="Expense">Expense</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as TransactionCategory })}
                    className="w-full px-3.5 py-2.5 border border-[var(--brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/20 focus:border-[var(--brand-blue)] bg-white appearance-none cursor-pointer">
                    {(form.type === "Income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Amount ({settings.currency})</label>
                  <input type="number" min={0} step={0.01} value={form.amount || ""} onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 border border-[var(--brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/20 focus:border-[var(--brand-blue)] transition-all"
                    placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Payment Method</label>
                  <select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value as PaymentMethod })}
                    className="w-full px-3.5 py-2.5 border border-[var(--brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/20 focus:border-[var(--brand-blue)] bg-white appearance-none cursor-pointer">
                    {PAYMENT_METHODS.map((m) => (<option key={m} value={m}>{m}</option>))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Date</label>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-[var(--brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/20 focus:border-[var(--brand-blue)] transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Recorded By</label>
                <input type="text" value={form.recordedBy} onChange={(e) => setForm({ ...form, recordedBy: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-[var(--brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/20 focus:border-[var(--brand-blue)] transition-all"
                  placeholder="Name of person recording" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} disabled={saving}
                  className="flex-1 px-4 py-2.5 border border-[var(--brand-border)] rounded-xl text-sm font-medium text-slate-700 hover:bg-[var(--brand-bg)] transition-colors focus-ring">
                  Cancel
                </button>
                <button onClick={handleAddTransaction} disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-[var(--brand-blue)] text-white rounded-xl text-sm font-medium hover:bg-[var(--brand-blue-dark)] transition-all disabled:opacity-50 focus-ring shadow-sm">
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </span>
                  ) : "Add Transaction"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
