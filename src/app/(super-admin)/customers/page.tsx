'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';
import {
  Search,
  Filter,
  MoreVertical,
  Eye,
  BarChart3,
  LogIn,
  Trash2,
} from 'lucide-react';

interface Customer {
  id: string;
  churchName: string;
  email: string;
  plan: string;
  status: 'Active' | 'Trial' | 'Suspended' | 'Churned';
  members: number;
  activeUsers: number;
  monthlySpend: number;
  createdAt: Date;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  useEffect(() => {
    async function fetchCustomers() {
      try {
        const churchesSnap = await getDocs(collection(db, 'churches'));

        const customersList: Customer[] = [];

        for (const churchDoc of churchesSnap.docs) {
          const churchData = churchDoc.data();

          // Get member count
          const membersSnap = await getDocs(
            query(
              collection(db, 'members'),
              where('churchId', '==', churchDoc.id)
            )
          );

          // Get user count
          const usersSnap = await getDocs(
            query(
              collection(db, 'users'),
              where('churchId', '==', churchDoc.id)
            )
          );

          // Get wallet balance
          const walletSnap = await getDoc(
            doc(db, 'wallets', churchDoc.id)
          );

          const wallet = walletSnap.exists() ? walletSnap.data() : {};

          customersList.push({
            id: churchDoc.id,
            churchName: churchData.churchName || 'Unnamed Church',
            email: churchData.email || 'N/A',
            plan: churchData.plan || 'Free',
            status: churchData.status || 'Active',
            members: membersSnap.size,
            activeUsers: usersSnap.size,
            monthlySpend: wallet.monthlySpend || 0,
            createdAt: churchData.createdAt?.toDate() || new Date(),
          });
        }

        // Filter and sort
        let filtered = customersList;
        if (filterStatus !== 'All') {
          filtered = filtered.filter((c) => c.status === filterStatus);
        }
        if (search) {
          filtered = filtered.filter(
            (c) =>
              c.churchName.toLowerCase().includes(search.toLowerCase()) ||
              c.email.toLowerCase().includes(search.toLowerCase())
          );
        }

        filtered.sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
        );

        setCustomers(filtered);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching customers:', error);
        setLoading(false);
      }
    }

    fetchCustomers();
  }, []);

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-900/30 text-green-400 border-green-700/50';
      case 'Trial':
        return 'bg-blue-900/30 text-blue-400 border-blue-700/50';
      case 'Suspended':
        return 'bg-red-900/30 text-red-400 border-red-700/50';
      case 'Churned':
        return 'bg-gray-900/30 text-gray-400 border-gray-700/50';
      default:
        return 'bg-slate-900/30 text-slate-400 border-slate-700/50';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-slate-400">Loading customers...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Customers</h1>
        <p className="text-slate-400">Manage all churches using Church Assist</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-72 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by church name or email..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-slate-600"
          />
        </div>

        <div className="flex gap-2">
          {['All', 'Active', 'Trial', 'Suspended', 'Churned'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
        {customers.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            No customers found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900/50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                    Church Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                    Plan
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                    Members
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                    Users
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                    Monthly Spend
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-white">
                          {customer.churchName}
                        </p>
                        <p className="text-sm text-slate-400">
                          {customer.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full text-sm">
                        {customer.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(
                          customer.status
                        )}`}
                      >
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white">
                      {customer.members}
                    </td>
                    <td className="px-6 py-4 text-white">
                      {customer.activeUsers}
                    </td>
                    <td className="px-6 py-4 text-white">
                      ₦{customer.monthlySpend.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/super-admin/customers/${customer.id}`}
                          className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-slate-400" />
                        </Link>
                        <button
                          className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
                          title="Impersonate"
                        >
                          <LogIn className="w-4 h-4 text-slate-400" />
                        </button>
                        <button
                          className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
                          title="More Options"
                        >
                          <MoreVertical className="w-4 h-4 text-slate-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <p className="text-slate-400 text-sm">
          Total Customers: <span className="text-white font-semibold">{customers.length}</span>
        </p>
      </div>
    </div>
  );
}
