'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package,
  BarChart3, PieChart, Users, ArrowDownLeft, ArrowUpRight,
} from 'lucide-react';

// ── Mock: Purchasing Analytics (as buyer) ──
const mockPurchasingAnalytics = {
  totalOrders: 12,
  totalSpent: 85375,
  avgOrderValue: 7115,
  activeOrders: 4,
  topCategories: ['Raw Materials', 'Electronics', 'Textiles', 'Packaging', 'Chemicals'],
  topSuppliers: ['Shanghai Steel Co.', 'Shenzhen Electronics', 'Mumbai Textiles Ltd'],
  monthlySpending: [
    { month: 'Oct', amount: 15000 },
    { month: 'Nov', amount: 22000 },
    { month: 'Dec', amount: 18000 },
    { month: 'Jan', amount: 30375 },
  ],
  yoyGrowth: 24.5,
  repeatRate: 67,
};

// ── Mock: Sales Analytics (as supplier) ──
const mockSalesAnalytics = {
  totalOrders: 8,
  totalRevenue: 2695000,
  avgOrderValue: 336875,
  activeOrders: 3,
  topCategories: ['Industrial Materials', 'Metals & Alloys'],
  topBuyers: ['Global Imports Inc.', 'Euro Manufacturing GmbH', 'Rotterdam Trading BV'],
  monthlyRevenue: [
    { month: 'Oct', amount: 400000 },
    { month: 'Nov', amount: 520000 },
    { month: 'Dec', amount: 675000 },
    { month: 'Jan', amount: 1100000 },
  ],
  yoyGrowth: 38.2,
  repeatRate: 75,
};

export default function AnalyticsPage() {
  const [view, setView] = useState<'purchasing' | 'sales'>('purchasing');

  const data = view === 'purchasing' ? mockPurchasingAnalytics : mockSalesAnalytics;
  const amountLabel = view === 'purchasing' ? 'Total Spent' : 'Total Revenue';
  const amountValue = view === 'purchasing' ? mockPurchasingAnalytics.totalSpent : mockSalesAnalytics.totalRevenue;
  const counterpartyLabel = view === 'purchasing' ? 'Top Suppliers' : 'Top Buyers';
  const counterparties = view === 'purchasing' ? mockPurchasingAnalytics.topSuppliers : mockSalesAnalytics.topBuyers;
  const monthlyData = view === 'purchasing' ? mockPurchasingAnalytics.monthlySpending : mockSalesAnalytics.monthlyRevenue;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Insights into your purchasing and sales activity</p>
        </div>
      </div>

      {/* View Toggle */}
      <Card>
        <CardContent className="p-4">
          <div className="inline-flex rounded-lg border border-input p-1 bg-muted/30">
            <button onClick={() => setView('purchasing')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'purchasing' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              <ArrowUpRight className="h-3.5 w-3.5" />Purchasing
            </button>
            <button onClick={() => setView('sales')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'sales' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              <ArrowDownLeft className="h-3.5 w-3.5" />Sales
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold mt-1">{data.totalOrders}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10"><ShoppingCart className="h-6 w-6 text-blue-500" /></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{amountLabel}</p>
                <p className="text-2xl font-bold mt-1">${amountValue.toLocaleString()}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10"><DollarSign className="h-6 w-6 text-green-500" /></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Order Value</p>
                <p className="text-2xl font-bold mt-1">${data.avgOrderValue.toLocaleString()}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10"><BarChart3 className="h-6 w-6 text-purple-500" /></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Orders</p>
                <p className="text-2xl font-bold mt-1">{data.activeOrders}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10"><Package className="h-6 w-6 text-orange-500" /></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Row: Trends + Categories + Counterparties */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><TrendingUp className="h-5 w-5 text-blue-500" />{view === 'purchasing' ? 'Spending Trend' : 'Revenue Trend'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyData.map((m) => (
                <div key={m.month} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground w-10">{m.month}</span>
                  <div className="flex-1 mx-3">
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-blue-500" style={{ width: `${(m.amount / Math.max(...monthlyData.map(x => x.amount))) * 100}%` }} />
                    </div>
                  </div>
                  <span className="text-sm font-medium w-24 text-right">${m.amount.toLocaleString()}</span>
                </div>
              ))}
              <div className="pt-3 border-t flex items-center justify-between">
                <span className="text-sm text-muted-foreground">YoY Growth</span>
                <Badge variant={data.yoyGrowth >= 0 ? 'success' : 'destructive'} className="flex items-center gap-1">
                  {data.yoyGrowth >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {data.yoyGrowth >= 0 ? '+' : ''}{data.yoyGrowth}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><PieChart className="h-5 w-5 text-purple-500" />Top Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topCategories.map((cat, i) => (
                <div key={cat} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-medium">{i + 1}</span>
                  <span className="text-sm">{cat}</span>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t mt-4 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Repeat Rate</span>
              <span className="text-sm font-bold">{data.repeatRate}%</span>
            </div>
          </CardContent>
        </Card>

        {/* Top Counterparties */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Users className="h-5 w-5 text-teal-500" />{counterpartyLabel}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {counterparties.map((name, i) => (
                <div key={name} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/10">
                    <span className="text-sm font-bold text-blue-600">{name.charAt(0)}</span>
                  </div>
                  <span className="text-sm font-medium">{name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
