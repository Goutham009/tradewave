'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Package,
  DollarSign,
  Truck,
  Shield,
  FileText,
  Loader2,
  Info,
} from 'lucide-react';

const STEPS = [
  { title: 'Basic Information', icon: Package },
  { title: 'Quantity & Budget', icon: DollarSign },
  { title: 'Delivery', icon: Truck },
  { title: 'Quality & Compliance', icon: Shield },
  { title: 'Payment & Preferences', icon: FileText },
];

const CATEGORIES = [
  'Industrial Materials', 'Electronics', 'Chemicals', 'Textiles',
  'Agriculture', 'Construction', 'Automotive', 'Energy',
  'Machinery', 'Packaging', 'Other',
];

const CERTIFICATIONS = [
  'ISO_9001', 'ISO_14001', 'CE_MARKING', 'MTC', 'SGS',
  'BIS', 'UL', 'FDA', 'ROHS', 'REACH',
];

const INCOTERMS = ['FOB', 'CIF', 'DDP', 'EXW', 'CFR', 'DAP', 'FCA'];

export default function NewRequirementPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    title: '',
    category: '',
    subcategory: '',
    description: '',
    technicalSpecs: '',
    quantity: '',
    unit: 'MT',
    budgetMin: '',
    budgetMax: '',
    currency: 'USD',
    deliveryLocation: '',
    deliveryAddress: '',
    deliveryDeadline: '',
    incoterms: '',
    packagingRequirements: '',
    requiredCertifications: [] as string[],
    qualityInspectionRequired: false,
    paymentTerms: '',
    paymentMethod: 'ESCROW',
    specialInstructions: '',
    preferredSupplierTiers: [] as string[],
    preferredGeographies: [] as string[],
    communicationPreference: 'THROUGH_AM',
    priority: 'MEDIUM',
  });

  const updateForm = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const toggleCert = (cert: string) => {
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

  const canNext = () => {
    switch (currentStep) {
      case 0: return form.title && form.category && form.description;
      case 1: return form.quantity && form.unit;
      case 2: return form.deliveryLocation && form.deliveryDeadline;
      case 3: return true;
      case 4: return true;
      default: return false;
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/buyer/requirements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          quantity: parseInt(form.quantity),
          budgetMin: form.budgetMin ? parseFloat(form.budgetMin) : undefined,
          budgetMax: form.budgetMax ? parseFloat(form.budgetMax) : undefined,
        }),
      });
      if (res.ok) {
        setSubmitted(true);
      }
    } catch (error) {
      console.error('Submit failed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Card className="border-green-200 bg-green-50/30">
          <CardContent className="pt-8 text-center space-y-4">
            <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto" />
            <h2 className="text-2xl font-bold text-green-900">Requirement Submitted!</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Your requirement has been submitted for verification by your Account Manager.
            </p>
            <div className="bg-white rounded-lg p-4 text-left text-sm space-y-2 max-w-sm mx-auto">
              <p className="font-medium">What Happens Next:</p>
              <div className="space-y-1 text-muted-foreground">
                <p>1. Your AM verifies the details (2-4 hours)</p>
                <p>2. Admin reviews and approves (4-8 hours)</p>
                <p>3. Sent to matched suppliers for quotes</p>
                <p>4. You receive quotes for comparison</p>
              </div>
            </div>
            <div className="flex gap-3 justify-center pt-4">
              <Button onClick={() => router.push('/buyer/dashboard')}>
                Back to Dashboard
              </Button>
              <Button variant="outline" onClick={() => {
                setSubmitted(false);
                setCurrentStep(0);
                setForm({
                  title: '', category: '', subcategory: '', description: '', technicalSpecs: '',
                  quantity: '', unit: 'MT', budgetMin: '', budgetMax: '', currency: 'USD',
                  deliveryLocation: '', deliveryAddress: '', deliveryDeadline: '',
                  incoterms: '', packagingRequirements: '', requiredCertifications: [],
                  qualityInspectionRequired: false, paymentTerms: '', paymentMethod: 'ESCROW',
                  specialInstructions: '', preferredSupplierTiers: [], preferredGeographies: [],
                  communicationPreference: 'THROUGH_AM', priority: 'MEDIUM',
                });
              }}>
                Create Another
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create New Requirement</h1>
          <p className="text-muted-foreground">Tell us what you need and we&apos;ll find the best suppliers</p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-between">
        {STEPS.map((step, i) => {
          const StepIcon = step.icon;
          const isActive = i === currentStep;
          const isDone = i < currentStep;
          return (
            <div key={i} className="flex items-center">
              <button
                onClick={() => i < currentStep && setCurrentStep(i)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm ${
                  isActive ? 'bg-teal-100 text-teal-700 font-medium' :
                  isDone ? 'text-green-600 cursor-pointer hover:bg-green-50' :
                  'text-muted-foreground'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <StepIcon className="h-4 w-4" />
                )}
                <span className="hidden md:inline">{step.title}</span>
                <span className="md:hidden">{i + 1}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`w-8 h-0.5 mx-1 ${isDone ? 'bg-green-400' : 'bg-neutral-200'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {React.createElement(STEPS[currentStep].icon, { className: 'h-5 w-5 text-teal-600' })}
            Step {currentStep + 1}: {STEPS[currentStep].title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Step 1: Basic Information */}
          {currentStep === 0 && (
            <>
              <div>
                <label className="text-sm font-medium block mb-1">Product/Service Name *</label>
                <Input
                  placeholder="e.g., Aluminum Sheets - Grade 6061"
                  value={form.title}
                  onChange={(e) => updateForm('title', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Product Category *</label>
                <select
                  value={form.category}
                  onChange={(e) => updateForm('category', e.target.value)}
                  className="w-full border border-neutral-200 rounded-md px-3 py-2 text-sm"
                >
                  <option value="">Select category...</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Subcategory</label>
                <Input
                  placeholder="e.g., Aerospace Grade Aluminum"
                  value={form.subcategory}
                  onChange={(e) => updateForm('subcategory', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Detailed Description *</label>
                <Textarea
                  placeholder="Describe what you need in detail..."
                  value={form.description}
                  onChange={(e) => updateForm('description', e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Technical Specifications</label>
                <Textarea
                  placeholder="e.g., Grade: 6061-T6&#10;Thickness: 3mm&#10;Size: 1220mm x 2440mm&#10;Standard: ASTM B209"
                  value={form.technicalSpecs}
                  onChange={(e) => updateForm('technicalSpecs', e.target.value)}
                  className="min-h-[100px] font-mono text-sm"
                />
              </div>
            </>
          )}

          {/* Step 2: Quantity & Budget */}
          {currentStep === 1 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Quantity *</label>
                  <Input
                    type="number"
                    placeholder="e.g., 200"
                    value={form.quantity}
                    onChange={(e) => updateForm('quantity', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Unit *</label>
                  <select
                    value={form.unit}
                    onChange={(e) => updateForm('unit', e.target.value)}
                    className="w-full border border-neutral-200 rounded-md px-3 py-2 text-sm"
                  >
                    {['MT', 'KG', 'pcs', 'units', 'sheets', 'meters', 'liters', 'tons'].map(u =>
                      <option key={u} value={u}>{u}</option>
                    )}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Currency</label>
                  <select
                    value={form.currency}
                    onChange={(e) => updateForm('currency', e.target.value)}
                    className="w-full border border-neutral-200 rounded-md px-3 py-2 text-sm"
                  >
                    {['USD', 'EUR', 'GBP', 'INR', 'CNY', 'JPY'].map(c =>
                      <option key={c} value={c}>{c}</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Min Budget (per unit)</label>
                  <Input
                    type="number"
                    placeholder="e.g., 250"
                    value={form.budgetMin}
                    onChange={(e) => updateForm('budgetMin', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Max Budget (per unit)</label>
                  <Input
                    type="number"
                    placeholder="e.g., 300"
                    value={form.budgetMax}
                    onChange={(e) => updateForm('budgetMax', e.target.value)}
                  />
                </div>
              </div>
              {form.quantity && form.budgetMax && (
                <div className="bg-blue-50 rounded-lg p-3 text-sm flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                  <p className="text-blue-800">
                    Estimated total: {form.currency} {(parseInt(form.quantity) * parseFloat(form.budgetMin || '0')).toLocaleString()} - {(parseInt(form.quantity) * parseFloat(form.budgetMax)).toLocaleString()}
                  </p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium block mb-1">Priority</label>
                <div className="flex gap-2">
                  {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map(p => (
                    <button
                      key={p}
                      onClick={() => updateForm('priority', p)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        form.priority === p
                          ? p === 'URGENT' ? 'bg-red-100 text-red-700 border border-red-300' :
                            p === 'HIGH' ? 'bg-orange-100 text-orange-700 border border-orange-300' :
                            p === 'MEDIUM' ? 'bg-blue-100 text-blue-700 border border-blue-300' :
                            'bg-gray-100 text-gray-700 border border-gray-300'
                          : 'bg-neutral-50 text-neutral-500 border border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Step 3: Delivery */}
          {currentStep === 2 && (
            <>
              <div>
                <label className="text-sm font-medium block mb-1">Delivery Location *</label>
                <Input
                  placeholder="e.g., Mumbai Port (JNPT), India"
                  value={form.deliveryLocation}
                  onChange={(e) => updateForm('deliveryLocation', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Full Delivery Address</label>
                <Textarea
                  placeholder="Complete address including warehouse/port details..."
                  value={form.deliveryAddress}
                  onChange={(e) => updateForm('deliveryAddress', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Required By Date *</label>
                <Input
                  type="date"
                  value={form.deliveryDeadline}
                  onChange={(e) => updateForm('deliveryDeadline', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Incoterms</label>
                <div className="flex flex-wrap gap-2">
                  {INCOTERMS.map(term => (
                    <button
                      key={term}
                      onClick={() => updateForm('incoterms', form.incoterms === term ? '' : term)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        form.incoterms === term
                          ? 'bg-teal-100 text-teal-700 border border-teal-300'
                          : 'bg-neutral-50 text-neutral-500 border border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Packaging Requirements</label>
                <Textarea
                  placeholder="Special packaging instructions..."
                  value={form.packagingRequirements}
                  onChange={(e) => updateForm('packagingRequirements', e.target.value)}
                />
              </div>
            </>
          )}

          {/* Step 4: Quality & Compliance */}
          {currentStep === 3 && (
            <>
              <div>
                <label className="text-sm font-medium block mb-2">Required Certifications</label>
                <div className="flex flex-wrap gap-2">
                  {CERTIFICATIONS.map(cert => (
                    <button
                      key={cert}
                      onClick={() => toggleCert(cert)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        form.requiredCertifications.includes(cert)
                          ? 'bg-teal-100 text-teal-700 border border-teal-300'
                          : 'bg-neutral-50 text-neutral-500 border border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      {cert.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.qualityInspectionRequired}
                    onChange={(e) => updateForm('qualityInspectionRequired', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm font-medium">Quality inspection required before shipment</span>
                </label>
              </div>
            </>
          )}

          {/* Step 5: Payment & Preferences */}
          {currentStep === 4 && (
            <>
              <div>
                <label className="text-sm font-medium block mb-1">Payment Terms</label>
                <select
                  value={form.paymentTerms}
                  onChange={(e) => updateForm('paymentTerms', e.target.value)}
                  className="w-full border border-neutral-200 rounded-md px-3 py-2 text-sm"
                >
                  <option value="">Select payment terms...</option>
                  <option value="30% Advance, 70% on Delivery">30% Advance, 70% on Delivery</option>
                  <option value="50% Advance, 50% on Delivery">50% Advance, 50% on Delivery</option>
                  <option value="100% Advance">100% Advance</option>
                  <option value="LC at Sight">LC at Sight</option>
                  <option value="Net 30">Net 30</option>
                  <option value="Net 60">Net 60</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Payment Method</label>
                <div className="flex gap-2">
                  {['ESCROW', 'BANK_TRANSFER', 'LC'].map(m => (
                    <button
                      key={m}
                      onClick={() => updateForm('paymentMethod', m)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        form.paymentMethod === m
                          ? 'bg-teal-100 text-teal-700 border border-teal-300'
                          : 'bg-neutral-50 text-neutral-500 border border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      {m.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Preferred Supplier Tiers</label>
                <div className="flex gap-2">
                  {['TRUSTED', 'STANDARD', 'REVIEW'].map(tier => (
                    <button
                      key={tier}
                      onClick={() => toggleTier(tier)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        form.preferredSupplierTiers.includes(tier)
                          ? 'bg-teal-100 text-teal-700 border border-teal-300'
                          : 'bg-neutral-50 text-neutral-500 border border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Communication Preference</label>
                <div className="flex gap-2">
                  {[
                    { value: 'THROUGH_AM', label: 'Through Account Manager' },
                    { value: 'DIRECT', label: 'Direct with Supplier' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => updateForm('communicationPreference', opt.value)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        form.communicationPreference === opt.value
                          ? 'bg-teal-100 text-teal-700 border border-teal-300'
                          : 'bg-neutral-50 text-neutral-500 border border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Special Instructions</label>
                <Textarea
                  placeholder="Any other requirements or notes for suppliers..."
                  value={form.specialInstructions}
                  onChange={(e) => updateForm('specialInstructions', e.target.value)}
                />
              </div>
            </>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(prev => prev - 1)}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            {currentStep < STEPS.length - 1 ? (
              <Button
                onClick={() => setCurrentStep(prev => prev + 1)}
                disabled={!canNext()}
              >
                Next <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-teal-600 hover:bg-teal-700"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Submit Requirement
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
