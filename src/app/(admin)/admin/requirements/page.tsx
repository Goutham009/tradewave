'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  RefreshCw,
  Package,
  Eye,
  Send,
  Clock,
  CheckCircle,
  FileText,
  AlertCircle,
  MapPin,
  DollarSign,
  ArrowUpRight,
  Loader2,
} from 'lucide-react';
import { formatRequirementReference } from '@/lib/flow-references';

interface Requirement {
  id: string;
  requirementReference?: string;
  title: string;
  description: string;
  category: string;
  status: string;
  quantity: number;
  unit: string;
  budgetMin: number | null;
  budgetMax: number | null;
  currency: string;
  deliveryLocation: string;
  deliveryDeadline: string;
  priority: string;
  amVerified: boolean;
  adminReviewed: boolean;
  buyer: {
    id: string;
    name: string;
    email: string;
    companyName: string;
  };
  accountManager?: { id: string; name: string; email?: string } | null;
  suppliersContacted: number;
  quotesReceived: number;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  PENDING_AM_VERIFICATION: { label: 'Pending AM', color: 'bg-slate-500/20 text-slate-400', icon: Clock },
  PENDING_ADMIN_REVIEW: { label: 'Pending Review', color: 'bg-blue-500/20 text-blue-400', icon: Package },
  UNDER_REVIEW: { label: 'Changes Requested', color: 'bg-orange-500/20 text-orange-400', icon: AlertCircle },
  VERIFIED: { label: 'Verified', color: 'bg-purple-500/20 text-purple-400', icon: CheckCircle },
  SOURCING: { label: 'Sourcing', color: 'bg-indigo-500/20 text-indigo-400', icon: Send },
  QUOTES_PENDING: { label: 'Quotes Pending', color: 'bg-yellow-500/20 text-yellow-400', icon: Send },
  QUOTATIONS_READY: { label: 'Quotes Ready', color: 'bg-cyan-500/20 text-cyan-400', icon: FileText },
  ACCEPTED: { label: 'Accepted', color: 'bg-green-500/20 text-green-400', icon: CheckCircle },
  COMPLETED: { label: 'Completed', color: 'bg-green-500/20 text-green-400', icon: CheckCircle },
  REJECTED: { label: 'Rejected', color: 'bg-red-500/20 text-red-400', icon: AlertCircle },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-500/20 text-red-400', icon: AlertCircle },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  LOW: { label: 'Low', color: 'bg-slate-500/20 text-slate-400' },
  MEDIUM: { label: 'Medium', color: 'bg-blue-500/20 text-blue-400' },
  HIGH: { label: 'High', color: 'bg-orange-500/20 text-orange-400' },
  URGENT: { label: 'Urgent', color: 'bg-red-500/20 text-red-400' },
};

