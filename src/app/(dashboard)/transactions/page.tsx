'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Search,
  Filter,
  Package,
  Calendar,
  DollarSign,
  Building2,
  Truck,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Link as LinkIcon,
  MapPin,
} from 'lucide-react';

const mockTransactions = [
  {
    id: 'TXN-2024-001',
    requirementTitle: 'Steel Components for Manufacturing',
    supplier: {
      name: 'Shanghai Steel Co.',
      location: 'Shanghai, China',
    },
    amount: 22500,
    currency: 'USD',
    status: 'IN_TRANSIT',
    progress: 65,
    escrowStatus: 'HELD',
    createdAt: '2024-01-15',
    expectedDelivery: '2024-01-29',
    milestones: [
      { status: 'INITIATED', completed: true, date: '2024-01-15' },
      { status: 'PAYMENT_RECEIVED', completed: true, date: '2024-01-15' },
      { status: 'ESCROW_HELD', completed: true, date: '2024-01-15' },
      { status: 'PRODUCTION', completed: true, date: '2024-01-17' },
      { status: 'QUALITY_CHECK', completed: true, date: '2024-01-20' },
      { status: 'SHIPPED', completed: true, date: '2024-01-22' },
      { status: 'IN_TRANSIT', completed: true, date: '2024-01-22' },
      { status: 'DELIVERED', completed: false },
      { status: 'CONFIRMED', completed: false },
      { status: 'ESCROW_RELEASED', completed: false },
    ],
  },
  {
    id: 'TXN-2024-002',
    requirementTitle: 'Electronic Circuit Boards',
    supplier: {
      name: 'Shenzhen Electronics',
      location: 'Shenzhen, China',
    },
    amount: 12500,
    currency: 'USD',
    status: 'PRODUCTION',
    progress: 35,
    escrowStatus: 'HELD',
    createdAt: '2024-01-14',
    expectedDelivery: '2024-02-04',
    milestones: [
      { status: 'INITIATED', completed: true, date: '2024-01-14' },
      { status: 'PAYMENT_RECEIVED', completed: true, date: '2024-01-14' },
      { status: 'ESCROW_HELD', completed: true, date: '2024-01-14' },
      { status: 'PRODUCTION', completed: true, date: '2024-01-16' },
      { status: 'QUALITY_CHECK', completed: false },
      { status: 'SHIPPED', completed: false },
      { status: 'IN_TRANSIT', completed: false },
      { status: 'DELIVERED', completed: false },
      { status: 'CONFIRMED', completed: false },
      { status: 'ESCROW_RELEASED', completed: false },
    ],
  },
  {
    id: 'TXN-2024-003',
    requirementTitle: 'Textile Fabric Rolls',
    supplier: {
      name: 'Mumbai Textiles Ltd',
      location: 'Mumbai, India',
    },
    amount: 11000,
    currency: 'USD',
    status: 'COMPLETED',
    progress: 100,
    escrowStatus: 'RELEASED',
    createdAt: '2024-01-05',
    expectedDelivery: '2024-01-20',
    deliveredAt: '2024-01-19',
    milestones: [
      { status: 'INITIATED', completed: true, date: '2024-01-05' },
      { status: 'PAYMENT_RECEIVED', completed: true, date: '2024-01-05' },
      { status: 'ESCROW_HELD', completed: true, date: '2024-01-05' },
      { status: 'PRODUCTION', completed: true, date: '2024-01-07' },
      { status: 'QUALITY_CHECK', completed: true, date: '2024-01-10' },
      { status: 'SHIPPED', completed: true, date: '2024-01-12' },
      { status: 'IN_TRANSIT', completed: true, date: '2024-01-12' },
      { status: 'DELIVERED', completed: true, date: '2024-01-19' },
      { status: 'CONFIRMED', completed: true, date: '2024-01-19' },
      { status: 'ESCROW_RELEASED', completed: true, date: '2024-01-20' },
    ],
  },
];

