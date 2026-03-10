'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Package,
  Users,
  Clock,
  ArrowRight,
  CheckCircle,
  Loader2,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

interface Requirement {
  id: string;
  requirementReference: string;
  title: string;
  buyerName: string;
  category: string;
  quantity: number;
  budget: number;
  deliveryLocation: string;
  deadline: string;
  status: 'pending_match' | 'suppliers_contacted' | 'quotes_received';
  priority: 'high' | 'medium' | 'low';
  rawStatus: string;
  suppliersContacted: number;
  quotesReceived: number;
}


const STATUS_CONFIG = {
  pending_match: { label: 'Pending Match', className: 'bg-yellow-500/20 text-yellow-400' },
  suppliers_contacted: { label: 'Suppliers Contacted', className: 'bg-blue-500/20 text-blue-400' },
  quotes_received: { label: 'Quotes Received', className: 'bg-green-500/20 text-green-400' },
};

const PRIORITY_CONFIG = {
  high: { label: 'High', className: 'bg-red-500/20 text-red-400' },
  medium: { label: 'Medium', className: 'bg-yellow-500/20 text-yellow-400' },
  low: { label: 'Low', className: 'bg-green-500/20 text-green-400' },
};

export default function RequirementsQueuePage() {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchRequirements = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const query = new URLSearchParams();
      if (search.trim()) {
        query.set('search', search.trim());
      }

      const response = await fetch(`/api/procurement/requirements?${query.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch procurement queue');
      }

      setRequirements(data.requirements || []);
    } catch (fetchError) {
      console.error('Failed to fetch procurement requirements:', fetchError);
      setRequirements([]);
      setError(
        fetchError instanceof Error ? fetchError.message : 'Failed to fetch procurement queue'
      );
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    void fetchRequirements();
  }, [fetchRequirements]);

  const filteredRequirements =
    statusFilter === 'all'
      ? requirements
      : requirements.filter((requirement) => requirement.status === statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Requirements Queue</h1>
          <p className="text-slate-400">Match buyer requirements with suitable suppliers</p>
        </div>
        <Button
          variant="outline"
          className="border-slate-700 text-slate-300"
          onClick={() => void fetchRequirements()}
          disabled={loading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-900/20 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search requirements..."
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
            variant={statusFilter === 'pending_match' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('pending_match')}
            size="sm"
            className="border-slate-700"
          >
            Pending Match
          </Button>
          <Button
            variant={statusFilter === 'suppliers_contacted' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('suppliers_contacted')}
            size="sm"
            className="border-slate-700"
          >
            Contacted
          </Button>
          <Button
            variant={statusFilter === 'quotes_received' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('quotes_received')}
            size="sm"
            className="border-slate-700"
          >
            Quotes Received
          </Button>
        </div>
      </div>

      {/* Requirements List */}
      <div className="space-y-4">
        {loading && (
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="py-10 text-center text-slate-400">
              <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin" />
              Loading procurement queue...
            </CardContent>
          </Card>
        )}

        {!loading && filteredRequirements.map((req) => (
          <Card key={req.id} className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <Package className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-white">{req.title}</h3>
                      <Badge className={STATUS_CONFIG[req.status].className}>
                        {STATUS_CONFIG[req.status].label}
                      </Badge>
                      <Badge className={PRIORITY_CONFIG[req.priority].className}>
                        {PRIORITY_CONFIG[req.priority].label}
                      </Badge>
                    </div>
                    <p className="font-mono text-xs text-slate-500 mt-1">{req.requirementReference}</p>
                    <p className="text-sm text-slate-400 mt-1">
                      {req.buyerName} • {req.category} • Qty: {req.quantity.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                      <span>Budget: ${req.budget.toLocaleString()}</span>
                      <span>•</span>
                      <span>Location: {req.deliveryLocation}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Deadline: {new Date(req.deadline).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-slate-400">
                      {req.suppliersContacted} suppliers contacted • {req.quotesReceived} quotes received
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {req.status === 'pending_match' && (
                    <Link href={`/internal/requirements/${req.id}/match`}>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Users className="h-4 w-4 mr-2" />
                        Match Suppliers
                      </Button>
                    </Link>
                  )}
                  {req.status === 'quotes_received' && (
                    <Link href={`/internal/quotations?requirement=${req.id}`}>
                      <Button className="bg-green-600 hover:bg-green-700 text-white">
                        Review Quotes
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {!loading && filteredRequirements.length === 0 && (
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-12 w-12 text-slate-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white">No requirements in queue</h3>
              <p className="text-slate-400">Approved requirements will appear here for procurement matching.</p>
            </CardContent>
          </Card>
        )}
      </div>

    </div>
  );
}
