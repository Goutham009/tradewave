'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Phone,
  Mail,
  Package,
  MapPin,
  Clock,
  Search,
  ChevronRight,
  Loader2,
  Star,
} from 'lucide-react';

interface Lead {
  id: string;
  email: string;
  fullName: string;
  companyName: string;
  phoneNumber: string;
  category: string;
  productName: string;
  quantity: number;
  unit: string;
  location: string;
  timeline: string;
  targetPrice: string | null;
  additionalReqs: string | null;
  source: string;
  leadScore: string | null;
  status: string;
  notes: string | null;
  assignedTo: string | null;
  assignedAt: string | null;
  callScheduledAt: string | null;
  callCompletedAt: string | null;
  callNotes: string | null;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  NEW_LEAD: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  ASSIGNED_TO_AM: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  CONTACTED: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  CALL_SCHEDULED: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  CALL_COMPLETED: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  QUALIFIED: 'bg-green-500/20 text-green-400 border-green-500/30',
  CONVERTED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  REJECTED: 'bg-red-500/20 text-red-400 border-red-500/30',
  UNRESPONSIVE: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

const LEAD_SCORE_COLORS: Record<string, string> = {
  HIGH: 'text-green-400',
  MEDIUM: 'text-yellow-400',
  LOW: 'text-red-400',
};

export default function AdminLeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: pagination.page.toString(), limit: pagination.limit.toString() });
      if (statusFilter) params.append('status', statusFilter);

      const res = await fetch(`/api/leads?${params}`);
      if (!res.ok) throw new Error('Failed to fetch leads');
      const data = await res.json();
      setLeads(data.leads || []);
      setPagination(prev => ({ ...prev, ...data.pagination }));
    } catch (error) {
      console.error('Error fetching leads:', error);
      // Demo data fallback
      setLeads([
        {
          id: 'lead_demo_001',
          email: 'john@abccorp.com',
          fullName: 'John Doe',
          companyName: 'ABC Corp',
          phoneNumber: '+91 98765 43210',
          category: 'Metals',
          productName: 'Industrial Steel Pipes',
          quantity: 500,
          unit: 'MT',
          location: 'Mumbai, India',
          timeline: '1-3 months',
          targetPrice: '$1200/MT',
          additionalReqs: 'Need ISO 9001 certified suppliers. Quality inspection required.',
          source: 'LANDING_PAGE_FORM',
          leadScore: 'HIGH',
          status: 'NEW_LEAD',
          notes: null,
          assignedTo: null,
          assignedAt: null,
          callScheduledAt: null,
          callCompletedAt: null,
          callNotes: null,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'lead_demo_002',
          email: 'priya@techmfg.in',
          fullName: 'Priya Sharma',
          companyName: 'TechMfg Industries',
          phoneNumber: '+91 98765 11111',
          category: 'Electronics',
          productName: 'PCB Assemblies',
          quantity: 10000,
          unit: 'Units',
          location: 'Bangalore, India',
          timeline: '2-4 weeks',
          targetPrice: null,
          additionalReqs: null,
          source: 'LANDING_PAGE_FORM',
          leadScore: 'MEDIUM',
          status: 'ASSIGNED_TO_AM',
          notes: null,
          assignedTo: 'am_sarah_001',
          assignedAt: new Date(Date.now() - 86400000).toISOString(),
          callScheduledAt: new Date(Date.now() + 86400000).toISOString(),
          callCompletedAt: null,
          callNotes: null,
          createdAt: new Date(Date.now() - 172800000).toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, statusFilter]);

  useEffect(() => {
    void fetchLeads();
  }, [fetchLeads]);

  const filteredLeads = useMemo(() => {
    if (!searchTerm) return leads;

    const term = searchTerm.toLowerCase();
    return leads.filter((lead) =>
      lead.fullName.toLowerCase().includes(term) ||
      lead.companyName.toLowerCase().includes(term) ||
      lead.productName.toLowerCase().includes(term) ||
      lead.email.toLowerCase().includes(term)
    );
  }, [leads, searchTerm]);

  const statusCounts = useMemo(() => {
    return leads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [leads]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Lead Management</h1>
          <p className="text-slate-400">Click any lead to open complete details and actions</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            {leads.length} Total Leads
          </Badge>
        </div>
      </div>

      {/* Status Filter Pills */}
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={statusFilter === '' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('')}
          className={statusFilter === '' ? 'bg-red-600' : 'border-slate-600 text-slate-300'}
        >
          All ({leads.length})
        </Button>
        {Object.entries(statusCounts).map(([status, count]) => (
          <Button
            key={status}
            size="sm"
            variant={statusFilter === status ? 'default' : 'outline'}
            onClick={() => setStatusFilter(status)}
            className={statusFilter === status ? 'bg-red-600' : 'border-slate-600 text-slate-300'}
          >
            {status.replace(/_/g, ' ')} ({count})
          </Button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search leads..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
      </div>

      {/* Leads Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-red-500" />
        </div>
      ) : filteredLeads.length === 0 ? (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No Leads Found</h3>
            <p className="text-slate-400">New enquiries from the landing page will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredLeads.map((lead) => (
            <Card
              key={lead.id}
              className="cursor-pointer border-slate-700 bg-slate-800 transition-colors hover:border-slate-500"
              onClick={() => router.push(`/admin/leads/${lead.id}`)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-white">{lead.companyName}</h3>
                      <Badge className={STATUS_COLORS[lead.status] || 'bg-gray-500/20 text-gray-400'}>
                        {lead.status.replace(/_/g, ' ')}
                      </Badge>
                      {lead.leadScore && (
                        <span className={`flex items-center gap-1 text-sm font-medium ${LEAD_SCORE_COLORS[lead.leadScore] || 'text-gray-400'}`}>
                          <Star className="h-3.5 w-3.5" />
                          {lead.leadScore}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2 lg:grid-cols-3">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Users className="h-4 w-4 text-slate-500" />
                        <span>{lead.fullName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Mail className="h-4 w-4 text-slate-500" />
                        <span>{lead.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Phone className="h-4 w-4 text-slate-500" />
                        <span>{lead.phoneNumber}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Package className="h-4 w-4 text-slate-500" />
                        <span>{lead.productName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <MapPin className="h-4 w-4 text-slate-500" />
                        <span>{lead.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Clock className="h-4 w-4 text-slate-500" />
                        <span>{lead.quantity} {lead.unit} • {lead.timeline}</span>
                      </div>
                    </div>

                    {lead.targetPrice && (
                      <p className="mt-2 text-sm text-green-400">Target Price: {lead.targetPrice}</p>
                    )}
                    {lead.additionalReqs && (
                      <p className="mt-1 line-clamp-1 text-sm text-slate-400">{lead.additionalReqs}</p>
                    )}

                    {lead.assignedTo && (
                      <div className="mt-3 text-sm text-blue-400">
                        Assigned to: {lead.assignedTo}
                      </div>
                    )}

                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-xs text-slate-500">
                        Created: {new Date(lead.createdAt).toLocaleString()}
                      </p>
                      <span className="inline-flex items-center gap-1 text-sm text-slate-300">
                        Open details
                        <ChevronRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800 px-4 py-3">
          <p className="text-sm text-slate-400">
            Showing {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPagination((prev) => ({ ...prev, page: Math.max(prev.page - 1, 1) }))}
              disabled={pagination.page === 1}
              className="border-slate-600 text-slate-300"
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPagination((prev) => ({ ...prev, page: Math.min(prev.page + 1, prev.pages || 1) }))}
              disabled={pagination.page >= pagination.pages}
              className="border-slate-600 text-slate-300"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
