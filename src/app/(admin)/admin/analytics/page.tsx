'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Package,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  RefreshCw,
  Calendar,
  Building2,
  BarChart3,
  Activity,
  LineChart,
} from 'lucide-react';
import { OperationsAnalyticsDashboard } from '@/components/admin/OperationsAnalyticsDashboard';
import { BIDashboard } from '@/components/admin/BIDashboard';

interface AnalyticsData {
  gmv: { current: number; previous: number; change: number };
  revenue: { current: number; previous: number; change: number };
  transactions: { current: number; previous: number; change: number };
  users: { current: number; previous: number; change: number };
  suppliers: { current: number; previous: number; change: number };
  avgOrderValue: { current: number; previous: number; change: number };
  conversionRate: { current: number; previous: number; change: number };
  repeatRate: { current: number; previous: number; change: number };
}

interface TopItem {
  name: string;
  value: number;
  change: number;
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [topSuppliers, setTopSuppliers] = useState<TopItem[]>([]);
  const [topCategories, setTopCategories] = useState<TopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [activeTab, setActiveTab] = useState('overview');

  const dateRange = useMemo(() => {
    const endDate = new Date();
    const startDate = new Date();
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }
    return { startDate, endDate };
  }, [period]);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      // In production, this would fetch from API
      // Mock data for demo
      setAnalytics({
        gmv: { current: 2340000, previous: 2080000, change: 12.5 },
        revenue: { current: 70200, previous: 62400, change: 12.5 },
        transactions: { current: 342, previous: 298, change: 14.8 },
        users: { current: 156, previous: 134, change: 16.4 },
        suppliers: { current: 23, previous: 19, change: 21.1 },
        avgOrderValue: { current: 6842, previous: 6980, change: -2.0 },
        conversionRate: { current: 3.2, previous: 2.9, change: 10.3 },
        repeatRate: { current: 42, previous: 38, change: 10.5 },
      });

      setTopSuppliers([
        { name: 'Steel Industries Ltd', value: 450000, change: 15.2 },
        { name: 'Global Metals Corp', value: 380000, change: 8.7 },
        { name: 'Electronics Hub', value: 320000, change: 22.4 },
        { name: 'Plastics International', value: 275000, change: -3.2 },
        { name: 'Chemical Solutions', value: 220000, change: 11.8 },
      ]);

      setTopCategories([
        { name: 'Steel & Metals', value: 680000, change: 18.5 },
        { name: 'Electronics', value: 520000, change: 25.3 },
        { name: 'Plastics', value: 340000, change: 5.2 },
        { name: 'Chemicals', value: 290000, change: 12.1 },
        { name: 'Textiles', value: 180000, change: -8.4 },
      ]);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const renderChange = (change: number) => {
    const isPositive = change >= 0;
    return (
      <span className={`flex items-center text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
        {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
        {Math.abs(change)}%
      </span>
    );
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
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-slate-400">Platform performance and insights</p>
        </div>
        <div className="flex items-center gap-2">
          {(['7d', '30d', '90d', '1y'] as const).map((p) => (
            <Button
              key={p}
              variant={period === p ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod(p)}
              className={period === p ? 'bg-red-600' : 'border-slate-600 text-slate-300'}
            >
              {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : p === '90d' ? '90 Days' : '1 Year'}
            </Button>
          ))}
        </div>
      </div>

      {/* Tabs for different analytics views */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-800 border border-slate-700">
          <TabsTrigger value="overview" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400">
            <BarChart3 className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="operations" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400">
            <Activity className="w-4 h-4 mr-2" />
            Operations Analytics
          </TabsTrigger>
          <TabsTrigger value="bi" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400">
            <LineChart className="w-4 h-4 mr-2" />
            Business Intelligence
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* GMV */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Gross Merchandise Value</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {formatCurrency(analytics?.gmv.current || 0)}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {renderChange(analytics?.gmv.change || 0)}
                  <span className="text-xs text-slate-500">vs prev period</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Platform Revenue</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {formatCurrency(analytics?.revenue.current || 0)}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {renderChange(analytics?.revenue.change || 0)}
                  <span className="text-xs text-slate-500">vs prev period</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-emerald-500" />
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
                <p className="text-2xl font-bold text-white mt-1">
                  {formatNumber(analytics?.transactions.current || 0)}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {renderChange(analytics?.transactions.change || 0)}
                  <span className="text-xs text-slate-500">vs prev period</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* New Users */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">New Users</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {formatNumber(analytics?.users.current || 0)}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {renderChange(analytics?.users.change || 0)}
                  <span className="text-xs text-slate-500">vs prev period</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Avg Order Value</p>
                <p className="text-lg font-bold text-white">{formatCurrency(analytics?.avgOrderValue.current || 0)}</p>
              </div>
              {renderChange(analytics?.avgOrderValue.change || 0)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Conversion Rate</p>
                <p className="text-lg font-bold text-white">{analytics?.conversionRate.current}%</p>
              </div>
              {renderChange(analytics?.conversionRate.change || 0)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Repeat Purchase Rate</p>
                <p className="text-lg font-bold text-white">{analytics?.repeatRate.current}%</p>
              </div>
              {renderChange(analytics?.repeatRate.change || 0)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">New Suppliers</p>
                <p className="text-lg font-bold text-white">{analytics?.suppliers.current}</p>
              </div>
              {renderChange(analytics?.suppliers.change || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Suppliers */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Top Suppliers by GMV
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topSuppliers.map((supplier, index) => (
                <div key={supplier.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs text-slate-400">
                      {index + 1}
                    </span>
                    <span className="text-white">{supplier.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-white font-medium">{formatCurrency(supplier.value)}</span>
                    {renderChange(supplier.change)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Categories */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Top Categories by GMV
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCategories.map((category, index) => (
                <div key={category.name}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs text-slate-400">
                        {index + 1}
                      </span>
                      <span className="text-white">{category.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-white font-medium">{formatCurrency(category.value)}</span>
                      {renderChange(category.change)}
                    </div>
                  </div>
                  <div className="ml-9 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500 rounded-full"
                      style={{ width: `${(category.value / topCategories[0].value) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">GMV Trend</CardTitle>
          <CardDescription className="text-slate-400">
            Monthly gross merchandise value over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between gap-2 px-4">
            {[
              { month: 'Jul', value: 1.2 },
              { month: 'Aug', value: 1.4 },
              { month: 'Sep', value: 1.3 },
              { month: 'Oct', value: 1.6 },
              { month: 'Nov', value: 1.9 },
              { month: 'Dec', value: 2.1 },
              { month: 'Jan', value: 2.3 },
            ].map((item) => (
              <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-red-500/80 rounded-t-lg transition-all hover:bg-red-500"
                  style={{ height: `${(item.value / 2.5) * 100}%` }}
                />
                <span className="text-xs text-slate-400">{item.month}</span>
                <span className="text-xs text-white font-medium">${item.value}M</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      </TabsContent>

        {/* Operations Analytics Tab */}
        <TabsContent value="operations" className="mt-6">
          <OperationsAnalyticsDashboard dateRange={dateRange} />
        </TabsContent>

        {/* Business Intelligence Tab */}
        <TabsContent value="bi" className="mt-6">
          <BIDashboard dateRange={dateRange} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
