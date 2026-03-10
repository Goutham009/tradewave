'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Plus, Search, FileText, Calendar, MapPin, DollarSign,
  Package,
  MoreHorizontal, Eye, Edit, Trash2, Clock, Star, Shield,
  Send, CheckCircle2, ArrowDownLeft, ArrowUpRight, Loader2, AlertCircle,
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type BuyerPostedRequirement = {
  id: string;
  title: string;
  category: string;
  status: string;
  priority: string;
  quantity: number;
  unit: string;
  targetPrice: number | null;
  currency: string;
  deliveryLocation: string;
  deliveryDeadline: string;
  quotationsCount: number;
};

type SupplierRequirementCard = {
  cardId: string;
  requirementId: string;
  status: string;
  daysLeft: number | null;
  isDirect: boolean;
  title: string;
  category: string;
  quantity: number;
  unit: string;
  targetPrice: number | null;
  currency: string;
  deliveryLocation: string;
  deliveryDeadline: string;
  certifications: string[];
  matchScore: number | null;
};

// ── Badge helpers ──
const getStatusBadge = (status: string) => {
  const v: Record<string, { variant: any; label: string }> = {
    DRAFT: { variant: 'secondary', label: 'Draft' },
    SUBMITTED: { variant: 'info', label: 'Submitted' },
    UNDER_REVIEW: { variant: 'warning', label: 'Under Review' },
    PENDING_AM_VERIFICATION: { variant: 'warning', label: 'Pending AM Review' },
    PENDING_ADMIN_REVIEW: { variant: 'warning', label: 'Pending Admin Review' },
    SOURCING: { variant: 'info', label: 'Sourcing' },
    QUOTATIONS_READY: { variant: 'success', label: 'Quotations Ready' },
    NEGOTIATING: { variant: 'warning', label: 'Negotiating' },
    ACCEPTED: { variant: 'success', label: 'Accepted' },
    COMPLETED: { variant: 'success', label: 'Completed' },
    CANCELLED: { variant: 'destructive', label: 'Cancelled' },
    SENT: { variant: 'info', label: 'New' },
    VIEWED: { variant: 'outline', label: 'Viewed' },
    QUOTE_SUBMITTED: { variant: 'success', label: 'Quote Sent' },
    DECLINED: { variant: 'destructive', label: 'Declined' },
    EXPIRED: { variant: 'secondary', label: 'Expired' },
  };
  const c = v[status] || { variant: 'secondary', label: status };
  return <Badge variant={c.variant}>{c.label}</Badge>;
};

const getPriorityBadge = (priority: string) => {
  const v: Record<string, { variant: any; label: string }> = {
    LOW: { variant: 'secondary', label: 'Low' }, MEDIUM: { variant: 'outline', label: 'Medium' },
    HIGH: { variant: 'warning', label: 'High' }, URGENT: { variant: 'destructive', label: 'Urgent' },
  };
  const c = v[priority] || { variant: 'secondary', label: priority };
  return <Badge variant={c.variant}>{c.label}</Badge>;
};

