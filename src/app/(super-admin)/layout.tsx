'use client';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is super_admin
    if (user && (user as any).role !== 'super_admin') {
      router.push('/dashboard');
    } else if (!user) {
      router.push('/login');
    } else {
      setLoading(false);
    }
  }, [user, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const navItems = [
    {
      label: 'Dashboard',
      href: '/super-admin',
      icon: LayoutDashboard,
    },
    {
      label: 'Customers',
      href: '/super-admin/customers',
      icon: Users,
    },
    {
      label: 'Support',
      href: '/super-admin/support',
      icon: MessageSquare,
    },
    {
      label: 'Analytics',
      href: '/super-admin/analytics',
      icon: BarChart3,
    },
    {
      label: 'Settings',
      href: '/super-admin/settings',
      icon: Settings,
    },
  ];

  return (
    <div className="flex h-screen bg-slate-950">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-slate-900 text-slate-100 transition-all duration-300 flex flex-col border-r border-slate-800`}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          {sidebarOpen && (
            <div>
              <h1 className="text-xl font-bold text-white">Church Assist</h1>
              <p className="text-xs text-slate-400 mt-1">Super Admin</p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 hover:bg-slate-800 rounded-lg"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors group"
                title={!sidebarOpen ? item.label : ''}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="text-sm">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => {
              // Handle logout
              router.push('/login');
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            title={!sidebarOpen ? 'Logout' : ''}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm">Logout</span>}
          </button>
          {sidebarOpen && (
            <div className="mt-4 p-3 bg-slate-800 rounded-lg text-xs text-slate-400">
              <p className="font-medium text-slate-200">{user?.displayName}</p>
              <p className="truncate">{user?.email}</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="h-16 bg-slate-900 border-b border-slate-800 flex items-center px-8">
          <div className="text-slate-400 text-sm">
            Welcome back, <span className="font-semibold text-white">{user?.displayName}</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-slate-950 p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
