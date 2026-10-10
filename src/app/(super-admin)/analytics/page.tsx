'use client';

import { BarChart3, TrendingUp, PieChart } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
        <p className="text-slate-400">Platform metrics and insights</p>
      </div>

      {/* Coming Soon */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
        <BarChart3 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Analytics Dashboard</h2>
        <p className="text-slate-400 mb-6">
          Comprehensive platform analytics and business intelligence coming soon
        </p>
        <div className="inline-flex gap-4">
          <div className="text-left">
            <p className="text-sm text-slate-400">Includes:</p>
            <ul className="text-sm text-slate-300 space-y-1 mt-2">
              <li>✓ Revenue metrics (MRR, ARR)</li>
              <li>✓ Customer growth trends</li>
              <li>✓ Feature adoption rates</li>
              <li>✓ Churn analysis</li>
              <li>✓ Custom reports</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Placeholder Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <p className="text-slate-400 text-sm">MRR</p>
          </div>
          <p className="text-3xl font-bold text-white">₦2.15M</p>
          <p className="text-xs text-green-400 mt-2">+15% vs last month</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <PieChart className="w-5 h-5 text-blue-400" />
            <p className="text-slate-400 text-sm">Growth Rate</p>
          </div>
          <p className="text-3xl font-bold text-white">12%</p>
          <p className="text-xs text-blue-400 mt-2">Monthly growth</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-5 h-5 text-yellow-400" />
            <p className="text-slate-400 text-sm">Churn Rate</p>
          </div>
          <p className="text-3xl font-bold text-white">2.1%</p>
          <p className="text-xs text-yellow-400 mt-2">This month</p>
        </div>
      </div>
    </div>
  );
}
