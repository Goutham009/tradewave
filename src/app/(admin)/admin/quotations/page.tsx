'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSocket, SOCKET_EVENTS } from '@/hooks/useSocket';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Search,
  MoreVertical,
  Eye,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Download,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  FileText,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Quotation {
  id: string;
  supplierName: string;
  supplierEmail: string;
  buyerName: string;
  buyerEmail: string;
  requirementTitle: string;
  category: string;
  amount: number;
  unitPrice: number;
  quantity: number;
  currency: string;
  status: string;
  validUntil: string;
  createdAt: string;
  updatedAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  SUBMITTED: { label: 'Submitted', color: 'bg-blue-500/20 text-blue-400' },
  SHORTLISTED: { label: 'Shortlisted', color: 'bg-purple-500/20 text-purple-400' },
  ACCEPTED: { label: 'Accepted', color: 'bg-green-500/20 text-green-400' },
  REJECTED: { label: 'Rejected', color: 'bg-red-500/20 text-red-400' },
  WITHDRAWN: { label: 'Withdrawn', color: 'bg-slate-500/20 text-slate-400' },
  EXPIRED: { label: 'Expired', color: 'bg-yellow-500/20 text-yellow-400' },
};

export default function AdminQuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
    totalValue: 0,
  });
  const { subscribe } = useSocket();

  const fetchQuotations = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(statusFilter && { status: statusFilter }),
      });
      
      const response = await fetch(`/api/admin/quotations?${params}`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setQuotations(data.data.quotations);
        setTotalPages(data.data.pagination?.pages || 1);
        setStats(data.data.stats || stats);
      }
    } catch (error) {
      console.error('Failed to fetch quotations:', error);
      // Mock data
      setQuotations([
        { id: 'QUO-2024-001', supplierName: 'Steel Inc', supplierEmail: 'sales@steelinc.com', buyerName: 'Acme Corp', buyerEmail: 'buyer@acme.com', requirementTitle: 'Steel Components', category: 'Raw Materials', amount: 45000, unitPrice: 45, quantity: 1000, currency: 'USD', status: 'SUBMITTED', validUntil: '2024-02-15', createdAt: '2024-01-15', updatedAt: '2024-01-15' },
        { id: 'QUO-2024-002', supplierName: 'Metals Ltd', supplierEmail: 'sales@metals.com', buyerName: 'Trade Co', buyerEmail: 'buyer@trade.com', requirementTitle: 'Aluminum Sheets', category: 'Raw Materials', amount: 28500, unitPrice: 57, quantity: 500, currency: 'USD', status: 'SHORTLISTED', validUntil: '2024-02-20', createdAt: '2024-01-18', updatedAt: '2024-01-19' },
        { id: 'QUO-2024-003', supplierName: 'Global Supply', supplierEmail: 'sales@global.com', buyerName: 'Import Hub', buyerEmail: 'buyer@import.com', requirementTitle: 'Electronic Parts', category: 'Electronics', amount: 67200, unitPrice: 168, quantity: 400, currency: 'USD', status: 'ACCEPTED', validUntil: '2024-02-10', createdAt: '2024-01-12', updatedAt: '2024-01-14' },
        { id: 'QUO-2024-004', supplierName: 'Electronics Co', supplierEmail: 'sales@elec.com', buyerName: 'Tech Solutions', buyerEmail: 'buyer@tech.com', requirementTitle: 'Circuit Boards', category: 'Electronics', amount: 18900, unitPrice: 63, quantity: 300, currency: 'USD', status: 'REJECTED', validUntil: '2024-02-05', createdAt: '2024-01-10', updatedAt: '2024-01-11' },
        { id: 'QUO-2024-005', supplierName: 'Plastics Ltd', supplierEmail: 'sales@plastics.com', buyerName: 'Mega Industries', buyerEmail: 'buyer@mega.com', requirementTitle: 'Plastic Materials', category: 'Raw Materials', amount: 125000, unitPrice: 125, quantity: 1000, currency: 'USD', status: 'SUBMITTED', validUntil: '2024-02-25', createdAt: '2024-01-20', updatedAt: '2024-01-20' },
      ]);
      setStats({
        total: 1247,
        pending: 234,
        accepted: 892,
        rejected: 121,
        totalValue: 8540000,
      });
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchQuotations();
  }, [fetchQuotations]);

  // Socket.io real-time listeners for quotation updates
  useEffect(() => {
    const unsubscribeUpdate = subscribe(SOCKET_EVENTS.QUOTATION_UPDATE, () => {
      fetchQuotations();
    });

    const unsubscribeNew = subscribe('quotation:submitted', (newQuotation: Quotation) => {
      setQuotations(prev => [newQuotation, ...prev]);
      setStats(prev => ({
        ...prev,
        total: prev.total + 1,
        pending: prev.pending + 1,
        totalValue: prev.totalValue + newQuotation.amount,
      }));
    });

    return () => {
      unsubscribeUpdate();
      unsubscribeNew();
    };
  }, [subscribe, fetchQuotations]);

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const filteredQuotations = quotations.filter(q =>
    q.id.toLowerCase().includes(search.toLowerCase()) ||
    q.supplierName.toLowerCase().includes(search.toLowerCase()) ||
    q.buyerName.toLowerCase().includes(search.toLowerCase()) ||
    q.requirementTitle.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Quotation Management</h1>
          <p className="text-slate-400">Monitor all supplier quotations</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="border-slate-600 text-slate-300"
            onClick={() => fetchQuotations()}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button className="bg-red-600 hover:bg-red-700">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Total</p>
                <p className="text-xl font-bold text-white">{stats.total.toLocaleString()}</p>
              </div>
              <FileText className="h-8 w-8 text-slate-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Pending</p>
                <p className="text-xl font-bold text-blue-400">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Accepted</p>
                <p className="text-xl font-bold text-green-400">{stats.accepted.toLocaleString()}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Rejected</p>
                <p className="text-xl font-bold text-red-400">{stats.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Total Value</p>
                <p className="text-xl font-bold text-white">{formatCurrency(stats.totalValue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
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
                  placeholder="Search by ID, supplier, buyer, or requirement..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={statusFilter === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(null)}
                className={statusFilter === null ? 'bg-red-600' : 'border-slate-600 text-slate-300'}
              >
                All
              </Button>
              {Object.entries(STATUS_CONFIG).slice(0, 4).map(([status, config]) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                  className={statusFilter === status ? 'bg-red-600' : 'border-slate-600 text-slate-300'}
                >
                  {config.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quotations Table */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-red-500" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left p-4 text-sm font-medium text-slate-400">Quotation ID</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-400">Supplier</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-400">Buyer</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-400">Requirement</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-400">Amount</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-400">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-400">Date</th>
                    <th className="text-right p-4 text-sm font-medium text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuotations.map((q) => (
                    <tr key={q.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                      <td className="p-4">
                        <p className="font-mono text-sm text-white">{q.id}</p>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="text-slate-300">{q.supplierName}</p>
                          <p className="text-xs text-slate-500">{q.supplierEmail}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="text-slate-300">{q.buyerName}</p>
                          <p className="text-xs text-slate-500">{q.buyerEmail}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="text-slate-300 truncate max-w-[200px]">{q.requirementTitle}</p>
                          <p className="text-xs text-slate-500">{q.category}</p>
                        </div>
                      </td>
                      <td className="p-4 font-medium text-white">
                        {formatCurrency(q.amount, q.currency)}
                      </td>
                      <td className="p-4">
                        <Badge className={STATUS_CONFIG[q.status]?.color || 'bg-slate-500/20 text-slate-400'}>
                          {STATUS_CONFIG[q.status]?.label || q.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm text-slate-400">
                        {new Date(q.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-slate-400">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                            <DropdownMenuItem className="text-slate-300 hover:bg-slate-700">
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t border-slate-700">
            <p className="text-sm text-slate-400">
              Showing {filteredQuotations.length} quotations
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="border-slate-600 text-slate-300"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="flex items-center px-3 text-sm text-slate-400">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="border-slate-600 text-slate-300"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
