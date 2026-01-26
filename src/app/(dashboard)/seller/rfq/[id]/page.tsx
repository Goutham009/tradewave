'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, MapPin, Calendar, Shield, Send, Plus, Trash2 } from 'lucide-react';

const PAYMENT_TERMS = ['NET30', 'NET60', 'NET90', '50/50', 'COD', 'LC', 'TT'];
const SHIPPING_METHODS = ['SEA', 'AIR', 'LAND', 'RAIL', 'MULTIMODAL'];
const INCOTERMS = ['EXW', 'FCA', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP', 'FAS', 'FOB', 'CFR', 'CIF'];

export default function SubmitQuotePage() {
  const params = useParams();
  const router = useRouter();
  const [rfq, setRfq] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    unitPrice: '',
    currency: 'USD',
    deliveryDate: '',
    deliveryLocation: '',
    shippingCost: '',
    shippingMethod: '',
    incoterms: '',
    paymentTerms: 'NET30',
    downPaymentPercentage: '',
    productionLeadTime: '',
    totalLeadTime: '',
    qualityAssurance: '',
    certifications: [] as string[],
    guaranteeInMonths: '',
    validUntil: '',
    notes: '',
    quantityBreaks: [] as { minQuantity: string; maxQuantity: string; unitPrice: string; discount: string }[]
  });

  useEffect(() => {
    fetchRFQ();
  }, [params.id]);

  const fetchRFQ = async () => {
    try {
      const res = await fetch(`/api/rfq/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setRfq(data);
        setFormData(prev => ({
          ...prev,
          title: `Quote for ${data.title}`,
          incoterms: data.incoterms || '',
          deliveryLocation: `${data.deliveryCity}, ${data.deliveryCountry}`
        }));
      }
    } catch (err) {
      console.error('Failed to fetch RFQ:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateTotal = () => {
    const unitPrice = parseFloat(formData.unitPrice) || 0;
    const quantity = rfq?.requestedQuantity || 0;
    return (unitPrice * quantity).toFixed(2);
  };

  const addQuantityBreak = () => {
    setFormData(prev => ({
      ...prev,
      quantityBreaks: [...prev.quantityBreaks, { minQuantity: '', maxQuantity: '', unitPrice: '', discount: '' }]
    }));
  };

  const updateQuantityBreak = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      quantityBreaks: prev.quantityBreaks.map((qb, i) => i === index ? { ...qb, [field]: value } : qb)
    }));
  };

  const removeQuantityBreak = (index: number) => {
    setFormData(prev => ({
      ...prev,
      quantityBreaks: prev.quantityBreaks.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!formData.unitPrice || !formData.deliveryDate || !formData.productionLeadTime || !formData.totalLeadTime) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rfqId: params.id,
          ...formData,
          totalPrice: calculateTotal(),
          quantityBreaks: formData.quantityBreaks.filter(qb => qb.minQuantity && qb.unitPrice)
        })
      });

      if (res.ok) {
        const quote = await res.json();
        router.push(`/seller/quotes/${quote.id}`);
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to submit quote');
      }
    } catch (err) {
      alert('Failed to submit quote');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading...</div>;
  }

  if (!rfq) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-gray-500">RFQ not found</p>
        <Link href="/seller/rfq" className="text-blue-600 hover:underline">Browse RFQs</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-900 flex items-center gap-2 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* RFQ Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border rounded-lg p-6 sticky top-4">
            <h2 className="font-semibold mb-4">RFQ Details</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Title</p>
                <p className="font-medium">{rfq.title}</p>
              </div>
              <div>
                <p className="text-gray-500">RFQ Number</p>
                <p className="font-medium">{rfq.rfqNumber}</p>
              </div>
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-400" />
                <span>{rfq.requestedQuantity.toLocaleString()} {rfq.quantityUnit}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{rfq.deliveryCity}, {rfq.deliveryCountry}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>Delivery: {new Date(rfq.deliveryDate).toLocaleDateString()}</span>
              </div>
              {rfq.qualityStandards?.length > 0 && (
                <div>
                  <p className="text-gray-500 mb-1">Required Standards</p>
                  <div className="flex flex-wrap gap-1">
                    {rfq.qualityStandards.map((std: string) => (
                      <span key={std} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">{std}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Your Total Quote</p>
              <p className="text-2xl font-bold">{formData.currency} {calculateTotal()}</p>
              <p className="text-xs text-gray-500">{formData.currency} {formData.unitPrice || '0'} × {rfq.requestedQuantity.toLocaleString()} units</p>
            </div>
          </div>
        </div>

        {/* Quote Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Submit Your Quote</h2>

            {/* Pricing */}
            <div className="mb-6">
              <h3 className="font-medium mb-4">Pricing</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Unit Price *</label>
                  <div className="flex">
                    <select value={formData.currency} onChange={(e) => updateField('currency', e.target.value)}
                      className="px-3 py-2 border rounded-l-lg border-r-0 bg-gray-50">
                      <option>USD</option><option>EUR</option><option>GBP</option><option>INR</option><option>CNY</option>
                    </select>
                    <input type="number" step="0.01" value={formData.unitPrice}
                      onChange={(e) => updateField('unitPrice', e.target.value)}
                      className="flex-1 px-4 py-2 border rounded-r-lg" placeholder="0.00" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Shipping Cost</label>
                  <input type="number" step="0.01" value={formData.shippingCost}
                    onChange={(e) => updateField('shippingCost', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg" placeholder="0.00" />
                </div>
              </div>
            </div>

            {/* Quantity Breaks */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Quantity Discounts (Optional)</h3>
                <button type="button" onClick={addQuantityBreak}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  <Plus className="w-4 h-4" /> Add Tier
                </button>
              </div>
              {formData.quantityBreaks.map((qb, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input type="number" placeholder="Min Qty" value={qb.minQuantity}
                    onChange={(e) => updateQuantityBreak(index, 'minQuantity', e.target.value)}
                    className="w-24 px-3 py-2 border rounded-lg text-sm" />
                  <input type="number" placeholder="Max Qty" value={qb.maxQuantity}
                    onChange={(e) => updateQuantityBreak(index, 'maxQuantity', e.target.value)}
                    className="w-24 px-3 py-2 border rounded-lg text-sm" />
                  <input type="number" step="0.01" placeholder="Unit Price" value={qb.unitPrice}
                    onChange={(e) => updateQuantityBreak(index, 'unitPrice', e.target.value)}
                    className="w-28 px-3 py-2 border rounded-lg text-sm" />
                  <input type="number" step="0.1" placeholder="Discount %" value={qb.discount}
                    onChange={(e) => updateQuantityBreak(index, 'discount', e.target.value)}
                    className="w-24 px-3 py-2 border rounded-lg text-sm" />
                  <button type="button" onClick={() => removeQuantityBreak(index)} className="text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Delivery & Lead Time */}
            <div className="mb-6">
              <h3 className="font-medium mb-4">Delivery & Lead Time</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Delivery Date *</label>
                  <input type="date" value={formData.deliveryDate} onChange={(e) => updateField('deliveryDate', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Shipping Method</label>
                  <select value={formData.shippingMethod} onChange={(e) => updateField('shippingMethod', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg">
                    <option value="">Select method</option>
                    {SHIPPING_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Production Lead Time (days) *</label>
                  <input type="number" value={formData.productionLeadTime} onChange={(e) => updateField('productionLeadTime', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Total Lead Time (days) *</label>
                  <input type="number" value={formData.totalLeadTime} onChange={(e) => updateField('totalLeadTime', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Incoterms</label>
                  <select value={formData.incoterms} onChange={(e) => updateField('incoterms', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg">
                    <option value="">Select incoterms</option>
                    {INCOTERMS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Payment Terms */}
            <div className="mb-6">
              <h3 className="font-medium mb-4">Payment Terms</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Payment Terms *</label>
                  <select value={formData.paymentTerms} onChange={(e) => updateField('paymentTerms', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg">
                    {PAYMENT_TERMS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Down Payment %</label>
                  <input type="number" value={formData.downPaymentPercentage}
                    onChange={(e) => updateField('downPaymentPercentage', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg" placeholder="e.g., 30" />
                </div>
              </div>
            </div>

            {/* Quality & Warranty */}
            <div className="mb-6">
              <h3 className="font-medium mb-4">Quality & Warranty</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Quality Assurance Details</label>
                  <textarea value={formData.qualityAssurance} onChange={(e) => updateField('qualityAssurance', e.target.value)}
                    rows={2} className="w-full px-4 py-2 border rounded-lg" placeholder="Describe your QA process..." />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Warranty (months)</label>
                  <input type="number" value={formData.guaranteeInMonths} onChange={(e) => updateField('guaranteeInMonths', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg" placeholder="12" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Quote Valid Until</label>
                  <input type="date" value={formData.validUntil} onChange={(e) => updateField('validUntil', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg" />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Additional Notes</label>
              <textarea value={formData.notes} onChange={(e) => updateField('notes', e.target.value)}
                rows={3} className="w-full px-4 py-2 border rounded-lg" placeholder="Any additional information for the buyer..." />
            </div>

            {/* Submit */}
            <button onClick={handleSubmit} disabled={submitting}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
              <Send className="w-5 h-5" />
              {submitting ? 'Submitting...' : 'Submit Quote'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
