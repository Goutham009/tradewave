'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Plus, Search, FileText, Calendar, MapPin, DollarSign,
  MoreHorizontal, Eye, Edit, Trash2, Clock, Star, Shield,
  Send, CheckCircle2, ArrowDownLeft, ArrowUpRight,
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// ── Mock data: My posted requirements (as buyer) ──
const mockPostedRequirements = [
  {
    id: 'REQ-2024-001', title: 'Steel Components for Manufacturing', category: 'Raw Materials',
    status: 'SOURCING', priority: 'HIGH', quantity: 5000, unit: 'kg', targetPrice: 25000,
    currency: 'USD', deliveryLocation: 'Mumbai, India', deliveryDeadline: '2024-02-15',
    quotationsCount: 3, createdAt: '2024-01-10', type: 'posted' as const,
  },
  {
    id: 'REQ-2024-002', title: 'Electronic Circuit Boards', category: 'Electronics',
    status: 'QUOTATIONS_READY', priority: 'MEDIUM', quantity: 1000, unit: 'pcs', targetPrice: 15000,
    currency: 'USD', deliveryLocation: 'Bangalore, India', deliveryDeadline: '2024-02-28',
    quotationsCount: 5, createdAt: '2024-01-08', type: 'posted' as const,
  },
  {
    id: 'REQ-2024-003', title: 'Industrial Packaging Materials', category: 'Packaging',
    status: 'DRAFT', priority: 'LOW', quantity: 10000, unit: 'units', targetPrice: 8000,
    currency: 'USD', deliveryLocation: 'Delhi, India', deliveryDeadline: '2024-03-15',
    quotationsCount: 0, createdAt: '2024-01-12', type: 'posted' as const,
  },
  {
    id: 'REQ-2024-004', title: 'Textile Fabric Rolls', category: 'Textiles',
    status: 'UNDER_REVIEW', priority: 'URGENT', quantity: 2000, unit: 'meters', targetPrice: 12000,
    currency: 'USD', deliveryLocation: 'Chennai, India', deliveryDeadline: '2024-01-30',
    quotationsCount: 2, createdAt: '2024-01-05', type: 'posted' as const,
  },
];

// ── Mock data: Received requirement cards (as supplier) ──
const mockReceivedRequirements = [
  {
    cardId: 'src-001', requirementId: 'req-abc-001', status: 'SENT',
    sentAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    responseDeadline: new Date(Date.now() + 3 * 86400000).toISOString(),
    daysLeft: 3, isDirect: false,
    title: 'Industrial Steel Pipes - Grade 304', category: 'Industrial Materials',
    quantity: 500, unit: 'MT', budgetRange: '$1,100 - $1,300 / MT',
    currency: 'USD', deliveryLocation: 'Mumbai Port (JNPT), India',
    deliveryDeadline: '2026-05-15',
    certifications: ['ISO 9001', 'CE Marking', 'MTC'],
    matchScore: 95, type: 'received' as const,
  },
  {
    cardId: 'src-002', requirementId: 'req-abc-002', status: 'VIEWED',
    sentAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    responseDeadline: new Date(Date.now() + 5 * 86400000).toISOString(),
    daysLeft: 5, isDirect: true,
    title: 'Copper Wire - Industrial Grade', category: 'Metals & Alloys',
    quantity: 200, unit: 'MT', budgetRange: '$8,000 - $9,500 / MT',
    currency: 'USD', deliveryLocation: 'Shanghai, China',
    deliveryDeadline: '2026-06-01',
    certifications: ['ISO 9001'],
    matchScore: 88, type: 'received' as const,
  },
  {
    cardId: 'src-003', requirementId: 'req-abc-003', status: 'QUOTE_SUBMITTED',
    sentAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    responseDeadline: new Date(Date.now() - 2 * 86400000).toISOString(),
    daysLeft: 0, isDirect: false,
    title: 'Aluminum Sheets - 5mm', category: 'Metals & Alloys',
    quantity: 150, unit: 'MT', budgetRange: '$2,200 - $2,600 / MT',
    currency: 'USD', deliveryLocation: 'Rotterdam, Netherlands',
    deliveryDeadline: '2026-04-20',
    certifications: ['ISO 9001', 'CE Marking'],
    matchScore: 82, type: 'received' as const,
  },
];

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

  const newReceivedCount = mockReceivedRequirements.filter(c => c.status === 'SENT').length;

  // Filter posted requirements
  const filteredPosted = mockPostedRequirements.filter(r => {
    const s = r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.id.toLowerCase().includes(searchQuery.toLowerCase());
    return s && (statusFilter === 'all' || r.status === statusFilter);
  });

  // Filter received requirements
  const filteredReceived = mockReceivedRequirements
    .filter(c => statusFilter === 'all' || c.status === statusFilter)
    .filter(c => !searchQuery || c.title.toLowerCase().includes(searchQuery.toLowerCase()));

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
                  <option value="all">All ({mockReceivedRequirements.length})</option>
                  <option value="SENT">New ({mockReceivedRequirements.filter(c => c.status === 'SENT').length})</option>
                  <option value="VIEWED">Viewed ({mockReceivedRequirements.filter(c => c.status === 'VIEWED').length})</option>
                  <option value="QUOTE_SUBMITTED">Quote Sent ({mockReceivedRequirements.filter(c => c.status === 'QUOTE_SUBMITTED').length})</option>
                </>
              )}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* As Buyer: Posted Requirements */}
      {view === 'as_buyer' && (
        <div className="grid gap-4">
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
                        <span className="flex items-center gap-1"><DollarSign className="h-4 w-4" />{req.currency} {req.targetPrice?.toLocaleString()}</span>
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
        </div>
      )}

      {/* As Supplier: Received Requirements */}
      {view === 'as_supplier' && (
        <div className="grid gap-4">
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
                      <span className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" />{card.budgetRange}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{card.deliveryLocation}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />Due: {new Date(card.deliveryDeadline).toLocaleDateString()}</span>
                    </div>
                    {card.certifications.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {card.certifications.map(cert => (
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
        </div>
      )}
    </div>
  );
}
