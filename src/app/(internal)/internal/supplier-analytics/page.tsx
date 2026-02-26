'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, TrendingUp, TrendingDown, Star, Package, Clock, DollarSign, AlertTriangle, CheckCircle, ArrowUp, ArrowDown } from 'lucide-react';

const STATS = {
  totalSuppliers: 156,
  activeSuppliers: 142,
  newThisMonth: 12,
  avgRating: 4.6,
  avgResponseTime: '3.2 hrs',
  fulfillmentRate: 94.5,
};

const TOP_SUPPLIERS = [
  { id: 1, name: 'Steel Industries Ltd', rating: 4.9, orders: 156, revenue: 450000, growth: 15.2, onTime: 98 },
  { id: 2, name: 'ChemPro Industries', rating: 4.9, orders: 234, revenue: 380000, growth: 12.8, onTime: 97 },
  { id: 3, name: 'Textile Masters', rating: 4.7, orders: 89, revenue: 245000, growth: 8.5, onTime: 95 },
  { id: 4, name: 'Premium Metals Co', rating: 4.6, orders: 112, revenue: 210000, growth: 10.2, onTime: 94 },
  { id: 5, name: 'Industrial Chemicals Co', rating: 4.7, orders: 189, revenue: 195000, growth: 5.5, onTime: 96 },
];

const AT_RISK = [
  { id: 1, name: 'Global Plastics', issue: 'Low rating (4.1)', severity: 'medium' },
  { id: 2, name: 'QuickSupply Co', issue: 'High response time', severity: 'low' },
  { id: 3, name: 'MetalWorks India', issue: 'Recent quality issues', severity: 'high' },
];

const CATEGORY_BREAKDOWN = [
  { name: 'Raw Materials', suppliers: 45, orders: 520, revenue: 1250000 },
  { name: 'Textiles', suppliers: 32, orders: 380, revenue: 890000 },
  { name: 'Chemicals', suppliers: 28, orders: 450, revenue: 1100000 },
  { name: 'Electronics', suppliers: 25, orders: 290, revenue: 650000 },
  { name: 'Plastics', suppliers: 18, orders: 180, revenue: 420000 },
  { name: 'Machinery', suppliers: 8, orders: 45, revenue: 380000 },
];

export default function SupplierAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('month');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Supplier Analytics</h1>
          <p className="text-slate-400">Track supplier performance and insights</p>
        </div>
        <div className="flex gap-2">
          {['week', 'month', 'quarter'].map((t) => (
            <Button key={t} variant={timeRange === t ? 'default' : 'outline'} onClick={() => setTimeRange(t)} size="sm" className="border-slate-700 capitalize">
              {t}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-4">
            <Building2 className="h-5 w-5 text-blue-400" />
            <p className="text-2xl font-bold text-white mt-2">{STATS.totalSuppliers}</p>
            <p className="text-sm text-slate-400">Total Suppliers</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-4">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <p className="text-2xl font-bold text-white mt-2">{STATS.activeSuppliers}</p>
            <p className="text-sm text-slate-400">Active</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-4">
            <TrendingUp className="h-5 w-5 text-purple-400" />
            <p className="text-2xl font-bold text-green-400 mt-2">+{STATS.newThisMonth}</p>
            <p className="text-sm text-slate-400">New This Month</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-4">
            <Star className="h-5 w-5 text-yellow-400" />
            <p className="text-2xl font-bold text-white mt-2">{STATS.avgRating}</p>
            <p className="text-sm text-slate-400">Avg Rating</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-4">
            <Clock className="h-5 w-5 text-orange-400" />
            <p className="text-2xl font-bold text-white mt-2">{STATS.avgResponseTime}</p>
            <p className="text-sm text-slate-400">Avg Response</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-4">
            <Package className="h-5 w-5 text-indigo-400" />
            <p className="text-2xl font-bold text-white mt-2">{STATS.fulfillmentRate}%</p>
            <p className="text-sm text-slate-400">Fulfillment Rate</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader><CardTitle className="text-white flex items-center gap-2"><TrendingUp className="h-5 w-5 text-green-400" />Top Performing Suppliers</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {TOP_SUPPLIERS.map((s, i) => (
                <div key={s.id} className="flex items-center gap-4 p-3 rounded-lg bg-slate-800/50">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${i === 0 ? 'bg-yellow-500/20 text-yellow-400' : i === 1 ? 'bg-slate-400/20 text-slate-300' : i === 2 ? 'bg-orange-500/20 text-orange-400' : 'bg-slate-700 text-slate-400'}`}>
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-white">{s.name}</p>
                    <p className="text-xs text-slate-400">{s.orders} orders • {s.onTime}% on-time</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-400">${(s.revenue / 1000).toFixed(0)}K</p>
                    <p className="text-xs text-green-400 flex items-center justify-end"><ArrowUp className="h-3 w-3" />{s.growth}%</p>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star className="h-4 w-4 fill-current" />
                    <span>{s.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader><CardTitle className="text-white flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-red-400" />At-Risk Suppliers</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {AT_RISK.map((s) => (
                <div key={s.id} className="flex items-center gap-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${s.severity === 'high' ? 'bg-red-500/20' : s.severity === 'medium' ? 'bg-yellow-500/20' : 'bg-blue-500/20'}`}>
                    <AlertTriangle className={`h-5 w-5 ${s.severity === 'high' ? 'text-red-400' : s.severity === 'medium' ? 'text-yellow-400' : 'text-blue-400'}`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">{s.name}</p>
                    <p className="text-sm text-slate-400">{s.issue}</p>
                  </div>
                  <Badge className={`${s.severity === 'high' ? 'bg-red-500/20 text-red-400' : s.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {s.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader><CardTitle className="text-white">Category Breakdown</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Category</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">Suppliers</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">Orders</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {CATEGORY_BREAKDOWN.map((c) => (
                  <tr key={c.name} className="border-b border-slate-800/50">
                    <td className="py-3 px-4 text-white">{c.name}</td>
                    <td className="py-3 px-4 text-right text-slate-300">{c.suppliers}</td>
                    <td className="py-3 px-4 text-right text-slate-300">{c.orders}</td>
                    <td className="py-3 px-4 text-right text-green-400">${(c.revenue / 1000).toFixed(0)}K</td>
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
