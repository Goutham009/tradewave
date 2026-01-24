'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  CreditCard,
  Clock,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  PiggyBank,
  BarChart3,
} from 'lucide-react';

const earningsData = {
  totalEarnings: 156780,
  pendingPayouts: 12450,
  availableBalance: 8930,
  thisMonth: 24560,
  lastMonth: 21340,
  percentChange: 15.1,
};

const recentTransactions = [
  { id: 'PAY-001', type: 'earning', description: 'Order #ORD-2024-156 - Steel Components', amount: 4500, status: 'completed', date: '2024-01-20' },
  { id: 'PAY-002', type: 'payout', description: 'Bank Transfer - HDFC ***4523', amount: -15000, status: 'completed', date: '2024-01-18' },
  { id: 'PAY-003', type: 'earning', description: 'Order #ORD-2024-152 - Electronics', amount: 8200, status: 'pending', date: '2024-01-17' },
  { id: 'PAY-004', type: 'earning', description: 'Order #ORD-2024-148 - Textiles', amount: 3100, status: 'completed', date: '2024-01-15' },
  { id: 'PAY-005', type: 'refund', description: 'Partial refund - Order #ORD-2024-140', amount: -500, status: 'completed', date: '2024-01-14' },
  { id: 'PAY-006', type: 'earning', description: 'Order #ORD-2024-138 - Machinery Parts', amount: 12800, status: 'completed', date: '2024-01-12' },
];

const monthlyEarnings = [
  { month: 'Aug', amount: 18500 },
  { month: 'Sep', amount: 22100 },
  { month: 'Oct', amount: 19800 },
  { month: 'Nov', amount: 25600 },
  { month: 'Dec', amount: 21340 },
  { month: 'Jan', amount: 24560 },
];

export default function EarningsPage() {
  const [timeRange, setTimeRange] = useState('30d');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(Math.abs(amount));
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earning':
        return <ArrowUpRight className="h-4 w-4 text-green-500" />;
      case 'payout':
        return <ArrowDownRight className="h-4 w-4 text-blue-500" />;
      case 'refund':
        return <ArrowDownRight className="h-4 w-4 text-red-500" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/20 text-green-600">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-600">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const maxEarning = Math.max(...monthlyEarnings.map(m => m.amount));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Earnings</h1>
          <p className="text-muted-foreground">
            Track your revenue and manage payouts
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="gradient">
            <Wallet className="mr-2 h-4 w-4" />
            Request Payout
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold">{formatCurrency(earningsData.totalEarnings)}</p>
                <p className="text-xs text-muted-foreground mt-1">All time</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">{formatCurrency(earningsData.thisMonth)}</p>
                <div className="flex items-center gap-1 mt-1">
                  {earningsData.percentChange > 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className={`text-xs ${earningsData.percentChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {earningsData.percentChange > 0 ? '+' : ''}{earningsData.percentChange}% vs last month
                  </span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
                <BarChart3 className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Payouts</p>
                <p className="text-2xl font-bold">{formatCurrency(earningsData.pendingPayouts)}</p>
                <p className="text-xs text-muted-foreground mt-1">Processing</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/10">
                <Clock className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available Balance</p>
                <p className="text-2xl font-bold">{formatCurrency(earningsData.availableBalance)}</p>
                <p className="text-xs text-muted-foreground mt-1">Ready to withdraw</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10">
                <PiggyBank className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart and Transactions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Earnings Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Monthly Earnings</CardTitle>
                <CardDescription>Your earnings over the last 6 months</CardDescription>
              </div>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
              >
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="6m">Last 6 months</option>
                <option value="1y">Last year</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyEarnings.map((month) => (
                <div key={month.month} className="flex items-center gap-4">
                  <span className="w-8 text-sm text-muted-foreground">{month.month}</span>
                  <div className="flex-1">
                    <div className="h-8 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-cyan-500 rounded-lg transition-all duration-500"
                        style={{ width: `${(month.amount / maxEarning) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-20 text-right text-sm font-medium">
                    {formatCurrency(month.amount)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Your latest earnings and payouts</CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center gap-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    transaction.type === 'earning' ? 'bg-green-500/10' :
                    transaction.type === 'payout' ? 'bg-blue-500/10' : 'bg-red-500/10'
                  }`}>
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{transaction.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${
                      transaction.amount > 0 ? 'text-green-600' : 'text-slate-600'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                    </p>
                    {getStatusBadge(transaction.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Manage your payout destinations</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              Add Method
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center gap-4 rounded-lg border p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                <CreditCard className="h-6 w-6 text-blue-500" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Bank Account</p>
                <p className="text-sm text-muted-foreground">HDFC Bank ***4523</p>
              </div>
              <Badge className="bg-green-500/20 text-green-600">
                <CheckCircle className="mr-1 h-3 w-3" />
                Primary
              </Badge>
            </div>
            <div className="flex items-center gap-4 rounded-lg border p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10">
                <Wallet className="h-6 w-6 text-purple-500" />
              </div>
              <div className="flex-1">
                <p className="font-medium">PayPal</p>
                <p className="text-sm text-muted-foreground">supplier@company.com</p>
              </div>
              <Badge variant="secondary">Backup</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
