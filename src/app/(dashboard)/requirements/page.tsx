'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Plus,
  Search,
  Filter,
  FileText,
  Calendar,
  MapPin,
  DollarSign,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const mockRequirements = [
  {
    id: 'REQ-2024-001',
    title: 'Steel Components for Manufacturing',
    category: 'Raw Materials',
    status: 'SOURCING',
    priority: 'HIGH',
    quantity: 5000,
    unit: 'kg',
    targetPrice: 25000,
    currency: 'USD',
    deliveryLocation: 'Mumbai, India',
    deliveryDeadline: '2024-02-15',
    quotationsCount: 3,
    createdAt: '2024-01-10',
  },
  {
    id: 'REQ-2024-002',
    title: 'Electronic Circuit Boards',
    category: 'Electronics',
    status: 'QUOTATIONS_READY',
    priority: 'MEDIUM',
    quantity: 1000,
    unit: 'pcs',
    targetPrice: 15000,
    currency: 'USD',
    deliveryLocation: 'Bangalore, India',
    deliveryDeadline: '2024-02-28',
    quotationsCount: 5,
    createdAt: '2024-01-08',
  },
  {
    id: 'REQ-2024-003',
    title: 'Industrial Packaging Materials',
    category: 'Packaging',
    status: 'DRAFT',
    priority: 'LOW',
    quantity: 10000,
    unit: 'units',
    targetPrice: 8000,
    currency: 'USD',
    deliveryLocation: 'Delhi, India',
    deliveryDeadline: '2024-03-15',
    quotationsCount: 0,
    createdAt: '2024-01-12',
  },
  {
    id: 'REQ-2024-004',
    title: 'Textile Fabric Rolls',
    category: 'Textiles',
    status: 'UNDER_REVIEW',
    priority: 'URGENT',
    quantity: 2000,
    unit: 'meters',
    targetPrice: 12000,
    currency: 'USD',
    deliveryLocation: 'Chennai, India',
    deliveryDeadline: '2024-01-30',
    quotationsCount: 2,
    createdAt: '2024-01-05',
  },
];

const getStatusBadge = (status: string) => {
  const variants: Record<string, { variant: any; label: string }> = {
    DRAFT: { variant: 'secondary', label: 'Draft' },
    SUBMITTED: { variant: 'info', label: 'Submitted' },
    UNDER_REVIEW: { variant: 'warning', label: 'Under Review' },
    SOURCING: { variant: 'info', label: 'Sourcing' },
    QUOTATIONS_READY: { variant: 'success', label: 'Quotations Ready' },
    NEGOTIATING: { variant: 'warning', label: 'Negotiating' },
    ACCEPTED: { variant: 'success', label: 'Accepted' },
    COMPLETED: { variant: 'success', label: 'Completed' },
    CANCELLED: { variant: 'destructive', label: 'Cancelled' },
  };
  const config = variants[status] || { variant: 'secondary', label: status };
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

const getPriorityBadge = (priority: string) => {
  const variants: Record<string, { variant: any; label: string }> = {
    LOW: { variant: 'secondary', label: 'Low' },
    MEDIUM: { variant: 'outline', label: 'Medium' },
    HIGH: { variant: 'warning', label: 'High' },
    URGENT: { variant: 'destructive', label: 'Urgent' },
  };
  const config = variants[priority] || { variant: 'secondary', label: priority };
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export default function RequirementsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredRequirements = mockRequirements.filter((req) => {
    const matchesSearch = req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Requirements</h1>
          <p className="text-muted-foreground">
            Manage your sourcing requirements and track quotations
          </p>
        </div>
        <Link href="/requirements/new">
          <Button variant="gradient">
            <Plus className="mr-2 h-4 w-4" />
            New Requirement
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search requirements..."
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
                <option value="DRAFT">Draft</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="SOURCING">Sourcing</option>
                <option value="QUOTATIONS_READY">Quotations Ready</option>
                <option value="ACCEPTED">Accepted</option>
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

      {/* Requirements List */}
      <div className="grid gap-4">
        {filteredRequirements.map((requirement) => (
          <Card key={requirement.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{requirement.title}</h3>
                      {getStatusBadge(requirement.status)}
                      {getPriorityBadge(requirement.priority)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {requirement.id} • {requirement.category}
                    </p>
                    <div className="flex flex-wrap gap-4 pt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {requirement.currency} {requirement.targetPrice?.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {requirement.deliveryLocation}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Due: {new Date(requirement.deliveryDeadline).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold">{requirement.quotationsCount}</p>
                    <p className="text-xs text-muted-foreground">Quotations</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/requirements/${requirement.id}`} className="flex items-center">
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/requirements/${requirement.id}/edit`} className="flex items-center">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRequirements.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No requirements found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Get started by creating your first requirement'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Link href="/requirements/new" className="mt-4">
                <Button variant="gradient">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Requirement
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
