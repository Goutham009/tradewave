'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Search,
  MessageSquare,
  Calendar,
  Building2,
  Star,
  Clock,
  Eye,
  Truck,
  Send,
  FileText,
  ArrowDownLeft,
  ArrowUpRight,
  DollarSign,
} from 'lucide-react';

const mockReceivedQuotes = [
  {
    id: 'QUO-2024-001',
    requirementId: 'REQ-2024-001',
    requirementTitle: 'Steel Components for Manufacturing',
    supplier: { name: 'Shanghai Steel Co.', rating: 4.8, verified: true },
    unitPrice: 4.5,
    quantity: 5000,
    total: 22500,
    currency: 'USD',
    leadTime: '14 days',
    validUntil: '2026-03-01',
    status: 'PENDING',
    createdAt: '2026-02-12',
  },
  {
    id: 'QUO-2024-002',
    requirementId: 'REQ-2024-001',
    requirementTitle: 'Steel Components for Manufacturing',
    supplier: { name: 'Mumbai Metals Ltd', rating: 4.5, verified: true },
    unitPrice: 4.8,
    quantity: 5000,
    total: 24000,
    currency: 'USD',
    leadTime: '10 days',
    validUntil: '2026-03-05',
    status: 'SHORTLISTED',
    createdAt: '2026-02-13',
  },
  {
    id: 'QUO-2024-003',
    requirementId: 'REQ-2024-002',
    requirementTitle: 'Electronic Circuit Boards',
    supplier: { name: 'Shenzhen Electronics', rating: 4.9, verified: true },
    unitPrice: 12.5,
    quantity: 1000,
    total: 12500,
    currency: 'USD',
    leadTime: '21 days',
    validUntil: '2026-03-10',
    status: 'ACCEPTED',
    createdAt: '2026-02-10',
  },
  {
    id: 'QUO-2024-004',
    requirementId: 'REQ-2024-002',
    requirementTitle: 'Electronic Circuit Boards',
    supplier: { name: 'Taiwan Tech Corp', rating: 4.6, verified: true },
    unitPrice: 14,
    quantity: 1000,
    total: 14000,
    currency: 'USD',
    leadTime: '18 days',
    validUntil: '2026-03-08',
    status: 'REJECTED',
    createdAt: '2026-02-11',
  },
];

const mockSubmittedQuotes = [
  {
    id: 'QUO-S-001',
    requirementId: 'req-abc-001',
    requirementTitle: 'Industrial Steel Pipes - Grade 304',
    buyer: 'Global Imports Inc.',
    category: 'Industrial Materials',
    unitPrice: 1150,
    quantity: 500,
    total: 575000,
    currency: 'USD',
    leadTime: '30 days',
    validUntil: '2026-04-15',
    status: 'SUBMITTED',
    submittedAt: '2026-02-10',
    negotiationStatus: 'Awaiting buyer response',
  },
  {
    id: 'QUO-S-002',
    requirementId: 'req-abc-002',
    requirementTitle: 'Copper Wire - Industrial Grade',
    buyer: 'Euro Manufacturing GmbH',
    category: 'Metals & Alloys',
    unitPrice: 8800,
    quantity: 200,
    total: 1760000,
    currency: 'USD',
    leadTime: '45 days',
    validUntil: '2026-04-20',
    status: 'APPROVED_BY_ADMIN',
    submittedAt: '2026-02-08',
    negotiationStatus: 'Buyer reviewing with AM',
  },
  {
    id: 'QUO-S-003',
    requirementId: 'req-abc-003',
    requirementTitle: 'Aluminum Sheets - 5mm',
    buyer: 'Rotterdam Trading BV',
    category: 'Metals & Alloys',
    unitPrice: 2400,
    quantity: 150,
    total: 360000,
    currency: 'USD',
    leadTime: '25 days',
    validUntil: '2026-03-30',
    status: 'ACCEPTED',
    submittedAt: '2026-02-05',
    negotiationStatus: 'Negotiation accepted',
  },
];

const getStatusBadge = (status: string) => {
  const v: Record<string, { variant: any; label: string }> = {
    PENDING: { variant: 'warning', label: 'Pending Review' },
    SUBMITTED: { variant: 'info', label: 'Submitted' },
    UNDER_REVIEW: { variant: 'info', label: 'Under Review' },
    SHORTLISTED: { variant: 'success', label: 'Shortlisted' },
    APPROVED_BY_ADMIN: { variant: 'info', label: 'Approved' },
    ACCEPTED: { variant: 'success', label: 'Accepted' },
    REJECTED: { variant: 'destructive', label: 'Rejected' },
    EXPIRED: { variant: 'secondary', label: 'Expired' },
  };
  const c = v[status] || { variant: 'secondary', label: status };
  return <Badge variant={c.variant}>{c.label}</Badge>;
};

