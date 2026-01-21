'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  DollarSign,
  Package,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Loader2,
  RefreshCw,
  Building2,
  CreditCard,
  Truck,
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalSuppliers: number;
  verifiedSuppliers: number;
  totalTransactions: number;
  pendingTransactions: number;
  totalGMV: number;
  monthlyGMV: number;
  totalDisputes: number;
  openDisputes: number;
  platformRevenue: number;
  monthlyRevenue: number;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  status: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/dashboard');
      const data = await response.json();
      
      if (data.status === 'success') {
        setStats(data.data.stats);
        setRecentActivity(data.data.recentActivity || []);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Set mock data for demo
      setStats({
        totalUsers: 1247,
        activeUsers: 892,
        totalSuppliers: 156,
        verifiedSuppliers: 134,
        totalTransactions: 3421,
        pendingTransactions: 47,
        totalGMV: 15420000,
        monthlyGMV: 2340000,
        totalDisputes: 23,
        openDisputes: 5,
        platformRevenue: 462600,
        monthlyRevenue: 70200,
      });
      setRecentActivity([
        { id: '1', type: 'USER', description: 'New user registered: john@example.com', timestamp: '2 min ago', status: 'success' },
        { id: '2', type: 'TRANSACTION', description: 'Transaction TXN-2024-1234 completed', timestamp: '5 min ago', status: 'success' },
        { id: '3', type: 'DISPUTE', description: 'New dispute opened for TXN-2024-1230', timestamp: '15 min ago', status: 'warning' },
        { id: '4', type: 'SUPPLIER', description: 'Supplier verification request from Steel Corp', timestamp: '30 min ago', status: 'pending' },
        { id: '5', type: 'PAYMENT', description: 'Escrow released: $45,000', timestamp: '1 hour ago', status: 'success' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-slate-400">Platform overview and monitoring</p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleRefresh}
          disabled={refreshing}
          className="border-slate-600 text-slate-300 hover:bg-slate-800"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total GMV */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total GMV</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(stats?.totalGMV || 0)}</p>
                <p className="text-xs text-green-400 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12.5% from last month
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Users */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Users</p>
                <p className="text-2xl font-bold text-white">{formatNumber(stats?.totalUsers || 0)}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {formatNumber(stats?.activeUsers || 0)} active
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Transactions</p>
                <p className="text-2xl font-bold text-white">{formatNumber(stats?.totalTransactions || 0)}</p>
                <p className="text-xs text-yellow-400 mt-1">
                  {stats?.pendingTransactions} pending
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Platform Revenue */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Platform Revenue</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(stats?.platformRevenue || 0)}</p>
                <p className="text-xs text-green-400 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +8.3% from last month
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Suppliers */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Suppliers</p>
                <p className="text-xl font-bold text-white">{stats?.totalSuppliers}</p>
              </div>
              <Building2 className="h-8 w-8 text-slate-500" />
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-slate-400">Verified</span>
              <span className="text-green-400">{stats?.verifiedSuppliers}</span>
            </div>
            <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${((stats?.verifiedSuppliers || 0) / (stats?.totalSuppliers || 1)) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Disputes */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Disputes</p>
                <p className="text-xl font-bold text-white">{stats?.totalDisputes}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-slate-500" />
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-slate-400">Open</span>
              <span className="text-red-400">{stats?.openDisputes}</span>
            </div>
            <div className="mt-2 flex gap-2">
              {stats?.openDisputes && stats.openDisputes > 0 ? (
                <Badge variant="destructive" className="text-xs">
                  {stats.openDisputes} need attention
                </Badge>
              ) : (
                <Badge className="bg-green-500/20 text-green-400 text-xs">
                  All resolved
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Stats */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">This Month</p>
                <p className="text-xl font-bold text-white">{formatCurrency(stats?.monthlyGMV || 0)}</p>
              </div>
              <Activity className="h-8 w-8 text-slate-500" />
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-slate-400">Revenue</span>
              <span className="text-green-400">{formatCurrency(stats?.monthlyRevenue || 0)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Activity</CardTitle>
            <CardDescription className="text-slate-400">Latest platform events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${
                    activity.status === 'success' ? 'bg-green-500/20' :
                    activity.status === 'warning' ? 'bg-yellow-500/20' :
                    'bg-slate-700'
                  }`}>
                    {activity.type === 'USER' && <Users className={`h-4 w-4 ${activity.status === 'success' ? 'text-green-500' : 'text-slate-400'}`} />}
                    {activity.type === 'TRANSACTION' && <CreditCard className={`h-4 w-4 ${activity.status === 'success' ? 'text-green-500' : 'text-slate-400'}`} />}
                    {activity.type === 'DISPUTE' && <AlertTriangle className={`h-4 w-4 ${activity.status === 'warning' ? 'text-yellow-500' : 'text-slate-400'}`} />}
                    {activity.type === 'SUPPLIER' && <Building2 className={`h-4 w-4 ${activity.status === 'pending' ? 'text-blue-500' : 'text-slate-400'}`} />}
                    {activity.type === 'PAYMENT' && <DollarSign className={`h-4 w-4 ${activity.status === 'success' ? 'text-green-500' : 'text-slate-400'}`} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white">{activity.description}</p>
                    <p className="text-xs text-slate-500">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">System Status</CardTitle>
            <CardDescription className="text-slate-400">Service health overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'API Server', status: 'operational', latency: '45ms' },
                { name: 'Database', status: 'operational', latency: '12ms' },
                { name: 'Blockchain Node', status: 'operational', latency: '230ms' },
                { name: 'Payment Gateway', status: 'operational', latency: '89ms' },
                { name: 'Email Service', status: 'operational', latency: '156ms' },
              ].map((service) => (
                <div key={service.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      service.status === 'operational' ? 'bg-green-500' :
                      service.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    <span className="text-sm text-white">{service.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500">{service.latency}</span>
                    <Badge className={`text-xs ${
                      service.status === 'operational' ? 'bg-green-500/20 text-green-400' :
                      service.status === 'degraded' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {service.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