export default function RequirementsPage() {
  const [view, setView] = useState<'as_buyer' | 'as_supplier'>('as_buyer');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [postedRequirements, setPostedRequirements] = useState<BuyerPostedRequirement[]>([]);
  const [postedLoading, setPostedLoading] = useState(false);
  const [postedError, setPostedError] = useState<string | null>(null);
  const [supplierCards, setSupplierCards] = useState<SupplierRequirementCard[]>([]);
  const [supplierLoading, setSupplierLoading] = useState(false);
  const [supplierError, setSupplierError] = useState<string | null>(null);
  const [supplierKybRequired, setSupplierKybRequired] = useState(false);
  const [supplierAccountRequired, setSupplierAccountRequired] = useState(false);

  const loadPostedRequirements = useCallback(async () => {
    try {
      setPostedLoading(true);
      setPostedError(null);

      const res = await fetch('/api/requirements?limit=50');
      const payload = await res.json();

      if (!res.ok || payload?.status !== 'success') {
        setPostedRequirements([]);
        setPostedError(payload?.error || 'Failed to load your posted requirements');
        return;
      }

      const items: BuyerPostedRequirement[] = Array.isArray(payload?.data?.requirements)
        ? payload.data.requirements.map((req: any) => ({
            id: req.id,
            title: req.title,
            category: req.category || 'N/A',
            status: req.status || 'DRAFT',
            priority: req.priority || 'MEDIUM',
            quantity: Number(req.quantity || 0),
            unit: req.unit || 'units',
            targetPrice: req.targetPrice !== null && req.targetPrice !== undefined ? Number(req.targetPrice) : null,
            currency: req.currency || 'USD',
            deliveryLocation: req.deliveryLocation || 'TBD',
            deliveryDeadline: req.deliveryDeadline || new Date().toISOString(),
            quotationsCount: Number(req?._count?.quotations || 0),
          }))
        : [];

      setPostedRequirements(items);
    } catch {
      setPostedRequirements([]);
      setPostedError('Network error while loading your requirements');
    } finally {
      setPostedLoading(false);
    }
  }, []);

  useEffect(() => {
    if (view === 'as_buyer') {
      void loadPostedRequirements();
    }
  }, [view, loadPostedRequirements]);

  const loadSupplierRequirements = useCallback(async () => {
    try {
      setSupplierLoading(true);
      setSupplierError(null);

      const res = await fetch('/api/supplier/requirements');
      const payload = await res.json();

      if (!res.ok) {
        setSupplierError(payload?.error || 'Failed to load supplier requirements');
        setSupplierCards([]);
        return;
      }

      setSupplierKybRequired(Boolean(payload?.kybRequired));
      setSupplierAccountRequired(Boolean(payload?.supplierAccountRequired));

      if (payload?.kybRequired || payload?.supplierAccountRequired) {
        setSupplierCards([]);
        return;
      }

      const cards: SupplierRequirementCard[] = Array.isArray(payload?.requirements)
        ? payload.requirements.map((card: any) => ({
            cardId: card.cardId,
            requirementId: card.requirementId,
            status: card.status,
            daysLeft: typeof card.daysLeft === 'number' ? card.daysLeft : null,
            isDirect: Boolean(card.isDirect),
            title: card.requirement?.title || 'Untitled Requirement',
            category: card.requirement?.category || 'N/A',
            quantity: Number(card.requirement?.quantity || 0),
            unit: card.requirement?.unit || 'units',
            targetPrice:
              card.requirement?.budgetMax !== null && card.requirement?.budgetMax !== undefined
                ? Number(card.requirement.budgetMax)
                : card.requirement?.budgetMin !== null && card.requirement?.budgetMin !== undefined
                  ? Number(card.requirement.budgetMin)
                  : null,
            currency: card.requirement?.currency || 'USD',
            deliveryLocation: card.requirement?.deliveryLocation || 'TBD',
            deliveryDeadline: card.requirement?.deliveryDeadline || new Date().toISOString(),
            certifications: Array.isArray(card.requirement?.requiredCertifications)
              ? card.requirement.requiredCertifications
              : [],
            matchScore:
              card.matchInfo?.matchScore !== null && card.matchInfo?.matchScore !== undefined
                ? Number(card.matchInfo.matchScore)
                : null,
          }))
        : [];

      setSupplierCards(cards);
    } catch {
      setSupplierError('Network error while loading supplier requirements');
      setSupplierCards([]);
    } finally {
      setSupplierLoading(false);
    }
  }, []);

  useEffect(() => {
    if (view === 'as_supplier') {
      void loadSupplierRequirements();
    }
  }, [view, loadSupplierRequirements]);

  const supplierCounts = {
    all: supplierCards.length,
    sent: supplierCards.filter((card) => card.status === 'SENT').length,
    viewed: supplierCards.filter((card) => card.status === 'VIEWED').length,
    quoted: supplierCards.filter((card) => card.status === 'QUOTE_SUBMITTED').length,
  };

  const newReceivedCount = supplierCounts.sent;

  // Filter posted requirements
  const filteredPosted = postedRequirements.filter((r) => {
    const s = r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.id.toLowerCase().includes(searchQuery.toLowerCase());
    return s && (statusFilter === 'all' || r.status === statusFilter);
  });

  // Filter received requirements
  const filteredReceived = supplierCards
    .filter((card) => statusFilter === 'all' || card.status === statusFilter)
    .filter(
      (card) =>
        !searchQuery ||
        card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.requirementId.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Requirements</h1>
          <p className="text-muted-foreground">Manage your posted and received requirements</p>
        </div>
        <Link href="/requirements/new">
          <Button variant="gradient"><Plus className="mr-2 h-4 w-4" />New Requirement</Button>
        </Link>
      </div>

      {/* Filters Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* View Toggle */}
            <div className="inline-flex rounded-lg border border-input p-1 bg-muted/30">
              <button
                onClick={() => { setView('as_buyer'); setStatusFilter('all'); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  view === 'as_buyer' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <ArrowUpRight className="h-3.5 w-3.5" />As Buyer
              </button>
              <button
                onClick={() => { setView('as_supplier'); setStatusFilter('all'); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  view === 'as_supplier' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <ArrowDownLeft className="h-3.5 w-3.5" />As Supplier
                {newReceivedCount > 0 && (
                  <Badge variant="info" className="h-5 px-1.5 text-[10px]">{newReceivedCount}</Badge>
                )}
              </button>
            </div>

            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search requirements..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>

            {/* Status Filter */}
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-md border border-input bg-background px-3 py-2 text-sm">
              {view === 'as_buyer' ? (
                <>
                  <option value="all">All Status</option>
                  <option value="DRAFT">Draft</option>
                  <option value="SUBMITTED">Submitted</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="SOURCING">Sourcing</option>
                  <option value="QUOTATIONS_READY">Quotations Ready</option>
                  <option value="ACCEPTED">Accepted</option>
                  <option value="COMPLETED">Completed</option>
                </>
              ) : (
                <>
                  <option value="all">All ({supplierCounts.all})</option>
                  <option value="SENT">New ({supplierCounts.sent})</option>
                  <option value="VIEWED">Viewed ({supplierCounts.viewed})</option>
                  <option value="QUOTE_SUBMITTED">Quote Sent ({supplierCounts.quoted})</option>
                </>
              )}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* As Buyer: Posted Requirements */}
      {view === 'as_buyer' && (
        <div className="grid gap-4">
          {postedLoading && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="mt-3 text-sm text-muted-foreground">Loading your requirements...</p>
              </CardContent>
            </Card>
          )}

          {!postedLoading && postedError && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-red-500" />
                <h3 className="mt-4 text-lg font-semibold">Unable to load requirements</h3>
                <p className="mt-2 text-sm text-muted-foreground text-center max-w-md">{postedError}</p>
                <Button className="mt-4" variant="outline" onClick={() => void loadPostedRequirements()}>
                  Retry
                </Button>
              </CardContent>
            </Card>
          )}

          {!postedLoading && !postedError && (
            <>
          {filteredPosted.map((req) => (
            <Card key={req.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{req.title}</h3>
                        {getStatusBadge(req.status)}
                        {getPriorityBadge(req.priority)}
                      </div>
                      <p className="text-sm text-muted-foreground">{req.id} &middot; {req.category}</p>
                      <div className="flex flex-wrap gap-4 pt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          Target Price:{' '}
                          {req.targetPrice !== null
                            ? `${req.currency} ${req.targetPrice.toLocaleString()} / ${req.unit}`
                            : 'Not specified'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Package className="h-4 w-4" />
                          Est. Total:{' '}
                          {req.targetPrice !== null
                            ? `${req.currency} ${(req.quantity * req.targetPrice).toLocaleString()}`
                            : 'N/A'}
                        </span>
                        <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{req.deliveryLocation}</span>
                        <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />Due: {new Date(req.deliveryDeadline).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold">{req.quotationsCount}</p>
                      <p className="text-xs text-muted-foreground">Quotations</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild><Link href={`/requirements/${req.id}`} className="flex items-center"><Eye className="mr-2 h-4 w-4" />View Details</Link></DropdownMenuItem>
                        <DropdownMenuItem asChild><Link href={`/requirements/${req.id}/edit`} className="flex items-center"><Edit className="mr-2 h-4 w-4" />Edit</Link></DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredPosted.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No requirements found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {searchQuery || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Get started by creating your first requirement'}
                </p>
                {!searchQuery && statusFilter === 'all' && (
                  <Link href="/requirements/new" className="mt-4"><Button variant="gradient"><Plus className="mr-2 h-4 w-4" />Create Requirement</Button></Link>
                )}
              </CardContent>
            </Card>
          )}
            </>
          )}
        </div>
      )}

      {/* As Supplier: Received Requirements */}
      {view === 'as_supplier' && (
        <div className="grid gap-4">
          {supplierLoading && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="mt-3 text-sm text-muted-foreground">Loading requirement invitations...</p>
              </CardContent>
            </Card>
          )}

          {!supplierLoading && supplierError && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-red-500" />
                <h3 className="mt-4 text-lg font-semibold">Unable to load requirements</h3>
                <p className="mt-2 text-sm text-muted-foreground text-center max-w-md">{supplierError}</p>
                <Button className="mt-4" variant="outline" onClick={() => void loadSupplierRequirements()}>
                  Retry
                </Button>
              </CardContent>
            </Card>
          )}

          {!supplierLoading && !supplierError && supplierKybRequired && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Shield className="h-12 w-12 text-amber-500" />
                <h3 className="mt-4 text-lg font-semibold">KYB Verification Required</h3>
                <p className="mt-2 text-sm text-muted-foreground text-center max-w-md">
                  Complete KYB verification to view requirement invitations and submit quotations.
                </p>
                <Link href="/kyb" className="mt-4">
                  <Button variant="gradient">Go to KYB</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {!supplierLoading && !supplierError && !supplierKybRequired && supplierAccountRequired && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Supplier profile missing</h3>
                <p className="mt-2 text-sm text-muted-foreground text-center max-w-md">
                  Your supplier profile is not linked yet. Contact support or your account manager to activate invitations.
                </p>
              </CardContent>
            </Card>
          )}

          {!supplierLoading && !supplierError && !supplierKybRequired && !supplierAccountRequired && (
            <>
              {filteredReceived.map((card) => (
                <Card key={card.cardId} className={`hover:shadow-md transition-shadow ${card.isDirect ? 'border-amber-300 bg-amber-50/30' : ''} ${card.status === 'SENT' ? 'border-blue-200' : ''}`}>
                  <CardContent className="p-5">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          {getStatusBadge(card.status)}
                          {card.isDirect && <Badge className="bg-amber-500 text-white">Direct Reorder</Badge>}
                          {card.matchScore && <Badge variant="outline"><Star className="h-3 w-3 mr-1" />{card.matchScore}% Match</Badge>}
                        </div>
                        <h3 className="font-semibold text-base">{card.title}</h3>
                        <p className="text-sm text-muted-foreground">{card.category}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3.5 w-3.5" />
                            Target Price:{' '}
                            {card.targetPrice !== null
                              ? `${card.currency} ${card.targetPrice.toLocaleString()} / ${card.unit}`
                              : 'Not specified'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Package className="h-3.5 w-3.5" />
                            Est. Total:{' '}
                            {card.targetPrice !== null
                              ? `${card.currency} ${(card.quantity * card.targetPrice).toLocaleString()}`
                              : 'N/A'}
                          </span>
                          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{card.deliveryLocation}</span>
                          <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />Due: {new Date(card.deliveryDeadline).toLocaleDateString()}</span>
                        </div>
                        {card.certifications.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {card.certifications.map((cert) => (
                              <Badge key={cert} variant="outline" className="text-xs"><Shield className="h-3 w-3 mr-1" />{cert}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <p className="text-lg font-bold">{card.quantity} {card.unit}</p>
                        {card.daysLeft !== null && card.status !== 'QUOTE_SUBMITTED' && (
                          <p className={`text-xs ${card.daysLeft <= 1 ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
                            <Clock className="inline h-3 w-3 mr-1" />
                            {card.daysLeft > 0 ? `${card.daysLeft} days left` : 'Deadline passed'}
                          </p>
                        )}
                        <div className="flex gap-2 mt-1">
                          <Link href={`/requirements/${card.requirementId}?card=${card.cardId}`}>
                            <Button variant="outline" size="sm"><Eye className="mr-1 h-3.5 w-3.5" />View</Button>
                          </Link>
                          {card.status !== 'QUOTE_SUBMITTED' && card.daysLeft !== null && card.daysLeft > 0 && (
                            <Link href={`/quotations/new?card=${card.cardId}&req=${card.requirementId}`}>
                              <Button variant="gradient" size="sm"><Send className="mr-1 h-3.5 w-3.5" />Submit Quote</Button>
                            </Link>
                          )}
                          {card.status === 'QUOTE_SUBMITTED' && (
                            <Button variant="outline" size="sm" disabled><CheckCircle2 className="mr-1 h-3.5 w-3.5" />Quoted</Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredReceived.length === 0 && (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No requirements yet</h3>
                    <p className="mt-2 text-sm text-muted-foreground max-w-sm text-center">
                      {searchQuery || statusFilter !== 'all'
                        ? 'Try adjusting your filters'
                        : 'We\'ll notify you when buyers post requirements matching your products.'}
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