export default function QuotationsPage() {
  const [view, setView] = useState<'received' | 'submitted'>('received');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const pendingReceivedCount = mockReceivedQuotes.filter((q) => q.status === 'PENDING').length;

  const receivedRequirementCards = useMemo(() => {
    const groups = new Map<string, (typeof mockReceivedQuotes)[number][]>();
    for (const quotation of mockReceivedQuotes) {
      if (!groups.has(quotation.requirementId)) {
        groups.set(quotation.requirementId, []);
      }
      groups.get(quotation.requirementId)?.push(quotation);
    }

    return Array.from(groups.entries()).map(([requirementId, quotations]) => {
      const sortedByPrice = [...quotations].sort((a, b) => a.total - b.total);
      const latestQuote = [...quotations].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];

      return {
        requirementId,
        requirementTitle: quotations[0].requirementTitle,
        quoteCount: quotations.length,
        pendingCount: quotations.filter((item) => item.status === 'PENDING').length,
        statuses: Array.from(new Set(quotations.map((item) => item.status))),
        bestQuoteTotal: sortedByPrice[0].total,
        highestQuoteTotal: sortedByPrice[sortedByPrice.length - 1].total,
        currency: quotations[0].currency,
        suppliers: quotations.map((item) => item.supplier.name),
        latestReceivedAt: latestQuote.createdAt,
      };
    });
  }, []);

  const filteredRequirementCards = receivedRequirementCards.filter((card) => {
    const matchesSearch =
      card.requirementTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.requirementId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || card.statuses.includes(statusFilter);
    return matchesSearch && matchesStatus;
  });

  const filteredSubmitted = mockSubmittedQuotes.filter((q) => {
    const matchesSearch =
      q.requirementTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.buyer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quotations</h1>
          <p className="text-muted-foreground">
            As buyer, review requirement-level quote summaries. As supplier, track submitted quotes and negotiations.
          </p>
        </div>
        {view === 'received' && pendingReceivedCount > 0 && (
          <Badge variant="warning" className="text-sm px-3 py-1">
            {pendingReceivedCount} pending quotes
          </Badge>
        )}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="inline-flex rounded-lg border border-input p-1 bg-muted/30">
              <button
                onClick={() => {
                  setView('received');
                  setStatusFilter('all');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  view === 'received' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <ArrowDownLeft className="h-3.5 w-3.5" />
                Received
              </button>
              <button
                onClick={() => {
                  setView('submitted');
                  setStatusFilter('all');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  view === 'submitted' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <ArrowUpRight className="h-3.5 w-3.5" />
                Submitted
              </button>
            </div>

            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by requirement, quote ID, or buyer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {view === 'received' ? (
                <>
                  <option value="all">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="SHORTLISTED">Shortlisted</option>
                  <option value="ACCEPTED">Accepted</option>
                  <option value="REJECTED">Rejected</option>
                </>
              ) : (
                <>
                  <option value="all">All Status</option>
                  <option value="SUBMITTED">Submitted</option>
                  <option value="APPROVED_BY_ADMIN">Approved by Admin</option>
                  <option value="ACCEPTED">Accepted</option>
                  <option value="REJECTED">Rejected</option>
                </>
              )}
            </select>
          </div>
        </CardContent>
      </Card>

      {view === 'received' && (
        <div className="grid gap-4">
          {filteredRequirementCards.map((card) => (
            <Card key={card.requirementId} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-semibold">{card.requirementTitle}</h3>
                      <Badge variant="outline" className="font-mono text-xs">
                        {card.requirementId}
                      </Badge>
                      <Badge variant="info">{card.quoteCount} quotations</Badge>
                      {card.pendingCount > 0 && <Badge variant="warning">{card.pendingCount} pending review</Badge>}
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        Best: {card.currency} {card.bestQuoteTotal.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        Highest: {card.currency} {card.highestQuoteTotal.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Latest quote: {new Date(card.latestReceivedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {card.suppliers.slice(0, 3).map((supplier) => (
                        <Badge key={supplier} variant="outline" className="text-xs">
                          <Building2 className="mr-1 h-3 w-3" />
                          {supplier}
                        </Badge>
                      ))}
                      {card.suppliers.length > 3 && <Badge variant="secondary">+{card.suppliers.length - 3} more</Badge>}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Link href={`/buyer/quotations/compare?requirementId=${card.requirementId}`}>
                      <Button variant="gradient" size="sm">
                        <FileText className="mr-2 h-4 w-4" />
                        View Quotations
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredRequirementCards.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No quotation groups found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Once suppliers submit quotations, each requirement appears here with quote counts.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {view === 'submitted' && (
        <div className="grid gap-4">
          {filteredSubmitted.map((q) => (
            <Card key={q.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500/10">
                      <Send className="h-6 w-6 text-teal-500" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{q.id}</h3>
                        {getStatusBadge(q.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">For: {q.requirementTitle}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                        {q.buyer}
                        <span>•</span>
                        <Star className="h-4 w-4" />
                        {q.negotiationStatus}
                      </div>
                    </div>
                  </div>

                  <div className="text-right space-y-2">
                    <p className="text-2xl font-bold">
                      {q.currency} {q.total.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {q.currency} {q.unitPrice.toLocaleString()} / unit × {q.quantity.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">Lead time: {q.leadTime}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Valid until: {new Date(q.validUntil).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Submitted: {new Date(q.submittedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/quotations/${q.id}?context=submitted`}>
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                    </Link>
                    {q.status === 'ACCEPTED' && (
                      <Link href="/orders">
                        <Button size="sm" variant="gradient">
                          <Truck className="mr-2 h-4 w-4" />
                          Manage Order
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredSubmitted.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Send className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No submitted quotes</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Submit quotes for incoming requirements to start negotiations.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
