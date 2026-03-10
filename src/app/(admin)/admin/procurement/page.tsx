'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Users,
  Clock,
  Building2,
  ArrowUpRight,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface Requirement {
  id: string;
  requirementReference: string;
  buyerName: string;
  title: string;
  category: string;
  quantity: number;
  unit: string;
  suppliersContacted: number;
  quotesReceived: number;
  status: 'pending_match' | 'suppliers_contacted' | 'quotes_received';
  rawStatus: string;
  lastUpdated: string;
  procurementOwner: string;
}

const STATUS_CONFIG: Record<Requirement['status'], { label: string; className: string }> = {
  pending_match: { label: 'Pending Match', className: 'bg-purple-500/20 text-purple-400' },
  suppliers_contacted: { label: 'Awaiting Quotations', className: 'bg-yellow-500/20 text-yellow-400' },
  quotes_received: { label: 'Quotations Received', className: 'bg-green-500/20 text-green-400' },
};

export default function ProcurementDashboard() {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Requirement['status']>('all');

  const fetchRequirements = useCallback(async (manualRefresh = false) => {
    try {
      if (manualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await fetch('/api/procurement/requirements');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch procurement queue');
      }

      setRequirements(Array.isArray(data.requirements) ? data.requirements : []);
    } catch (fetchError) {
      console.error('Failed to load admin procurement queue:', fetchError);
      setRequirements([]);
      setError(fetchError instanceof Error ? fetchError.message : 'Failed to load procurement queue');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchRequirements();
  }, [fetchRequirements]);

  const filteredRequirements = useMemo(() => {
    const term = searchQuery.toLowerCase().trim();
    return requirements.filter((item) => {
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      if (!matchesStatus) {
        return false;
      }

      if (!term) {
        return true;
      }

      return (
        item.requirementReference.toLowerCase().includes(term) ||
        item.buyerName.toLowerCase().includes(term) ||
        item.title.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term)
      );
    });
  }, [requirements, searchQuery, statusFilter]);

  const queueStats = {
    total: requirements.length,
    pendingMatch: requirements.filter((item) => item.status === 'pending_match').length,
    awaitingQuotes: requirements.filter((item) => item.status === 'suppliers_contacted').length,
    quotationsReceived: requirements.filter((item) => item.status === 'quotes_received').length,
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Procurement Matching Queue</h1>
          <p className="mt-1 text-slate-400">
            Information-only admin view. Open a requirement to see which suppliers were invited and current response status.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="border-slate-600 text-slate-300"
            onClick={() => void fetchRequirements(true)}
            disabled={loading || refreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Badge className="bg-slate-700 text-slate-200">{queueStats.total} requirements</Badge>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-900/20 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <p className="text-xs text-slate-400">Pending Match</p>
            <p className="text-2xl font-bold text-purple-400">{queueStats.pendingMatch}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <p className="text-xs text-slate-400">Awaiting Quotes</p>
            <p className="text-2xl font-bold text-yellow-400">{queueStats.awaitingQuotes}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <p className="text-xs text-slate-400">Quotes Received</p>
            <p className="text-2xl font-bold text-green-400">{queueStats.quotationsReceived}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <p className="text-xs text-slate-400">Total Suppliers Contacted</p>
            <p className="text-2xl font-bold text-blue-400">
              {requirements.reduce((sum, req) => sum + req.suppliersContacted, 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[260px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                placeholder="Search by requirement id, buyer, or product..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="bg-slate-900 border-slate-700 text-white pl-10"
              />
            </div>
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              className="border-slate-600 text-slate-300"
              onClick={() => setStatusFilter('all')}
            >
              All
            </Button>
            <Button
              variant={statusFilter === 'pending_match' ? 'default' : 'outline'}
              className="border-slate-600 text-slate-300"
              onClick={() => setStatusFilter('pending_match')}
            >
              Pending Match
            </Button>
            <Button
              variant={statusFilter === 'suppliers_contacted' ? 'default' : 'outline'}
              className="border-slate-600 text-slate-300"
              onClick={() => setStatusFilter('suppliers_contacted')}
            >
              Awaiting Quotes
            </Button>
            <Button
              variant={statusFilter === 'quotes_received' ? 'default' : 'outline'}
              className="border-slate-600 text-slate-300"
              onClick={() => setStatusFilter('quotes_received')}
            >
              Quotes Received
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-10 text-center text-slate-400">
              <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin" />
              Loading procurement queue...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="p-4 text-left text-sm font-medium text-slate-400">Requirement</th>
                    <th className="p-4 text-left text-sm font-medium text-slate-400">Buyer</th>
                    <th className="p-4 text-left text-sm font-medium text-slate-400">Suppliers / Quotes</th>
                    <th className="p-4 text-left text-sm font-medium text-slate-400">Owner</th>
                    <th className="p-4 text-left text-sm font-medium text-slate-400">Status</th>
                    <th className="p-4 text-right text-sm font-medium text-slate-400">Open</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequirements.map((requirement) => (
                    <tr key={requirement.id} className="border-b border-slate-700/60 hover:bg-slate-700/40">
                      <td className="p-4">
                        <p className="font-mono text-xs text-slate-500">{requirement.requirementReference}</p>
                        <p className="font-medium text-white">{requirement.title}</p>
                        <p className="text-xs text-slate-400">
                          {requirement.quantity.toLocaleString()} {requirement.unit} • {requirement.category}
                        </p>
                      </td>
                      <td className="p-4 text-slate-300">{requirement.buyerName}</td>
                      <td className="p-4 text-slate-300">
                        <div className="text-sm">
                          <p>{requirement.suppliersContacted} suppliers contacted</p>
                          <p className="text-slate-400">{requirement.quotesReceived} quotations received</p>
                        </div>
                      </td>
                      <td className="p-4 text-slate-300">
                        <span className="inline-flex items-center gap-2">
                          <Users className="h-4 w-4 text-slate-500" />
                          {requirement.procurementOwner || 'Unassigned'}
                        </span>
                      </td>
                      <td className="p-4">
                        <Badge className={STATUS_CONFIG[requirement.status].className}>
                          {STATUS_CONFIG[requirement.status].label}
                        </Badge>
                        <p className="mt-1 text-xs text-slate-500 inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(requirement.lastUpdated).toLocaleString()}
                        </p>
                      </td>
                      <td className="p-4 text-right">
                        <Link href={`/admin/procurement/${requirement.id}`}>
                          <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
                            Details
                            <ArrowUpRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!loading && filteredRequirements.length === 0 && (
            <div className="p-10 text-center text-slate-400">
              <Building2 className="mx-auto mb-3 h-10 w-10 opacity-50" />
              No procurement queue items found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
