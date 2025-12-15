import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Package,
  CreditCard,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Plus,
} from 'lucide-react';

const stats = [
  {
    name: 'Active Requirements',
    value: '12',
    change: '+2 this week',
    icon: FileText,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    name: 'Pending Quotations',
    value: '8',
    change: '3 new today',
    icon: Clock,
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
  },
  {
    name: 'In-Transit Orders',
    value: '5',
    change: '2 arriving soon',
    icon: Package,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
  },
  {
    name: 'Escrow Balance',
    value: '$124,500',
    change: 'Across 4 transactions',
    icon: CreditCard,
    color: 'text-green-500',
    bg: 'bg-green-500/10',
  },
];

const recentTransactions = [
  {
    id: 'TXN-2024-001',
    title: 'Steel Components Order',
    supplier: 'Shanghai Steel Co.',
    amount: '$45,000',
    status: 'in_transit',
    date: '2024-01-15',
  },
  {
    id: 'TXN-2024-002',
    title: 'Electronic Parts',
    supplier: 'Shenzhen Electronics',
    amount: '$28,500',
    status: 'production',
    date: '2024-01-14',
  },
  {
    id: 'TXN-2024-003',
    title: 'Textile Materials',
    supplier: 'Mumbai Textiles Ltd',
    amount: '$15,200',
    status: 'delivered',
    date: '2024-01-12',
  },
];

const getStatusBadge = (status: string) => {
  const variants: Record<string, { variant: any; label: string }> = {
    in_transit: { variant: 'info', label: 'In Transit' },
    production: { variant: 'warning', label: 'Production' },
    delivered: { variant: 'success', label: 'Delivered' },
    pending: { variant: 'pending', label: 'Pending' },
  };
  const config = variants[status] || variants.pending;
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s an overview of your trade activities.
          </p>
        </div>
        <Link href="/requirements/new">
          <Button variant="gradient">
            <Plus className="mr-2 h-4 w-4" />
            New Requirement
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`rounded-lg p-2 ${stat.bg}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.name}</p>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{stat.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Transactions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest trade activities</CardDescription>
            </div>
            <Link href="/transactions">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{transaction.title}</p>
                      <p className="text-sm text-muted-foreground">{transaction.supplier}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{transaction.amount}</p>
                    {getStatusBadge(transaction.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to get you started</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <Link href="/requirements/new">
                <div className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-accent">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                    <FileText className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Submit New Requirement</p>
                    <p className="text-sm text-muted-foreground">
                      Start a new sourcing request
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </Link>

              <Link href="/quotations">
                <div className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-accent">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
                    <Clock className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Review Pending Quotations</p>
                    <p className="text-sm text-muted-foreground">
                      8 quotations awaiting review
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </Link>

              <Link href="/transactions">
                <div className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-accent">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Confirm Delivery</p>
                    <p className="text-sm text-muted-foreground">
                      2 deliveries pending confirmation
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </Link>

              <Link href="/blockchain">
                <div className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-accent">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                    <AlertCircle className="h-5 w-5 text-purple-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">View Blockchain Records</p>
                    <p className="text-sm text-muted-foreground">
                      Verify documents and audit trail
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
