'use client';

import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Users, Eye, Ban, FileText, TrendingUp, Clock } from 'lucide-react';
import Link from 'next/link';

interface RiskOverview {
  riskProfiles: {
    highRisk: number;
    criticalRisk: number;
    monitored: number;
    withRestrictions: number;
  };
  alerts: {
    critical: number;
    high: number;
    medium: number;
    total: number;
  };
  kyb: {
    pendingReview: number;
    expiringSoon: number;
    pendingAppeals: number;
  };
}

interface HighRiskUser {
  id: string;
  overallRiskLevel: string;
  overallRiskScore: number;
  isMonitored: boolean;
  hasRestrictions: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    companyName?: string;
  };
  alerts: {
    id: string;
    alertType: string;
    severity: string;
    message: string;
  }[];
}

export default function AdminRiskDashboardPage() {
  const [overview, setOverview] = useState<RiskOverview | null>(null);
  const [highRiskUsers, setHighRiskUsers] = useState<HighRiskUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/admin/risk');
      const data = await res.json();
      setOverview(data.overview);
      setHighRiskUsers(data.highRiskUsers || []);
    } catch (error) {
      console.error('Failed to fetch risk dashboard:', error);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Risk Management Dashboard</h1>
          <p className="text-slate-400">Monitor risk levels, alerts, and compliance</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 rounded-xl border border-red-500/30 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Critical Risk</p>
              <p className="text-white text-2xl font-bold">{overview?.riskProfiles.criticalRisk || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-xl border border-orange-500/30 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Shield className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">High Risk</p>
              <p className="text-white text-2xl font-bold">{overview?.riskProfiles.highRisk || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-xl border border-yellow-500/30 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <Eye className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Monitored</p>
              <p className="text-white text-2xl font-bold">{overview?.riskProfiles.monitored || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-800 rounded-lg">
              <Ban className="w-6 h-6 text-slate-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Restricted</p>
              <p className="text-white text-2xl font-bold">{overview?.riskProfiles.withRestrictions || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts & KYB Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Active Alerts */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Active Alerts</h2>
            <Link href="/admin/risk/alerts" className="text-blue-400 text-sm hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400"></span>
                <span className="text-slate-300">Critical</span>
              </div>
              <span className="text-white font-semibold">{overview?.alerts.critical || 0}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                <span className="text-slate-300">High</span>
              </div>
              <span className="text-white font-semibold">{overview?.alerts.high || 0}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                <span className="text-slate-300">Medium</span>
              </div>
              <span className="text-white font-semibold">{overview?.alerts.medium || 0}</span>
            </div>
          </div>
        </div>

        {/* KYB Queue */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">KYB Queue</h2>
            <Link href="/admin/kyb/appeals" className="text-blue-400 text-sm hover:underline">
              View Appeals
            </Link>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-slate-300">Pending Review</span>
              </div>
              <span className="text-white font-semibold">{overview?.kyb.pendingReview || 0}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                <span className="text-slate-300">Expiring Soon</span>
              </div>
              <span className="text-white font-semibold">{overview?.kyb.expiringSoon || 0}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                <span className="text-slate-300">Pending Appeals</span>
              </div>
              <span className="text-white font-semibold">{overview?.kyb.pendingAppeals || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* High Risk Users */}
      <div className="bg-slate-900 rounded-xl border border-slate-800">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">High Risk Users</h2>
          <Link href="/admin/risk/monitoring" className="text-blue-400 text-sm hover:underline">
            View Monitored
          </Link>
        </div>
        {highRiskUsers.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            No high-risk users at this time
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left p-4 text-slate-400 font-medium">User</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Risk Level</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Score</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Status</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Alerts</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {highRiskUsers.map((profile) => (
                  <tr key={profile.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                    <td className="p-4">
                      <p className="text-white font-medium">{profile.user.name}</p>
                      <p className="text-slate-400 text-sm">{profile.user.email}</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        profile.overallRiskLevel === 'CRITICAL'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-orange-500/20 text-orange-400'
                      }`}>
                        {profile.overallRiskLevel}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-white font-semibold">{profile.overallRiskScore}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {profile.isMonitored && (
                          <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded">
                            Monitored
                          </span>
                        )}
                        {profile.hasRestrictions && (
                          <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded">
                            Restricted
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-slate-300">
                      {profile.alerts.length}
                    </td>
                    <td className="p-4">
                      <Link
                        href={`/admin/users/${profile.user.id}`}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 text-sm"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/risk/alerts"
          className="bg-slate-900 rounded-xl border border-slate-800 p-6 hover:border-slate-700 transition-colors"
        >
          <AlertTriangle className="w-8 h-8 text-yellow-400 mb-3" />
          <h3 className="text-white font-semibold">Manage Alerts</h3>
          <p className="text-slate-400 text-sm">Review and acknowledge risk alerts</p>
        </Link>

        <Link
          href="/admin/risk/monitoring"
          className="bg-slate-900 rounded-xl border border-slate-800 p-6 hover:border-slate-700 transition-colors"
        >
          <Eye className="w-8 h-8 text-blue-400 mb-3" />
          <h3 className="text-white font-semibold">Monitoring</h3>
          <p className="text-slate-400 text-sm">View and manage monitored users</p>
        </Link>

        <Link
          href="/admin/kyb/appeals"
          className="bg-slate-900 rounded-xl border border-slate-800 p-6 hover:border-slate-700 transition-colors"
        >
          <FileText className="w-8 h-8 text-purple-400 mb-3" />
          <h3 className="text-white font-semibold">KYB Appeals</h3>
          <p className="text-slate-400 text-sm">Process KYB appeal requests</p>
        </Link>
      </div>
    </div>
  );
}
