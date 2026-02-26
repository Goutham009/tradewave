'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, TrendingUp, Users, Clock, DollarSign, CheckCircle, ArrowUp, BarChart3, Target } from 'lucide-react';

const STATS = {
  totalRequirements: 245,
  matched: 218,
  avgMatchTime: '2.4 hrs',
  successRate: 89,
  totalQuotations: 1250,
  avgQuotesPerReq: 5.2,
  totalValue: 4500000,
  valueGrowth: 18.5,
};

const MONTHLY_DATA = [
  { month: 'Oct', requirements: 52, matched: 45, value: 890000 },
  { month: 'Nov', requirements: 58, matched: 51, value: 1020000 },
  { month: 'Dec', requirements: 62, matched: 56, value: 1180000 },
  { month: 'Jan', requirements: 73, matched: 66, value: 1410000 },
];

const CATEGORY_PERFORMANCE = [
  { name: 'Raw Materials', requirements: 85, matched: 78, avgTime: '2.1 hrs', successRate: 92 },
  { name: 'Textiles', requirements: 52, matched: 46, avgTime: '2.8 hrs', successRate: 88 },
  { name: 'Chemicals', requirements: 48, matched: 44, avgTime: '1.9 hrs', successRate: 92 },
  { name: 'Electronics', requirements: 35, matched: 28, avgTime: '3.5 hrs', successRate: 80 },
  { name: 'Plastics', requirements: 25, matched: 22, avgTime: '2.2 hrs', successRate: 88 },
];

const RECENT_MATCHES = [
  { id: 1, requirement: 'Steel Components - 5000 units', buyer: 'Acme Corp', suppliers: 6, bestQuote: 24000, time: '1.5 hrs', status: 'completed' },
  { id: 2, requirement: 'Cotton Fabric Premium', buyer: 'Fashion Hub', suppliers: 4, bestQuote: 42000, time: '2.2 hrs', status: 'completed' },
  { id: 3, requirement: 'Industrial Chemicals', buyer: 'Tech Solutions', suppliers: 5, bestQuote: 15000, time: '1.8 hrs', status: 'in_progress' },
  { id: 4, requirement: 'Electronic Capacitors', buyer: 'ElectroMart', suppliers: 3, bestQuote: 75000, time: '3.1 hrs', status: 'pending' },
];

export default function ProcurementAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('month');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Procurement Analytics</h1>
          <p className="text-slate-400">Track matching performance and procurement metrics</p>
        </div>
        <div className="flex gap-2">
          {['week', 'month', 'quarter'].map((t) => (
            <Button key={t} variant={timeRange === t ? 'default' : 'outline'} onClick={() => setTimeRange(t)} size="sm" className="border-slate-700 capitalize">
              {t}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-4">
            <Package className="h-5 w-5 text-blue-400" />
            <p className="text-2xl font-bold text-white mt-2">{STATS.totalRequirements}</p>
            <p className="text-sm text-slate-400">Total Requirements</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-4">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <p className="text-2xl font-bold text-green-400 mt-2">{STATS.matched}</p>
            <p className="text-sm text-slate-400">Successfully Matched</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-4">
            <Clock className="h-5 w-5 text-yellow-400" />
            <p className="text-2xl font-bold text-white mt-2">{STATS.avgMatchTime}</p>
            <p className="text-sm text-slate-400">Avg Match Time</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-4">
            <Target className="h-5 w-5 text-purple-400" />
            <p className="text-2xl font-bold text-white mt-2">{STATS.successRate}%</p>
            <p className="text-sm text-slate-400">Success Rate</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
          <CardContent className="pt-4">
            <DollarSign className="h-5 w-5 text-green-400" />
            <p className="text-2xl font-bold text-white mt-2">${(STATS.totalValue / 1000000).toFixed(1)}M</p>
            <p className="text-sm text-slate-400">Total Value Processed</p>
            <p className="text-xs text-green-400 mt-1 flex items-center"><ArrowUp className="h-3 w-3" />{STATS.valueGrowth}% vs last period</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-4">
            <BarChart3 className="h-5 w-5 text-indigo-400" />
            <p className="text-2xl font-bold text-white mt-2">{STATS.totalQuotations}</p>
            <p className="text-sm text-slate-400">Total Quotations</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-4">
            <Users className="h-5 w-5 text-orange-400" />
            <p className="text-2xl font-bold text-white mt-2">{STATS.avgQuotesPerReq}</p>
            <p className="text-sm text-slate-400">Avg Quotes/Requirement</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-4">
            <TrendingUp className="h-5 w-5 text-blue-400" />
            <p className="text-2xl font-bold text-white mt-2">${Math.round(STATS.totalValue / STATS.totalRequirements / 1000)}K</p>
            <p className="text-sm text-slate-400">Avg Requirement Value</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader><CardTitle className="text-white">Monthly Trend</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {MONTHLY_DATA.map((m) => (
                <div key={m.month} className="flex items-center gap-4">
                  <span className="w-10 text-slate-400 font-medium">{m.month}</span>
                  <div className="flex-1">
                    <div className="flex gap-2 mb-1">
                      <div className="flex-1 bg-slate-800 rounded h-6">
                        <div className="bg-blue-500 h-full rounded flex items-center px-2 text-xs text-white" style={{ width: `${(m.requirements / 80) * 100}%` }}>
                          {m.requirements} reqs
                        </div>
                      </div>
                      <div className="flex-1 bg-slate-800 rounded h-6">
                        <div className="bg-green-500 h-full rounded flex items-center px-2 text-xs text-white" style={{ width: `${(m.matched / 80) * 100}%` }}>
                          {m.matched} matched
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">${(m.value / 1000).toFixed(0)}K total value</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader><CardTitle className="text-white">Category Performance</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {CATEGORY_PERFORMANCE.map((c) => (
                <div key={c.name} className="flex items-center gap-4 p-3 rounded-lg bg-slate-800/50">
                  <div className="flex-1">
                    <p className="font-medium text-white">{c.name}</p>
                    <p className="text-xs text-slate-400">{c.requirements} requirements • {c.matched} matched</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-300">{c.avgTime}</p>
                    <p className="text-xs text-slate-500">avg time</p>
                  </div>
                  <Badge className={c.successRate >= 90 ? 'bg-green-500/20 text-green-400' : c.successRate >= 85 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}>
                    {c.successRate}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader><CardTitle className="text-white">Recent Matches</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {RECENT_MATCHES.map((m) => (
              <div key={m.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <div>
                  <p className="font-medium text-white">{m.requirement}</p>
                  <p className="text-sm text-slate-400">{m.buyer} • {m.suppliers} suppliers</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-400">${m.bestQuote.toLocaleString()}</p>
                  <p className="text-xs text-slate-500">best quote • {m.time}</p>
                </div>
                <Badge className={m.status === 'completed' ? 'bg-green-500/20 text-green-400' : m.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'}>
                  {m.status.replace('_', ' ')}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
