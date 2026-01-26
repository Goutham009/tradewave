'use client';

import { useState, useEffect } from 'react';
import { 
  Shield, Smartphone, Mail, Key, Users, 
  CheckCircle, XCircle, Clock, RefreshCw
} from 'lucide-react';

interface MFAStats {
  totalUsers: number;
  mfaEnabled: number;
  totpEnabled: number;
  smsEnabled: number;
  emailEnabled: number;
  recentEnablements: {
    id: string;
    userId: string;
    isMFAEnabled: boolean;
    totpEnabled: boolean;
    smsEnabled: boolean;
    emailEnabled: boolean;
    lastVerifiedAt?: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  }[];
}

export default function AdminMFAPage() {
  const [stats, setStats] = useState<MFAStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/security/mfa');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch MFA stats:', error);
      // Set mock data for demo
      setStats({
        totalUsers: 1250,
        mfaEnabled: 890,
        totpEnabled: 650,
        smsEnabled: 180,
        emailEnabled: 890,
        recentEnablements: []
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const mfaRate = stats ? ((stats.mfaEnabled / stats.totalUsers) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">MFA Management</h1>
          <p className="text-slate-400">Multi-factor authentication overview</p>
        </div>
        <button
          onClick={fetchStats}
          className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* MFA Adoption */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">MFA Adoption Rate</h3>
        <div className="flex items-center gap-6">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                className="text-slate-800"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                strokeDasharray={352}
                strokeDashoffset={352 - (352 * Number(mfaRate)) / 100}
                className="text-green-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{mfaRate}%</span>
            </div>
          </div>
          <div>
            <p className="text-slate-400">
              <span className="text-white font-semibold">{stats?.mfaEnabled || 0}</span> of{' '}
              <span className="text-white font-semibold">{stats?.totalUsers || 0}</span> users have MFA enabled
            </p>
            <p className="text-slate-500 text-sm mt-1">
              {stats?.totalUsers ? stats.totalUsers - stats.mfaEnabled : 0} users without MFA protection
            </p>
          </div>
        </div>
      </div>

      {/* MFA Methods */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Key className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">TOTP (Authenticator)</p>
              <p className="text-white text-2xl font-bold">{stats?.totpEnabled || 0}</p>
            </div>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2">
            <div
              className="bg-purple-500 h-2 rounded-full"
              style={{ width: `${stats ? (stats.totpEnabled / stats.totalUsers * 100) : 0}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Smartphone className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">SMS</p>
              <p className="text-white text-2xl font-bold">{stats?.smsEnabled || 0}</p>
            </div>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: `${stats ? (stats.smsEnabled / stats.totalUsers * 100) : 0}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Mail className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Email</p>
              <p className="text-white text-2xl font-bold">{stats?.emailEnabled || 0}</p>
            </div>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full"
              style={{ width: `${stats ? (stats.emailEnabled / stats.totalUsers * 100) : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Recent MFA Changes */}
      <div className="bg-slate-900 rounded-xl border border-slate-800">
        <div className="p-4 border-b border-slate-800">
          <h3 className="text-lg font-semibold text-white">Recent MFA Changes</h3>
        </div>
        {!stats?.recentEnablements?.length ? (
          <div className="p-8 text-center text-slate-400">
            <Shield className="w-12 h-12 mx-auto mb-4 text-slate-500" />
            <p>No recent MFA changes</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left p-4 text-slate-400 font-medium">User</th>
                  <th className="text-left p-4 text-slate-400 font-medium">MFA Status</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Methods</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Last Verified</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentEnablements.map((mfa) => (
                  <tr key={mfa.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                    <td className="p-4">
                      <p className="text-white">{mfa.user.name}</p>
                      <p className="text-slate-400 text-sm">{mfa.user.email}</p>
                    </td>
                    <td className="p-4">
                      {mfa.isMFAEnabled ? (
                        <span className="flex items-center gap-2 text-green-400">
                          <CheckCircle className="w-4 h-4" /> Enabled
                        </span>
                      ) : (
                        <span className="flex items-center gap-2 text-red-400">
                          <XCircle className="w-4 h-4" /> Disabled
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {mfa.totpEnabled && (
                          <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded">TOTP</span>
                        )}
                        {mfa.smsEnabled && (
                          <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">SMS</span>
                        )}
                        {mfa.emailEnabled && (
                          <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">Email</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-slate-300">
                      {mfa.lastVerifiedAt 
                        ? new Date(mfa.lastVerifiedAt).toLocaleDateString()
                        : 'Never'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Security Recommendations */}
      <div className="bg-slate-900 rounded-xl border border-yellow-500/30 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-yellow-400" />
          Security Recommendations
        </h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
            <div>
              <p className="text-white">Encourage TOTP over SMS</p>
              <p className="text-slate-400 text-sm">TOTP is more secure than SMS-based authentication</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-yellow-400 mt-0.5" />
            <div>
              <p className="text-white">Require MFA for admin accounts</p>
              <p className="text-slate-400 text-sm">All administrator accounts should have MFA enabled</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <Users className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <p className="text-white">Send reminders to users without MFA</p>
              <p className="text-slate-400 text-sm">
                {stats?.totalUsers ? stats.totalUsers - stats.mfaEnabled : 0} users need MFA setup
              </p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}
