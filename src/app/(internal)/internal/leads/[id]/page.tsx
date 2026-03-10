'use client';

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Globe,
  Calendar,
  CheckCircle,
  Clock,
  UserPlus,
  TrendingUp,
  Users,
  MessageSquare,
  Shield,
  Target,
  Loader2,
} from 'lucide-react';

interface LeadDetail {
  id: string;
  companyName: string;
  contactPerson: string;
  title: string;
  email: string;
  phone: string;
  website: string;
  industry: string;
  companySize: string;
  location: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted';
  assignedAt: string;
  lastTouch: string;
  potentialValue: number;
  likelihood: number;
  requirements: string[];
  activity: { id: string; type: string; notes: string; date: string }[];
}

type LiveLead = {
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
  additionalReqs: string | null;
  status: string;
  notes: string | null;
  assignedAt: string | null;
  convertedUserId: string | null;
  createdAt: string;
};

type ConvertedUser = {
  id: string;
  name: string;
  email: string;
  accountNumber?: string;
};

type CreatedAccount = {
  user: {
    id: string;
    name: string;
    email: string;
    accountNumber?: string;
  };
  tempPassword: string;
};

const LIVE_STATUS_LABELS: Record<string, string> = {
  NEW_LEAD: 'New',
  ASSIGNED_TO_AM: 'Assigned',
  CONTACTED: 'Contacted',
  CALL_SCHEDULED: 'Call Scheduled',
  CALL_COMPLETED: 'Call Completed',
  QUALIFIED: 'Qualified',
  CONVERTED: 'Converted',
};

const LIVE_STATUS_COLORS: Record<string, string> = {
  NEW_LEAD: 'bg-blue-500/20 text-blue-400',
  ASSIGNED_TO_AM: 'bg-indigo-500/20 text-indigo-400',
  CONTACTED: 'bg-yellow-500/20 text-yellow-400',
  CALL_SCHEDULED: 'bg-orange-500/20 text-orange-400',
  CALL_COMPLETED: 'bg-teal-500/20 text-teal-400',
  QUALIFIED: 'bg-purple-500/20 text-purple-400',
  CONVERTED: 'bg-green-500/20 text-green-400',
};

