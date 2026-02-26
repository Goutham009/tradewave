'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Search,
  CreditCard,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle2,
  Shield,
  Download,
  Calendar,
} from 'lucide-react';

type ActionStatus = 'AWAITING_PAYMENT' | 'RECEIPT_UPLOADED' | 'UNDER_REVIEW' | 'APPROVED' | 'FUNDS_RELEASED' | 'CONFIRMED';

type ActionablePayment = {
  id: string;
  transactionId: string;
  orderNumber: string;
  description: string;
  amount: number;
  currency: string;
  dueDate: string;
  status: ActionStatus;
  preferredMethod: 'BANK_TRANSFER' | 'CARD';
  receiptFileName?: string;
};

type PaymentRecord = {
  id: string;
  transactionId: string;
  orderNumber: string;
  description: string;
  amount: number;
  currency: string;
  type: 'ESCROW_DEPOSIT' | 'ESCROW_RELEASE' | 'PLATFORM_FEE';
  status: 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED';
  method: string;
  createdAt: string;
};

const initialActionablePaid: ActionablePayment[] = [
  {
    id: 'ACT-P-001',
    transactionId: 'TXN-2024-004',
    orderNumber: 'PO-2024-004',
    description: 'Chemical Raw Materials - Escrow deposit pending',
    amount: 15000,
    currency: 'USD',
    dueDate: '2024-02-10',
    status: 'AWAITING_PAYMENT',
    preferredMethod: 'BANK_TRANSFER',
  },
  {
    id: 'ACT-P-002',
    transactionId: 'TXN-2024-002',
    orderNumber: 'PO-2024-002',
    description: 'Electronic Circuit Boards - Escrow top-up',
    amount: 2500,
    currency: 'USD',
    dueDate: '2024-02-06',
    status: 'UNDER_REVIEW',
    preferredMethod: 'CARD',
  },
];

const initialActionableReceived: ActionablePayment[] = [
  {
    id: 'ACT-R-001',
    transactionId: 'TXN-S-001',
    orderNumber: 'SO-2026-001',
    description: 'Steel Pipes - escrow release initiated',
    amount: 287500,
    currency: 'USD',
    dueDate: '2026-03-12',
    status: 'FUNDS_RELEASED',
    preferredMethod: 'BANK_TRANSFER',
  },
  {
    id: 'ACT-R-002',
    transactionId: 'TXN-S-002',
    orderNumber: 'SO-2026-002',
    description: 'Copper Wire - release under admin review',
    amount: 1760000,
    currency: 'USD',
    dueDate: '2026-03-18',
    status: 'UNDER_REVIEW',
    preferredMethod: 'BANK_TRANSFER',
  },
];

const initialPaidHistory: PaymentRecord[] = [
  {
    id: 'PAY-2024-001',
    transactionId: 'TXN-2024-001',
    orderNumber: 'PO-2024-001',
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
    orderNumber: 'PO-2024-002',
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
    orderNumber: 'PO-2024-003',
    description: 'Platform Fee - January 2024',
    amount: 450,
    currency: 'USD',
    type: 'PLATFORM_FEE',
    status: 'SUCCEEDED',
    method: 'Auto-deduct',
    createdAt: '2024-01-31T00:00:00Z',
  },
];

const initialReceivedHistory: PaymentRecord[] = [
  {
    id: 'PAY-R-001',
    transactionId: 'TXN-S-003',
    orderNumber: 'SO-2026-003',
    description: 'Aluminum Sheets - Escrow Release',
    amount: 360000,
    currency: 'USD',
    type: 'ESCROW_RELEASE',
    status: 'SUCCEEDED',
    method: 'Bank Transfer',
    createdAt: '2026-03-01T10:00:00Z',
  },
  {
    id: 'PAY-R-002',
    transactionId: 'TXN-S-001',
    orderNumber: 'SO-2026-001',
    description: 'Steel Pipes - Partial Payment',
    amount: 287500,
    currency: 'USD',
    type: 'ESCROW_RELEASE',
    status: 'PROCESSING',
    method: 'Bank Transfer',
    createdAt: '2026-03-10T14:00:00Z',
  },
  {
    id: 'PAY-R-003',
    transactionId: 'TXN-S-002',
    orderNumber: 'SO-2026-002',
    description: 'Platform Fee - February 2026',
    amount: 2100,
    currency: 'USD',
    type: 'PLATFORM_FEE',
    status: 'SUCCEEDED',
    method: 'Auto-deduct',
    createdAt: '2026-02-28T00:00:00Z',
  },
];

const getStatusBadge = (status: string) => {
  const v: Record<string, { variant: any; label: string }> = {
    PENDING: { variant: 'warning', label: 'Pending' },
    PROCESSING: { variant: 'info', label: 'Processing' },
    SUCCEEDED: { variant: 'success', label: 'Succeeded' },
    FAILED: { variant: 'destructive', label: 'Failed' },
    REFUNDED: { variant: 'secondary', label: 'Refunded' },
    AWAITING_PAYMENT: { variant: 'warning', label: 'Awaiting Payment' },
    RECEIPT_UPLOADED: { variant: 'info', label: 'Receipt Uploaded' },
    UNDER_REVIEW: { variant: 'info', label: 'Under Review' },
    APPROVED: { variant: 'success', label: 'Approved' },
    FUNDS_RELEASED: { variant: 'success', label: 'Funds Released' },
    CONFIRMED: { variant: 'success', label: 'Confirmed' },
  };
  const c = v[status] || { variant: 'secondary', label: status };
  return <Badge variant={c.variant}>{c.label}</Badge>;
};

