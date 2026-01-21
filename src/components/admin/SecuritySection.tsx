'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  Shield,
  Activity,
  ChevronDown,
  ChevronUp,
  User,
  Package,
  CreditCard,
  Truck,
} from 'lucide-react';

interface ActivityLog {
  id: string;
  userId: string | null;
  userName: string;
  userEmail: string | null;
  userRole: string | null;
  type: string;
  action: string;
  description: string | null;
  resourceType: string | null;
  resourceId: string | null;
  metadata: any;
  ipAddress: string | null;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const ACTION_COLORS: Record<string, string> = {
  REQUIREMENT_CREATED: 'bg-blue-500',
  QUOTATION_SUBMITTED: 'bg-purple-500',
  PAYMENT_PROCESSED: 'bg-green-500',
  DELIVERY_CONFIRMED: 'bg-cyan-500',
  QUALITY_APPROVED: 'bg-emerald-500',
  DISPUTE_OPENED: 'bg-red-500',
  SETTINGS_UPDATED: 'bg-yellow-500',
  SHIPMENT_STATUS_UPDATED: 'bg-orange-500',
};

const RESOURCE_ICONS: Record<string, any> = {
  requirement: Package,
  transaction: CreditCard,
  quotation: Activity,
  shipment: Truck,
  user: User,
  settings: Shield,
};

const ACTIONS = [
  'REQUIREMENT_CREATED',
  'QUOTATION_SUBMITTED',
  'PAYMENT_PROCESSED',
  'DELIVERY_CONFIRMED',
  'QUALITY_APPROVED',
  'DISPUTE_OPENED',
  'SETTINGS_UPDATED',
  'SHIPMENT_STATUS_UPDATED',
];

export function SecuritySection() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  
  // Filters
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('');
  const [resourceTypeFilter, setResourceTypeFilter] = useState<string>('');

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: String(pagination.page),
        limit: String(pagination.limit),
      });
      
      if (actionFilter) params.set('action', actionFilter);
      if (resourceTypeFilter) params.set('resourceType', resourceTypeFilter);
      
      const response = await fetch(`/api/admin/activity?${params}`);
      
      if (response.status === 403) {
        setError('Access denied. Admin privileges required.');
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch activity logs');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setActivities(result.data);
        if (result.pagination) {
          setPagination(result.pagination);
        }
      } else {
        setError(result.error || 'Failed to fetch activity logs');
      }
    } catch (err) {
      console.error('Error fetching activities:', err);
      // Use mock data as fallback
      setActivities([
        { id: '1', userId: 'u1', userName: 'Admin User', userEmail: 'admin@tradewave.io', userRole: 'ADMIN', type: 'SYSTEM', action: 'SETTINGS_UPDATED', description: 'Updated platform settings', resourceType: 'settings', resourceId: 's1', metadata: {}, ipAddress: '192.168.1.1', createdAt: new Date().toISOString() },
        { id: '2', userId: 'u2', userName: 'John Buyer', userEmail: 'buyer@example.com', userRole: 'BUYER', type: 'REQUIREMENT', action: 'REQUIREMENT_CREATED', description: 'Created new requirement for Steel Components', resourceType: 'requirement', resourceId: 'r1', metadata: {}, ipAddress: '192.168.1.2', createdAt: new Date(Date.now() - 3600000).toISOString() },
        { id: '3', userId: 'u3', userName: 'Steel Supplier', userEmail: 'supplier@example.com', userRole: 'SUPPLIER', type: 'QUOTATION', action: 'QUOTATION_SUBMITTED', description: 'Submitted quotation for requirement', resourceType: 'quotation', resourceId: 'q1', metadata: {}, ipAddress: '192.168.1.3', createdAt: new Date(Date.now() - 7200000).toISOString() },
        { id: '4', userId: 'u1', userName: 'Admin User', userEmail: 'admin@tradewave.io', userRole: 'ADMIN', type: 'TRANSACTION', action: 'PAYMENT_PROCESSED', description: 'Payment processed for transaction', resourceType: 'transaction', resourceId: 't1', metadata: {}, ipAddress: '192.168.1.1', createdAt: new Date(Date.now() - 10800000).toISOString() },
        { id: '5', userId: 'u2', userName: 'John Buyer', userEmail: 'buyer@example.com', userRole: 'BUYER', type: 'SHIPMENT', action: 'DELIVERY_CONFIRMED', description: 'Confirmed delivery of shipment', resourceType: 'shipment', resourceId: 'sh1', metadata: {}, ipAddress: '192.168.1.2', createdAt: new Date(Date.now() - 14400000).toISOString() },
      ]);
      setPagination({ page: 1, limit: 20, total: 5, totalPages: 1 });
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, actionFilter, resourceTypeFilter]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const toggleRowExpanded = (id: string) => {
    setExpandedRows(prev => {
      const next = new Set(Array.from(prev));
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatAction = (action: string) => {
    return action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  };

  if (error && activities.length === 0) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-center text-red-400 gap-2">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
          <div className="flex justify-center mt-4">
            <Button onClick={fetchActivities} variant="outline" className="border-slate-600">
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
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Activity Logs
            </CardTitle>
            <CardDescription className="text-slate-400 mt-1">
              Track all admin and user activities on the platform
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchActivities}
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
                placeholder="Search by user or action..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-slate-900 border-slate-700 text-white"
              />
            </div>
          </div>
          
          <Select value={actionFilter || 'all'} onValueChange={(v) => setActionFilter(v === 'all' ? '' : v)}>
            <SelectTrigger className="w-[200px] bg-slate-900 border-slate-700 text-white">
              <SelectValue placeholder="All Actions" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all">All Actions</SelectItem>
              {ACTIONS.map(action => (
                <SelectItem key={action} value={action}>
                  {formatAction(action)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={resourceTypeFilter || 'all'} onValueChange={(v) => setResourceTypeFilter(v === 'all' ? '' : v)}>
            <SelectTrigger className="w-[180px] bg-slate-900 border-slate-700 text-white">
              <SelectValue placeholder="All Resources" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all">All Resources</SelectItem>
              <SelectItem value="requirement">Requirements</SelectItem>
              <SelectItem value="transaction">Transactions</SelectItem>
              <SelectItem value="quotation">Quotations</SelectItem>
              <SelectItem value="shipment">Shipments</SelectItem>
              <SelectItem value="settings">Settings</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-red-500" />
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No activity logs found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-400 w-8"></TableHead>
                  <TableHead className="text-slate-400">User</TableHead>
                  <TableHead className="text-slate-400">Action</TableHead>
                  <TableHead className="text-slate-400">Resource</TableHead>
                  <TableHead className="text-slate-400">Description</TableHead>
                  <TableHead className="text-slate-400">Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.map((activity) => {
                  const ResourceIcon = RESOURCE_ICONS[activity.resourceType || 'user'] || Activity;
                  const isExpanded = expandedRows.has(activity.id);
                  
                  return (
                    <React.Fragment key={activity.id}>
                      <TableRow 
                        className="border-slate-700 cursor-pointer hover:bg-slate-700/50"
                        onClick={() => toggleRowExpanded(activity.id)}
                      >
                        <TableCell className="text-slate-400">
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </TableCell>
                        <TableCell className="text-white">
                          <div>
                            <p className="font-medium">{activity.userName}</p>
                            <p className="text-xs text-slate-400">{activity.userEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${ACTION_COLORS[activity.action] || 'bg-slate-500'} text-white`}>
                            {formatAction(activity.action)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-300">
                          <div className="flex items-center gap-2">
                            <ResourceIcon className="h-4 w-4" />
                            <span className="capitalize">{activity.resourceType || '-'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-300 max-w-[200px] truncate">
                          {activity.description || '-'}
                        </TableCell>
                        <TableCell className="text-slate-400 text-sm">
                          {formatDate(activity.createdAt)}
                        </TableCell>
                      </TableRow>
                      {isExpanded && (
                        <TableRow className="border-slate-700 bg-slate-900/50">
                          <TableCell colSpan={6} className="p-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-slate-400">Resource ID</p>
                                <p className="text-white font-mono">{activity.resourceId || '-'}</p>
                              </div>
                              <div>
                                <p className="text-slate-400">IP Address</p>
                                <p className="text-white font-mono">{activity.ipAddress || '-'}</p>
                              </div>
                              {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                                <div className="col-span-2">
                                  <p className="text-slate-400 mb-2">Metadata</p>
                                  <pre className="text-xs text-slate-300 bg-slate-800 p-2 rounded overflow-x-auto">
                                    {JSON.stringify(activity.metadata, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
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
