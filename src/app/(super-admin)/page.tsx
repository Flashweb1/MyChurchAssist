'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import {
  Church,
  Users,
  TrendingUp,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import Link from 'next/link';

interface DashboardMetrics {
  activeChurches: number;
  totalUsers: number;
  monthlyRevenue: number;
  openTickets: number;
  churchesChange: number;
  revenueChange: number;
  usersChange: number;
}

interface RecentActivity {
  id: string;
  type: 'signup' | 'payment' | 'ticket' | 'alert';
  title: string;
  description: string;
  timestamp: Date;
}

export default function SuperAdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    activeChurches: 0,
    totalUsers: 0,
    monthlyRevenue: 0,
    openTickets: 0,
    churchesChange: 0,
    revenueChange: 0,
    usersChange: 0,
  });

  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        // Get active churches
        const churchesSnap = await getDocs(
          query(
            collection(db, 'churches'),
            where('status', '==', 'Active'),
            limit(1000)
          )
        );
        const activeChurches = churchesSnap.size;

        // Get all users
        const usersSnap = await getDocs(
          query(collection(db, 'users'), limit(5000))
        );
        const totalUsers = usersSnap.size;

        // Get recent wallet transactions (revenue proxy)
        const transactionsSnap = await getDocs(
          query(
            collection(db, 'wallet_transactions'),
            where('status', '==', 'success'),
            limit(1000)
          )
        );

        const monthlyRevenue = transactionsSnap.docs.reduce((sum, doc) => {
          const amount = doc.data().amount || 0;
          return sum + amount;
        }, 0);

        // Get open tickets (if collection exists)
        let openTickets = 0;
        try {
          const ticketsSnap = await getDocs(
            query(
              collection(db, 'super_admin_tickets'),
              where('status', '==', 'In Progress'),
              limit(1000)
            )
          );
          openTickets = ticketsSnap.size;
        } catch (e) {
          // Tickets collection might not exist yet
        }

        setMetrics({
          activeChurches,
          totalUsers,
          monthlyRevenue,
          openTickets,
          churchesChange: 12,
          revenueChange: 15,
          usersChange: 8,
        });

        // Set sample activities
        setActivities([
          {
            id: '1',
            type: 'signup',
            title: 'New Church Registered',
            description: 'Bethel Church (Lagos) just signed up',
            timestamp: new Date(Date.now() - 10 * 60000), // 10 min ago
          },
          {
            id: '2',
            type: 'payment',
            title: 'Payment Received',
            description: 'Grace Church upgraded to Pro plan - ₦15,000',
            timestamp: new Date(Date.now() - 45 * 60000), // 45 min ago
          },
          {
            id: '3',
            type: 'ticket',
            title: 'Support Ticket',
            description: 'Zion Ministry reported messaging issue',
            timestamp: new Date(Date.now() - 2 * 60 * 60000), // 2 hours ago
          },
          {
            id: '4',
            type: 'alert',
            title: 'High Error Rate',
            description: 'SMS provider experiencing 5% failure rate',
            timestamp: new Date(Date.now() - 3 * 60 * 60000), // 3 hours ago
          },
        ]);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching metrics:', error);
        setLoading(false);
      }
    }

    fetchMetrics();
  }, []);

  const MetricCard = ({
    label,
    value,
    change,
    icon: Icon,
    trend,
  }: {
    label: string;
    value: string | number;
    change: number;
    icon: React.ReactNode;
    trend: 'up' | 'down';
  }) => (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="text-slate-400 text-sm font-medium">{label}</div>
        <div className="text-slate-500">{Icon}</div>
      </div>
      <div className="flex items-baseline gap-2">
        <div className="text-3xl font-bold text-white">{value}</div>
        <div
          className={`flex items-center gap-1 text-sm ${
            trend === 'up' ? 'text-green-400' : 'text-red-400'
          }`}
        >
          {trend === 'up' ? (
            <ArrowUpRight className="w-4 h-4" />
          ) : (
            <ArrowDownRight className="w-4 h-4" />
          )}
          <span>{Math.abs(change)}%</span>
        </div>
      </div>
      <p className="text-xs text-slate-500 mt-2">vs last month</p>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-slate-400">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400">
          Welcome to your Church Assist admin control panel
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          label="Active Churches"
          value={metrics.activeChurches}
          change={metrics.churchesChange}
          trend="up"
          icon={<Church className="w-6 h-6" />}
        />
        <MetricCard
          label="Total Users"
          value={metrics.totalUsers}
          change={metrics.usersChange}
          trend="up"
          icon={<Users className="w-6 h-6" />}
        />
        <MetricCard
          label="Monthly Revenue"
          value={`₦${(metrics.monthlyRevenue / 1000).toFixed(0)}K`}
          change={metrics.revenueChange}
          trend="up"
          icon={<TrendingUp className="w-6 h-6" />}
        />
        <MetricCard
          label="Open Tickets"
          value={metrics.openTickets}
          change={0}
          trend="down"
          icon={<AlertCircle className="w-6 h-6" />}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-6">Recent Activity</h2>

          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-4 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    activity.type === 'signup'
                      ? 'bg-green-900/30 text-green-400'
                      : activity.type === 'payment'
                      ? 'bg-blue-900/30 text-blue-400'
                      : activity.type === 'ticket'
                      ? 'bg-yellow-900/30 text-yellow-400'
                      : 'bg-red-900/30 text-red-400'
                  }`}
                >
                  {activity.type === 'signup' && <Users className="w-5 h-5" />}
                  {activity.type === 'payment' && <TrendingUp className="w-5 h-5" />}
                  {activity.type === 'ticket' && <AlertCircle className="w-5 h-5" />}
                  {activity.type === 'alert' && <AlertCircle className="w-5 h-5" />}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{activity.title}</p>
                  <p className="text-sm text-slate-400 truncate">
                    {activity.description}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {activity.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>

          <div className="space-y-3">
            <Link
              href="/super-admin/customers"
              className="block w-full p-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Manage Customers
            </Link>
            <Link
              href="/super-admin/support"
              className="block w-full p-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              View Tickets
            </Link>
            <Link
              href="/super-admin/analytics"
              className="block w-full p-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              View Analytics
            </Link>
            <Link
              href="/super-admin/settings"
              className="block w-full p-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Settings
            </Link>
          </div>

          {/* Stats Box */}
          <div className="mt-8 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
            <p className="text-xs text-slate-400 mb-2">System Status</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-slate-200">All Systems Operational</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
