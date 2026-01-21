'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Search,
  Filter,
  MessageSquare,
  Calendar,
  DollarSign,
  Building2,
  Star,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  ArrowUpDown,
  GitCompare,
  MapPin,
  Truck,
  X,
} from 'lucide-react';

const mockQuotations = [
  {
    id: 'QUO-2024-001',
    requirementId: 'REQ-2024-001',
    requirementTitle: 'Steel Components for Manufacturing',
    supplier: {
      name: 'Shanghai Steel Co.',
      rating: 4.8,
      verified: true,
    },
    unitPrice: 4.5,
    quantity: 5000,
    total: 22500,
    currency: 'USD',
    leadTime: '14 days',
    validUntil: '2024-02-01',
    status: 'PENDING',
    createdAt: '2024-01-12',
  },
  {
    id: 'QUO-2024-002',
    requirementId: 'REQ-2024-001',
    requirementTitle: 'Steel Components for Manufacturing',
    supplier: {
      name: 'Mumbai Metals Ltd',
      rating: 4.5,
      verified: true,
    },
    unitPrice: 4.8,
    quantity: 5000,
    total: 24000,
    currency: 'USD',
    leadTime: '10 days',
    validUntil: '2024-02-05',
    status: 'SHORTLISTED',
    createdAt: '2024-01-13',
  },
  {
    id: 'QUO-2024-003',
    requirementId: 'REQ-2024-002',
    requirementTitle: 'Electronic Circuit Boards',
    supplier: {
      name: 'Shenzhen Electronics',
      rating: 4.9,
      verified: true,
    },
    unitPrice: 12.5,
    quantity: 1000,
    total: 12500,
    currency: 'USD',
    leadTime: '21 days',
    validUntil: '2024-02-10',
    status: 'ACCEPTED',
    createdAt: '2024-01-10',
  },
  {
    id: 'QUO-2024-004',
    requirementId: 'REQ-2024-002',
    requirementTitle: 'Electronic Circuit Boards',
    supplier: {
      name: 'Taiwan Tech Corp',
      rating: 4.6,
      verified: true,
    },
    unitPrice: 14.0,
    quantity: 1000,
    total: 14000,
    currency: 'USD',
    leadTime: '18 days',
    validUntil: '2024-02-08',
    status: 'REJECTED',
    createdAt: '2024-01-11',
  },
];

