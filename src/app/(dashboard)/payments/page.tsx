'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Search,
  Filter,
  CreditCard,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle2,
  Shield,
  AlertCircle,
  Download,
  Calendar,
} from 'lucide-react';

const mockPayments = [
  {
    id: 'PAY-2024-001',
    transactionId: 'TXN-2024-001',
    description: 'Steel Components - Escrow Deposit',
    amount: 22500,
    currency: 'USD',
    type: 'ESCROW_DEPOSIT',
    status: 'SUCCEEDED',
    method: 'Bank Transfer',
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: 'PAY-2024-002',
    transactionId: 'TXN-2024-002',
    description: 'Electronic Circuit Boards - Escrow Deposit',
    amount: 12500,
    currency: 'USD',
    type: 'ESCROW_DEPOSIT',
    status: 'SUCCEEDED',
    method: 'Credit Card',
    createdAt: '2024-01-14T14:00:00Z',
  },
  {
    id: 'PAY-2024-003',
    transactionId: 'TXN-2024-003',
    description: 'Textile Fabric - Escrow Release',
    amount: 11000,
    currency: 'USD',
    type: 'ESCROW_RELEASE',
    status: 'SUCCEEDED',
    method: 'Bank Transfer',
    createdAt: '2024-01-20T16:00:00Z',
  },
  {
    id: 'PAY-2024-004',
    transactionId: 'TXN-2024-004',
    description: 'Platform Fee - January 2024',
    amount: 450,
    currency: 'USD',
    type: 'PLATFORM_FEE',
    status: 'SUCCEEDED',
    method: 'Auto-deduct',
    createdAt: '2024-01-31T00:00:00Z',
  },
];

const mockEscrowSummary = {
  totalHeld: 35000,
  pendingRelease: 22500,
  released: 11000,
  currency: 'USD',
};

const getStatusBadge = (status: string) => {
  const variants: Record<string, { variant: any; label: string }> = {
    PENDING: { variant: 'warning', label: 'Pending' },
    PROCESSING: { variant: 'info', label: 'Processing' },
    SUCCEEDED: { variant: 'success', label: 'Succeeded' },
    FAILED: { variant: 'destructive', label: 'Failed' },
    REFUNDED: { variant: 'secondary', label: 'Refunded' },
  };
  const config = variants[status] || { variant: 'secondary', label: status };
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

const getTypeIcon = (type: string) => {
  if (type === 'ESCROW_DEPOSIT') {
    return <ArrowUpRight className="h-4 w-4 text-blue-500" />;
  } else if (type === 'ESCROW_RELEASE') {
    return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
  } else {
    return <DollarSign className="h-4 w-4 text-gray-500" />;
  }
};

export default function PaymentsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPayments = mockPayments.filter((payment) =>
    payment.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    payment.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payments & Escrow</h1>
          <p className="text-muted-foreground">
            Manage payments and track escrow funds
          </p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Escrow Summary */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <Shield className="h-8 w-8 opacity-80" />
              <span className="text-xs opacity-80">Total Held</span>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold">
                ${mockEscrowSummary.totalHeld.toLocaleString()}
              </p>
              <p className="text-sm opacity-80">In Escrow</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  ${mockEscrowSummary.pendingRelease.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Pending Release</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  ${mockEscrowSummary.released.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Released (30d)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                <CreditCard className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockPayments.length}</p>
                <p className="text-sm text-muted-foreground">Transactions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Escrow Conditions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Active Escrow - TXN-2024-001
          </CardTitle>
          <CardDescription>
            Funds will be released when all conditions are met
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Release Progress</span>
              <span className="text-sm text-muted-foreground">2 of 3 conditions met</span>
            </div>
            <Progress value={66} className="h-2" />
            
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-sm">Delivery Confirmed</span>
                <Badge variant="success" className="ml-auto">Complete</Badge>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-sm">Quality Approved</span>
                <Badge variant="success" className="ml-auto">Complete</Badge>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-yellow-500" />
                <span className="text-sm">Documents Verified</span>
                <Badge variant="warning" className="ml-auto">Pending</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search payments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select className="rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="all">All Types</option>
                <option value="ESCROW_DEPOSIT">Escrow Deposit</option>
                <option value="ESCROW_RELEASE">Escrow Release</option>
                <option value="PLATFORM_FEE">Platform Fee</option>
              </select>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments List */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>All your payment transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPayments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    {getTypeIcon(payment.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{payment.description}</p>
                      {getStatusBadge(payment.status)}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{payment.id}</span>
                      <span>•</span>
                      <span>{payment.method}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-semibold ${
                    payment.type === 'ESCROW_RELEASE' ? 'text-green-600' : ''
                  }`}>
                    {payment.type === 'ESCROW_RELEASE' ? '+' : '-'}
                    ${payment.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">{payment.currency}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
