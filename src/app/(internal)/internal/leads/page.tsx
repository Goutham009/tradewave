'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Search,
  UserPlus,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  Loader2,
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';

interface Lead {
  id: string;
  companyName: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  source: string;
  status: string;
  assignedAt: string | null;
  notes: string | null;
  productName: string;
  quantity: number;
  unit: string;
  timeline: string;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  NEW_LEAD: { label: 'New', className: 'bg-blue-500/20 text-blue-400' },
  ASSIGNED_TO_AM: { label: 'Assigned', className: 'bg-indigo-500/20 text-indigo-400' },
  CONTACTED: { label: 'Contacted', className: 'bg-yellow-500/20 text-yellow-400' },
  CALL_SCHEDULED: { label: 'Call Scheduled', className: 'bg-orange-500/20 text-orange-400' },
  CALL_COMPLETED: { label: 'Call Completed', className: 'bg-teal-500/20 text-teal-400' },
  QUALIFIED: { label: 'Qualified', className: 'bg-purple-500/20 text-purple-400' },
  CONVERTED: { label: 'Converted', className: 'bg-green-500/20 text-green-400' },
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/leads?page=1&limit=100');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch assigned leads');
      }

      setLeads(data.leads || []);
    } catch (fetchError) {
      console.error('Failed to fetch assigned leads:', fetchError);
      setLeads([]);
      setError(fetchError instanceof Error ? fetchError.message : 'Failed to fetch assigned leads');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchLeads();
  }, [fetchLeads]);

  const filteredLeads = useMemo(
    () =>
      leads.filter((lead) =>
        [lead.companyName, lead.fullName, lead.email, lead.productName]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(search.toLowerCase()))
      ),
    [leads, search]
  );

  const handleUpdateStatus = async (leadId: string, newStatus: string) => {
    try {
      setUpdatingStatusId(leadId);

      const response = await fetch(`/api/am/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          lastContactedAt: new Date().toISOString(),
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update lead status');
      }

      setLeads((prev) =>
        prev.map((lead) =>
          lead.id === leadId
            ? {
                ...lead,
                status: data.lead?.status || newStatus,
              }
            : lead
        )
      );
    } catch (statusError) {
      console.error('Failed to update lead status:', statusError);
      setError(statusError instanceof Error ? statusError.message : 'Failed to update lead status');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedLead) return;

    try {
      setSaving(true);

      const response = await fetch(`/api/am/leads/${selectedLead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save notes');
      }

      setLeads((prev) =>
        prev.map((lead) =>
          lead.id === selectedLead.id
            ? {
                ...lead,
                notes,
              }
            : lead
        )
      );

      setSelectedLead(null);
    } catch (notesError) {
      console.error('Failed to save notes:', notesError);
      setError(notesError instanceof Error ? notesError.message : 'Failed to save notes');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Assigned Leads</h1>
        <p className="text-slate-400">Review assigned leads and move them toward account creation</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search leads..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="pl-10 bg-slate-900 border-slate-700"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-red-500" />
        </div>
      ) : filteredLeads.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="py-10 text-center text-slate-400">
            No assigned leads found.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredLeads.map((lead) => {
            const statusConfig =
              STATUS_CONFIG[lead.status] ||
              ({ label: lead.status.replace(/_/g, ' '), className: 'bg-slate-500/20 text-slate-400' } as const);
            const isUpdating = updatingStatusId === lead.id;

            return (
              <Card key={lead.id} className="bg-slate-900 border-slate-800">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                        <UserPlus className="h-6 w-6 text-indigo-500" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-white">{lead.companyName}</h3>
                          <Badge className={statusConfig.className}>{statusConfig.label}</Badge>
                          <Badge variant="outline" className="text-xs">{lead.source}</Badge>
                        </div>
                        <p className="text-sm text-slate-300 mt-1">{lead.fullName}</p>
                        <p className="text-sm text-slate-400 mt-1">{lead.productName} • {lead.quantity} {lead.unit} • {lead.timeline}</p>

                        <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {lead.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {lead.phoneNumber}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Assigned {lead.assignedAt ? new Date(lead.assignedAt).toLocaleDateString() : new Date(lead.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        {lead.notes && (
                          <p className="text-sm text-slate-400 mt-2 italic">&ldquo;{lead.notes}&rdquo;</p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-end">
                      <Link href={`/internal/leads/${lead.id}`}>
                        <Button variant="outline" size="sm" className="border-slate-700">
                          View Details
                        </Button>
                      </Link>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedLead(lead);
                          setNotes(lead.notes || '');
                        }}
                        className="border-slate-700"
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Notes
                      </Button>

                      {['NEW_LEAD', 'ASSIGNED_TO_AM'].includes(lead.status) && (
                        <Button
                          size="sm"
                          onClick={() => handleUpdateStatus(lead.id, 'CONTACTED')}
                          disabled={isUpdating}
                          className="bg-yellow-600 hover:bg-yellow-700"
                        >
                          {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Mark Contacted'}
                        </Button>
                      )}

                      {['CONTACTED', 'CALL_SCHEDULED', 'CALL_COMPLETED'].includes(lead.status) && (
                        <Button
                          size="sm"
                          onClick={() => handleUpdateStatus(lead.id, 'QUALIFIED')}
                          disabled={isUpdating}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Mark Qualified'}
                        </Button>
                      )}

                      {lead.status === 'QUALIFIED' && (
                        <Link href={`/internal/leads/${lead.id}`}>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Convert
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {error && (
        <Card className="bg-slate-900 border-red-500/30">
          <CardContent className="py-3 text-sm text-red-300">{error}</CardContent>
        </Card>
      )}

      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white">Lead Notes</DialogTitle>
            <DialogDescription>
              {selectedLead?.companyName} - {selectedLead?.fullName}
            </DialogDescription>
          </DialogHeader>

          <Textarea
            placeholder="Add notes about this lead..."
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className="min-h-32 bg-slate-800 border-slate-700"
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedLead(null)} className="border-slate-700">
              Cancel
            </Button>
            <Button onClick={handleSaveNotes} disabled={saving}>
              {saving ? 'Saving...' : 'Save Notes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