const getStatusBadge = (status: string) => {
  const variants: Record<string, { variant: any; label: string; icon: any }> = {
    PENDING: { variant: 'warning', label: 'Pending Review', icon: Clock },
    SUBMITTED: { variant: 'info', label: 'Submitted', icon: MessageSquare },
    UNDER_REVIEW: { variant: 'info', label: 'Under Review', icon: Eye },
    SHORTLISTED: { variant: 'success', label: 'Shortlisted', icon: Star },
    ACCEPTED: { variant: 'success', label: 'Accepted', icon: CheckCircle2 },
    REJECTED: { variant: 'destructive', label: 'Rejected', icon: XCircle },
    EXPIRED: { variant: 'secondary', label: 'Expired', icon: Calendar },
  };
  const config = variants[status] || { variant: 'secondary', label: status, icon: Clock };
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export default function QuotationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  const filteredQuotations = mockQuotations
    .filter((quo) => {
      const matchesSearch = 
        quo.requirementTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quo.supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quo.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || quo.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.total - b.total;
        case 'price-high':
          return b.total - a.total;
        case 'lead-time':
          return parseInt(a.leadTime) - parseInt(b.leadTime);
        case 'rating':
          return b.supplier.rating - a.supplier.rating;
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const pendingCount = mockQuotations.filter(q => q.status === 'PENDING').length;

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectedQuotations = mockQuotations.filter(q => selectedIds.includes(q.id));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quotations</h1>
          <p className="text-muted-foreground">
            Review and compare supplier quotations
          </p>
        </div>
        {pendingCount > 0 && (
          <Badge variant="warning" className="text-sm px-3 py-1">
            {pendingCount} pending review
          </Badge>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{mockQuotations.length}</div>
            <p className="text-sm text-muted-foreground">Total Quotations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            <p className="text-sm text-muted-foreground">Pending Review</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {mockQuotations.filter(q => q.status === 'ACCEPTED').length}
            </div>
            <p className="text-sm text-muted-foreground">Accepted</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {mockQuotations.filter(q => q.status === 'SHORTLISTED').length}
            </div>
            <p className="text-sm text-muted-foreground">Shortlisted</p>
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
                placeholder="Search quotations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="SHORTLISTED">Shortlisted</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="REJECTED">Rejected</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="date">Sort: Newest First</option>
                <option value="price-low">Sort: Price Low to High</option>
                <option value="price-high">Sort: Price High to Low</option>
                <option value="lead-time">Sort: Fastest Delivery</option>
                <option value="rating">Sort: Highest Rating</option>
              </select>
              {selectedIds.length >= 2 && (
                <Button variant="gradient" size="sm" onClick={() => setShowCompare(true)}>
                  <GitCompare className="mr-2 h-4 w-4" />
                  Compare ({selectedIds.length})
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quotations List */}
      <div className="grid gap-4">
        {filteredQuotations.map((quotation) => (
          <Card key={quotation.id} className={`hover:shadow-md transition-shadow ${selectedIds.includes(quotation.id) ? 'ring-2 ring-primary' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(quotation.id)}
                      onChange={() => toggleSelection(quotation.id)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                      <MessageSquare className="h-6 w-6 text-blue-500" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{quotation.id}</h3>
                      {getStatusBadge(quotation.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      For: {quotation.requirementTitle}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{quotation.supplier.name}</span>
                      {quotation.supplier.verified && (
                        <Badge variant="outline" className="text-xs">Verified</Badge>
                      )}
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs">{quotation.supplier.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <div>
                    <p className="text-2xl font-bold">
                      ${quotation.total.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ${quotation.unitPrice}/unit × {quotation.quantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground justify-end">
                    <Clock className="h-4 w-4" />
                    <span>Lead: {quotation.leadTime}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Valid until: {new Date(quotation.validUntil).toLocaleDateString()}
                  </span>
                  <span>
                    Received: {new Date(quotation.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Link href={`/quotations/${quotation.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                  </Link>
                  {quotation.status === 'PENDING' && (
                    <Button size="sm" variant="gradient">
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Review
                    </Button>
                  )}
                  {quotation.status === 'SHORTLISTED' && (
                    <Button size="sm" variant="gradient">
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Accept
                    </Button>
                  )}
                  {quotation.status === 'ACCEPTED' && (
                    <Link href={`/transactions`}>
                      <Button size="sm" variant="gradient">
                        <Truck className="mr-2 h-4 w-4" />
                        Track Order
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredQuotations.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No quotations found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Quotations will appear here once suppliers respond to your requirements
            </p>
          </CardContent>
        </Card>
      )}

      {/* Comparison Modal */}
      {showCompare && selectedQuotations.length >= 2 && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-5xl max-h-[90vh] overflow-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <GitCompare className="h-5 w-5" />
                  Compare Quotations
                </CardTitle>
                <CardDescription>Side-by-side comparison of selected quotations</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowCompare(false)}>
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${selectedQuotations.length}, 1fr)` }}>
                {selectedQuotations.map((q) => (
                  <div key={q.id} className="border rounded-lg p-4 space-y-4">
                    <div className="text-center border-b pb-4">
                      <h3 className="font-bold">{q.supplier.name}</h3>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{q.supplier.rating}</span>
                      </div>
                      {getStatusBadge(q.status)}
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Price</span>
                        <span className="font-bold text-lg">${q.total.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Unit Price</span>
                        <span>${q.unitPrice}/unit</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Quantity</span>
                        <span>{q.quantity.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Lead Time</span>
                        <span className="font-medium">{q.leadTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Valid Until</span>
                        <span>{new Date(q.validUntil).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <Link href={`/quotations/${q.id}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          View Full Details
                        </Button>
                      </Link>
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
