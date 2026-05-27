"use client";

import { useState, useEffect } from "react";
import { Wallet, Plus, ArrowUpRight, RefreshCw, Clock, CheckCircle2, XCircle } from "lucide-react";
import { collection, getDocs, query, orderBy, limit, doc, getDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

const MIN_TOPUP = 1000;

export default function WalletPage() {
  const { user, churchId } = useAuth();
  const [wallet, setWallet] = useState<{ balance: number; totalFunded: number; totalSpent: number } | null>(null);
  const [txs, setTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [topupAmount, setTopupAmount] = useState(2000);
  const [processing, setProcessing] = useState(false);

  const fetchWallet = async () => {
    if (!churchId) return;
    try {
      const [walletSnap, txsSnap] = await Promise.all([
        getDoc(doc(db, "wallets", churchId)),
        getDocs(query(collection(db, "wallet_transactions"), where("churchId", "==", churchId), orderBy("createdAt", "desc"), limit(50))),
      ]);
      if (walletSnap.exists()) setWallet(walletSnap.data() as any);
      setTxs(txsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch {
      // Wallet may not exist yet
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWallet(); }, [churchId]);

  const handleTopup = async () => {
    if (topupAmount < MIN_TOPUP) {
      toast.error(`Minimum top-up is ₦${MIN_TOPUP.toLocaleString()}`);
      return;
    }
    setProcessing(true);
    try {
      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user?.email, amount: topupAmount, churchId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      window.location.href = data.authorizationUrl;
    } catch (err: any) {
      toast.error(err.message || "Failed to initialize payment");
    } finally {
      setProcessing(false);
    }
  };

  const statusIcon = (type: string, status: string) => {
    if (status === "success") return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    if (status === "failed") return <XCircle className="w-4 h-4 text-red-500" />;
    return <Clock className="w-4 h-4 text-amber-500" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--brand-navy)]">Wallet</h1>
          <p className="text-[var(--brand-muted)] mt-1 text-sm">Manage your wallet balance and top up for messaging.</p>
        </div>
        <button onClick={fetchWallet} disabled={loading} className="flex items-center gap-2 px-4 py-2.5 bg-[var(--brand-navy)] text-white rounded-xl hover:bg-[var(--brand-navy-light)] transition-all text-sm font-medium shadow-sm">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-[var(--brand-navy)] to-[var(--brand-navy-light)] rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-[var(--brand-blue)]" />
            <span className="text-sm font-medium text-slate-300">Wallet Balance</span>
          </div>
        </div>
        <p className="text-4xl font-bold mb-2">
          {loading ? (
            <span className="animate-pulse">₦ ---</span>
          ) : (
            `₦ ${(wallet?.balance || 0).toLocaleString()}`
          )}
        </p>
        <div className="flex gap-6 text-sm text-slate-400">
          <span>Funded: ₦{(wallet?.totalFunded || 0).toLocaleString()}</span>
          <span>Spent: ₦{(wallet?.totalSpent || 0).toLocaleString()}</span>
        </div>
      </div>

      {/* Top Up */}
      <div className="bg-white rounded-2xl border border-[var(--brand-border)] shadow-sm p-6">
        <h2 className="text-lg font-semibold text-[var(--brand-navy)] mb-4">Top Up Wallet</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {[1000, 2000, 5000, 10000, 25000, 50000].map((amt) => (
            <button
              key={amt}
              onClick={() => setTopupAmount(amt)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                topupAmount === amt
                  ? "bg-[var(--brand-blue)] text-white shadow-sm"
                  : "bg-[var(--brand-bg)] text-slate-700 hover:bg-[var(--brand-border)] border border-[var(--brand-border)]"
              }`}
            >
              ₦{amt.toLocaleString()}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <input
            type="number"
            min={MIN_TOPUP}
            value={topupAmount}
            onChange={(e) => setTopupAmount(Number(e.target.value))}
            className="flex-1 px-4 py-2.5 border border-[var(--brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/20"
            placeholder="Custom amount"
          />
          <button
            onClick={handleTopup}
            disabled={processing || topupAmount < MIN_TOPUP}
            className="flex items-center gap-2 px-6 py-2.5 bg-[var(--brand-blue)] text-white rounded-xl hover:bg-[var(--brand-blue-dark)] transition-all font-medium disabled:opacity-50 shadow-sm"
          >
            {processing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Top Up
          </button>
        </div>
        <p className="text-xs text-[var(--brand-muted)] mt-2">Minimum top-up: ₦{MIN_TOPUP.toLocaleString()}</p>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-2xl border border-[var(--brand-border)] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[var(--brand-border)] bg-[var(--brand-bg)]">
          <h2 className="text-lg font-semibold text-[var(--brand-navy)]">Transaction History</h2>
        </div>
        <div className="divide-y divide-[var(--brand-border-light)]">
          {txs.length === 0 && loading && (
            <div className="p-8 text-center text-sm text-[var(--brand-muted)]">Loading...</div>
          )}
          {txs.length === 0 && !loading && (
            <div className="p-8 text-center">
              <Wallet className="w-10 h-10 text-[var(--brand-muted-light)] mx-auto mb-2" />
              <p className="text-sm text-[var(--brand-muted)]">No transactions yet</p>
            </div>
          )}
          {txs.map((tx) => (
            <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-[var(--brand-bg)]/80 transition-colors">
              <div className="flex items-center gap-3">
                {statusIcon(tx.type, tx.status)}
                <div>
                  <p className="text-sm font-medium text-slate-900">{tx.description}</p>
                  <p className="text-xs text-[var(--brand-muted)]">{tx.type} · {tx.createdAt?.toDate?.()?.toLocaleDateString() || "—"}</p>
                </div>
              </div>
              <span className={`text-sm font-semibold ${tx.type === "credit" ? "text-emerald-600" : tx.type === "refund" ? "text-amber-600" : "text-red-600"}`}>
                {tx.type === "credit" || tx.type === "refund" ? "+" : "-"}₦{tx.amount?.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
