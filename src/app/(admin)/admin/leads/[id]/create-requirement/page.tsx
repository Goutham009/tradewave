'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  DollarSign,
  MapPin,
  Calendar,
  Shield,
  FileText,
  Settings,
  AlertCircle,
  Globe,
  Users,
} from 'lucide-react';

const CATEGORIES = [
  'Metals', 'Chemicals', 'Textiles', 'Electronics',
  'Raw Materials', 'Agriculture', 'Plastics', 'Other',
];

const UNITS = ['MT', 'Kg', 'Tons', 'Units', 'Pieces', 'Barrels', 'Liters', 'Grams', 'Boxes', 'Pallets'];

const CERTIFICATIONS = [
  'ISO 9001', 'ISO 14001', 'CE Marking', 'MTC (Mill Test Certificate)',
  'SGS Inspection', 'BIS', 'FDA', 'REACH', 'RoHS', 'ASTM',
];

const INCOTERMS = ['FOB', 'CIF', 'DDP', 'EXW', 'FCA', 'CPT', 'CIP', 'DAP', 'DPU'];

const PAYMENT_METHODS = [
  { value: 'ESCROW', label: 'Escrow (Recommended)' },
  { value: 'LC', label: 'Letter of Credit (L/C)' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer (T/T)' },
];

export default function CreateRequirementPage() {
  const params = useParams();
  const leadId = typeof params.id === 'string' ? params.id : '';
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [createdReq, setCreatedReq] = useState<any>(null);
  const [leadError, setLeadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Pre-filled from lead data
  const [leadData, setLeadData] = useState<any>(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    technicalSpecs: '',
    quantity: '',
    unit: 'MT',
    targetPrice: '',
    budgetMin: '',
    budgetMax: '',
    currency: 'USD',
    deliveryLocation: '',
    deliveryAddress: '',
    deliveryDeadline: '',
    incoterms: 'FOB',
    packagingRequirements: '',
    requiredCertifications: [] as string[],
    qualityInspectionRequired: false,
    paymentTerms: '30% advance, 70% on delivery',
    paymentMethod: 'ESCROW',
    specialInstructions: '',
    preferredSupplierTiers: ['TRUSTED', 'STANDARD'] as string[],
    preferredGeographies: '',
    maxSuppliersToMatch: '10',
    communicationPreference: 'THROUGH_AM',
    internalNotes: '',
  });

  const fetchLeadData = useCallback(async () => {
    try {
      setLeadError(null);

      const res = await fetch(`/api/admin/leads/${leadId}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to load lead details');
      }

      setLeadData(data.lead);
      prefillFromLead(data.lead);
    } catch (error) {
      console.error('Error loading lead details:', error);
      setLeadData(null);
      setLeadError(error instanceof Error ? error.message : 'Failed to load lead details');
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    void fetchLeadData();
  }, [fetchLeadData]);

  const prefillFromLead = (lead: any) => {
    const deadlineDays = lead.timeline?.includes('7 days') ? 7
      : lead.timeline?.includes('2-4 weeks') ? 28
      : lead.timeline?.includes('1-3 months') ? 90
      : lead.timeline?.includes('3-6 months') ? 180
      : 60;
    const deadline = new Date(Date.now() + deadlineDays * 86400000).toISOString().split('T')[0];

    setForm(prev => ({
      ...prev,
      title: lead.productName || '',
      description: `${lead.productName || ''} - ${lead.quantity} ${lead.unit}. ${lead.additionalReqs || ''}`.trim(),
      category: lead.category || '',
      quantity: String(lead.quantity || ''),
      unit: lead.unit || 'MT',
      targetPrice: lead.targetPrice?.replace(/[^0-9.]/g, '') || '',
      deliveryLocation: lead.location || '',
      deliveryDeadline: deadline,
      internalNotes: lead.additionalReqs || '',
      qualityInspectionRequired: lead.additionalReqs?.toLowerCase().includes('inspection') || false,
      requiredCertifications: lead.additionalReqs?.includes('ISO 9001') ? ['ISO 9001'] : [],
    }));
  };

  const updateForm = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const toggleCertification = (cert: string) => {
    setForm(prev => ({
      ...prev,
      requiredCertifications: prev.requiredCertifications.includes(cert)
        ? prev.requiredCertifications.filter(c => c !== cert)
        : [...prev.requiredCertifications, cert],
    }));
  };

  const toggleTier = (tier: string) => {
    setForm(prev => ({
      ...prev,
      preferredSupplierTiers: prev.preferredSupplierTiers.includes(tier)
        ? prev.preferredSupplierTiers.filter(t => t !== tier)
        : [...prev.preferredSupplierTiers, tier],
    }));
  };

  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.category || !form.quantity || !form.deliveryLocation || !form.deliveryDeadline) {
      return;
    }

    if (!leadData?.convertedUserId) {
      setSubmitError('Create the user account first before submitting a requirement.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch('/api/am/requirements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerId: leadData.convertedUserId,
          ...form,
          preferredGeographies: form.preferredGeographies ? form.preferredGeographies.split(',').map((g: string) => g.trim()) : [],
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create requirement');
      }

      setCreatedReq(data.requirement);
      setSubmitted(true);
    } catch (error) {
      console.error('Error creating requirement from lead:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to create requirement');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    );
  }

  if (submitted && createdReq) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="bg-slate-800 border-green-500/30">
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Requirement Created!</h2>
            <p className="text-slate-400 mb-4">
              <strong className="text-white">{createdReq.title}</strong> has been submitted for admin review.
            </p>
            {createdReq.referenceId && (
              <p className="mb-3 font-mono text-sm text-cyan-300">Requirement No: {createdReq.referenceId}</p>
            )}
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 mb-6">
              {createdReq.status?.replace(/_/g, ' ')}
            </Badge>
            <div className="flex gap-3 justify-center">
              <Button className="bg-red-600 hover:bg-red-700" onClick={() => router.push('/admin/leads')}>
                Back to Leads
              </Button>
              <Button variant="outline" className="border-slate-600 text-slate-300" onClick={() => router.push('/admin/requirements')}>
                View Requirements
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!leadData) {
    return (
      <Card className="bg-slate-800 border-red-500/30">
        <CardContent className="py-12 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white">Unable to load lead data</h3>
          {leadError && <p className="mt-2 text-sm text-red-300">{leadError}</p>}
          <Button className="mt-4 bg-red-600 hover:bg-red-700" onClick={() => router.push('/admin/leads')}>
            Back to Leads
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()} className="text-slate-400 hover:text-white">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">Create Requirement</h1>
          {leadData && (
            <p className="text-slate-400">
              For {leadData.companyName} ({leadData.fullName})
            </p>
          )}
        </div>
      </div>

      {/* Section 1: Product Details */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Package className="h-5 w-5 text-red-400" /> Product Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1">Product Title *</label>
              <input type="text" value={form.title} onChange={e => updateForm('title', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1">Description *</label>
              <textarea value={form.description} onChange={e => updateForm('description', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 min-h-[80px]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Category *</label>
              <select value={form.category} onChange={e => updateForm('category', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500">
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Subcategory</label>
              <input type="text" value={form.subcategory} onChange={e => updateForm('subcategory', e.target.value)}
                placeholder="e.g. Stainless Steel" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Quantity *</label>
              <input type="number" value={form.quantity} onChange={e => updateForm('quantity', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Unit *</label>
              <select value={form.unit} onChange={e => updateForm('unit', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500">
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1">Technical Specifications</label>
              <textarea value={form.technicalSpecs} onChange={e => updateForm('technicalSpecs', e.target.value)}
                placeholder="Grade, dimensions, material composition, tolerances..." className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-red-500 min-h-[60px]" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Pricing */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-red-400" /> Pricing & Budget
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Buyer&apos;s Target Price (Hidden)</label>
              <input type="number" value={form.targetPrice} onChange={e => updateForm('targetPrice', e.target.value)}
                placeholder="Per unit" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-red-500" />
              <p className="text-xs text-yellow-400 mt-1">Not shown to suppliers</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Budget Min (Visible)</label>
              <input type="number" value={form.budgetMin} onChange={e => updateForm('budgetMin', e.target.value)}
                placeholder="Per unit" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Budget Max (Visible)</label>
              <input type="number" value={form.budgetMax} onChange={e => updateForm('budgetMax', e.target.value)}
                placeholder="Per unit" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-red-500" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Payment Terms</label>
              <input type="text" value={form.paymentTerms} onChange={e => updateForm('paymentTerms', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Payment Method</label>
              <select value={form.paymentMethod} onChange={e => updateForm('paymentMethod', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500">
                {PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Delivery */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <MapPin className="h-5 w-5 text-red-400" /> Delivery Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Delivery Location *</label>
              <input type="text" value={form.deliveryLocation} onChange={e => updateForm('deliveryLocation', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Delivery Deadline *</label>
              <input type="date" value={form.deliveryDeadline} onChange={e => updateForm('deliveryDeadline', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Incoterms</label>
              <select value={form.incoterms} onChange={e => updateForm('incoterms', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500">
                {INCOTERMS.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Packaging Requirements</label>
              <input type="text" value={form.packagingRequirements} onChange={e => updateForm('packagingRequirements', e.target.value)}
                placeholder="e.g. Wooden crates, shrink wrap" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-red-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Quality */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-400" /> Quality Requirements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Required Certifications</label>
            <div className="flex flex-wrap gap-2">
              {CERTIFICATIONS.map(cert => (
                <button key={cert} onClick={() => toggleCertification(cert)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    form.requiredCertifications.includes(cert)
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}>
                  {cert}
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.qualityInspectionRequired}
              onChange={e => updateForm('qualityInspectionRequired', e.target.checked)}
              className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-red-500 focus:ring-red-500" />
            <span className="text-sm text-slate-300">Require third-party quality inspection before shipment</span>
          </label>
        </CardContent>
      </Card>

      {/* Section 5: Supplier Matching */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-red-400" /> Supplier Matching Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Preferred Supplier Tiers</label>
            <div className="flex gap-3">
              {['TRUSTED', 'STANDARD', 'REVIEW'].map(tier => (
                <button key={tier} onClick={() => toggleTier(tier)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    form.preferredSupplierTiers.includes(tier)
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}>
                  {tier}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Preferred Geographies</label>
              <input type="text" value={form.preferredGeographies} onChange={e => updateForm('preferredGeographies', e.target.value)}
                placeholder="India, China, Vietnam" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Max Suppliers to Match</label>
              <input type="number" value={form.maxSuppliersToMatch} onChange={e => updateForm('maxSuppliersToMatch', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 6: Internal Notes */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-red-400" /> Internal Notes (Admin Only)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <textarea value={form.internalNotes} onChange={e => updateForm('internalNotes', e.target.value)}
            placeholder="Notes visible only to admin/AM, not to buyer or suppliers..."
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-red-500 min-h-[80px]" />
        </CardContent>
      </Card>

      {/* Submit */}
      {!leadData?.convertedUserId && (
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-900/20 p-4 text-sm text-yellow-200">
          This lead is not yet converted to a user. Create the user account first from lead details, then return to submit the requirement.
        </div>
      )}

      {submitError && (
        <div className="rounded-lg border border-red-500/30 bg-red-900/20 p-4 text-sm text-red-300">
          {submitError}
        </div>
      )}

      <Button className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-lg" onClick={handleSubmit}
        disabled={submitting || !leadData?.convertedUserId || !form.title || !form.category || !form.quantity || !form.deliveryLocation || !form.deliveryDeadline}>
        {submitting ? <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Creating...</> : <><CheckCircle2 className="h-5 w-5 mr-2" /> Submit Requirement for Admin Review</>}
      </Button>
    </div>
  );
}
