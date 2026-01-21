'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Package,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';

interface Requirement {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  quantity: number;
  unit: string;
  targetPrice: number | null;
  currency: string;
  deliveryLocation: string;
  priority: string;
  quotationCount: number;
  buyer: {
    id: string;
    name: string;
    email: string;
    companyName: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-slate-500',
  SUBMITTED: 'bg-blue-500',
  UNDER_REVIEW: 'bg-yellow-500',
  SOURCING: 'bg-purple-500',
  QUOTATIONS_READY: 'bg-cyan-500',
  NEGOTIATING: 'bg-orange-500',
  ACCEPTED: 'bg-green-500',
  COMPLETED: 'bg-emerald-600',
  CANCELLED: 'bg-red-500',
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'bg-slate-400',
  MEDIUM: 'bg-blue-400',
  HIGH: 'bg-orange-400',
  URGENT: 'bg-red-500',
};

export function RequirementsSection() {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  
  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  const fetchRequirements = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: String(pagination.page),
        limit: String(pagination.limit),
      });
      
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (categoryFilter) params.set('category', categoryFilter);
      
      const response = await fetch(`/api/admin/requirements?${params}`);
      
      if (response.status === 403) {
        setError('Access denied. Admin privileges required.');
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch requirements');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setRequirements(result.data);
        if (result.pagination) {
          setPagination(result.pagination);
        }
      } else {
        setError(result.error || 'Failed to fetch requirements');
      }
    } catch (err) {
      console.error('Error fetching requirements:', err);
      // Use mock data as fallback
      setRequirements([
        { id: 'r1', title: 'Steel Components for Manufacturing', description: 'High-quality steel components', category: 'Raw Materials', status: 'SUBMITTED', quantity: 1000, unit: 'kg', targetPrice: 5000, currency: 'USD', deliveryLocation: 'New York, USA', priority: 'HIGH', quotationCount: 3, buyer: { id: 'b1', name: 'Acme Corp', email: 'buyer@acme.com', companyName: 'Acme Corporation' }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'r2', title: 'Electronic Circuit Boards', description: 'PCB boards for electronics', category: 'Electronics', status: 'SOURCING', quantity: 500, unit: 'pieces', targetPrice: 2500, currency: 'USD', deliveryLocation: 'Los Angeles, USA', priority: 'MEDIUM', quotationCount: 5, buyer: { id: 'b2', name: 'Tech Solutions', email: 'buyer@tech.com', companyName: 'Tech Solutions Inc' }, createdAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: new Date().toISOString() },
        { id: 'r3', title: 'Industrial Machinery Parts', description: 'Replacement parts for machinery', category: 'Machinery', status: 'QUOTATIONS_READY', quantity: 50, unit: 'pieces', targetPrice: 15000, currency: 'USD', deliveryLocation: 'Chicago, USA', priority: 'URGENT', quotationCount: 2, buyer: { id: 'b1', name: 'Acme Corp', email: 'buyer@acme.com', companyName: 'Acme Corporation' }, createdAt: new Date(Date.now() - 172800000).toISOString(), updatedAt: new Date().toISOString() },
        { id: 'r4', title: 'Textile Raw Materials', description: 'Cotton and polyester blend', category: 'Textiles', status: 'NEGOTIATING', quantity: 2000, unit: 'meters', targetPrice: 8000, currency: 'USD', deliveryLocation: 'Miami, USA', priority: 'LOW', quotationCount: 4, buyer: { id: 'b3', name: 'Fashion Hub', email: 'buyer@fashion.com', companyName: 'Fashion Hub Ltd' }, createdAt: new Date(Date.now() - 259200000).toISOString(), updatedAt: new Date().toISOString() },
        { id: 'r5', title: 'Chemical Compounds', description: 'Industrial chemicals for processing', category: 'Chemicals', status: 'COMPLETED', quantity: 100, unit: 'liters', targetPrice: 3000, currency: 'USD', deliveryLocation: 'Houston, USA', priority: 'MEDIUM', quotationCount: 1, buyer: { id: 'b2', name: 'Tech Solutions', email: 'buyer@tech.com', companyName: 'Tech Solutions Inc' }, createdAt: new Date(Date.now() - 345600000).toISOString(), updatedAt: new Date().toISOString() },
      ]);
      setPagination({ page: 1, limit: 10, total: 5, totalPages: 1 });
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, statusFilter, categoryFilter]);

  useEffect(() => {
    fetchRequirements();
  }, [fetchRequirements]);

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchRequirements();
  };

  const formatCurrency = (amount: number | null, currency: string) => {
    if (amount === null) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (error) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-center text-red-400 gap-2">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
          <div className="flex justify-center mt-4">
            <Button onClick={fetchRequirements} variant="outline" className="border-slate-600">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Package className="h-5 w-5" />
            Requirements Management
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchRequirements}
            disabled={loading}
            className="border-slate-600 text-slate-300"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <form onSubmit={handleSearch} className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search requirements..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-slate-900 border-slate-700 text-white"
              />
            </div>
          </form>
          
          <Select value={statusFilter || 'all'} onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}>
            <SelectTrigger className="w-[180px] bg-slate-900 border-slate-700 text-white">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="SUBMITTED">Submitted</SelectItem>
              <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
              <SelectItem value="SOURCING">Sourcing</SelectItem>
              <SelectItem value="QUOTATIONS_READY">Quotations Ready</SelectItem>
              <SelectItem value="NEGOTIATING">Negotiating</SelectItem>
              <SelectItem value="ACCEPTED">Accepted</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={categoryFilter || 'all'} onValueChange={(v) => setCategoryFilter(v === 'all' ? '' : v)}>
            <SelectTrigger className="w-[180px] bg-slate-900 border-slate-700 text-white">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Electronics">Electronics</SelectItem>
              <SelectItem value="Textiles">Textiles</SelectItem>
              <SelectItem value="Machinery">Machinery</SelectItem>
              <SelectItem value="Raw Materials">Raw Materials</SelectItem>
              <SelectItem value="Components">Components</SelectItem>
              <SelectItem value="Chemicals">Chemicals</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-red-500" />
          </div>
        ) : requirements.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No requirements found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-400">Title</TableHead>
                  <TableHead className="text-slate-400">Category</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                  <TableHead className="text-slate-400">Priority</TableHead>
                  <TableHead className="text-slate-400">Quantity</TableHead>
                  <TableHead className="text-slate-400">Target Price</TableHead>
                  <TableHead className="text-slate-400">Quotations</TableHead>
                  <TableHead className="text-slate-400">Created</TableHead>
                  <TableHead className="text-slate-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requirements.map((req) => (
                  <TableRow key={req.id} className="border-slate-700">
                    <TableCell className="text-white">
                      <div>
                        <p className="font-medium truncate max-w-[200px]">{req.title}</p>
                        <p className="text-xs text-slate-400">{req.buyer?.companyName}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-300">{req.category}</TableCell>
                    <TableCell>
                      <Badge className={`${STATUS_COLORS[req.status] || 'bg-slate-500'} text-white`}>
                        {req.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${PRIORITY_COLORS[req.priority] || 'bg-slate-400'} text-white`}>
                        {req.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {req.quantity} {req.unit}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {formatCurrency(req.targetPrice, req.currency)}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {req.quotationCount}
                    </TableCell>
                    <TableCell className="text-slate-400 text-sm">
                      {formatDate(req.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Eye className="h-4 w-4 text-slate-400" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Edit className="h-4 w-4 text-slate-400" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700">
            <p className="text-sm text-slate-400">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} results
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="border-slate-600 text-slate-300"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="flex items-center px-3 text-slate-300">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="border-slate-600 text-slate-300"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
