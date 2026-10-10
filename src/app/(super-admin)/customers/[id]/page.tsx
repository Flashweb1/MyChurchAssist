'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import Link from 'next/link';
import {
  ArrowLeft,
  Mail,
  Users,
  Calendar,
  Wallet,
  MessageSquare,
  LogIn,
  Trash2,
  Eye,
  BarChart3,
} from 'lucide-react';

interface CustomerDetail {
  id: string;
  churchName: string;
  email: string;
  phone: string;
  plan: string;
  status: string;
  createdAt: Date;
  members: number;
  activeUsers: number;
  walletBalance: number;
  totalFunded: number;
  totalSpent: number;
  healthScore: number;
}

export default function CustomerDetailPage() {
  const params = useParams();
  const churchId = params.id as string;

  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    async function fetchCustomer() {
      try {
        // Get church data
        const churchSnap = await getDoc(doc(db, 'churches', churchId));

        if (!churchSnap.exists()) {
          setLoading(false);
          return;
        }

        const churchData = churchSnap.data();

        // Get members
        const membersSnap = await getDocs(
          query(collection(db, 'members'), where('churchId', '==', churchId))
        );

        // Get users
        const usersSnap = await getDocs(
          query(collection(db, 'users'), where('churchId', '==', churchId))
        );

        // Get wallet
        const walletSnap = await getDoc(doc(db, 'wallets', churchId));
        const wallet = walletSnap.exists() ? walletSnap.data() : {};

        setCustomer({
          id: churchId,
          churchName: churchData.churchName || 'Unnamed',
          email: churchData.email || 'N/A',
          phone: churchData.phone || 'N/A',
          plan: churchData.plan || 'Free',
          status: churchData.status || 'Active',
          createdAt: churchData.createdAt?.toDate() || new Date(),
          members: membersSnap.size,
          activeUsers: usersSnap.size,
          walletBalance: wallet.balance || 0,
          totalFunded: wallet.totalFunded || 0,
          totalSpent: wallet.totalSpent || 0,
          healthScore: calculateHealthScore(
            membersSnap.size,
            usersSnap.size,
            wallet.balance || 0
          ),
        });

        // Load notes from localStorage (for MVP)
        const savedNotes = localStorage.getItem(`notes_${churchId}`);
        setNotes(savedNotes || '');

        setLoading(false);
      } catch (error) {
        console.error('Error fetching customer:', error);
        setLoading(false);
      }
    }

    fetchCustomer();
  }, [churchId]);

  const calculateHealthScore = (
    members: number,
    users: number,
    balance: number
  ): number => {
    let score = 50;
    if (members > 100) score += 20;
    if (users > 5) score += 20;
    if (balance > 5000) score += 10;
    return Math.min(100, score);
  };

  const handleSaveNote = () => {
    const combined = `${notes}\n[${new Date().toLocaleString()}] ${newNote}`;
    setNotes(combined);
    localStorage.setItem(`notes_${churchId}`, combined);
    setNewNote('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-slate-400">Loading customer...</div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="space-y-6">
        <Link href="/super-admin/customers" className="flex items-center gap-2 text-blue-400 hover:text-blue-300">
          <ArrowLeft className="w-4 h-4" />
          Back to Customers
        </Link>
        <div className="text-slate-400">Customer not found</div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-900/30 text-green-400 border-green-700/50';
      case 'Trial':
        return 'bg-blue-900/30 text-blue-400 border-blue-700/50';
      case 'Suspended':
        return 'bg-red-900/30 text-red-400 border-red-700/50';
      default:
        return 'bg-slate-900/30 text-slate-400 border-slate-700/50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Link
        href="/super-admin/customers"
        className="flex items-center gap-2 text-blue-400 hover:text-blue-300"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Customers
      </Link>

      {/* Customer Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {customer.churchName}
              </h1>
              <div className="flex items-center gap-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(
                    customer.status
                  )}`}
                >
                  {customer.status}
                </span>
                <span className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full text-sm">
                  {customer.plan}
                </span>
                <div className="flex items-center gap-1">
                  <div className="text-xs text-slate-400">Health:</div>
                  <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        customer.healthScore > 80
                          ? 'bg-green-500'
                          : customer.healthScore > 50
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{
                        width: `${customer.healthScore}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-slate-300 ml-2">
                    {customer.healthScore}%
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors" title="Impersonate">
                <LogIn className="w-5 h-5 text-slate-400" />
              </button>
              <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors" title="Delete">
                <Trash2 className="w-5 h-5 text-red-400" />
              </button>
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-6 mt-8 pt-8 border-t border-slate-700">
            <div>
              <p className="text-xs text-slate-400 mb-2">Email</p>
              <p className="text-white font-medium flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-500" />
                {customer.email}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-2">Phone</p>
              <p className="text-white font-medium">{customer.phone}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-2">Joined</p>
              <p className="text-white font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-500" />
                {customer.createdAt.toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-2">Customer Since</p>
              <p className="text-white font-medium">
                {Math.floor(
                  (new Date().getTime() - customer.createdAt.getTime()) /
                    (1000 * 60 * 60 * 24)
                )}{' '}
                days
              </p>
            </div>
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          {/* Members & Users */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-slate-400 mb-4">Usage</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    Members
                  </span>
                  <span className="text-white font-bold">
                    {customer.members}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{
                      width: `${Math.min(100, (customer.members / 500) * 100)}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-green-400" />
                    Active Users
                  </span>
                  <span className="text-white font-bold">
                    {customer.activeUsers}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500"
                    style={{
                      width: `${Math.min(100, (customer.activeUsers / 50) * 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Wallet */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-slate-400 mb-4 flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Wallet
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-400">Current Balance</p>
                <p className="text-2xl font-bold text-white">
                  ₦{customer.walletBalance.toLocaleString()}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-700">
                <div>
                  <p className="text-xs text-slate-400">Total Funded</p>
                  <p className="text-sm font-semibold text-green-400">
                    ₦{customer.totalFunded.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Total Spent</p>
                  <p className="text-sm font-semibold text-red-400">
                    ₦{customer.totalSpent.toLocaleString()}
                  </p>
                </div>
              </div>
              <button className="w-full mt-3 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                Top-up Wallet
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Internal Notes */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4">Internal Notes</h3>

        {notes && (
          <div className="mb-6 p-4 bg-slate-900/50 rounded-lg border border-slate-700 max-h-40 overflow-y-auto">
            <p className="text-sm text-slate-300 whitespace-pre-wrap font-mono text-xs">
              {notes}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a note..."
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-slate-500 resize-none h-20"
          />
          <button
            onClick={handleSaveNote}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Save Note
          </button>
        </div>
      </div>
    </div>
  );
}