const getTypeIcon = (type: string) => {
  if (type === 'ESCROW_DEPOSIT') return <ArrowUpRight className="h-4 w-4 text-blue-500" />;
  if (type === 'ESCROW_RELEASE') return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
  return <DollarSign className="h-4 w-4 text-gray-500" />;
};

export default function PaymentsPage() {
  const searchParams = useSearchParams();
  const viewParam = searchParams.get('view');
  const [view, setView] = useState<'paid' | 'received'>('paid');
  const [searchQuery, setSearchQuery] = useState('');
  const actionablePaid = initialActionablePaid;
  const actionableReceived = initialActionableReceived;
  const paidHistory = initialPaidHistory;
  const receivedHistory = initialReceivedHistory;

  useEffect(() => {
    if (viewParam === 'paid' || viewParam === 'received') {
      setView(viewParam);
    }
  }, [viewParam]);

  const payments = view === 'paid' ? paidHistory : receivedHistory;
  const actionItems = view === 'paid' ? actionablePaid : actionableReceived;
  const totalAmount = payments
    .filter((p) => p.status === 'SUCCEEDED')
    .reduce((sum, p) => sum + p.amount, 0);

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const haystack = `${p.description} ${p.id} ${p.orderNumber} ${p.transactionId}`.toLowerCase();
      return haystack.includes(searchQuery.toLowerCase());
    });
  }, [payments, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payments & Escrow</h1>
          <p className="text-muted-foreground">Open each payment item to review agreed terms (advance, LC, credit), complete actions, and track settlement.</p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <Shield className="h-8 w-8 opacity-80" />
              <span className="text-xs opacity-80">{view === 'paid' ? 'Total Paid' : 'Total Received'}</span>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold">${totalAmount.toLocaleString()}</p>
              <p className="text-sm opacity-80">{view === 'paid' ? 'Escrow deposits' : 'Escrow releases'}</p>
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
                <p className="text-2xl font-bold">{actionItems.filter((item) => item.status !== 'CONFIRMED').length}</p>
                <p className="text-sm text-muted-foreground">Action Required</p>
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
                <p className="text-2xl font-bold">{payments.filter((p) => p.status === 'SUCCEEDED').length}</p>
                <p className="text-sm text-muted-foreground">Succeeded</p>
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
                <p className="text-2xl font-bold">{payments.length}</p>
                <p className="text-sm text-muted-foreground">History Records</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="inline-flex rounded-lg border border-input p-1 bg-muted/30">
              <button
                onClick={() => setView('paid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  view === 'paid' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <ArrowUpRight className="h-3.5 w-3.5" />
                Payments Made
              </button>
              <button
                onClick={() => setView('received')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  view === 'received' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <ArrowDownLeft className="h-3.5 w-3.5" />
                Payments Received
              </button>
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by payment ID, order number, or transaction..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order-linked Payments</CardTitle>
          <CardDescription>
            {view === 'paid'
              ? 'Open each item to choose the agreed payment method and submit required records.'
              : 'Open each item to review release details and confirm settlement from the detailed page.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {actionItems.map((item) => (
            <div key={item.id} className="rounded-lg border p-4 space-y-3 hover:bg-muted/20 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium">{item.description}</p>
                    {getStatusBadge(item.status)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Order{' '}
                    <Link href={`/orders/${item.transactionId}`} className="font-mono text-primary hover:underline">
                      {item.orderNumber}
                    </Link>{' '}
                    • Transaction <span className="font-mono">{item.transactionId}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Due date: {new Date(item.dueDate).toLocaleDateString()} • Preferred method:{' '}
                    {item.preferredMethod.replace('_', ' ')}
                  </p>
                </div>
                <div className="text-right space-y-2">
                  <p className="text-lg font-semibold">
                    {item.currency} {item.amount.toLocaleString()}
                  </p>
                  <Link href={`/payments/${item.id}?view=${view}&mode=action`}>
                    <Button size="sm" variant="outline">Open Payment Details</Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
          {actionItems.length === 0 && (
            <p className="text-sm text-muted-foreground">No order-linked payment actions right now.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>
            Click any payment to view full details, linked order, method, and verification metadata.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPayments.map((payment) => (
              <div key={payment.id} className="rounded-lg border p-4 hover:bg-muted/20">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      {getTypeIcon(payment.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium">{payment.description}</p>
                        {getStatusBadge(payment.status)}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span>{payment.id}</span>
                        <span>•</span>
                        <span>{payment.method}</span>
                        <span>•</span>
                        <Link href={`/orders/${payment.transactionId}`} className="text-primary hover:underline">
                          Order {payment.orderNumber}
                        </Link>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-semibold ${view === 'received' && payment.type === 'ESCROW_RELEASE' ? 'text-green-600' : ''}`}>
                      {view === 'received' && payment.type === 'ESCROW_RELEASE' ? '+' : '-'}
                      {payment.currency} {payment.amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">Tx: {payment.transactionId}</p>
                    <Link href={`/payments/${payment.id}?view=${view}`} className="text-xs text-primary hover:underline">
                      View payment details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            {filteredPayments.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12">
                <DollarSign className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No payments found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {view === 'paid'
                    ? 'Payments appear here once you fund escrow or upload receipts.'
                    : 'Received payments appear here once escrow is released.'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
