'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Search, MessageSquare, Calendar, Building2, Star,
  CheckCircle2, Clock, Eye, GitCompare, Truck, X,
  Send, FileText, ArrowDownLeft, ArrowUpRight,
} from 'lucide-react';

// ── Mock: Received Quotes (as buyer) ──
const mockReceivedQuotes = [
  {
    id: 'QUO-2024-001', requirementId: 'REQ-2024-001',
    requirementTitle: 'Steel Components for Manufacturing',
    supplier: { name: 'Shanghai Steel Co.', rating: 4.8, verified: true },
    unitPrice: 4.5, quantity: 5000, total: 22500, currency: 'USD',
    leadTime: '14 days', validUntil: '2024-02-01', status: 'PENDING', createdAt: '2024-01-12',
  },
  {
    id: 'QUO-2024-002', requirementId: 'REQ-2024-001',
    requirementTitle: 'Steel Components for Manufacturing',
    supplier: { name: 'Mumbai Metals Ltd', rating: 4.5, verified: true },
    unitPrice: 4.8, quantity: 5000, total: 24000, currency: 'USD',
    leadTime: '10 days', validUntil: '2024-02-05', status: 'SHORTLISTED', createdAt: '2024-01-13',
  },
  {
    id: 'QUO-2024-003', requirementId: 'REQ-2024-002',
    requirementTitle: 'Electronic Circuit Boards',
    supplier: { name: 'Shenzhen Electronics', rating: 4.9, verified: true },
    unitPrice: 12.5, quantity: 1000, total: 12500, currency: 'USD',
    leadTime: '21 days', validUntil: '2024-02-10', status: 'ACCEPTED', createdAt: '2024-01-10',
  },
  {
    id: 'QUO-2024-004', requirementId: 'REQ-2024-002',
    requirementTitle: 'Electronic Circuit Boards',
    supplier: { name: 'Taiwan Tech Corp', rating: 4.6, verified: true },
    unitPrice: 14.0, quantity: 1000, total: 14000, currency: 'USD',
    leadTime: '18 days', validUntil: '2024-02-08', status: 'REJECTED', createdAt: '2024-01-11',
  },
];

// ── Mock: Submitted Quotes (as supplier) ──
const mockSubmittedQuotes = [
  {
    id: 'QUO-S-001', requirementId: 'req-abc-001',
    requirementTitle: 'Industrial Steel Pipes - Grade 304',
    buyer: 'Global Imports Inc.', category: 'Industrial Materials',
    unitPrice: 1150, quantity: 500, total: 575000, currency: 'USD',
    leadTime: '30 days', validUntil: '2026-04-15', status: 'SUBMITTED',
    submittedAt: '2026-02-10', adminReviewed: false, visibleToBuyer: false,
  },
  {
    id: 'QUO-S-002', requirementId: 'req-abc-002',
    requirementTitle: 'Copper Wire - Industrial Grade',
    buyer: 'Euro Manufacturing GmbH', category: 'Metals & Alloys',
    unitPrice: 8800, quantity: 200, total: 1760000, currency: 'USD',
    leadTime: '45 days', validUntil: '2026-04-20', status: 'APPROVED_BY_ADMIN',
    submittedAt: '2026-02-08', adminReviewed: true, visibleToBuyer: true,
  },
  {
    id: 'QUO-S-003', requirementId: 'req-abc-003',
    requirementTitle: 'Aluminum Sheets - 5mm',
    buyer: 'Rotterdam Trading BV', category: 'Metals & Alloys',
    unitPrice: 2400, quantity: 150, total: 360000, currency: 'USD',
    leadTime: '25 days', validUntil: '2026-03-30', status: 'ACCEPTED',
    submittedAt: '2026-02-05', adminReviewed: true, visibleToBuyer: true,
  },
];

// ── Badge helpers ──
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

