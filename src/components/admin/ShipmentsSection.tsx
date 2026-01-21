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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Truck,
  MapPin,
  MoreVertical,
  Eye,
} from 'lucide-react';

interface Shipment {
  id: string;
  transactionId: string;
  trackingNumber: string;
  carrier: string;
  status: string;
  originLocation: string;
  currentLocation: string;
  destinationLocation: string;
  estimatedDelivery: string | null;
  actualDelivery: string | null;
  updates: any[];
  transaction: {
    id: string;
    amount: number;
    currency: string;
    buyerName: string;
    supplierName: string;
  } | null;
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
  PENDING: 'bg-blue-500',
  PICKED_UP: 'bg-cyan-500',
  IN_TRANSIT: 'bg-yellow-500',
  OUT_FOR_DELIVERY: 'bg-orange-500',
  DELIVERED: 'bg-green-500',
  DELAYED: 'bg-red-500',
  LOST: 'bg-red-700',
  CANCELLED: 'bg-slate-500',
};

const CARRIERS = ['DHL', 'FedEx', 'UPS', 'Local Courier'];
const STATUSES = ['PENDING', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'DELAYED', 'LOST', 'CANCELLED'];

export function ShipmentsSection() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  
  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [carrierFilter, setCarrierFilter] = useState<string>('');

  const fetchShipments = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: String(pagination.page),
        limit: String(pagination.limit),
      });
      
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (carrierFilter) params.set('carrier', carrierFilter);
      
      const response = await fetch(`/api/admin/shipments?${params}`);
      
      if (response.status === 403) {
        setError('Access denied. Admin privileges required.');
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch shipments');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setShipments(result.data);
        if (result.pagination) {
          setPagination(result.pagination);
        }
      } else {
        setError(result.error || 'Failed to fetch shipments');
      }
    } catch (err) {
      console.error('Error fetching shipments:', err);
      // Use mock data as fallback
      setShipments([
        { id: 'sh1', transactionId: 't1', trackingNumber: 'TW-2024-001234', carrier: 'DHL', status: 'IN_TRANSIT', originLocation: 'Shanghai, China', currentLocation: 'Singapore Hub', destinationLocation: 'New York, USA', estimatedDelivery: new Date(Date.now() + 5 * 86400000).toISOString(), actualDelivery: null, updates: [], transaction: { id: 't1', amount: 45000, currency: 'USD', buyerName: 'Acme Corp', supplierName: 'Steel Industries' }, createdAt: new Date(Date.now() - 3 * 86400000).toISOString(), updatedAt: new Date().toISOString() },
        { id: 'sh2', transactionId: 't2', trackingNumber: 'TW-2024-001235', carrier: 'FedEx', status: 'DELIVERED', originLocation: 'Mumbai, India', currentLocation: 'Los Angeles, USA', destinationLocation: 'Los Angeles, USA', estimatedDelivery: new Date(Date.now() - 2 * 86400000).toISOString(), actualDelivery: new Date(Date.now() - 1 * 86400000).toISOString(), updates: [], transaction: { id: 't2', amount: 28000, currency: 'USD', buyerName: 'Tech Solutions', supplierName: 'Electronics Co' }, createdAt: new Date(Date.now() - 10 * 86400000).toISOString(), updatedAt: new Date().toISOString() },
        { id: 'sh3', transactionId: 't3', trackingNumber: 'TW-2024-001236', carrier: 'UPS', status: 'CUSTOMS_CLEARANCE', originLocation: 'Tokyo, Japan', currentLocation: 'Customs Office', destinationLocation: 'Chicago, USA', estimatedDelivery: new Date(Date.now() + 3 * 86400000).toISOString(), actualDelivery: null, updates: [], transaction: { id: 't3', amount: 67000, currency: 'USD', buyerName: 'Manufacturing Inc', supplierName: 'Precision Parts' }, createdAt: new Date(Date.now() - 7 * 86400000).toISOString(), updatedAt: new Date().toISOString() },
        { id: 'sh4', transactionId: 't4', trackingNumber: 'TW-2024-001237', carrier: 'Maersk', status: 'PICKED_UP', originLocation: 'Hamburg, Germany', currentLocation: 'Hamburg Port', destinationLocation: 'Miami, USA', estimatedDelivery: new Date(Date.now() + 14 * 86400000).toISOString(), actualDelivery: null, updates: [], transaction: { id: 't4', amount: 125000, currency: 'USD', buyerName: 'Import Hub', supplierName: 'Euro Supplies' }, createdAt: new Date(Date.now() - 1 * 86400000).toISOString(), updatedAt: new Date().toISOString() },
      ]);
      setPagination({ page: 1, limit: 10, total: 4, totalPages: 1 });
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, statusFilter, carrierFilter]);

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  const handleStatusUpdate = async (shipmentId: string, newStatus: string) => {
    setUpdating(shipmentId);
    
    try {
      const response = await fetch('/api/admin/shipments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: shipmentId,
          status: newStatus,
          updateNote: `Status changed to ${newStatus}`,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update shipment');
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Update local state
        setShipments(prev => 
          prev.map(s => s.id === shipmentId ? { ...s, status: newStatus } : s)
        );
      }
    } catch (err) {
      console.error('Error updating shipment:', err);
    } finally {
      setUpdating(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
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
            <Button onClick={fetchShipments} variant="outline" className="border-slate-600">
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
            <Truck className="h-5 w-5" />
            Shipment Tracking
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchShipments}
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
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by tracking number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-slate-900 border-slate-700 text-white"
              />
            </div>
          </div>
          
          <Select value={statusFilter || 'all'} onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}>
            <SelectTrigger className="w-[180px] bg-slate-900 border-slate-700 text-white">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all">All Statuses</SelectItem>
              {STATUSES.map(status => (
                <SelectItem key={status} value={status}>
                  {status.replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={carrierFilter || 'all'} onValueChange={(v) => setCarrierFilter(v === 'all' ? '' : v)}>
            <SelectTrigger className="w-[180px] bg-slate-900 border-slate-700 text-white">
              <SelectValue placeholder="All Carriers" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all">All Carriers</SelectItem>
              {CARRIERS.map(carrier => (
                <SelectItem key={carrier} value={carrier}>{carrier}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-red-500" />
          </div>
        ) : shipments.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No shipments found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-400">Tracking #</TableHead>
                  <TableHead className="text-slate-400">Carrier</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                  <TableHead className="text-slate-400">Origin</TableHead>
                  <TableHead className="text-slate-400">Current</TableHead>
                  <TableHead className="text-slate-400">Destination</TableHead>
                  <TableHead className="text-slate-400">Est. Delivery</TableHead>
                  <TableHead className="text-slate-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shipments.map((shipment) => (
                  <TableRow key={shipment.id} className="border-slate-700">
                    <TableCell className="text-white font-mono">
                      {shipment.trackingNumber}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {shipment.carrier}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${STATUS_COLORS[shipment.status] || 'bg-slate-500'} text-white`}>
                        {shipment.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-300">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate max-w-[120px]">{shipment.originLocation}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-yellow-400">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate max-w-[120px]">{shipment.currentLocation}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-300">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate max-w-[120px]">{shipment.destinationLocation}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-400">
                      {formatDate(shipment.estimatedDelivery)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Eye className="h-4 w-4 text-slate-400" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              disabled={updating === shipment.id}
                            >
                              {updating === shipment.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <MoreVertical className="h-4 w-4 text-slate-400" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-slate-800 border-slate-700">
                            {STATUSES.map(status => (
                              <DropdownMenuItem
                                key={status}
                                onClick={() => handleStatusUpdate(shipment.id, status)}
                                className="text-slate-300 hover:bg-slate-700 cursor-pointer"
                              >
                                Update to {status.replace('_', ' ')}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
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
