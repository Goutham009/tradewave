'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, 
  AlertTriangle, ArrowUpRight, ArrowDownRight, BarChart3, Activity
} from 'lucide-react';

interface OverviewData {
  totalTransactions: number;
  recentTransactions: number;
  transactionGrowth: number;
  totalRevenue: number;
  weeklyRevenue: number;
  totalUsers: number;
  newUsersThisWeek: number;
  sellerCount: number;
  buyerCount: number;
  totalDisputes: number;
  openDisputes: number;
  successRate: number;
}

interface DailyMetric {
  date: string;
  count: number;
  volume: number;
}

export default function AnalyticsDashboardPage() {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [trends, setTrends] = useState<{ transactions: DailyMetric[] }>({ transactions: [] });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`/api/analytics/dashboard/overview?period=${period}`);
      const data = await res.json();
      setOverview(data.overview);
      setTrends(data.trends || { transactions: [] });
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
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
          <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
          <p className="text-slate-400">Platform performance metrics and trends</p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-white mt-1">
                {formatCurrency(overview?.totalRevenue || 0)}
              </p>
            </div>
            <div className="p-3 bg-green-500/20 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-400" />
            </div>
          </div>
          <div className="flex items-center mt-3 text-sm">
            <span className="text-green-400 flex items-center">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              {formatCurrency(overview?.weeklyRevenue || 0)}
            </span>
            <span className="text-slate-500 ml-2">this week</span>
          </div>
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Transactions</p>
              <p className="text-2xl font-bold text-white mt-1">
                {formatNumber(overview?.totalTransactions || 0)}
              </p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <div className="flex items-center mt-3 text-sm">
            {overview?.transactionGrowth && overview.transactionGrowth > 0 ? (
              <span className="text-green-400 flex items-center">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                +{overview.transactionGrowth}%
              </span>
            ) : (
              <span className="text-red-400 flex items-center">
                <ArrowDownRight className="w-4 h-4 mr-1" />
                {overview?.transactionGrowth}%
              </span>
            )}
            <span className="text-slate-500 ml-2">vs last week</span>
          </div>
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Users</p>
              <p className="text-2xl font-bold text-white mt-1">
                {formatNumber(overview?.totalUsers || 0)}
              </p>
            </div>
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <div className="flex items-center mt-3 text-sm">
            <span className="text-green-400 flex items-center">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              +{overview?.newUsersThisWeek || 0}
            </span>
            <span className="text-slate-500 ml-2">new this week</span>
          </div>
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Success Rate</p>
              <p className="text-2xl font-bold text-white mt-1">
                {overview?.successRate || 0}%
              </p>
            </div>
            <div className="p-3 bg-emerald-500/20 rounded-lg">
              <Activity className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <div className="flex items-center mt-3 text-sm">
            <span className="text-slate-400">{overview?.openDisputes || 0} open disputes</span>
          </div>
        </div>
      </div>

      {/* User Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">User Distribution</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400">Sellers</span>
                <span className="text-white font-semibold">{overview?.sellerCount || 0}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{
                    width: `${overview?.totalUsers ? (overview.sellerCount / overview.totalUsers * 100) : 0}%`
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400">Buyers</span>
                <span className="text-white font-semibold">{overview?.buyerCount || 0}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full"
                  style={{
                    width: `${overview?.totalUsers ? (overview.buyerCount / overview.totalUsers * 100) : 0}%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Dispute Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800 rounded-lg p-4">
              <p className="text-slate-400 text-sm">Total Disputes</p>
              <p className="text-2xl font-bold text-white">{overview?.totalDisputes || 0}</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <p className="text-slate-400 text-sm">Open Disputes</p>
              <p className="text-2xl font-bold text-yellow-400">{overview?.openDisputes || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Trend */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Transaction Trend</h3>
        <div className="h-64 flex items-end justify-between gap-1">
          {trends.transactions.slice(-30).map((day, idx) => {
            const maxVolume = Math.max(...trends.transactions.map(d => Number(d.volume) || 1));
            const height = (Number(day.volume) / maxVolume * 100) || 5;
            return (
              <div
                key={idx}
                className="flex-1 bg-blue-500 rounded-t hover:bg-blue-400 transition-colors"
                style={{ height: `${height}%` }}
                title={`${new Date(day.date).toLocaleDateString()}: ${formatCurrency(Number(day.volume))}`}
              />
            );
          })}
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-500">
          <span>30 days ago</span>
          <span>Today</span>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a
          href="/admin/analytics/transactions"
          className="bg-slate-900 rounded-xl border border-slate-800 p-6 hover:border-slate-700 transition-colors"
        >
          <BarChart3 className="w-8 h-8 text-blue-400 mb-3" />
          <h3 className="text-white font-semibold">Transaction Analytics</h3>
          <p className="text-slate-400 text-sm">Detailed transaction metrics</p>
        </a>
        <a
          href="/admin/analytics/users"
          className="bg-slate-900 rounded-xl border border-slate-800 p-6 hover:border-slate-700 transition-colors"
        >
          <Users className="w-8 h-8 text-purple-400 mb-3" />
          <h3 className="text-white font-semibold">User Growth</h3>
          <p className="text-slate-400 text-sm">User acquisition and retention</p>
        </a>
        <a
          href="/admin/fraud"
          className="bg-slate-900 rounded-xl border border-slate-800 p-6 hover:border-slate-700 transition-colors"
        >
          <AlertTriangle className="w-8 h-8 text-yellow-400 mb-3" />
          <h3 className="text-white font-semibold">Fraud Detection</h3>
          <p className="text-slate-400 text-sm">Monitor suspicious activity</p>
        </a>
      </div>
    </div>
  );
}
