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

  const filteredQuotations = mockQuotations.filter((quo) => {
    const matchesSearch = 
      quo.requirementTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quo.supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quo.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || quo.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = mockQuotations.filter(q => q.status === 'PENDING').length;

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
            <div className="flex gap-2">
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
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quotations List */}
      <div className="grid gap-4">
        {filteredQuotations.map((quotation) => (
          <Card key={quotation.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                    <MessageSquare className="h-6 w-6 text-blue-500" />
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
                  {quotation.status === 'PENDING' && (
                    <>
                      <Button variant="outline" size="sm">
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                      <Button variant="outline" size="sm">
                        <Star className="mr-2 h-4 w-4" />
                        Shortlist
                      </Button>
                      <Button size="sm" variant="gradient">
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Accept
                      </Button>
                    </>
                  )}
                  {quotation.status === 'SHORTLISTED' && (
                    <Button size="sm" variant="gradient">
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Accept & Proceed
                    </Button>
                  )}
                  {quotation.status === 'ACCEPTED' && (
                    <Link href={`/transactions`}>
                      <Button size="sm" variant="outline">
                        <Eye className="mr-2 h-4 w-4" />
                        View Transaction
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
    </div>
  );
}
