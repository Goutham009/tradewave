'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

type BuyerReceivedQuote = {
  id: string;
  requirementId: string;
  requirementTitle: string;
  supplier: {
    name: string;
    rating: number | null;
    verified: boolean;
  };
  unitPrice: number;
  quantity: number;
  total: number;
  currency: string;
  leadTime: string;
  validUntil: string;
  status: string;
  createdAt: string;
};

type SupplierSubmittedQuote = {
  id: string;
  requirementId: string;
  requirementTitle: string;
  category: string;
  unitPrice: number;
  quantity: number;
  total: number;
  currency: string;
  leadTime: string;
  validUntil: string;
  status: string;
  submittedAt: string;
  negotiationStatus: string;
};

const getStatusBadge = (status: string) => {
  const v: Record<string, { variant: any; label: string }> = {
    PENDING: { variant: 'warning', label: 'Pending Review' },
    SUBMITTED: { variant: 'info', label: 'Submitted' },
    UNDER_REVIEW: { variant: 'info', label: 'Under Review' },
    SHORTLISTED: { variant: 'success', label: 'Shortlisted' },
    APPROVED_BY_ADMIN: { variant: 'info', label: 'Approved' },
    VISIBLE_TO_BUYER: { variant: 'info', label: 'Visible to Buyer' },
    IN_NEGOTIATION: { variant: 'warning', label: 'In Negotiation' },
    ACCEPTED: { variant: 'success', label: 'Accepted' },
    REJECTED: { variant: 'destructive', label: 'Rejected' },
    DECLINED: { variant: 'destructive', label: 'Declined' },
    EXPIRED: { variant: 'secondary', label: 'Expired' },
  };
  const c = v[status] || { variant: 'secondary', label: status };
  return <Badge variant={c.variant}>{c.label}</Badge>;
};

const asNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toLeadTimeLabel = (days: unknown): string => {
  const parsed = asNumber(days);
  return parsed > 0 ? `${parsed} days` : 'TBD';
};

const PENDING_RECEIVED_STATUSES = new Set([
  'PENDING',
  'SUBMITTED',
  'APPROVED_BY_ADMIN',
  'VISIBLE_TO_BUYER',
  'SHORTLISTED',
  'IN_NEGOTIATION',
]);

