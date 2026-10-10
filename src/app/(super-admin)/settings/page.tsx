'use client';

import { Settings, Save } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-slate-400">Manage platform configuration</p>
      </div>

      {/* Coming Soon */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
        <Settings className="w-16 h-16 text-slate-600 mx-auto mb-4 animate-spin" />
        <h2 className="text-2xl font-bold text-white mb-2">Settings & Configuration</h2>
        <p className="text-slate-400 mb-6">
          Platform settings and integration management coming soon
        </p>
        <div className="inline-flex gap-4">
          <div className="text-left">
            <p className="text-sm text-slate-400">Coming Features:</p>
            <ul className="text-sm text-slate-300 space-y-1 mt-2">
              <li>✓ Subscription tier management</li>
              <li>✓ Integration settings</li>
              <li>✓ Email template customization</li>
              <li>✓ Security & access control</li>
              <li>✓ Notification preferences</li>
              <li>✓ API configuration</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Sample Settings Section */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-6">General Settings</h3>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Platform Name
            </label>
            <input
              type="text"
              value="Church Assist"
              readOnly
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Support Email
            </label>
            <input
              type="email"
              value="support@churchassist.com"
              readOnly
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Support Phone
            </label>
            <input
              type="tel"
              value="+234 XXX XXXX XXX"
              readOnly
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            />
          </div>

          <div className="pt-4 border-t border-slate-700">
            <button
              disabled
              className="flex items-center gap-2 px-6 py-2 bg-slate-700 text-slate-500 rounded-lg font-medium"
            >
              <Save className="w-4 h-4" />
              Save Changes (Coming Soon)
            </button>
          </div>
        </div>
      </div>

      {/* Subscription Tiers */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-6">Subscription Tiers</h3>

        <div className="space-y-4">
          {['Free', 'Pro', 'Business'].map((tier) => (
            <div
              key={tier}
              className="p-4 bg-slate-700/50 border border-slate-600 rounded-lg flex items-center justify-between"
            >
              <div>
                <p className="font-semibold text-white">{tier} Plan</p>
                <p className="text-sm text-slate-400">Configure pricing and features</p>
              </div>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                Edit
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
