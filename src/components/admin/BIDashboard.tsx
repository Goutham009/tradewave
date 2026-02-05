'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, DollarSign, TrendingUp, TrendingDown, Globe, Calendar, Package } from 'lucide-react';

interface BIDashboardProps {
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
}

interface RevenueMetrics {
  totalRevenue: number;
  totalTransactions: number;
  averageTransactionValue: number;
  revenueByMonth: Array<{ month: string; revenue: number; transactionCount: number }>;
  revenueGrowth: number;
  topRevenueCategories: Array<{ category: string; revenue: number; percentage: number }>;
}

interface CategoryMetrics {
  category: string;
  totalRequirements: number;
  totalQuotations: number;
  totalTransactions: number;
  averageValue: number;
  conversionRate: number;
}

interface GeographicMetric {
  country: string;
  region: string;
  totalBuyers: number;
  totalSuppliers: number;
  totalTransactions: number;
  totalRevenue: number;
}

interface SeasonalTrend {
  quarter: string;
  month: string;
  totalRequirements: number;
  totalRevenue: number;
  averageTransactionValue: number;
  growthRate: number;
}

export function BIDashboard({ dateRange }: BIDashboardProps) {
  const [revenueMetrics, setRevenueMetrics] = useState<RevenueMetrics | null>(null);
  const [popularCategories, setPopularCategories] = useState<CategoryMetrics[]>([]);
  const [geographicDistribution, setGeographicDistribution] = useState<GeographicMetric[]>([]);
  const [seasonalTrends, setSeasonalTrends] = useState<SeasonalTrend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBIData();
  }, [dateRange]);

  const fetchBIData = async () => {
    try {
      setLoading(true);
      const params = `startDate=${dateRange.startDate.toISOString()}&endDate=${dateRange.endDate.toISOString()}`;

      const [revenueRes, categoriesRes, geoRes, trendsRes] = await Promise.all([
        fetch(`/api/admin/analytics/revenue?${params}`),
        fetch(`/api/admin/analytics/popular-categories?${params}`),
        fetch(`/api/admin/analytics/geographic-distribution?${params}`),
        fetch(`/api/admin/analytics/seasonal-trends?year=${dateRange.startDate.getFullYear()}`),
      ]);

      if (revenueRes.ok) setRevenueMetrics(await revenueRes.json());
      if (categoriesRes.ok) setPopularCategories(await categoriesRes.json());
      if (geoRes.ok) setGeographicDistribution(await geoRes.json());
      if (trendsRes.ok) setSeasonalTrends(await trendsRes.json());
    } catch (error) {
      console.error('BI data fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Revenue Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Revenue</p>
                <p className="text-2xl font-bold text-green-400 mt-1">
                  {formatCurrency(revenueMetrics?.totalRevenue || 0)}
                </p>
                <div className={`flex items-center gap-1 mt-1 text-sm ${(revenueMetrics?.revenueGrowth || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {(revenueMetrics?.revenueGrowth || 0) >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {Math.abs(revenueMetrics?.revenueGrowth || 0).toFixed(1)}% vs prev period
                </div>
              </div>
              <div className="p-3 bg-green-500/20 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Transactions</p>
                <p className="text-2xl font-bold text-blue-400 mt-1">
                  {revenueMetrics?.totalTransactions?.toLocaleString() || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Package className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Avg Transaction Value</p>
                <p className="text-2xl font-bold text-purple-400 mt-1">
                  {formatCurrency(revenueMetrics?.averageTransactionValue || 0)}
                </p>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Revenue Growth</p>
                <p className={`text-2xl font-bold mt-1 ${(revenueMetrics?.revenueGrowth || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {(revenueMetrics?.revenueGrowth || 0) >= 0 ? '+' : ''}
                  {revenueMetrics?.revenueGrowth?.toFixed(1) || 0}%
                </p>
              </div>
              <div className={`p-3 rounded-lg ${(revenueMetrics?.revenueGrowth || 0) >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                {(revenueMetrics?.revenueGrowth || 0) >= 0 ? 
                  <TrendingUp className="w-6 h-6 text-green-400" /> : 
                  <TrendingDown className="w-6 h-6 text-red-400" />
                }
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Revenue Trend */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Monthly Revenue Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {revenueMetrics?.revenueByMonth.map((month, index) => {
              const maxRevenue = Math.max(...(revenueMetrics?.revenueByMonth.map(m => m.revenue) || [1]));
              return (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-white">{month.month}</span>
                    <span className="text-sm font-bold text-white">
                      {formatCurrency(month.revenue)} ({month.transactionCount} txns)
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-green-500 to-green-400 h-3 rounded-full transition-all"
                      style={{ width: `${(month.revenue / maxRevenue) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Top Revenue Categories */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Top Revenue Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {revenueMetrics?.topRevenueCategories.map((category, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 flex items-center justify-center bg-slate-600 text-slate-300 rounded-full font-bold text-sm">
                    #{index + 1}
                  </span>
                  <span className="font-medium text-white">{category.category}</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-400">{formatCurrency(category.revenue)}</p>
                  <p className="text-sm text-slate-400">{category.percentage.toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Popular Product Categories */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Package className="w-5 h-5" />
            Popular Product Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Category</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">Requirements</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">Quotations</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">Transactions</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">Avg Value</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">Conversion</th>
                </tr>
              </thead>
              <tbody>
                {popularCategories.slice(0, 10).map((category, index) => (
                  <tr key={index} className="border-b border-slate-700/50">
                    <td className="py-3 px-4 font-medium text-white">{category.category}</td>
                    <td className="py-3 px-4 text-right text-white">{category.totalRequirements}</td>
                    <td className="py-3 px-4 text-right text-white">{category.totalQuotations}</td>
                    <td className="py-3 px-4 text-right text-white">{category.totalTransactions}</td>
                    <td className="py-3 px-4 text-right text-white">{formatCurrency(category.averageValue)}</td>
                    <td className="py-3 px-4 text-right">
                      <Badge className={category.conversionRate >= 30 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}>
                        {category.conversionRate.toFixed(1)}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Geographic Distribution */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Geographic Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Country</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Region</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">Buyers</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">Suppliers</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">Transactions</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {geographicDistribution.map((geo, index) => (
                  <tr key={index} className="border-b border-slate-700/50">
                    <td className="py-3 px-4 font-medium text-white">{geo.country}</td>
                    <td className="py-3 px-4 text-slate-300">{geo.region}</td>
                    <td className="py-3 px-4 text-right text-white">{geo.totalBuyers}</td>
                    <td className="py-3 px-4 text-right text-white">{geo.totalSuppliers}</td>
                    <td className="py-3 px-4 text-right text-white">{geo.totalTransactions}</td>
                    <td className="py-3 px-4 text-right font-bold text-green-400">
                      {formatCurrency(geo.totalRevenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Seasonal Trends */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Seasonal Trends ({dateRange.startDate.getFullYear()})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Month</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Quarter</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">Requirements</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">Revenue</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">Avg Value</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">Growth</th>
                </tr>
              </thead>
              <tbody>
                {seasonalTrends.map((trend, index) => (
                  <tr key={index} className="border-b border-slate-700/50">
                    <td className="py-3 px-4 font-medium text-white">{trend.month}</td>
                    <td className="py-3 px-4">
                      <Badge className="bg-blue-500/20 text-blue-400">{trend.quarter}</Badge>
                    </td>
                    <td className="py-3 px-4 text-right text-white">{trend.totalRequirements}</td>
                    <td className="py-3 px-4 text-right font-bold text-green-400">
                      {formatCurrency(trend.totalRevenue)}
                    </td>
                    <td className="py-3 px-4 text-right text-white">
                      {formatCurrency(trend.averageTransactionValue)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Badge className={trend.growthRate >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                        {trend.growthRate >= 0 ? '+' : ''}{trend.growthRate.toFixed(1)}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
