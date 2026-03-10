'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  Calendar,
  MessageSquare,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  Star,
  FileText,
  Send,
  AlertCircle,
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
  callScheduledAt: string | null;
  callCompletedAt: string | null;
  callNotes: string | null;
  callChecklist: any;
  createdAt: string;
}

interface AccountManagerOption {
  id: string;
  name: string;
  email: string;
}

interface CreatedAccount {
  user: {
    id: string;
    name: string;
    email: string;
    accountNumber?: string;
  };
  tempPassword: string;
}

const CALL_CHECKLIST_ITEMS = [
  'Confirmed product specifications',
  'Discussed quality standards required',
  'Confirmed quantity & delivery timeline',
  'Discussed budget/pricing expectations',
  'Explained Tradewave process',
  'Explained escrow security',
  'Got commitment to proceed',
];

export default function LeadDetailPage() {
  const params = useParams();
  const leadId = typeof params.id === 'string' ? params.id : '';
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [leadError, setLeadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'call' | 'create-account'>('details');

  const [accountManagers, setAccountManagers] = useState<AccountManagerOption[]>([]);
  const [selectedAccountManagerId, setSelectedAccountManagerId] = useState('');
  const [loadingAccountManagers, setLoadingAccountManagers] = useState(true);
  const [assigningLead, setAssigningLead] = useState(false);
  const [assignmentError, setAssignmentError] = useState<string | null>(null);

  // Call notes form
  const [callNotes, setCallNotes] = useState('');
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [savingCall, setSavingCall] = useState(false);

  // Account creation form
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
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [createdAccount, setCreatedAccount] = useState<CreatedAccount | null>(null);
  const [createAccountError, setCreateAccountError] = useState<string | null>(null);

  const fetchLead = useCallback(async () => {
    try {
      setLoading(true);
      setLeadError(null);

      const res = await fetch(`/api/admin/leads/${leadId}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch lead');
      }

      setLead(data.lead);
      setSelectedAccountManagerId(data.lead.assignedTo || '');

      // Pre-fill account form from lead data
      setAccountForm(prev => ({
        ...prev,
        name: data.lead.fullName,
        email: data.lead.email,
        phone: data.lead.phoneNumber,
        companyName: data.lead.companyName,
      }));
    } catch (error) {
      console.error('Error fetching lead:', error);
      setLead(null);
      setLeadError(error instanceof Error ? error.message : 'Failed to fetch lead');
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  const fetchAccountManagers = useCallback(async () => {
    try {
      setLoadingAccountManagers(true);
      setAssignmentError(null);

      const res = await fetch('/api/admin/users?role=ACCOUNT_MANAGER&limit=100');
      const data = await res.json();

      if (data.status !== 'success') {
        throw new Error(data.error || 'Failed to load account managers');
      }

      const managers: AccountManagerOption[] = data.data.users.map((user: any) => ({
        id: user.id,
        name: user.name,
        email: user.email,
      }));

      setAccountManagers(managers);
    } catch (error) {
      console.error('Error fetching account managers:', error);
      setAssignmentError(
        error instanceof Error ? error.message : 'Failed to load account managers'
      );
    } finally {
      setLoadingAccountManagers(false);
    }
  }, []);

  useEffect(() => {
    void fetchLead();
    void fetchAccountManagers();
  }, [fetchLead, fetchAccountManagers]);

  const handleAssignLead = async () => {
    if (!lead || !selectedAccountManagerId) {
      return;
    }

    setAssigningLead(true);
    setAssignmentError(null);

    try {
      const res = await fetch(`/api/admin/leads/${lead.id}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedTo: selectedAccountManagerId }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to assign lead');
      }

      const assignedManager = accountManagers.find(
        (accountManager) => accountManager.id === selectedAccountManagerId
      );
      setLead((prev) =>
        prev
          ? {
              ...prev,
              assignedTo: selectedAccountManagerId,
              status: data.lead?.status || 'ASSIGNED_TO_AM',
            }
          : null
      );

      if (assignedManager) {
        setAccountForm((prev) => ({
          ...prev,
          notes: prev.notes || `Assigned to ${assignedManager.name} (${assignedManager.email})`,
        }));
      }
    } catch (error) {
      console.error('Error assigning lead:', error);
      setAssignmentError(error instanceof Error ? error.message : 'Failed to assign lead');
    } finally {
      setAssigningLead(false);
    }
  };

  const handleSaveCallNotes = async () => {
    if (!lead) return;

    setSavingCall(true);
    setLeadError(null);

    try {
      const res = await fetch(`/api/admin/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'CALL_COMPLETED',
          callCompletedAt: new Date().toISOString(),
          callNotes,
          callChecklist: checklist,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save call notes');
      }

      setLead(prev => prev ? { ...prev, status: 'CALL_COMPLETED', callNotes, callChecklist: checklist } : null);
      setActiveTab('create-account');
    } catch (error) {
      console.error('Error saving call notes:', error);
      setLeadError(error instanceof Error ? error.message : 'Failed to save call notes');
    } finally {
      setSavingCall(false);
    }
  };

  const handleCreateAccount = async () => {
    if (!lead) return;
    setCreatingAccount(true);
    setCreateAccountError(null);

    try {
      const res = await fetch(`/api/am/leads/${lead.id}/create-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...accountForm,
          accountManagerId: lead.assignedTo || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create account');
      }

      setCreatedAccount(data);

      setLead((prev) =>
        prev
          ? {
              ...prev,
              status: 'CONVERTED',
            }
          : null
      );
    } catch (error) {
      console.error('Error creating account:', error);
      setCreateAccountError(
        error instanceof Error ? error.message : 'Failed to create account'
      );
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
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="py-12 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white">Lead not found</h3>
          {leadError && <p className="mt-2 text-sm text-red-300">{leadError}</p>}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push('/admin/leads')} className="text-slate-400 hover:text-white">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Leads
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">{lead.companyName}</h1>
          <p className="text-slate-400">{lead.fullName} • {lead.productName}</p>
        </div>
        <Badge className="ml-auto bg-blue-500/20 text-blue-400 border-blue-500/30">
          {lead.status.replace(/_/g, ' ')}
        </Badge>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-slate-700 pb-2">
        {(['details', 'call', 'create-account'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {tab === 'details' ? 'Lead Details' : tab === 'call' ? 'Discovery Call' : 'Create Account'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'details' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-red-400" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-slate-500" />
                <span className="text-slate-300">{lead.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-slate-500" />
                <span className="text-slate-300">{lead.phoneNumber}</span>
              </div>
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-slate-500" />
                <span className="text-slate-300">{lead.companyName}</span>
              </div>
              <div className="flex items-center gap-3">
                <Star className="h-4 w-4 text-slate-500" />
                <span className="text-slate-300">Lead Score: <strong className="text-yellow-400">{lead.leadScore}</strong></span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Package className="h-5 w-5 text-red-400" />
                Requirement Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Package className="h-4 w-4 text-slate-500" />
                <span className="text-slate-300">{lead.productName} ({lead.category})</span>
              </div>
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-slate-500" />
                <span className="text-slate-300">{lead.quantity} {lead.unit}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-slate-500" />
                <span className="text-slate-300">{lead.location}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-slate-500" />
                <span className="text-slate-300">{lead.timeline}</span>
              </div>
              {lead.targetPrice && (
                <p className="text-green-400 text-sm">Target: {lead.targetPrice}</p>
              )}
              {lead.additionalReqs && (
                <p className="text-slate-400 text-sm mt-2">{lead.additionalReqs}</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700 md:col-span-2">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setActiveTab('call')}>
                <Phone className="h-4 w-4 mr-2" />
                Log Discovery Call
              </Button>
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => setActiveTab('create-account')}>
                <UserPlus className="h-4 w-4 mr-2" />
                Create Account
              </Button>
              <Button variant="outline" className="border-slate-600 text-slate-300">
                <Send className="h-4 w-4 mr-2" />
                Send Introduction Email
              </Button>
              <Button variant="outline" className="border-slate-600 text-slate-300">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Call
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700 md:col-span-2">
            <CardHeader>
              <CardTitle className="text-white">Assign to Account Manager</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto]">
                <select
                  value={selectedAccountManagerId}
                  onChange={(event) => setSelectedAccountManagerId(event.target.value)}
                  disabled={loadingAccountManagers || assigningLead}
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Select account manager</option>
                  {accountManagers.map((accountManager) => (
                    <option key={accountManager.id} value={accountManager.id}>
                      {accountManager.name} ({accountManager.email})
                    </option>
                  ))}
                </select>

                <Button
                  className="bg-red-600 hover:bg-red-700"
                  onClick={handleAssignLead}
                  disabled={loadingAccountManagers || assigningLead || !selectedAccountManagerId}
                >
                  {assigningLead ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Assign Lead'
                  )}
                </Button>
              </div>

              {lead.assignedTo && (
                <p className="text-sm text-blue-300">
                  Currently assigned to user ID: <span className="font-mono">{lead.assignedTo}</span>
                </p>
              )}

              {assignmentError && (
                <p className="text-sm text-red-300">{assignmentError}</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'call' && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Phone className="h-5 w-5 text-red-400" />
              Discovery Call Notes - {lead.companyName}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Call Checklist */}
            <div>
              <h4 className="text-sm font-medium text-slate-300 mb-3">Call Checklist</h4>
              <div className="space-y-2">
                {CALL_CHECKLIST_ITEMS.map((item, idx) => (
                  <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={!!checklist[item]}
                      onChange={(e) => setChecklist(prev => ({ ...prev, [item]: e.target.checked }))}
                      className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-red-500 focus:ring-red-500"
                    />
                    <span className={`text-sm ${checklist[item] ? 'text-green-400' : 'text-slate-400'} group-hover:text-white transition-colors`}>
                      {item}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Key Notes */}
            <div>
              <h4 className="text-sm font-medium text-slate-300 mb-2">Key Notes</h4>
              <textarea
                value={callNotes}
                onChange={(e) => setCallNotes(e.target.value)}
                placeholder="Enter key notes from the call..."
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-red-500 focus:border-transparent min-h-[120px] resize-y"
              />
            </div>

            <div className="flex gap-3">
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={handleSaveCallNotes}
                disabled={savingCall}
              >
                {savingCall ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                Save Notes & Create Account
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'create-account' && (
        <>
          {createdAccount ? (
            <Card className="bg-slate-800 border-slate-700 border-green-500/30">
              <CardContent className="py-8 text-center">
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Account Created Successfully!</h3>
                <div className="bg-slate-700 rounded-lg p-4 max-w-md mx-auto text-left space-y-2 mb-6">
                  <p className="text-sm text-slate-300"><span className="text-slate-500">Account #:</span> <span className="font-mono">{createdAccount.user.accountNumber || 'Pending'}</span></p>
                  <p className="text-sm text-slate-300"><span className="text-slate-500">Name:</span> {createdAccount.user.name}</p>
                  <p className="text-sm text-slate-300"><span className="text-slate-500">Email:</span> {createdAccount.user.email}</p>
                  <p className="text-sm text-yellow-400 font-mono"><span className="text-slate-500">Temp Password:</span> {createdAccount.tempPassword}</p>
                </div>
                <div className="flex gap-3 justify-center">
                  <Button className="bg-red-600 hover:bg-red-700" onClick={() => router.push('/admin/leads')}>
                    Back to Leads
                  </Button>
                  <Button
                    variant="outline"
                    className="border-slate-600 text-slate-300"
                    onClick={() => router.push(`/admin/leads/${lead.id}/create-requirement`)}
                  >
                    Create Requirement
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-red-400" />
                  Create Account for Lead
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={accountForm.name}
                      onChange={(e) => setAccountForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Email *</label>
                    <input
                      type="email"
                      value={accountForm.email}
                      onChange={(e) => setAccountForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Phone *</label>
                    <input
                      type="tel"
                      value={accountForm.phone}
                      onChange={(e) => setAccountForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Company Name *</label>
                    <input
                      type="text"
                      value={accountForm.companyName}
                      onChange={(e) => setAccountForm(prev => ({ ...prev, companyName: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Country *</label>
                    <input
                      type="text"
                      value={accountForm.country}
                      onChange={(e) => setAccountForm(prev => ({ ...prev, country: e.target.value }))}
                      placeholder="e.g. India"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Region/State</label>
                    <input
                      type="text"
                      value={accountForm.region}
                      onChange={(e) => setAccountForm(prev => ({ ...prev, region: e.target.value }))}
                      placeholder="e.g. Maharashtra"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-300 mb-1">User Type *</label>
                    <div className="flex gap-4">
                      {['BUYER', 'SUPPLIER', 'BOTH'].map(r => (
                        <label key={r} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="role"
                            value={r}
                            checked={accountForm.role === r}
                            onChange={(e) => setAccountForm(prev => ({ ...prev, role: e.target.value }))}
                            className="text-red-500 focus:ring-red-500"
                          />
                          <span className="text-sm text-slate-300">{r === 'BOTH' ? 'Both (Buyer & Supplier)' : `${r.charAt(0)}${r.slice(1).toLowerCase()} Only`}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-300 mb-1">Notes from Discovery Call</label>
                    <textarea
                      value={accountForm.notes}
                      onChange={(e) => setAccountForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Notes about the buyer..."
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-red-500 min-h-[80px]"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={accountForm.sendWelcomeEmail}
                    onChange={(e) => setAccountForm(prev => ({ ...prev, sendWelcomeEmail: e.target.checked }))}
                    className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-red-500 focus:ring-red-500"
                  />
                  <span className="text-sm text-slate-300">Send welcome email with login details</span>
                </label>

                <Button
                  className="bg-red-600 hover:bg-red-700 w-full"
                  onClick={handleCreateAccount}
                  disabled={creatingAccount || !accountForm.name || !accountForm.email || !accountForm.companyName}
                >
                  {creatingAccount ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UserPlus className="h-4 w-4 mr-2" />}
                  Create Account & Continue to Requirement
                </Button>

                {createAccountError && (
                  <p className="text-sm text-red-300">{createAccountError}</p>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
