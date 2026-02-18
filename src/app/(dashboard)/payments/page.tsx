'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Search, CreditCard, DollarSign, ArrowUpRight, ArrowDownLeft,
  Clock, CheckCircle2, Shield, Download, Calendar,
} from 'lucide-react';

// ── Mock: Payments Made (as buyer) ──
const mockPaymentsMade = [
  { id: 'PAY-2024-001', transactionId: 'TXN-2024-001', description: 'Steel Components - Escrow Deposit', amount: 22500, currency: 'USD', type: 'ESCROW_DEPOSIT', status: 'SUCCEEDED', method: 'Bank Transfer', createdAt: '2024-01-15T10:30:00Z' },
  { id: 'PAY-2024-002', transactionId: 'TXN-2024-002', description: 'Electronic Circuit Boards - Escrow Deposit', amount: 12500, currency: 'USD', type: 'ESCROW_DEPOSIT', status: 'SUCCEEDED', method: 'Credit Card', createdAt: '2024-01-14T14:00:00Z' },
  { id: 'PAY-2024-003', transactionId: 'TXN-2024-003', description: 'Platform Fee - January 2024', amount: 450, currency: 'USD', type: 'PLATFORM_FEE', status: 'SUCCEEDED', method: 'Auto-deduct', createdAt: '2024-01-31T00:00:00Z' },
];

// ── Mock: Payments Received (as supplier) ──
const mockPaymentsReceived = [
  { id: 'PAY-R-001', transactionId: 'TXN-S-003', description: 'Aluminum Sheets - Escrow Release', amount: 360000, currency: 'USD', type: 'ESCROW_RELEASE', status: 'SUCCEEDED', method: 'Bank Transfer', createdAt: '2026-03-01T10:00:00Z' },
  { id: 'PAY-R-002', transactionId: 'TXN-S-001', description: 'Steel Pipes - Partial Payment', amount: 287500, currency: 'USD', type: 'ESCROW_RELEASE', status: 'PROCESSING', method: 'Bank Transfer', createdAt: '2026-03-10T14:00:00Z' },
  { id: 'PAY-R-003', transactionId: 'TXN-S-002', description: 'Platform Fee - February 2026', amount: 2100, currency: 'USD', type: 'PLATFORM_FEE', status: 'SUCCEEDED', method: 'Auto-deduct', createdAt: '2026-02-28T00:00:00Z' },
];

const getStatusBadge = (status: string) => {
  const v: Record<string, { variant: any; label: string }> = {
    PENDING: { variant: 'warning', label: 'Pending' }, PROCESSING: { variant: 'info', label: 'Processing' },
    SUCCEEDED: { variant: 'success', label: 'Succeeded' }, FAILED: { variant: 'destructive', label: 'Failed' },
    REFUNDED: { variant: 'secondary', label: 'Refunded' },
  };
  const c = v[status] || { variant: 'secondary', label: status };
  return <Badge variant={c.variant}>{c.label}</Badge>;
};

const getTypeIcon = (type: string, viewDir: 'paid' | 'received') => {
  if (type === 'ESCROW_DEPOSIT') return <ArrowUpRight className="h-4 w-4 text-blue-500" />;
  if (type === 'ESCROW_RELEASE') return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
  return <DollarSign className="h-4 w-4 text-gray-500" />;
};

export default function PaymentsPage() {
  const [view, setView] = useState<'paid' | 'received'>('paid');
  const [searchQuery, setSearchQuery] = useState('');

  const payments = view === 'paid' ? mockPaymentsMade : mockPaymentsReceived;
  const totalAmount = payments.filter(p => p.status === 'SUCCEEDED').reduce((sum, p) => sum + p.amount, 0);

  const filteredPayments = payments.filter(p =>
    p.description.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payments & Escrow</h1>
          <p className="text-muted-foreground">Manage payments made and received</p>
        </div>
        <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export</Button>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between"><Shield className="h-8 w-8 opacity-80" /><span className="text-xs opacity-80">{view === 'paid' ? 'Total Paid' : 'Total Received'}</span></div>
            <div className="mt-4"><p className="text-3xl font-bold">${totalAmount.toLocaleString()}</p><p className="text-sm opacity-80">{view === 'paid' ? 'Escrow & Fees' : 'Released Funds'}</p></div>
          </CardContent>
        </Card>
        <Card><CardContent className="p-6"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10"><Clock className="h-5 w-5 text-yellow-500" /></div><div><p className="text-2xl font-bold">{payments.filter(p => p.status === 'PROCESSING').length}</p><p className="text-sm text-muted-foreground">Processing</p></div></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10"><CheckCircle2 className="h-5 w-5 text-green-500" /></div><div><p className="text-2xl font-bold">{payments.filter(p => p.status === 'SUCCEEDED').length}</p><p className="text-sm text-muted-foreground">Succeeded</p></div></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10"><CreditCard className="h-5 w-5 text-purple-500" /></div><div><p className="text-2xl font-bold">{payments.length}</p><p className="text-sm text-muted-foreground">Transactions</p></div></div></CardContent></Card>
      </div>

      {/* Escrow Conditions (shown for paid view) */}
      {view === 'paid' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Active Escrow - TXN-2024-001</CardTitle>
            <CardDescription>Funds will be released when all conditions are met</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between"><span className="text-sm font-medium">Release Progress</span><span className="text-sm text-muted-foreground">2 of 3 conditions met</span></div>
              <Progress value={66} className="h-2" />
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-green-500" /><span className="text-sm">Delivery Confirmed</span><Badge variant="success" className="ml-auto">Complete</Badge></div>
                <div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-green-500" /><span className="text-sm">Quality Approved</span><Badge variant="success" className="ml-auto">Complete</Badge></div>
                <div className="flex items-center gap-3"><Clock className="h-5 w-5 text-yellow-500" /><span className="text-sm">Documents Verified</span><Badge variant="warning" className="ml-auto">Pending</Badge></div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="inline-flex rounded-lg border border-input p-1 bg-muted/30">
              <button onClick={() => setView('paid')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'paid' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                <ArrowUpRight className="h-3.5 w-3.5" />Payments Made
              </button>
              <button onClick={() => setView('received')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'received' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                <ArrowDownLeft className="h-3.5 w-3.5" />Payments Received
              </button>
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search payments..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments List */}
      <Card>
        <CardHeader><CardTitle>Payment History</CardTitle><CardDescription>{view === 'paid' ? 'Payments you have made' : 'Payments you have received'}</CardDescription></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPayments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">{getTypeIcon(payment.type, view)}</div>
                  <div>
                    <div className="flex items-center gap-2"><p className="font-medium">{payment.description}</p>{getStatusBadge(payment.status)}</div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{payment.id}</span><span>•</span><span>{payment.method}</span><span>•</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(payment.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-semibold ${view === 'received' && payment.type === 'ESCROW_RELEASE' ? 'text-green-600' : ''}`}>
                    {view === 'received' && payment.type === 'ESCROW_RELEASE' ? '+' : '-'}${payment.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">{payment.currency}</p>
                </div>
              </div>
            ))}
            {filteredPayments.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12"><DollarSign className="h-12 w-12 text-muted-foreground" /><h3 className="mt-4 text-lg font-semibold">No payments found</h3><p className="mt-2 text-sm text-muted-foreground">{view === 'paid' ? 'Payments will appear when you fund escrow' : 'Received payments will appear when escrow is released'}</p></div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