const getStatusBadge = (status: string) => {
  const variants: Record<string, { variant: any; label: string }> = {
    INITIATED: { variant: 'secondary', label: 'Initiated' },
    PAYMENT_PENDING: { variant: 'warning', label: 'Payment Pending' },
    PAYMENT_RECEIVED: { variant: 'info', label: 'Payment Received' },
    ESCROW_HELD: { variant: 'info', label: 'Escrow Held' },
    PRODUCTION: { variant: 'warning', label: 'In Production' },
    QUALITY_CHECK: { variant: 'info', label: 'Quality Check' },
    SHIPPED: { variant: 'info', label: 'Shipped' },
    IN_TRANSIT: { variant: 'info', label: 'In Transit' },
    CUSTOMS: { variant: 'warning', label: 'At Customs' },
    DELIVERED: { variant: 'success', label: 'Delivered' },
    CONFIRMED: { variant: 'success', label: 'Confirmed' },
    ESCROW_RELEASED: { variant: 'success', label: 'Escrow Released' },
    COMPLETED: { variant: 'success', label: 'Completed' },
    DISPUTED: { variant: 'destructive', label: 'Disputed' },
    CANCELLED: { variant: 'destructive', label: 'Cancelled' },
  };
  const config = variants[status] || { variant: 'secondary', label: status };
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

const getEscrowBadge = (status: string) => {
  const variants: Record<string, { variant: any; label: string }> = {
    PENDING: { variant: 'secondary', label: 'Pending' },
    HELD: { variant: 'warning', label: 'Funds Held' },
    RELEASING: { variant: 'info', label: 'Releasing' },
    RELEASED: { variant: 'success', label: 'Released' },
    DISPUTED: { variant: 'destructive', label: 'Disputed' },
  };
  const config = variants[status] || { variant: 'secondary', label: status };
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export default function TransactionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredTransactions = mockTransactions.filter((txn) => {
    const matchesSearch = 
      txn.requirementTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || txn.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = mockTransactions.filter(t => 
    !['COMPLETED', 'CANCELLED'].includes(t.status)
  ).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">
            Track your orders and manage deliveries
          </p>
        </div>
        <Badge variant="info" className="text-sm px-3 py-1">
          {activeCount} active orders
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{mockTransactions.length}</div>
            <p className="text-sm text-muted-foreground">Total Transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{activeCount}</div>
            <p className="text-sm text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {mockTransactions.filter(t => t.status === 'COMPLETED').length}
            </div>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              ${mockTransactions.filter(t => t.escrowStatus === 'HELD')
                .reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">In Escrow</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">All Status</option>
                <option value="PRODUCTION">In Production</option>
                <option value="IN_TRANSIT">In Transit</option>
                <option value="DELIVERED">Delivered</option>
                <option value="COMPLETED">Completed</option>
              </select>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <div className="grid gap-4">
        {filteredTransactions.map((transaction) => (
          <Card key={transaction.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10">
                    <Package className="h-6 w-6 text-purple-500" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{transaction.id}</h3>
                      {getStatusBadge(transaction.status)}
                      {getEscrowBadge(transaction.escrowStatus)}
                    </div>
                    <p className="text-sm font-medium">{transaction.requirementTitle}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        {transaction.supplier.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {transaction.supplier.location}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">
                    ${transaction.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">{transaction.currency}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Order Progress</span>
                  <span className="text-sm font-medium">{transaction.progress}%</span>
                </div>
                <Progress value={transaction.progress} className="h-2" />
              </div>

              {/* Milestone Timeline */}
              <div className="flex items-center gap-1 overflow-x-auto pb-2">
                {transaction.milestones.slice(0, 6).map((milestone, idx) => (
                  <div key={idx} className="flex items-center">
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                        milestone.completed
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {milestone.completed ? '✓' : idx + 1}
                    </div>
                    {idx < 5 && (
                      <div
                        className={`h-0.5 w-8 ${
                          milestone.completed ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Started: {new Date(transaction.createdAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Truck className="h-4 w-4" />
                    Expected: {new Date(transaction.expectedDelivery).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Link href="/blockchain">
                    <Button variant="outline" size="sm">
                      <LinkIcon className="mr-2 h-4 w-4" />
                      Blockchain
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm">
                    <FileText className="mr-2 h-4 w-4" />
                    Documents
                  </Button>
                  {transaction.status === 'DELIVERED' && (
                    <Button size="sm" variant="gradient">
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Confirm Delivery
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTransactions.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No transactions found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Transactions will appear here once you accept quotations
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
