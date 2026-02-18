'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Phone,
  Mail,
  Building2,
  Package,
  MapPin,
  Clock,
  UserPlus,
  Search,
  Filter,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Star,
  Calendar,
  MessageSquare,
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

// Mock AM list - in production, fetch from API
const ACCOUNT_MANAGERS = [
  { id: 'am_sarah_001', name: 'Sarah Johnson', email: 'sarah@tradewave.io' },
  { id: 'am_raj_001', name: 'Raj Patel', email: 'raj@tradewave.io' },
  { id: 'am_lisa_001', name: 'Lisa Chen', email: 'lisa@tradewave.io' },
];

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [assigningLead, setAssigningLead] = useState<string | null>(null);
  const [selectedAM, setSelectedAM] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });

  useEffect(() => {
    fetchLeads();
  }, [statusFilter, pagination.page]);

  const fetchLeads = async () => {
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
  };

  const handleAssignAM = async (leadId: string) => {
    if (!selectedAM) return;
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedTo: selectedAM }),
      });

      if (res.ok) {
        setAssigningLead(null);
        setSelectedAM('');
        fetchLeads();
      }
    } catch (error) {
      console.error('Error assigning AM:', error);
      // Update locally for demo
      setLeads(prev =>
        prev.map(l =>
          l.id === leadId
            ? { ...l, assignedTo: selectedAM, status: 'ASSIGNED_TO_AM', assignedAt: new Date().toISOString() }
            : l
        )
      );
      setAssigningLead(null);
      setSelectedAM('');
    }
  };

  const filteredLeads = leads.filter(lead => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        lead.fullName.toLowerCase().includes(term) ||
        lead.companyName.toLowerCase().includes(term) ||
        lead.productName.toLowerCase().includes(term) ||
        lead.email.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const statusCounts = leads.reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Lead Management</h1>
          <p className="text-slate-400">Manage enquiries and assign Account Managers</p>
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
            <Card key={lead.id} className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  {/* Lead Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
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

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
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
                      <p className="text-sm text-green-400 mt-2">Target Price: {lead.targetPrice}</p>
                    )}
                    {lead.additionalReqs && (
                      <p className="text-sm text-slate-400 mt-1 line-clamp-1">{lead.additionalReqs}</p>
                    )}

                    {lead.assignedTo && (
                      <div className="mt-3 flex items-center gap-2">
                        <UserPlus className="h-4 w-4 text-blue-400" />
                        <span className="text-sm text-blue-400">
                          Assigned to: {ACCOUNT_MANAGERS.find(am => am.id === lead.assignedTo)?.name || lead.assignedTo}
                        </span>
                        {lead.callScheduledAt && (
                          <span className="text-sm text-orange-400 ml-4 flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            Call: {new Date(lead.callScheduledAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    )}

                    <p className="text-xs text-slate-500 mt-2">
                      Created: {new Date(lead.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 shrink-0">
                    {lead.status === 'NEW_LEAD' && (
                      <>
                        {assigningLead === lead.id ? (
                          <div className="flex flex-col gap-2">
                            <select
                              value={selectedAM}
                              onChange={(e) => setSelectedAM(e.target.value)}
                              className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-red-500"
                            >
                              <option value="">Select AM...</option>
                              {ACCOUNT_MANAGERS.map(am => (
                                <option key={am.id} value={am.id}>{am.name}</option>
                              ))}
                            </select>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => handleAssignAM(lead.id)}
                                disabled={!selectedAM}
                              >
                                Assign
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-slate-600 text-slate-300"
                                onClick={() => { setAssigningLead(null); setSelectedAM(''); }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={() => setAssigningLead(lead.id)}
                          >
                            <UserPlus className="h-4 w-4 mr-1" />
                            Assign AM
                          </Button>
                        )}
                      </>
                    )}
                    {lead.status === 'ASSIGNED_TO_AM' && (
                      <div className="flex flex-col gap-1">
                        <Button size="sm" variant="outline" className="border-slate-600 text-slate-300">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Send Email
                        </Button>
                        <Button size="sm" variant="outline" className="border-slate-600 text-slate-300">
                          <Calendar className="h-4 w-4 mr-1" />
                          Schedule Call
                        </Button>
                      </div>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-slate-400 hover:text-white"
                      onClick={() => setSelectedLead(selectedLead?.id === lead.id ? null : lead)}
                    >
                      Details <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedLead?.id === lead.id && (
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-slate-300 mb-2">Product Details</h4>
                        <div className="space-y-1 text-sm text-slate-400">
                          <p><span className="text-slate-500">Category:</span> {lead.category}</p>
                          <p><span className="text-slate-500">Product:</span> {lead.productName}</p>
                          <p><span className="text-slate-500">Quantity:</span> {lead.quantity} {lead.unit}</p>
                          <p><span className="text-slate-500">Location:</span> {lead.location}</p>
                          <p><span className="text-slate-500">Timeline:</span> {lead.timeline}</p>
                          {lead.targetPrice && <p><span className="text-slate-500">Target Price:</span> {lead.targetPrice}</p>}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-slate-300 mb-2">Contact & Status</h4>
                        <div className="space-y-1 text-sm text-slate-400">
                          <p><span className="text-slate-500">Email:</span> {lead.email}</p>
                          <p><span className="text-slate-500">Phone:</span> {lead.phoneNumber}</p>
                          <p><span className="text-slate-500">Company:</span> {lead.companyName}</p>
                          <p><span className="text-slate-500">Source:</span> {lead.source}</p>
                          <p><span className="text-slate-500">Lead Score:</span> {lead.leadScore || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                    {lead.additionalReqs && (
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-slate-300 mb-1">Additional Requirements</h4>
                        <p className="text-sm text-slate-400">{lead.additionalReqs}</p>
                      </div>
                    )}
                    {lead.callNotes && (
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-slate-300 mb-1">Call Notes</h4>
                        <p className="text-sm text-slate-400">{lead.callNotes}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
