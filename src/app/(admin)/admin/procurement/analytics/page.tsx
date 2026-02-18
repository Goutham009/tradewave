'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Package,
  Users,
  Clock,
  CheckCircle,
  DollarSign,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Download,
} from 'lucide-react';

interface ProcurementMetrics {
  totalRequirements: number;
  matchedSuppliers: number;
  quotesReceived: number;
  avgResponseTime: string;
  conversionRate: number;
  totalValue: number;
}

interface ProcurementOfficer {
  id: string;
  name: string;
  email: string;
  requirementsHandled: number;
  suppliersMatched: number;
  avgMatchTime: string;
  rating: number;
  status: 'active' | 'away';
}

const MOCK_METRICS: ProcurementMetrics = {
  totalRequirements: 156,
  matchedSuppliers: 423,
  quotesReceived: 312,
  avgResponseTime: '18 hrs',
  conversionRate: 72.5,
  totalValue: 2450000,
};

const MOCK_OFFICERS: ProcurementOfficer[] = [
  { id: '1', name: 'David Rodriguez', email: 'procurement1@tradewave.io', requirementsHandled: 45, suppliersMatched: 134, avgMatchTime: '12 hrs', rating: 4.8, status: 'active' },
  { id: '2', name: 'Emily Watson', email: 'procurement2@tradewave.io', requirementsHandled: 38, suppliersMatched: 112, avgMatchTime: '15 hrs', rating: 4.6, status: 'active' },
  { id: '3', name: 'Chris Thompson', email: 'chris.t@tradewave.io', requirementsHandled: 42, suppliersMatched: 98, avgMatchTime: '14 hrs', rating: 4.7, status: 'active' },
  { id: '4', name: 'Maria Garcia', email: 'maria.g@tradewave.io', requirementsHandled: 31, suppliersMatched: 79, avgMatchTime: '20 hrs', rating: 4.5, status: 'away' },
];

const CATEGORY_PERFORMANCE = [
  { category: 'Steel & Metals', requirements: 42, matches: 126, conversion: 78 },
  { category: 'Electronics', requirements: 35, matches: 98, conversion: 72 },
  { category: 'Textiles', requirements: 28, matches: 84, conversion: 69 },
  { category: 'Chemicals', requirements: 24, matches: 65, conversion: 65 },
  { category: 'Machinery', requirements: 18, matches: 45, conversion: 61 },
  { category: 'Others', requirements: 9, matches: 25, conversion: 55 },
];

export default function ProcurementAnalyticsPage() {
  const [metrics] = useState<ProcurementMetrics>(MOCK_METRICS);
  const [officers] = useState<ProcurementOfficer[]>(MOCK_OFFICERS);
  const [period, setPeriod] = useState('30d');
  const [loading, setLoading] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Procurement Analytics</h1>
          <p className="text-slate-400">Monitor supplier matching and procurement performance</p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[140px] bg-slate-800 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="border-slate-600 text-slate-300" onClick={() => setLoading(true)}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button className="bg-red-600 hover:bg-red-700">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Requirements</p>
                <p className="text-2xl font-bold text-white">{metrics.totalRequirements}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-2 flex items-center text-xs text-green-400">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +12% from last period
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Suppliers Matched</p>
                <p className="text-2xl font-bold text-white">{metrics.matchedSuppliers}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
            <div className="mt-2 flex items-center text-xs text-green-400">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +8% from last period
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Quotes Received</p>
                <p className="text-2xl font-bold text-white">{metrics.quotesReceived}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-2 flex items-center text-xs text-green-400">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +15% from last period
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Avg Response</p>
                <p className="text-2xl font-bold text-white">{metrics.avgResponseTime}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="mt-2 flex items-center text-xs text-red-400">
              <ArrowDownRight className="h-3 w-3 mr-1" />
              +2 hrs from last period
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Conversion</p>
                <p className="text-2xl font-bold text-white">{metrics.conversionRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-cyan-500" />
            </div>
            <div className="mt-2 flex items-center text-xs text-green-400">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +5% from last period
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Total Value</p>
                <p className="text-xl font-bold text-white">{formatCurrency(metrics.totalValue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-emerald-500" />
            </div>
            <div className="mt-2 flex items-center text-xs text-green-400">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +18% from last period
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Category Performance */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Category Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {CATEGORY_PERFORMANCE.map((cat) => (
                <div key={cat.category} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white">{cat.category}</span>
                    <span className="text-slate-400">{cat.requirements} reqs • {cat.matches} matches • {cat.conversion}% conv</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                      style={{ width: `${cat.conversion}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Team Performance */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {officers.map((officer) => (
                <div key={officer.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                      {officer.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-white font-medium">{officer.name}</p>
                      <p className="text-xs text-slate-400">{officer.requirementsHandled} reqs • {officer.suppliersMatched} matches</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-yellow-400">
                      <span className="text-sm font-medium">★ {officer.rating}</span>
                    </div>
                    <p className="text-xs text-slate-400">{officer.avgMatchTime} avg</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Supplier Matching Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { req: 'Steel Coils - Grade A', suppliers: 5, time: '2 hours ago', status: 'sent' },
              { req: 'Cotton Fabric Premium', suppliers: 4, time: '5 hours ago', status: 'quotes_received' },
              { req: 'Electronic Components', suppliers: 3, time: '1 day ago', status: 'completed' },
              { req: 'Industrial Chemicals', suppliers: 6, time: '2 days ago', status: 'completed' },
            ].map((activity, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <div>
                  <p className="text-white font-medium">{activity.req}</p>
                  <p className="text-xs text-slate-400">Matched with {activity.suppliers} suppliers</p>
                </div>
                <div className="text-right">
                  <Badge className={
                    activity.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    activity.status === 'quotes_received' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }>
                    {activity.status === 'completed' ? 'Completed' : 
                     activity.status === 'quotes_received' ? 'Quotes Received' : 'Sent to Suppliers'}
                  </Badge>
                  <p className="text-xs text-slate-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
