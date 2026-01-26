'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, AlertTriangle, Ban, Flag, Users, TrendingDown, FileWarning, Gavel, Search } from 'lucide-react';

export default function AdminTrustScoreDashboard() {
  const [stats, setStats] = useState({
    totalBuyers: 0,
    highRiskBuyers: 0,
    mediumRiskBuyers: 0,
    lowRiskBuyers: 0,
    activeFlags: 0,
    blacklistedBuyers: 0,
    pendingAppeals: 0,
    recentFlags: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/trust-score/analytics');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <Shield className="w-8 h-8" />
          Trust Score Management
        </h1>
        <p className="text-slate-400 mt-1">Monitor buyer risk levels, manage flags, and review appeals</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users} label="Total Buyers" value={stats.totalBuyers} color="blue" />
        <StatCard icon={AlertTriangle} label="High Risk" value={stats.highRiskBuyers} color="red" />
        <StatCard icon={TrendingDown} label="Medium Risk" value={stats.mediumRiskBuyers} color="yellow" />
        <StatCard icon={Flag} label="Active Flags" value={stats.activeFlags} color="orange" />
        <StatCard icon={Ban} label="Blacklisted" value={stats.blacklistedBuyers} color="gray" />
        <StatCard icon={Gavel} label="Pending Appeals" value={stats.pendingAppeals} color="purple" />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link href="/admin/trust/flags" 
          className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:bg-slate-700 transition-colors">
          <Flag className="w-8 h-8 text-orange-400 mb-4" />
          <h3 className="text-lg font-semibold text-white">Manage Flags</h3>
          <p className="text-slate-400 text-sm mt-1">Review and resolve buyer risk flags</p>
          {stats.activeFlags > 0 && (
            <span className="inline-block mt-3 px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-sm">
              {stats.activeFlags} active
            </span>
          )}
        </Link>

        <Link href="/admin/trust/blacklist"
          className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:bg-slate-700 transition-colors">
          <Ban className="w-8 h-8 text-red-400 mb-4" />
          <h3 className="text-lg font-semibold text-white">Blacklist Management</h3>
          <p className="text-slate-400 text-sm mt-1">Manage blacklisted buyers</p>
          {stats.blacklistedBuyers > 0 && (
            <span className="inline-block mt-3 px-2 py-1 bg-red-500/20 text-red-400 rounded text-sm">
              {stats.blacklistedBuyers} blacklisted
            </span>
          )}
        </Link>

        <Link href="/admin/trust/appeals"
          className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:bg-slate-700 transition-colors">
          <Gavel className="w-8 h-8 text-purple-400 mb-4" />
          <h3 className="text-lg font-semibold text-white">Review Appeals</h3>
          <p className="text-slate-400 text-sm mt-1">Process flag and blacklist appeals</p>
          {stats.pendingAppeals > 0 && (
            <span className="inline-block mt-3 px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-sm">
              {stats.pendingAppeals} pending
            </span>
          )}
        </Link>
      </div>

      {/* Recent Flags */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg">
        <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Recent Flags</h2>
          <Link href="/admin/trust/flags" className="text-blue-400 hover:underline text-sm">View All</Link>
        </div>
        <div className="divide-y divide-slate-700">
          {loading ? (
            <div className="p-6 text-center text-slate-400">Loading...</div>
          ) : stats.recentFlags.length === 0 ? (
            <div className="p-6 text-center text-slate-400">No recent flags</div>
          ) : (
            stats.recentFlags.slice(0, 5).map((flag: any) => (
              <div key={flag.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">{flag.trustScore?.buyer?.companyName || 'Unknown Buyer'}</p>
                  <p className="text-slate-400 text-sm">{flag.flagType.replace(/_/g, ' ')}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    flag.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                    flag.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                    flag.severity === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-slate-600 text-slate-300'
                  }`}>
                    {flag.severity}
                  </span>
                  <span className="text-slate-500 text-sm">
                    {new Date(flag.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500/20 text-blue-400',
    red: 'bg-red-500/20 text-red-400',
    yellow: 'bg-yellow-500/20 text-yellow-400',
    orange: 'bg-orange-500/20 text-orange-400',
    gray: 'bg-slate-600 text-slate-300',
    purple: 'bg-purple-500/20 text-purple-400'
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <div className={`inline-flex p-2 rounded-lg ${colorClasses[color]} mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-slate-400 text-sm">{label}</p>
    </div>
  );
}
