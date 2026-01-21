'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  RefreshCw,
  Users,
  CreditCard,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Activity,
  Package,
  Truck,
  Loader2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

interface Stats {
  users: {
    total: number;
    buyers: number;
    suppliers: number;
    admins: number;
  };
  transactions: {
    total: number;
    active: number;
    completed: number;
    disputed: number;
  };
  financial: {
    totalVolume: number;
    completedVolume: number;
    revenue: number;
    avgTransactionValue: number;
    currency: string;
  };
  requirements: {
    total: number;
    active: number;
  };
  quotations: {
    total: number;
    pending: number;
  };
  shipments: {
    total: number;
    inTransit: number;
    delivered: number;
  };
  activity: {
    last24Hours: number;
  };
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: any;
  trend?: number;
  color?: string;
}

function StatCard({ title, value, subtitle, icon: Icon, trend, color = 'text-slate-400' }: StatCardProps) {
  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-slate-400">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
            {subtitle && (
              <p className="text-xs text-slate-500">{subtitle}</p>
            )}
            {trend !== undefined && (
              <div className={`flex items-center text-xs ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {trend >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                )}
                {Math.abs(trend)}% vs last month
              </div>
            )}
          </div>
          <div className={`h-12 w-12 rounded-full bg-slate-700 flex items-center justify-center ${color}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatCardSkeleton() {
  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 w-24 bg-slate-700 rounded animate-pulse" />
            <div className="h-8 w-32 bg-slate-700 rounded animate-pulse" />
            <div className="h-3 w-20 bg-slate-700 rounded animate-pulse" />
          </div>
          <div className="h-12 w-12 rounded-full bg-slate-700 animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/stats');
      
      if (response.status === 403) {
        setError('Access denied. Admin privileges required.');
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setStats(result.data);
      } else {
        setError(result.error || 'Failed to fetch stats');
      }
    } catch (err) {
      setError('Failed to load dashboard stats. Please try again.');
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  if (error && !stats) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-center text-red-400 gap-2">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
          <div className="flex justify-center mt-4">
            <Button onClick={fetchStats} variant="outline" className="border-slate-600">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Dashboard Overview</h2>
          <p className="text-slate-400 text-sm">Real-time platform statistics</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchStats}
          disabled={loading}
          className="border-slate-600 text-slate-300"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      {loading && !stats ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      ) : stats ? (
        <>
          {/* Primary Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Users"
              value={formatNumber(stats.users.total)}
              subtitle={`${stats.users.buyers} buyers, ${stats.users.suppliers} suppliers`}
              icon={Users}
              color="text-blue-400"
              trend={12}
            />
            <StatCard
              title="Active Transactions"
              value={formatNumber(stats.transactions.active)}
              subtitle={`${stats.transactions.completed} completed`}
              icon={CreditCard}
              color="text-green-400"
              trend={8}
            />
            <StatCard
              title="Total Volume"
              value={formatCurrency(stats.financial.totalVolume, stats.financial.currency)}
              subtitle={`${formatCurrency(stats.financial.completedVolume)} completed`}
              icon={DollarSign}
              color="text-emerald-400"
              trend={15}
            />
            <StatCard
              title="Platform Revenue"
              value={formatCurrency(stats.financial.revenue, stats.financial.currency)}
              subtitle="2.5% transaction fee"
              icon={TrendingUp}
              color="text-purple-400"
              trend={18}
            />
          </div>

          {/* Secondary Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Pending Disputes"
              value={formatNumber(stats.transactions.disputed)}
              subtitle="Requires attention"
              icon={AlertTriangle}
              color="text-red-400"
            />
            <StatCard
              title="Avg Transaction"
              value={formatCurrency(stats.financial.avgTransactionValue, stats.financial.currency)}
              icon={Activity}
              color="text-cyan-400"
            />
            <StatCard
              title="Requirements"
              value={formatNumber(stats.requirements.total)}
              subtitle={`${stats.requirements.active} active`}
              icon={Package}
              color="text-orange-400"
            />
            <StatCard
              title="Shipments"
              value={formatNumber(stats.shipments.total)}
              subtitle={`${stats.shipments.inTransit} in transit`}
              icon={Truck}
              color="text-yellow-400"
            />
          </div>

          {/* Quick Stats Row */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-400">User Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Buyers</span>
                    <span className="text-white font-medium">{stats.users.buyers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Suppliers</span>
                    <span className="text-white font-medium">{stats.users.suppliers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Admins</span>
                    <span className="text-white font-medium">{stats.users.admins}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-400">Transaction Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Total</span>
                    <span className="text-white font-medium">{stats.transactions.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Active</span>
                    <span className="text-yellow-400 font-medium">{stats.transactions.active}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Completed</span>
                    <span className="text-green-400 font-medium">{stats.transactions.completed}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-400">Activity (24h)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-white">{stats.activity.last24Hours}</p>
                    <p className="text-xs text-slate-400">actions recorded</p>
                  </div>
                  <Activity className="h-10 w-10 text-slate-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}
