'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  MessageSquare,
  Loader2,
  Search,
  Filter,
  ChevronRight,
  Plus,
  Scale,
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  UNDER_REVIEW: { label: 'Under Review', color: 'bg-blue-100 text-blue-800', icon: Clock },
  AWAITING_RESPONSE: { label: 'Awaiting Response', color: 'bg-purple-100 text-purple-800', icon: MessageSquare },
  RESOLVED: { label: 'Resolved', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  CLOSED: { label: 'Closed', color: 'bg-gray-100 text-gray-800', icon: CheckCircle },
  ESCALATED: { label: 'Escalated', color: 'bg-red-100 text-red-800', icon: AlertTriangle },
};

const REASON_LABELS: Record<string, string> = {
  QUALITY_ISSUE: 'Quality Issues',
  NOT_RECEIVED: 'Not Received',
  DIFFERENT_ITEM: 'Wrong Item',
  QUANTITY_MISMATCH: 'Quantity Issue',
  LATE_DELIVERY: 'Late Delivery',
  PAYMENT_NOT_RECEIVED: 'Payment Issue',
  OTHER: 'Other',
};

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchDisputes();
  }, [filter]);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const url = `/api/disputes${filter ? `?status=${filter}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        setDisputes(data.disputes);
      } else {
        setError(data.error || 'Failed to fetch disputes');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const filteredDisputes = disputes.filter(d => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      d.id.toLowerCase().includes(searchLower) ||
      d.transactionId.toLowerCase().includes(searchLower) ||
      d.reason.toLowerCase().includes(searchLower) ||
      d.description.toLowerCase().includes(searchLower)
    );
  });

  const pendingCount = disputes.filter(d => d.status === 'PENDING' || d.status === 'UNDER_REVIEW').length;
  const resolvedCount = disputes.filter(d => d.status === 'RESOLVED' || d.status === 'CLOSED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Disputes</h1>
          <p className="text-muted-foreground">Manage and track your transaction disputes</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Disputes</p>
                <p className="text-3xl font-bold">{disputes.length}</p>
              </div>
              <Scale className="h-10 w-10 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
              <Clock className="h-10 w-10 text-yellow-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resolved</p>
                <p className="text-3xl font-bold text-green-600">{resolvedCount}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search disputes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="AWAITING_RESPONSE">Awaiting Response</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Disputes List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-red-500" />
            <p className="mt-4 text-muted-foreground">{error}</p>
            <Button className="mt-4" onClick={fetchDisputes}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : filteredDisputes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Scale className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No disputes found</h3>
            <p className="mt-2 text-muted-foreground">
              {filter || search ? 'Try adjusting your filters' : 'You have no disputes'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredDisputes.map((dispute) => {
            const statusConfig = STATUS_CONFIG[dispute.status] || STATUS_CONFIG.PENDING;
            const StatusIcon = statusConfig.icon;
            
            return (
              <Link key={dispute.id} href={`/disputes/${dispute.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <Badge className={statusConfig.color}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {statusConfig.label}
                          </Badge>
                          <Badge variant="outline">
                            {REASON_LABELS[dispute.reason] || dispute.reason}
                          </Badge>
                        </div>
                        
                        <h3 className="font-semibold truncate">
                          Dispute #{dispute.id.slice(0, 8)}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {dispute.description}
                        </p>
                        
                        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                          <span>
                            Transaction: {dispute.transactionId.slice(0, 8)}...
                          </span>
                          <span>•</span>
                          <span>
                            {new Date(dispute.createdAt).toLocaleDateString()}
                          </span>
                          {dispute._count?.messages > 0 && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                {dispute._count.messages}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {dispute.transaction?.amount && (
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Amount</p>
                            <p className="font-semibold">
                              ${Number(dispute.transaction.amount).toLocaleString()}
                            </p>
                          </div>
                        )}
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
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
