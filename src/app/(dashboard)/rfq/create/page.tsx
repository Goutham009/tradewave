'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, FileText, Package, MapPin, Shield, Users } from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Basic Details', icon: FileText },
  { id: 2, title: 'Specifications', icon: Package },
  { id: 3, title: 'Delivery', icon: MapPin },
  { id: 4, title: 'Quality', icon: Shield },
  { id: 5, title: 'Visibility', icon: Users }
];

const INDUSTRY_CATEGORIES = [
  'Manufacturing', 'Electronics', 'Chemicals', 'Textiles', 'Food & Beverage',
  'Automotive', 'Construction', 'Healthcare', 'Agriculture', 'Other'
];

const QUANTITY_UNITS = ['Pieces', 'Kg', 'Liter', 'Meters', 'Tons', 'Boxes', 'Cartons', 'Pallets'];

const INCOTERMS = ['EXW', 'FCA', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP', 'FAS', 'FOB', 'CFR', 'CIF'];

const QUALITY_STANDARDS = ['ISO 9001', 'ISO 14001', 'CE', 'UL', 'FDA', 'HACCP', 'GMP', 'RoHS', 'REACH'];

export default function CreateRFQPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1: Basic Details
    title: '',
    description: '',
    industryCategory: '',
    productCategory: '',
    // Step 2: Specifications
    specifications: '',
    requestedQuantity: '',
    quantityUnit: 'Pieces',
    estimatedBudget: '',
    budgetCurrency: 'USD',
    // Step 3: Delivery
    deliveryLocation: '',
    deliveryCity: '',
    deliveryRegion: '',
    deliveryCountry: '',
    deliveryDate: '',
    incoterms: '',
    // Step 4: Quality
    qualityStandards: [] as string[],
    certificationRequired: [] as string[],
    productionCapacityNeeded: '',
    // Step 5: Visibility
    visibility: 'PRIVATE',
    selectedSuppliers: [] as string[],
    expiresAt: ''
  });

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayField = (field: 'qualityStandards' | 'certificationRequired', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v: string) => v !== value)
        : [...prev[field], value]
    }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.title && formData.description && formData.industryCategory && formData.productCategory;
      case 2: return formData.requestedQuantity && formData.quantityUnit;
      case 3: return formData.deliveryCity && formData.deliveryCountry && formData.deliveryDate;
      case 4: return true;
      case 5: return formData.expiresAt;
      default: return true;
    }
  };

  const handleSubmit = async (publish: boolean = false) => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/rfq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          publish,
          budgetRange: formData.estimatedBudget ? {
            amount: parseFloat(formData.estimatedBudget),
            currency: formData.budgetCurrency
          } : null
        })
      });

      if (res.ok) {
        const rfq = await res.json();
        router.push(`/rfq/${rfq.id}`);
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to create RFQ');
      }
    } catch (err) {
      alert('Failed to create RFQ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-900 flex items-center gap-2 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="text-3xl font-bold">Create Request for Quote</h1>
        <p className="text-gray-600 mt-1">Define your requirements and invite suppliers to submit quotes</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {STEPS.map((step, index) => {
          const StepIcon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          return (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                isCompleted ? 'bg-green-500 text-white' : isActive ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {isCompleted ? <Check className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
              </div>
              <span className={`ml-2 text-sm hidden md:block ${isActive ? 'font-semibold' : ''}`}>{step.title}</span>
              {index < STEPS.length - 1 && <div className={`w-8 md:w-16 h-1 mx-2 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />}
            </div>
          );
        })}
      </div>

      {/* Form Content */}
      <div className="bg-white border rounded-lg p-6">
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Basic Details</h2>
            <div>
              <label className="block text-sm font-medium mb-1">RFQ Title *</label>
              <input type="text" value={formData.title} onChange={(e) => updateField('title', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg" placeholder="e.g., Electronic Components for Q1 Production" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description *</label>
              <textarea value={formData.description} onChange={(e) => updateField('description', e.target.value)}
                rows={4} className="w-full px-4 py-2 border rounded-lg" placeholder="Describe your requirements in detail..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Industry Category *</label>
                <select value={formData.industryCategory} onChange={(e) => updateField('industryCategory', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg">
                  <option value="">Select category</option>
                  {INDUSTRY_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Product Category *</label>
                <input type="text" value={formData.productCategory} onChange={(e) => updateField('productCategory', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg" placeholder="e.g., Capacitors, Resistors" />
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Specifications & Quantity</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Technical Specifications</label>
              <textarea value={formData.specifications} onChange={(e) => updateField('specifications', e.target.value)}
                rows={6} className="w-full px-4 py-2 border rounded-lg font-mono text-sm"
                placeholder="Enter detailed specifications (dimensions, materials, tolerances, etc.)" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Requested Quantity *</label>
                <input type="number" value={formData.requestedQuantity} onChange={(e) => updateField('requestedQuantity', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg" placeholder="10000" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Unit *</label>
                <select value={formData.quantityUnit} onChange={(e) => updateField('quantityUnit', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg">
                  {QUANTITY_UNITS.map(unit => <option key={unit} value={unit}>{unit}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Estimated Budget</label>
                <input type="number" value={formData.estimatedBudget} onChange={(e) => updateField('estimatedBudget', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg" placeholder="50000" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Currency</label>
                <select value={formData.budgetCurrency} onChange={(e) => updateField('budgetCurrency', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg">
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="INR">INR</option>
                  <option value="CNY">CNY</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Delivery Requirements</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Delivery Address</label>
              <textarea value={formData.deliveryLocation} onChange={(e) => updateField('deliveryLocation', e.target.value)}
                rows={2} className="w-full px-4 py-2 border rounded-lg" placeholder="Full delivery address" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">City *</label>
                <input type="text" value={formData.deliveryCity} onChange={(e) => updateField('deliveryCity', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Region/State</label>
                <input type="text" value={formData.deliveryRegion} onChange={(e) => updateField('deliveryRegion', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Country *</label>
                <input type="text" value={formData.deliveryCountry} onChange={(e) => updateField('deliveryCountry', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg" placeholder="e.g., US, IN, CN" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Expected Delivery Date *</label>
                <input type="date" value={formData.deliveryDate} onChange={(e) => updateField('deliveryDate', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Preferred Incoterms</label>
                <select value={formData.incoterms} onChange={(e) => updateField('incoterms', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg">
                  <option value="">Select incoterms</option>
                  {INCOTERMS.map(term => <option key={term} value={term}>{term}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Quality Requirements</h2>
            <div>
              <label className="block text-sm font-medium mb-2">Required Quality Standards</label>
              <div className="flex flex-wrap gap-2">
                {QUALITY_STANDARDS.map(std => (
                  <button key={std} type="button"
                    onClick={() => toggleArrayField('qualityStandards', std)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      formData.qualityStandards.includes(std)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}>{std}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Required Certifications</label>
              <div className="flex flex-wrap gap-2">
                {['Product Certificate', 'Material Test Report', 'Factory Audit', 'Quality Inspection', 'Third-Party Testing'].map(cert => (
                  <button key={cert} type="button"
                    onClick={() => toggleArrayField('certificationRequired', cert)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      formData.certificationRequired.includes(cert)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}>{cert}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Minimum Production Capacity (units/month)</label>
              <input type="number" value={formData.productionCapacityNeeded} onChange={(e) => updateField('productionCapacityNeeded', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg" placeholder="e.g., 50000" />
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Visibility & Expiration</h2>
            <div>
              <label className="block text-sm font-medium mb-2">RFQ Visibility</label>
              <div className="space-y-2">
                {[
                  { value: 'PRIVATE', label: 'Private', desc: 'Only invited suppliers can view and submit quotes' },
                  { value: 'OPEN', label: 'Open', desc: 'All verified suppliers can view and submit quotes' },
                  { value: 'PUBLIC', label: 'Public', desc: 'Visible to all suppliers on the marketplace' }
                ].map(opt => (
                  <label key={opt.value} className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer ${
                    formData.visibility === opt.value ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}>
                    <input type="radio" name="visibility" value={opt.value}
                      checked={formData.visibility === opt.value}
                      onChange={(e) => updateField('visibility', e.target.value)}
                      className="mt-1" />
                    <div>
                      <p className="font-medium">{opt.label}</p>
                      <p className="text-sm text-gray-500">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">RFQ Expiration Date *</label>
              <input type="date" value={formData.expiresAt} onChange={(e) => updateField('expiresAt', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg" min={new Date().toISOString().split('T')[0]} />
              <p className="text-sm text-gray-500 mt-1">Suppliers won't be able to submit quotes after this date</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <button onClick={() => setCurrentStep(s => s - 1)} disabled={currentStep === 1}
          className="px-4 py-2 border rounded-lg disabled:opacity-50 flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Previous
        </button>
        <div className="flex gap-3">
          {currentStep === 5 && (
            <>
              <button onClick={() => handleSubmit(false)} disabled={!canProceed() || submitting}
                className="px-4 py-2 border rounded-lg disabled:opacity-50">
                {submitting ? 'Saving...' : 'Save as Draft'}
              </button>
              <button onClick={() => handleSubmit(true)} disabled={!canProceed() || submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 flex items-center gap-2">
                {submitting ? 'Publishing...' : 'Publish RFQ'}
              </button>
            </>
          )}
          {currentStep < 5 && (
            <button onClick={() => setCurrentStep(s => s + 1)} disabled={!canProceed()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 flex items-center gap-2">
              Next <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
