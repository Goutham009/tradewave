'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Search,
  Loader2,
  Download,
  DollarSign,
  Clock,
  CheckCircle,
  RefreshCw,
  FileText,
  ChevronRight,
  Package,
  Building2,
  User,
  AlertCircle,
} from 'lucide-react';

interface RequirementWithQuotes {
  id: string;
  title: string;
  buyerName: string;
  buyerCompany: string;
  category: string;
  quantity: number;
  unit: string;
  createdAt: string;
  quotationCount: number;
  pendingCount: number;
  verifiedCount: number;
  sentCount: number;
  lowestPrice: number;
  highestPrice: number;
  status: 'needs_review' | 'ready_to_send' | 'sent_to_buyer' | 'completed';
}

const MOCK_REQUIREMENTS: RequirementWithQuotes[] = [
  { id: 'REQ-2024-004', title: 'Textile Raw Materials - Cotton', buyerName: 'Mike Chen', buyerCompany: 'Fashion Hub Ltd', category: 'Textiles', quantity: 2000, unit: 'kg', createdAt: '2024-01-10', quotationCount: 4, pendingCount: 3, verifiedCount: 1, sentCount: 0, lowestPrice: 6900, highestPrice: 7800, status: 'needs_review' },
  { id: 'REQ-2024-005', title: 'Chemical Compounds - Industrial', buyerName: 'Sarah Lee', buyerCompany: 'Tech Solutions Inc', category: 'Chemicals', quantity: 100, unit: 'barrels', createdAt: '2024-01-08', quotationCount: 3, pendingCount: 0, verifiedCount: 3, sentCount: 0, lowestPrice: 2800, highestPrice: 3100, status: 'ready_to_send' },
  { id: 'REQ-2024-001', title: 'Steel Components for Manufacturing', buyerName: 'John Smith', buyerCompany: 'Acme Corporation', category: 'Raw Materials', quantity: 1000, unit: 'units', createdAt: '2024-01-05', quotationCount: 1, pendingCount: 0, verifiedCount: 0, sentCount: 1, lowestPrice: 4800, highestPrice: 4800, status: 'sent_to_buyer' },
  { id: 'REQ-2024-006', title: 'Electronic Components - PCB', buyerName: 'Lisa Wang', buyerCompany: 'TechParts Inc', category: 'Electronics', quantity: 5000, unit: 'pcs', createdAt: '2024-01-12', quotationCount: 2, pendingCount: 2, verifiedCount: 0, sentCount: 0, lowestPrice: 12500, highestPrice: 14200, status: 'needs_review' },
  { id: 'REQ-2024-007', title: 'Packaging Materials - Cardboard', buyerName: 'Emma Davis', buyerCompany: 'PackRight Co', category: 'Packaging', quantity: 10000, unit: 'units', createdAt: '2024-01-15', quotationCount: 5, pendingCount: 1, verifiedCount: 4, sentCount: 0, lowestPrice: 8500, highestPrice: 11200, status: 'ready_to_send' },
];

const STATUS_CONFIG = {
  needs_review: { label: 'Needs Review', color: 'bg-yellow-500/20 text-yellow-400', icon: Clock },
  ready_to_send: { label: 'Ready to Send', color: 'bg-green-500/20 text-green-400', icon: CheckCircle },
  sent_to_buyer: { label: 'Sent to Buyer', color: 'bg-cyan-500/20 text-cyan-400', icon: CheckCircle },
  completed: { label: 'Completed', color: 'bg-emerald-500/20 text-emerald-400', icon: CheckCircle },
};