export default function AdminRequirementsPage() {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchRequirements = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const query = new URLSearchParams({ page: '1', limit: '100' });
      if (statusFilter !== 'all') {
        query.set('status', statusFilter);
      }
      if (search.trim()) {
        query.set('search', search.trim());
      }

      const res = await fetch(`/api/admin/requirements?${query.toString()}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch requirements');
      }

      setRequirements(Array.isArray(data.data) ? data.data : []);
    } catch (fetchError) {
      console.error('Failed to fetch admin requirements:', fetchError);
      setRequirements([]);
      setError(fetchError instanceof Error ? fetchError.message : 'Failed to fetch requirements');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    void fetchRequirements();
  }, [fetchRequirements]);

  const stats = {
    total: requirements.length,
    pendingReview: requirements.filter(r => r.status === 'PENDING_ADMIN_REVIEW').length,
    verified: requirements.filter(r => r.status === 'VERIFIED').length,
    quotesPending: requirements.filter(r => r.status === 'QUOTES_PENDING').length,
    quotationsReady: requirements.filter(r => r.status === 'QUOTATIONS_READY').length,
  };

  const filteredRequirements = requirements;

  const formatCurrency = (amount: number | null, currency: string = 'USD') => {
    if (amount === null) return '-';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Requirement Management</h1>
          <p className="text-slate-400">Open each requirement to review details and take actions</p>
        </div>
        <Button variant="outline" className="border-slate-600 text-slate-300" onClick={() => void fetchRequirements(true)}>
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-900/20 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="bg-slate-800 border-slate-700 cursor-pointer hover:border-slate-500/50" onClick={() => setStatusFilter('all')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Total</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <Package className="h-8 w-8 text-slate-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700 cursor-pointer hover:border-blue-500/50" onClick={() => setStatusFilter('PENDING_ADMIN_REVIEW')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Pending Review</p>
                <p className="text-2xl font-bold text-blue-400">{stats.pendingReview}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700 cursor-pointer hover:border-purple-500/50" onClick={() => setStatusFilter('VERIFIED')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Verified (Ready)</p>
                <p className="text-2xl font-bold text-purple-400">{stats.verified}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700 cursor-pointer hover:border-yellow-500/50" onClick={() => setStatusFilter('QUOTES_PENDING')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Quotes Pending</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.quotesPending}</p>
              </div>
              <Send className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700 cursor-pointer hover:border-cyan-500/50" onClick={() => setStatusFilter('QUOTATIONS_READY')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Quotes Ready</p>
                <p className="text-2xl font-bold text-cyan-400">{stats.quotationsReady}</p>
              </div>
              <FileText className="h-8 w-8 text-cyan-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input
                  placeholder="Search by ID, title, or company..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="PENDING_AM_VERIFICATION">Pending AM</SelectItem>
                <SelectItem value="PENDING_ADMIN_REVIEW">Pending Review</SelectItem>
                <SelectItem value="UNDER_REVIEW">Changes Requested</SelectItem>
                <SelectItem value="VERIFIED">Verified</SelectItem>
                <SelectItem value="SOURCING">Sourcing</SelectItem>
                <SelectItem value="QUOTES_PENDING">Quotes Pending</SelectItem>
                <SelectItem value="QUOTATIONS_READY">Quotes Ready</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Requirements List */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-14 text-slate-400">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading requirements...
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left p-4 text-sm font-medium text-slate-400">Requirement</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-400">Buyer</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-400">Details</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-400">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-400">Suppliers</th>
                  <th className="text-right p-4 text-sm font-medium text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequirements.map((req) => (
                  <tr key={req.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                    <td className="p-4">
                      <div>
                        <p className="font-mono text-xs text-slate-500">
                          {req.requirementReference || formatRequirementReference(req.id)}
                        </p>
                        <p className="font-medium text-white truncate max-w-[250px]">{req.title}</p>
                        <p className="text-xs text-slate-400">{req.category}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-slate-300">{req.buyer.companyName}</p>
                        <p className="text-xs text-slate-500">{req.buyer.email}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Package className="h-3 w-3 text-slate-500" />
                          <span className="text-slate-300">{req.quantity} {req.unit}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="h-3 w-3 text-slate-500" />
                          <span className="text-slate-300">
                            {req.budgetMin && req.budgetMax 
                              ? `${formatCurrency(req.budgetMin, req.currency)} - ${formatCurrency(req.budgetMax, req.currency)}`
                              : formatCurrency(req.budgetMin || req.budgetMax, req.currency)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-3 w-3 text-slate-500" />
                          <span className="text-slate-400 text-xs">{req.deliveryLocation}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-2">
                        <Badge className={STATUS_CONFIG[req.status]?.color}>
                          {STATUS_CONFIG[req.status]?.label}
                        </Badge>
                        <Badge className={PRIORITY_CONFIG[req.priority]?.color}>
                          {req.priority}
                        </Badge>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <p className="text-slate-300">{req.suppliersContacted} contacted</p>
                        <p className="text-slate-400">{req.quotesReceived} quotes</p>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-slate-600 text-slate-300"
                        onClick={() => window.location.href = `/admin/requirements/${req.id}`}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                        <ArrowUpRight className="h-4 w-4 ml-1" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}

          {!loading && filteredRequirements.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No requirements found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