export default function LeadDetailPage() {
  const params = useParams();
  const leadId = typeof params.id === 'string' ? params.id : '';
  const router = useRouter();

  const [lead, setLead] = useState<LiveLead | null>(null);
  const [convertedUser, setConvertedUser] = useState<ConvertedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [savingLead, setSavingLead] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [creatingAccount, setCreatingAccount] = useState(false);

  const [saveError, setSaveError] = useState<string | null>(null);
  const [createdAccount, setCreatedAccount] = useState<CreatedAccount | null>(null);

  const [leadForm, setLeadForm] = useState({
    productName: '',
    category: '',
    quantity: '',
    unit: '',
    location: '',
    timeline: '',
    additionalReqs: '',
  });

  const [notes, setNotes] = useState('');
  const [accountForm, setAccountForm] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    country: '',
    region: '',
    role: 'BUYER',
    notes: '',
    sendWelcomeEmail: true,
  });

  const hydrateForm = useCallback((nextLead: LiveLead, nextConvertedUser: ConvertedUser | null) => {
    setLeadForm({
      productName: nextLead.productName || '',
      category: nextLead.category || '',
      quantity: String(nextLead.quantity || ''),
      unit: nextLead.unit || '',
      location: nextLead.location || '',
      timeline: nextLead.timeline || '',
      additionalReqs: nextLead.additionalReqs || '',
    });

    setNotes(nextLead.notes || '');

    if (!nextConvertedUser) {
      setAccountForm((prev) => ({
        ...prev,
        name: nextLead.fullName || '',
        email: nextLead.email || '',
        phone: nextLead.phoneNumber || '',
        companyName: nextLead.companyName || '',
      }));
    }
  }, []);

  const fetchLead = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/am/leads/${leadId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load lead details');
      }

      setLead(data.lead);
      setConvertedUser(data.convertedUser || null);
      hydrateForm(data.lead, data.convertedUser || null);
    } catch (fetchError) {
      console.error('Failed to fetch lead details:', fetchError);
      setLead(null);
      setError(fetchError instanceof Error ? fetchError.message : 'Failed to fetch lead details');
    } finally {
      setLoading(false);
    }
  }, [leadId, hydrateForm]);

  useEffect(() => {
    void fetchLead();
  }, [fetchLead]);

  const handleSaveLeadDetails = async () => {
    if (!lead) return;

    try {
      setSavingLead(true);
      setSaveError(null);

      const response = await fetch(`/api/am/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: leadForm.productName,
          category: leadForm.category,
          quantity: leadForm.quantity,
          unit: leadForm.unit,
          location: leadForm.location,
          timeline: leadForm.timeline,
          additionalReqs: leadForm.additionalReqs,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update lead details');
      }

      setLead(data.lead);
      hydrateForm(data.lead, convertedUser);
    } catch (saveLeadError) {
      console.error('Failed to save lead details:', saveLeadError);
      setSaveError(saveLeadError instanceof Error ? saveLeadError.message : 'Failed to save lead details');
    } finally {
      setSavingLead(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!lead) return;

    try {
      setSavingNotes(true);
      setSaveError(null);

      const response = await fetch(`/api/am/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save notes');
      }

      setLead(data.lead);
      setNotes(data.lead.notes || '');
    } catch (notesError) {
      console.error('Failed to save notes:', notesError);
      setSaveError(notesError instanceof Error ? notesError.message : 'Failed to save notes');
    } finally {
      setSavingNotes(false);
    }
  };

  const handleUpdateStatus = async (nextStatus: string) => {
    if (!lead) return;

    try {
      setUpdatingStatus(true);
      setSaveError(null);

      const response = await fetch(`/api/am/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: nextStatus,
          lastContactedAt: new Date().toISOString(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update lead status');
      }

      setLead(data.lead);
    } catch (statusError) {
      console.error('Failed to update lead status:', statusError);
      setSaveError(statusError instanceof Error ? statusError.message : 'Failed to update lead status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCreateAccount = async () => {
    if (!lead) return;

    try {
      setCreatingAccount(true);
      setSaveError(null);

      const response = await fetch(`/api/am/leads/${lead.id}/create-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accountForm),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account');
      }

      setCreatedAccount(data);
      setConvertedUser(data.user || null);
      setLead((prev) =>
        prev
          ? {
              ...prev,
              status: 'CONVERTED',
              convertedUserId: data.user?.id || prev.convertedUserId,
            }
          : prev
      );
    } catch (accountError) {
      console.error('Failed to create account:', accountError);
      setSaveError(accountError instanceof Error ? accountError.message : 'Failed to create account');
    } finally {
      setCreatingAccount(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    );
  }

  if (!lead) {
    return (
      <Card className="bg-slate-900 border-red-500/30">
        <CardContent className="py-12 text-center">
          <p className="text-lg font-medium text-white">Lead not found</p>
          {error && <p className="mt-2 text-sm text-red-300">{error}</p>}
          <Button className="mt-4" onClick={() => router.push('/internal/leads')}>
            Back to Leads
          </Button>
        </CardContent>
      </Card>
    );
  }

  const statusLabel = LIVE_STATUS_LABELS[lead.status] || lead.status.replace(/_/g, ' ');
  const statusClass = LIVE_STATUS_COLORS[lead.status] || 'bg-slate-500/20 text-slate-400';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white" onClick={() => router.push('/internal/leads')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Leads
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{lead.companyName}</h1>
              <Badge className={statusClass}>{statusLabel}</Badge>
            </div>
            <p className="text-slate-400 mt-1">{lead.fullName} • {lead.productName}</p>
          </div>
        </div>

        <div className="flex gap-2">
          {['NEW_LEAD', 'ASSIGNED_TO_AM'].includes(lead.status) && (
            <Button
              className="bg-yellow-600 hover:bg-yellow-700"
              onClick={() => handleUpdateStatus('CONTACTED')}
              disabled={updatingStatus}
            >
              {updatingStatus ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Mark Contacted'}
            </Button>
          )}
          {['CONTACTED', 'CALL_SCHEDULED', 'CALL_COMPLETED'].includes(lead.status) && (
            <Button
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => handleUpdateStatus('QUALIFIED')}
              disabled={updatingStatus}
            >
              {updatingStatus ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Mark Qualified'}
            </Button>
          )}
        </div>
      </div>

      {saveError && (
        <Card className="bg-slate-900 border-red-500/30">
          <CardContent className="py-3 text-sm text-red-300">{saveError}</CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Editable Requirement Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Product Name</label>
              <input
                value={leadForm.productName}
                onChange={(event) => setLeadForm((prev) => ({ ...prev, productName: event.target.value }))}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Category</label>
                <input
                  value={leadForm.category}
                  onChange={(event) => setLeadForm((prev) => ({ ...prev, category: event.target.value }))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Timeline</label>
                <input
                  value={leadForm.timeline}
                  onChange={(event) => setLeadForm((prev) => ({ ...prev, timeline: event.target.value }))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Quantity</label>
                <input
                  type="number"
                  value={leadForm.quantity}
                  onChange={(event) => setLeadForm((prev) => ({ ...prev, quantity: event.target.value }))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Unit</label>
                <input
                  value={leadForm.unit}
                  onChange={(event) => setLeadForm((prev) => ({ ...prev, unit: event.target.value }))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Location</label>
                <input
                  value={leadForm.location}
                  onChange={(event) => setLeadForm((prev) => ({ ...prev, location: event.target.value }))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Additional Requirements</label>
              <Textarea
                value={leadForm.additionalReqs}
                onChange={(event) => setLeadForm((prev) => ({ ...prev, additionalReqs: event.target.value }))}
                className="min-h-24 bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleSaveLeadDetails}
              disabled={savingLead}
            >
              {savingLead ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Save Requirement Updates
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">AM Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Capture discovery notes, objections, and action items"
              className="min-h-28 bg-slate-800 border-slate-700 text-white"
            />
            <Button onClick={handleSaveNotes} disabled={savingNotes}>
              {savingNotes ? 'Saving...' : 'Save Notes'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Create User Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(convertedUser || createdAccount) ? (
            <div className="rounded-lg border border-green-500/30 bg-green-900/20 p-4 text-green-200">
              <p className="font-medium">Account is already created for this lead.</p>
              <p className="text-sm mt-1">
                {(createdAccount?.user.name || convertedUser?.name)} ({createdAccount?.user.email || convertedUser?.email})
              </p>
              {(createdAccount?.user.accountNumber || convertedUser?.accountNumber) && (
                <p className="text-sm mt-1">Account #: <span className="font-mono">{createdAccount?.user.accountNumber || convertedUser?.accountNumber}</span></p>
              )}
              {createdAccount?.tempPassword && (
                <p className="text-sm mt-1">Temp password: <span className="font-mono">{createdAccount.tempPassword}</span></p>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  placeholder="Name"
                  value={accountForm.name}
                  onChange={(event) => setAccountForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
                />
                <input
                  placeholder="Email"
                  type="email"
                  value={accountForm.email}
                  onChange={(event) => setAccountForm((prev) => ({ ...prev, email: event.target.value }))}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
                />
                <input
                  placeholder="Phone"
                  value={accountForm.phone}
                  onChange={(event) => setAccountForm((prev) => ({ ...prev, phone: event.target.value }))}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
                />
                <input
                  placeholder="Company Name"
                  value={accountForm.companyName}
                  onChange={(event) => setAccountForm((prev) => ({ ...prev, companyName: event.target.value }))}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
                />
                <input
                  placeholder="Country"
                  value={accountForm.country}
                  onChange={(event) => setAccountForm((prev) => ({ ...prev, country: event.target.value }))}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
                />
                <input
                  placeholder="Region"
                  value={accountForm.region}
                  onChange={(event) => setAccountForm((prev) => ({ ...prev, region: event.target.value }))}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
                />
              </div>

              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={handleCreateAccount}
                disabled={creatingAccount || !accountForm.name || !accountForm.email || !accountForm.companyName}
              >
                {creatingAccount ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                Create Account
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