export default function AdminQuotationsPage() {
  const [requirements, setRequirements] = useState<RequirementWithQuotes[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setRequirements(MOCK_REQUIREMENTS);
      setLoading(false);
    }, 500);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
  };

  const filteredRequirements = requirements.filter(req => {
    const matchesSearch = req.title.toLowerCase().includes(search.toLowerCase()) ||
      req.buyerName.toLowerCase().includes(search.toLowerCase()) ||
      req.buyerCompany.toLowerCase().includes(search.toLowerCase()) ||
      req.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: requirements.reduce((sum, r) => sum + r.quotationCount, 0),
    needsReview: requirements.filter(r => r.status === 'needs_review').length,
    readyToSend: requirements.filter(r => r.status === 'ready_to_send').length,
    sent: requirements.filter(r => r.status === 'sent_to_buyer').length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Quotation Management</h1>
          <p className="text-slate-400">Review quotations by requirement and send best quotes to buyers</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.reload()} className="border-slate-600 text-slate-300">
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
          <Button className="bg-red-600 hover:bg-red-700">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Total Quotations</p>
                <p className="text-xl font-bold text-white">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-slate-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700 cursor-pointer hover:border-yellow-500/50" onClick={() => setStatusFilter('needs_review')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Needs Review</p>
                <p className="text-xl font-bold text-yellow-400">{stats.needsReview}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700 cursor-pointer hover:border-green-500/50" onClick={() => setStatusFilter('ready_to_send')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Ready to Send</p>
                <p className="text-xl font-bold text-green-400">{stats.readyToSend}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700 cursor-pointer hover:border-cyan-500/50" onClick={() => setStatusFilter('sent_to_buyer')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Sent to Buyer</p>
                <p className="text-xl font-bold text-cyan-400">{stats.sent}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-cyan-600" />
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
                  placeholder="Search by requirement, buyer, or ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" variant={statusFilter === 'all' ? 'default' : 'outline'} onClick={() => setStatusFilter('all')} className={statusFilter === 'all' ? 'bg-red-600' : 'border-slate-600 text-slate-300'}>
                All
              </Button>
              <Button size="sm" variant={statusFilter === 'needs_review' ? 'default' : 'outline'} onClick={() => setStatusFilter('needs_review')} className={statusFilter === 'needs_review' ? 'bg-red-600' : 'border-slate-600 text-slate-300'}>
                Needs Review
              </Button>
              <Button size="sm" variant={statusFilter === 'ready_to_send' ? 'default' : 'outline'} onClick={() => setStatusFilter('ready_to_send')} className={statusFilter === 'ready_to_send' ? 'bg-red-600' : 'border-slate-600 text-slate-300'}>
                Ready to Send
              </Button>
              <Button size="sm" variant={statusFilter === 'sent_to_buyer' ? 'default' : 'outline'} onClick={() => setStatusFilter('sent_to_buyer')} className={statusFilter === 'sent_to_buyer' ? 'bg-red-600' : 'border-slate-600 text-slate-300'}>
                Sent to Buyer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requirements List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-red-500" />
        </div>
      ) : filteredRequirements.length === 0 ? (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-slate-600" />
            <p className="text-slate-400">No requirements found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRequirements.map((req) => {
            const statusConfig = STATUS_CONFIG[req.status];
            return (
              <Link key={req.id} href={`/admin/quotations/${req.id}`}>
                <Card className="bg-slate-800 border-slate-700 hover:border-slate-600 cursor-pointer transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xs font-mono text-slate-500">{req.id}</span>
                          <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-1">{req.title}</h3>
                        <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                          <span className="flex items-center gap-1">
                            <User className="h-4 w-4" /> {req.buyerName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Building2 className="h-4 w-4" /> {req.buyerCompany}
                          </span>
                          <span className="flex items-center gap-1">
                            <Package className="h-4 w-4" /> {req.quantity.toLocaleString()} {req.unit}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-8">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-white">{req.quotationCount}</p>
                          <p className="text-xs text-slate-400">Quotes</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-slate-300">
                            {req.pendingCount > 0 && <span className="text-yellow-400">{req.pendingCount} pending</span>}
                            {req.pendingCount > 0 && req.verifiedCount > 0 && ' • '}
                            {req.verifiedCount > 0 && <span className="text-green-400">{req.verifiedCount} verified</span>}
                            {(req.pendingCount > 0 || req.verifiedCount > 0) && req.sentCount > 0 && ' • '}
                            {req.sentCount > 0 && <span className="text-cyan-400">{req.sentCount} sent</span>}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-slate-400">Price Range</p>
                          <p className="text-white font-medium">
                            {formatCurrency(req.lowestPrice)} - {formatCurrency(req.highestPrice)}
                          </p>
                        </div>
                        <ChevronRight className="h-6 w-6 text-slate-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
