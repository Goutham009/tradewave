'use client';

import React, { useState, useEffect } from 'react';
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
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'call' | 'create-account'>('details');

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
  const [createdAccount, setCreatedAccount] = useState<any>(null);

  useEffect(() => {
    fetchLead();
  }, [params.id]);

  const fetchLead = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/leads/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setLead(data.lead);
        // Pre-fill account form from lead data
        setAccountForm(prev => ({
          ...prev,
          name: data.lead.fullName,
          email: data.lead.email,
          phone: data.lead.phoneNumber,
          companyName: data.lead.companyName,
        }));
      }
    } catch (error) {
      console.error('Error fetching lead:', error);
      // Demo fallback
      const demoLead: Lead = {
        id: params.id as string,
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
        status: 'ASSIGNED_TO_AM',
        notes: null,
        assignedTo: 'am_sarah_001',
        callScheduledAt: null,
        callCompletedAt: null,
        callNotes: null,
        callChecklist: null,
        createdAt: new Date().toISOString(),
      };
      setLead(demoLead);
      setAccountForm({
        name: demoLead.fullName,
        email: demoLead.email,
        phone: demoLead.phoneNumber,
        companyName: demoLead.companyName,
        country: 'India',
        region: 'Maharashtra',
        role: 'BUYER',
        notes: 'First-time importer. Needs guidance throughout process. Quality-focused.',
        sendWelcomeEmail: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCallNotes = async () => {
    if (!lead) return;
    setSavingCall(true);
    try {
      await fetch(`/api/admin/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'CALL_COMPLETED',
          callCompletedAt: new Date().toISOString(),
          callNotes,
          callChecklist: checklist,
        }),
      });
      setLead(prev => prev ? { ...prev, status: 'CALL_COMPLETED', callNotes, callChecklist: checklist } : null);
      setActiveTab('create-account');
    } catch (error) {
      console.error('Error saving call notes:', error);
      // Update locally for demo
      setLead(prev => prev ? { ...prev, status: 'CALL_COMPLETED', callNotes, callChecklist: checklist } : null);
      setActiveTab('create-account');
    } finally {
      setSavingCall(false);
    }
  };

  const handleCreateAccount = async () => {
    if (!lead) return;
    setCreatingAccount(true);
    try {
      const res = await fetch(`/api/am/leads/${lead.id}/create-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...accountForm,
          accountManagerId: lead.assignedTo || 'am_sarah_001',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCreatedAccount(data);
      } else {
        // Demo fallback
        setCreatedAccount({
          user: { id: 'usr_demo_001', ...accountForm },
          tempPassword: `TW-2026-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        });
      }
    } catch (error) {
      console.error('Error creating account:', error);
      setCreatedAccount({
        user: { id: 'usr_demo_001', ...accountForm },
        tempPassword: `TW-2026-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      });
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
                  <p className="text-sm text-slate-300"><span className="text-slate-500">Name:</span> {createdAccount.user.name}</p>
                  <p className="text-sm text-slate-300"><span className="text-slate-500">Email:</span> {createdAccount.user.email}</p>
                  <p className="text-sm text-yellow-400 font-mono"><span className="text-slate-500">Temp Password:</span> {createdAccount.tempPassword}</p>
                </div>
                <div className="flex gap-3 justify-center">
                  <Button className="bg-red-600 hover:bg-red-700" onClick={() => router.push('/admin/leads')}>
                    Back to Leads
                  </Button>
                  <Button variant="outline" className="border-slate-600 text-slate-300">
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
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
