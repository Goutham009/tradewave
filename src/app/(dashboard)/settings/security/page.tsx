'use client';

import { useState } from 'react';
import { Shield, Key, Smartphone, Clock, AlertTriangle, Check, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function SecuritySettingsPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const sessions = [
    { id: '1', device: 'Chrome on MacOS', location: 'Mumbai, India', lastActive: 'Active now', current: true },
    { id: '2', device: 'Safari on iPhone', location: 'Mumbai, India', lastActive: '2 hours ago', current: false },
    { id: '3', device: 'Firefox on Windows', location: 'Delhi, India', lastActive: '3 days ago', current: false },
  ];

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle password change
    alert('Password changed successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Security Settings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account security</p>
        </div>
        <Link href="/settings" className="text-blue-600 hover:underline text-sm">
          ← Back to Settings
        </Link>
      </div>

      <div className="grid gap-6">
        {/* Change Password */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Key className="w-5 h-5 text-blue-600" />
            Change Password
          </h2>
          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwords.current}
                  onChange={(e) => setPasswords(p => ({ ...p, current: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={passwords.new}
                onChange={(e) => setPasswords(p => ({ ...p, new: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwords.confirm}
                onChange={(e) => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Update Password
            </button>
          </form>
        </div>

        {/* Two-Factor Authentication */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">Two-Factor Authentication</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  Add an extra layer of security to your account
                </p>
                {twoFactorEnabled && (
                  <span className="inline-flex items-center gap-1 mt-2 text-green-600 text-sm">
                    <Check className="w-4 h-4" /> Enabled
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
              className={`px-4 py-2 rounded-lg font-medium ${
                twoFactorEnabled
                  ? 'bg-red-100 text-red-600 hover:bg-red-200'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {twoFactorEnabled ? 'Disable' : 'Enable'}
            </button>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-600" />
            Active Sessions
          </h2>
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-lg"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 dark:text-white">{session.device}</p>
                    {session.current && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {session.location} • {session.lastActive}
                  </p>
                </div>
                {!session.current && (
                  <button className="text-red-600 hover:underline text-sm">
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
          <button className="mt-4 text-red-600 hover:underline text-sm flex items-center gap-1">
            <AlertTriangle className="w-4 h-4" />
            Sign out of all other sessions
          </button>
        </div>
      </div>
    </div>
  );
}