// ── Main Page with Received / Submitted filter toggle ──
export default function QuotationsPage() {
  const [view, setView] = useState<'received' | 'submitted'>('received');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  const pendingReceivedCount = mockReceivedQuotes.filter(q => q.status === 'PENDING').length;
  const toggleSelection = (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const selectedQuotations = mockReceivedQuotes.filter(q => selectedIds.includes(q.id));

  const filteredReceived = mockReceivedQuotes
    .filter(q => {
      const s = q.requirementTitle.toLowerCase().includes(searchQuery.toLowerCase()) || q.supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) || q.id.toLowerCase().includes(searchQuery.toLowerCase());
      return s && (statusFilter === 'all' || q.status === statusFilter);
    })
    .sort((a, b) => {
      switch (sortBy) { case 'price-low': return a.total - b.total; case 'price-high': return b.total - a.total; case 'lead-time': return parseInt(a.leadTime) - parseInt(b.leadTime); case 'rating': return b.supplier.rating - a.supplier.rating; default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); }
    });

  const filteredSubmitted = mockSubmittedQuotes.filter(q => {
    const s = q.requirementTitle.toLowerCase().includes(searchQuery.toLowerCase()) || q.id.toLowerCase().includes(searchQuery.toLowerCase());
    return s && (statusFilter === 'all' || q.status === statusFilter);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quotations</h1>
          <p className="text-muted-foreground">Manage received and submitted quotations</p>
        </div>
        {view === 'received' && pendingReceivedCount > 0 && (
          <Badge variant="warning" className="text-sm px-3 py-1">{pendingReceivedCount} pending review</Badge>
        )}
      </div>

      {/* Filters Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* View Toggle */}
            <div className="inline-flex rounded-lg border border-input p-1 bg-muted/30">
              <button onClick={() => { setView('received'); setStatusFilter('all'); setSelectedIds([]); }} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'received' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                <ArrowDownLeft className="h-3.5 w-3.5" />Received
                {pendingReceivedCount > 0 && <Badge variant="warning" className="h-5 px-1.5 text-[10px]">{pendingReceivedCount}</Badge>}
              </button>
              <button onClick={() => { setView('submitted'); setStatusFilter('all'); setSelectedIds([]); }} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'submitted' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                <ArrowUpRight className="h-3.5 w-3.5" />Submitted
              </button>
            </div>
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search quotations..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <div className="flex gap-2 flex-wrap">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-md border border-input bg-background px-3 py-2 text-sm">
                {view === 'received' ? (
                  <><option value="all">All Status</option><option value="PENDING">Pending</option><option value="SHORTLISTED">Shortlisted</option><option value="ACCEPTED">Accepted</option><option value="REJECTED">Rejected</option></>
                ) : (
                  <><option value="all">All Status</option><option value="SUBMITTED">Pending Review</option><option value="APPROVED_BY_ADMIN">Approved</option><option value="ACCEPTED">Accepted</option><option value="REJECTED">Rejected</option></>
                )}
              </select>
              {view === 'received' && (
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="date">Newest First</option><option value="price-low">Price: Low→High</option><option value="price-high">Price: High→Low</option><option value="lead-time">Fastest Delivery</option><option value="rating">Highest Rating</option>
                </select>
              )}
              {view === 'received' && selectedIds.length >= 2 && (
                <Button variant="gradient" size="sm" onClick={() => setShowCompare(true)}><GitCompare className="mr-2 h-4 w-4" />Compare ({selectedIds.length})</Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Received Quotes */}
      {view === 'received' && (
        <div className="grid gap-4">
          {filteredReceived.map((q) => (
            <Card key={q.id} className={`hover:shadow-md transition-shadow ${selectedIds.includes(q.id) ? 'ring-2 ring-primary' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" checked={selectedIds.includes(q.id)} onChange={() => toggleSelection(q.id)} className="h-4 w-4 rounded border-gray-300" />
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10"><MessageSquare className="h-6 w-6 text-blue-500" /></div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2"><h3 className="font-semibold">{q.id}</h3>{getStatusBadge(q.status)}</div>
                      <p className="text-sm text-muted-foreground">For: {q.requirementTitle}</p>
                      <div className="flex items-center gap-2 pt-1">
                        <Building2 className="h-4 w-4 text-muted-foreground" /><span className="text-sm font-medium">{q.supplier.name}</span>
                        {q.supplier.verified && <Badge variant="outline" className="text-xs">Verified</Badge>}
                        <div className="flex items-center gap-1"><Star className="h-3 w-3 fill-yellow-400 text-yellow-400" /><span className="text-xs">{q.supplier.rating}</span></div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <p className="text-2xl font-bold">${q.total.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">${q.unitPrice}/unit x {q.quantity}</p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground justify-end"><Clock className="h-4 w-4" /><span>Lead: {q.leadTime}</span></div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                  <span className="flex items-center gap-1 text-sm text-muted-foreground"><Calendar className="h-4 w-4" />Valid until: {new Date(q.validUntil).toLocaleDateString()}</span>
                  <div className="flex gap-2">
                    <Link href={`/quotations/${q.id}`}><Button variant="outline" size="sm"><Eye className="mr-2 h-4 w-4" />View Details</Button></Link>
                    {q.status === 'PENDING' && <Button size="sm" variant="gradient"><CheckCircle2 className="mr-2 h-4 w-4" />Review</Button>}
                    {q.status === 'SHORTLISTED' && <Button size="sm" variant="gradient"><CheckCircle2 className="mr-2 h-4 w-4" />Accept</Button>}
                    {q.status === 'ACCEPTED' && <Link href="/orders"><Button size="sm" variant="gradient"><Truck className="mr-2 h-4 w-4" />Track Order</Button></Link>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredReceived.length === 0 && (
            <Card><CardContent className="flex flex-col items-center justify-center py-12"><MessageSquare className="h-12 w-12 text-muted-foreground" /><h3 className="mt-4 text-lg font-semibold">No received quotations</h3><p className="mt-2 text-sm text-muted-foreground">Quotations will appear here once suppliers respond to your requirements</p></CardContent></Card>
          )}
        </div>
      )}

      {/* Submitted Quotes */}
      {view === 'submitted' && (
        <div className="grid gap-4">
          {filteredSubmitted.map((q) => (
            <Card key={q.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500/10"><Send className="h-6 w-6 text-teal-500" /></div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{q.id}</h3>{getStatusBadge(q.status)}
                        {!q.adminReviewed && <Badge variant="outline" className="text-xs"><Clock className="h-3 w-3 mr-1" />Awaiting Review</Badge>}
                        {q.visibleToBuyer && <Badge variant="outline" className="text-xs text-green-700"><Eye className="h-3 w-3 mr-1" />Buyer Can See</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">For: {q.requirementTitle}</p>
                      <p className="text-xs text-muted-foreground">{q.category}</p>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <p className="text-2xl font-bold">${q.total.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">${q.unitPrice}/unit x {q.quantity}</p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground justify-end"><Clock className="h-4 w-4" /><span>Lead: {q.leadTime}</span></div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />Valid until: {new Date(q.validUntil).toLocaleDateString()}</span>
                    <span>Submitted: {new Date(q.submittedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/quotations/${q.id}`}><Button variant="outline" size="sm"><Eye className="mr-2 h-4 w-4" />View Details</Button></Link>
                    {q.status === 'ACCEPTED' && <Link href="/orders"><Button size="sm" variant="gradient"><Truck className="mr-2 h-4 w-4" />Manage Order</Button></Link>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredSubmitted.length === 0 && (
            <Card><CardContent className="flex flex-col items-center justify-center py-12"><Send className="h-12 w-12 text-muted-foreground" /><h3 className="mt-4 text-lg font-semibold">No submitted quotes</h3><p className="mt-2 text-sm text-muted-foreground">Submit quotes for requirements to start selling</p></CardContent></Card>
          )}
        </div>
      )}

      {/* Compare Modal */}
      {showCompare && selectedQuotations.length >= 2 && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-5xl max-h-[90vh] overflow-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <div><CardTitle className="flex items-center gap-2"><GitCompare className="h-5 w-5" />Compare Quotations</CardTitle><CardDescription>Side-by-side comparison</CardDescription></div>
              <Button variant="ghost" size="sm" onClick={() => setShowCompare(false)}><X className="h-5 w-5" /></Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${selectedQuotations.length}, 1fr)` }}>
                {selectedQuotations.map((q) => (
                  <div key={q.id} className="border rounded-lg p-4 space-y-4">
                    <div className="text-center border-b pb-4"><h3 className="font-bold">{q.supplier.name}</h3><div className="flex items-center justify-center gap-1 mt-1"><Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /><span>{q.supplier.rating}</span></div>{getStatusBadge(q.status)}</div>
                    <div className="space-y-3">
                      <div className="flex justify-between"><span className="text-muted-foreground">Total</span><span className="font-bold text-lg">${q.total.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Unit Price</span><span>${q.unitPrice}/unit</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Lead Time</span><span>{q.leadTime}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Valid Until</span><span>{new Date(q.validUntil).toLocaleDateString()}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
