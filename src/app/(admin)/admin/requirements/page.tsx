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
} from 'lucide-react';

interface Requirement {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'PENDING_AM_VERIFICATION' | 'PENDING_ADMIN_REVIEW' | 'VERIFIED' | 'QUOTES_PENDING' | 'QUOTATIONS_READY' | 'ACCEPTED' | 'COMPLETED';
  quantity: number;
  unit: string;
  budgetMin: number | null;
  budgetMax: number | null;
  currency: string;
  deliveryLocation: string;
  deliveryDeadline: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  amVerified: boolean;
  adminReviewed: boolean;
  buyer: {
    id: string;
    name: string;
    email: string;
    companyName: string;
  };
  accountManager?: { id: string; name: string };
  suppliersContacted: number;
  quotesReceived: number;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  PENDING_AM_VERIFICATION: { label: 'Pending AM', color: 'bg-slate-500/20 text-slate-400', icon: Clock },
  PENDING_ADMIN_REVIEW: { label: 'Pending Review', color: 'bg-blue-500/20 text-blue-400', icon: Package },
  VERIFIED: { label: 'Verified', color: 'bg-purple-500/20 text-purple-400', icon: CheckCircle },
  QUOTES_PENDING: { label: 'Quotes Pending', color: 'bg-yellow-500/20 text-yellow-400', icon: Send },
  QUOTATIONS_READY: { label: 'Quotes Ready', color: 'bg-cyan-500/20 text-cyan-400', icon: FileText },
  ACCEPTED: { label: 'Accepted', color: 'bg-green-500/20 text-green-400', icon: CheckCircle },
  COMPLETED: { label: 'Completed', color: 'bg-green-500/20 text-green-400', icon: CheckCircle },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  LOW: { label: 'Low', color: 'bg-slate-500/20 text-slate-400' },
  MEDIUM: { label: 'Medium', color: 'bg-blue-500/20 text-blue-400' },
  HIGH: { label: 'High', color: 'bg-orange-500/20 text-orange-400' },
  URGENT: { label: 'Urgent', color: 'bg-red-500/20 text-red-400' },
};

const mockRequirements: Requirement[] = [
  { id: 'REQ-2024-001', title: 'Steel Coils - Grade A', description: 'Hot rolled steel coils for automotive manufacturing', category: 'Steel', status: 'PENDING_ADMIN_REVIEW', quantity: 500, unit: 'tons', budgetMin: 400, budgetMax: 450, currency: 'USD', deliveryLocation: 'Detroit, USA', deliveryDeadline: '2024-03-15', priority: 'HIGH', amVerified: true, adminReviewed: false, buyer: { id: 'b1', name: 'John Smith', email: 'john@acmecorp.com', companyName: 'Acme Corporation' }, accountManager: { id: 'am1', name: 'Sarah Johnson' }, suppliersContacted: 0, quotesReceived: 0, createdAt: '2024-02-15T10:30:00Z' },
  { id: 'REQ-2024-002', title: 'Cotton Fabric - Premium Quality', description: '100% cotton fabric for garment production', category: 'Textiles', status: 'VERIFIED', quantity: 10000, unit: 'meters', budgetMin: 2, budgetMax: 3, currency: 'USD', deliveryLocation: 'Los Angeles, USA', deliveryDeadline: '2024-03-20', priority: 'MEDIUM', amVerified: true, adminReviewed: true, buyer: { id: 'b2', name: 'Lisa Wang', email: 'lisa@globalimports.com', companyName: 'Global Imports LLC' }, accountManager: { id: 'am1', name: 'Sarah Johnson' }, suppliersContacted: 0, quotesReceived: 0, createdAt: '2024-02-14T14:20:00Z' },
  { id: 'REQ-2024-003', title: 'Electronic Components - Capacitors', description: 'Ceramic capacitors 100uF, 50V', category: 'Electronics', status: 'QUOTES_PENDING', quantity: 50000, unit: 'pcs', budgetMin: 0.05, budgetMax: 0.08, currency: 'USD', deliveryLocation: 'Singapore', deliveryDeadline: '2024-03-10', priority: 'HIGH', amVerified: true, adminReviewed: true, buyer: { id: 'b3', name: 'Wei Lin', email: 'wei@asiamart.sg', companyName: 'Asia Mart Pte Ltd' }, accountManager: { id: 'am2', name: 'Michael Chen' }, suppliersContacted: 3, quotesReceived: 2, createdAt: '2024-02-10T09:15:00Z' },
  { id: 'REQ-2024-004', title: 'Industrial Chemicals - Sulfuric Acid', description: 'Technical grade sulfuric acid 98%', category: 'Chemicals', status: 'PENDING_AM_VERIFICATION', quantity: 100, unit: 'tons', budgetMin: 200, budgetMax: 250, currency: 'USD', deliveryLocation: 'Houston, USA', deliveryDeadline: '2024-04-15', priority: 'LOW', amVerified: false, adminReviewed: false, buyer: { id: 'b1', name: 'John Smith', email: 'john@acmecorp.com', companyName: 'Acme Corporation' }, accountManager: { id: 'am1', name: 'Sarah Johnson' }, suppliersContacted: 0, quotesReceived: 0, createdAt: '2024-02-12T16:45:00Z' },
  { id: 'REQ-2024-005', title: 'Aluminum Sheets - Aircraft Grade', description: '2024-T3 aluminum alloy sheets', category: 'Metals', status: 'QUOTATIONS_READY', quantity: 200, unit: 'sheets', budgetMin: 150, budgetMax: 200, currency: 'USD', deliveryLocation: 'Seattle, USA', deliveryDeadline: '2024-03-25', priority: 'URGENT', amVerified: true, adminReviewed: true, buyer: { id: 'b4', name: 'Robert Brown', email: 'robert@aerospace.com', companyName: 'Aerospace Parts Inc' }, accountManager: { id: 'am2', name: 'Michael Chen' }, suppliersContacted: 4, quotesReceived: 4, createdAt: '2024-02-08T11:00:00Z' },
];

export default function AdminRequirementsPage() {
  const [requirements, setRequirements] = useState<Requirement[]>(mockRequirements);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);

  const stats = {
    total: requirements.length,
    pendingReview: requirements.filter(r => r.status === 'PENDING_ADMIN_REVIEW').length,
    verified: requirements.filter(r => r.status === 'VERIFIED').length,
    quotesPending: requirements.filter(r => r.status === 'QUOTES_PENDING').length,
    quotationsReady: requirements.filter(r => r.status === 'QUOTATIONS_READY').length,
  };

  const filteredRequirements = requirements.filter(req => {
    const matchesSearch = req.title.toLowerCase().includes(search.toLowerCase()) ||
      req.id.toLowerCase().includes(search.toLowerCase()) ||
      req.buyer.companyName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
        <Button variant="outline" className="border-slate-600 text-slate-300" onClick={() => setLoading(true)}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

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
                <SelectItem value="VERIFIED">Verified</SelectItem>
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
                        <p className="font-mono text-xs text-slate-500">{req.id}</p>
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

          {filteredRequirements.length === 0 && (
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
