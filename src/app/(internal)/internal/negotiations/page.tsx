'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  MessageSquare,
  Clock,
  ArrowRight,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

interface NegotiationThread {
  id: string;
  status: string;
  requirement: {
    id: string;
    title: string;
    category: string;
    quantity: number;
    unit: string;
  };
  buyer: {
    id: string;
    name: string;
  };
  supplierNames: string[];
  quotationsCount: number;
  rounds: number;
  originalAmount: number | null;
  currentAmount: number | null;
  currency: string;
  lastActivity: string;
  latestMessage: {
    id: string;
    content: string;
    senderRole: string;
    createdAt: string;
  } | null;
}

const STATUS_CONFIG = {
  ACTIVE: { label: 'Active', className: 'bg-blue-500/20 text-blue-400' },
  COMPLETED: { label: 'Completed', className: 'bg-green-500/20 text-green-400' },
  ABANDONED: { label: 'Abandoned', className: 'bg-red-500/20 text-red-400' },
  EXPIRED: { label: 'Expired', className: 'bg-slate-500/20 text-slate-300' },
};

const formatCurrency = (amount: number | null, currency = 'USD') => {
  if (amount === null) return 'N/A';
  return `${currency} ${amount.toLocaleString()}`;
};

export default function NegotiationsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [threads, setThreads] = useState<NegotiationThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNegotiations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.set('status', statusFilter);
      }

      const response = await fetch(`/api/negotiations${params.toString() ? `?${params}` : ''}`);
      const payload = await response.json();

      if (!response.ok) {
        setThreads([]);
        setError(payload?.error || 'Failed to load negotiations');
        return;
      }

      setThreads(Array.isArray(payload?.threads) ? payload.threads : []);
    } catch {
      setThreads([]);
      setError('Network error while loading negotiations');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    void fetchNegotiations();
  }, [fetchNegotiations]);

  const filteredNegotiations = useMemo(() => {
    if (!search.trim()) {
      return threads;
    }

    const query = search.toLowerCase();
    return threads.filter((thread) => {
      const supplierText = thread.supplierNames.join(' ').toLowerCase();
      return (
        thread.id.toLowerCase().includes(query) ||
        thread.requirement.title.toLowerCase().includes(query) ||
        thread.buyer.name.toLowerCase().includes(query) ||
        supplierText.includes(query)
      );
    });
  }, [search, threads]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Negotiations</h1>
          <p className="text-slate-400">Manage ongoing price negotiations between buyers and suppliers</p>
        </div>
        <Button variant="outline" onClick={() => void fetchNegotiations()} className="border-slate-700">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search negotiations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-slate-900 border-slate-700"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('all')}
            size="sm"
            className="border-slate-700"
          >
            All
          </Button>
          <Button
            variant={statusFilter === 'ACTIVE' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('ACTIVE')}
            size="sm"
            className="border-slate-700"
          >
            Active
          </Button>
          <Button
            variant={statusFilter === 'COMPLETED' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('COMPLETED')}
            size="sm"
            className="border-slate-700"
          >
            Completed
          </Button>
          <Button
            variant={statusFilter === 'ABANDONED' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('ABANDONED')}
            size="sm"
            className="border-slate-700"
          >
            Abandoned
          </Button>
        </div>
      </div>

      {loading && (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="py-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
            <p className="text-sm text-slate-400">Loading negotiation threads...</p>
          </CardContent>
        </Card>
      )}

      {!loading && error && (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="py-16 flex flex-col items-center justify-center gap-3">
            <AlertCircle className="h-10 w-10 text-red-400" />
            <p className="text-sm text-slate-300">{error}</p>
            <Button variant="outline" onClick={() => void fetchNegotiations()} className="border-slate-700">
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Negotiations List */}
      {!loading && !error && (
        <div className="space-y-4">
          {filteredNegotiations.map((thread) => {
            const statusConfig =
              STATUS_CONFIG[thread.status as keyof typeof STATUS_CONFIG] ||
              { label: thread.status, className: 'bg-slate-500/20 text-slate-200' };

            const supplierText =
              thread.supplierNames.length > 0 ? thread.supplierNames.join(', ') : 'Supplier details pending';

            const hasAmount = thread.currentAmount !== null || thread.originalAmount !== null;
            const savingsPercent =
              thread.currentAmount !== null &&
              thread.originalAmount !== null &&
              thread.originalAmount > 0
                ? Math.round(((thread.originalAmount - thread.currentAmount) / thread.originalAmount) * 100)
                : null;

            return (
              <Card key={thread.id} className="bg-slate-900 border-slate-800">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div
                        className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                          thread.status === 'COMPLETED'
                            ? 'bg-green-500/20'
                            : thread.status === 'ABANDONED' || thread.status === 'EXPIRED'
                              ? 'bg-red-500/20'
                              : 'bg-blue-500/20'
                        }`}
                      >
                        {thread.status === 'COMPLETED' ? (
                          <CheckCircle className="h-6 w-6 text-green-500" />
                        ) : thread.status === 'ABANDONED' || thread.status === 'EXPIRED' ? (
                          <XCircle className="h-6 w-6 text-red-500" />
                        ) : (
                          <MessageSquare className="h-6 w-6 text-blue-500" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-white">{thread.requirement.title}</h3>
                          <Badge className={statusConfig.className}>{statusConfig.label}</Badge>
                        </div>

                        <p className="text-sm text-slate-400 mt-1">
                          {thread.buyer.name} ↔ {supplierText}
                        </p>

                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(thread.lastActivity).toLocaleString()}
                          </span>
                          <span>{thread.rounds} messages</span>
                          <span>{thread.quotationsCount} quotations</span>
                        </div>

                        {thread.latestMessage && (
                          <p className="mt-2 text-xs text-slate-400 max-w-2xl line-clamp-1">
                            Latest ({thread.latestMessage.senderRole}): {thread.latestMessage.content}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right min-w-[220px]">
                      {hasAmount ? (
                        <>
                          <div className="flex items-center justify-end gap-2 text-sm">
                            <span className="text-slate-400 line-through">
                              {formatCurrency(thread.originalAmount, thread.currency)}
                            </span>
                            <ArrowRight className="h-4 w-4 text-slate-500" />
                            <span className="text-lg font-bold text-white">
                              {formatCurrency(thread.currentAmount, thread.currency)}
                            </span>
                          </div>
                          <p className="text-xs text-green-400 mt-1">
                            {savingsPercent === null ? 'Latest offer updated' : `${savingsPercent}% reduction`}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-slate-400">Pricing not available</p>
                      )}

                      <Link href={`/internal/negotiations/${thread.id}`}>
                        <Button variant="outline" size="sm" className="mt-2 border-slate-700">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {filteredNegotiations.length === 0 && (
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="py-16 text-center">
                <MessageSquare className="h-10 w-10 text-slate-500 mx-auto" />
                <h3 className="mt-4 text-lg font-semibold text-white">No negotiations found</h3>
                <p className="mt-2 text-sm text-slate-400">
                  Try adjusting filters or wait for buyers to initiate negotiations.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