export default function QuotationsPage() {
  const searchParams = useSearchParams();
  const [view, setView] = useState<'received' | 'submitted'>(
    searchParams.get('view') === 'submitted' ? 'submitted' : 'received'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [receivedQuotes, setReceivedQuotes] = useState<BuyerReceivedQuote[]>([]);
  const [submittedQuotes, setSubmittedQuotes] = useState<SupplierSubmittedQuote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const requestedView = searchParams.get('view');
    if (requestedView === 'submitted') {
      setView('submitted');
      setStatusFilter('all');
    } else if (requestedView === 'received') {
      setView('received');
      setStatusFilter('all');
    }
  }, [searchParams]);

  const loadQuotations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (view === 'received') {
        const response = await fetch('/api/quotations?limit=100');
        const payload = await response.json();

        if (!response.ok || payload?.status !== 'success') {
          setReceivedQuotes([]);
          setError(payload?.error || 'Failed to load received quotations');
          return;
        }

        const mapped: BuyerReceivedQuote[] = Array.isArray(payload?.data?.quotations)
          ? payload.data.quotations.map((item: any) => ({
              id: item.id,
              requirementId: item.requirementId,
              requirementTitle: item.requirement?.title || 'Requirement',
              supplier: {
                name: item.supplier?.companyName || item.supplier?.name || 'Supplier',
                rating:
                  item.supplier?.overallRating !== null && item.supplier?.overallRating !== undefined
                    ? asNumber(item.supplier.overallRating)
                    : null,
                verified: Boolean(item.supplier?.verified),
              },
              unitPrice: asNumber(item.unitPrice),
              quantity: asNumber(item.quantity),
              total: asNumber(item.total),
              currency: item.currency || 'USD',
              leadTime: toLeadTimeLabel(item.deliveryTimeline || item.leadTime),
              validUntil: item.validUntil || new Date().toISOString(),
              status: item.status || 'PENDING',
              createdAt: item.createdAt || new Date().toISOString(),
            }))
          : [];

        setReceivedQuotes(mapped);
        return;
      }

      const response = await fetch('/api/supplier/quotations?limit=100');
      const payload = await response.json();

      if (!response.ok) {
        setSubmittedQuotes([]);

        if (response.status === 403) {
          setError('Submitted quotations are available for supplier accounts only.');
          return;
        }

        setError(payload?.error || 'Failed to load submitted quotations');
        return;
      }

      const mapped: SupplierSubmittedQuote[] = Array.isArray(payload?.quotations)
        ? payload.quotations.map((item: any) => ({
            id: item.id,
            requirementId: item.requirementId,
            requirementTitle: item.requirementTitle || 'Requirement',
            category: item.category || 'General',
            unitPrice: asNumber(item.pricePerUnit),
            quantity: asNumber(item.quantity),
            total: asNumber(item.total),
            currency: item.currency || 'USD',
            leadTime: toLeadTimeLabel(item.deliveryTimeline),
            validUntil: item.validUntil || new Date().toISOString(),
            status: item.status || 'SUBMITTED',
            submittedAt: item.submittedAt || item.createdAt || new Date().toISOString(),
            negotiationStatus: item.negotiationThreadId
              ? 'In negotiation'
              : item.status === 'ACCEPTED'
                ? 'Negotiation accepted'
                : item.status === 'APPROVED_BY_ADMIN' || item.status === 'VISIBLE_TO_BUYER'
                  ? 'Buyer reviewing with AM'
                  : item.status === 'SUBMITTED'
                    ? 'Awaiting buyer response'
                    : 'No active negotiation',
          }))
        : [];

      setSubmittedQuotes(mapped);
    } catch {
      if (view === 'received') {
        setReceivedQuotes([]);
      } else {
        setSubmittedQuotes([]);
      }
      setError('Network error while loading quotations');
    } finally {
      setLoading(false);
    }
  }, [view]);

  useEffect(() => {
    void loadQuotations();
  }, [loadQuotations]);

  const pendingReceivedCount = receivedQuotes.filter((q) => PENDING_RECEIVED_STATUSES.has(q.status)).length;

  const receivedRequirementCards = useMemo(() => {
    const groups = new Map<string, BuyerReceivedQuote[]>();
    for (const quotation of receivedQuotes) {
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
        pendingCount: quotations.filter((item) => PENDING_RECEIVED_STATUSES.has(item.status)).length,
        statuses: Array.from(new Set(quotations.map((item) => item.status))),
        bestQuoteTotal: sortedByPrice[0].total,
        highestQuoteTotal: sortedByPrice[sortedByPrice.length - 1].total,
        currency: quotations[0].currency,
        suppliers: quotations.map((item) => item.supplier.name),
        latestReceivedAt: latestQuote.createdAt,
      };
    });
  }, [receivedQuotes]);

  const filteredRequirementCards = receivedRequirementCards.filter((card) => {
    const matchesSearch =
      card.requirementTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.requirementId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || card.statuses.includes(statusFilter);
    return matchesSearch && matchesStatus;
  });

  const filteredSubmitted = submittedQuotes.filter((q) => {
    const matchesSearch =
      q.requirementTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.category.toLowerCase().includes(searchQuery.toLowerCase());
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
        <div className="flex items-center gap-2">
          {view === 'received' && pendingReceivedCount > 0 && (
            <Badge variant="warning" className="text-sm px-3 py-1">
              {pendingReceivedCount} pending quotes
            </Badge>
          )}
          <Button variant="outline" onClick={() => void loadQuotations()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
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
                  <option value="VISIBLE_TO_BUYER">Visible to Buyer</option>
                  <option value="APPROVED_BY_ADMIN">Approved by Admin</option>
                  <option value="IN_NEGOTIATION">In Negotiation</option>
                  <option value="SHORTLISTED">Shortlisted</option>
                  <option value="ACCEPTED">Accepted</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="DECLINED">Declined</option>
                </>
              ) : (
                <>
                  <option value="all">All Status</option>
                  <option value="SUBMITTED">Submitted</option>
                  <option value="APPROVED_BY_ADMIN">Approved by Admin</option>
                  <option value="VISIBLE_TO_BUYER">Visible to Buyer</option>
                  <option value="IN_NEGOTIATION">In Negotiation</option>
                  <option value="ACCEPTED">Accepted</option>
                  <option value="DECLINED">Declined</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="EXPIRED">Expired</option>
                </>
              )}
            </select>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading quotations...</p>
          </CardContent>
        </Card>
      )}

      {!loading && error && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 gap-3">
            <AlertCircle className="h-10 w-10 text-red-500" />
            <p className="text-sm text-muted-foreground text-center max-w-md">{error}</p>
            <Button variant="outline" onClick={() => void loadQuotations()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {!loading && !error && view === 'received' && (
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

      {!loading && !error && view === 'submitted' && (
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
                        {q.category}
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
