'use client';

import React, { useState } from 'react';
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
  Building2,
  Clock,
  CheckCircle,
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';

interface Lead {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted';
  assignedAt: string;
  notes: string;
}

const MOCK_LEADS: Lead[] = [
  { id: 'LEAD-001', companyName: 'Global Imports Co', contactPerson: 'David Brown', email: 'david@globalimports.com', phone: '+1 234 567 8900', source: 'Website', status: 'new', assignedAt: '2024-01-20', notes: '' },
  { id: 'LEAD-002', companyName: 'Premium Exports Ltd', contactPerson: 'Lisa Wang', email: 'lisa@premiumexports.com', phone: '+1 345 678 9012', source: 'Referral', status: 'contacted', assignedAt: '2024-01-18', notes: 'Interested in bulk orders' },
  { id: 'LEAD-003', companyName: 'Metro Supplies', contactPerson: 'James Miller', email: 'james@metrosupplies.com', phone: '+1 456 789 0123', source: 'Trade Show', status: 'qualified', assignedAt: '2024-01-15', notes: 'Ready to proceed with KYB' },
  { id: 'LEAD-004', companyName: 'Eastern Trading', contactPerson: 'Anna Lee', email: 'anna@easterntrading.com', phone: '+1 567 890 1234', source: 'LinkedIn', status: 'new', assignedAt: '2024-01-19', notes: '' },
];

const STATUS_CONFIG = {
  new: { label: 'New', className: 'bg-blue-500/20 text-blue-400' },
  contacted: { label: 'Contacted', className: 'bg-yellow-500/20 text-yellow-400' },
  qualified: { label: 'Qualified', className: 'bg-purple-500/20 text-purple-400' },
  converted: { label: 'Converted', className: 'bg-green-500/20 text-green-400' },
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
  const [search, setSearch] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const filteredLeads = leads.filter((lead) =>
    lead.companyName.toLowerCase().includes(search.toLowerCase()) ||
    lead.contactPerson.toLowerCase().includes(search.toLowerCase())
  );

  const handleUpdateStatus = async (leadId: string, newStatus: Lead['status']) => {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === leadId ? { ...lead, status: newStatus } : lead
      )
    );
  };

  const handleSaveNotes = async () => {
    if (!selectedLead) return;
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === selectedLead.id ? { ...lead, notes } : lead
      )
    );
    setSaving(false);
    setSelectedLead(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Assigned Leads</h1>
        <p className="text-slate-400">Convert leads to registered users on the platform</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search leads..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-slate-900 border-slate-700"
        />
      </div>

      {/* Leads List */}
      <div className="space-y-4">
        {filteredLeads.map((lead) => (
          <Card key={lead.id} className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                    <UserPlus className="h-6 w-6 text-indigo-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white">{lead.companyName}</h3>
                      <Badge className={STATUS_CONFIG[lead.status].className}>
                        {STATUS_CONFIG[lead.status].label}
                      </Badge>
                      <Badge variant="outline" className="text-xs">{lead.source}</Badge>
                    </div>
                    <p className="text-sm text-slate-400 mt-1">{lead.contactPerson}</p>
                    
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {lead.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {lead.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Assigned {lead.assignedAt}
                      </span>
                    </div>

                    {lead.notes && (
                      <p className="text-sm text-slate-400 mt-2 italic">&ldquo;{lead.notes}&rdquo;</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/internal/leads/${lead.id}`}>
                    <Button variant="outline" size="sm" className="border-slate-700">
                      View Details
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setSelectedLead(lead); setNotes(lead.notes); }}
                    className="border-slate-700"
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Notes
                  </Button>
                  {lead.status === 'new' && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(lead.id, 'contacted')}
                      className="bg-yellow-600 hover:bg-yellow-700"
                    >
                      Mark Contacted
                    </Button>
                  )}
                  {lead.status === 'contacted' && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(lead.id, 'qualified')}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Mark Qualified
                    </Button>
                  )}
                  {lead.status === 'qualified' && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(lead.id, 'converted')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Convert
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Notes Dialog */}
      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white">Lead Notes</DialogTitle>
            <DialogDescription>
              {selectedLead?.companyName} - {selectedLead?.contactPerson}
            </DialogDescription>
          </DialogHeader>
          
          <Textarea
            placeholder="Add notes about this lead..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
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
