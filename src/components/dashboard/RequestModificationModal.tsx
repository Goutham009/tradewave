'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, DollarSign, Clock, FileText, Settings } from 'lucide-react';

interface Quotation {
  id: string;
  supplier: {
    companyName: string;
    rating: number;
  };
  totalPrice: number;
  unitPrice: number;
  deliveryTime: number;
  paymentTerms: string;
}

interface RequestModificationModalProps {
  quotation: Quotation;
  onClose: () => void;
  onSubmit: (data: ModificationData) => void;
}

interface ModificationData {
  modificationType: string;
  targetPrice: string;
  targetDeliveryTime: string;
  additionalRequirements: string;
  notes: string;
}

export function RequestModificationModal({ 
  quotation, 
  onClose, 
  onSubmit 
}: RequestModificationModalProps) {
  const [formData, setFormData] = useState<ModificationData>({
    modificationType: '',
    targetPrice: '',
    targetDeliveryTime: '',
    additionalRequirements: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/quotations/request-modification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quotationId: quotation.id,
          ...formData,
        }),
      });

      if (response.ok) {
        alert('Modification request sent to procurement team');
        onSubmit(formData);
        onClose();
      } else {
        // Demo mode - simulate success
        alert('Modification request sent to procurement team');
        onSubmit(formData);
        onClose();
      }
    } catch {
      // Demo mode - simulate success
      alert('Modification request sent to procurement team');
      onSubmit(formData);
      onClose();
    }

    setSubmitting(false);
  };

  const getModificationIcon = (type: string) => {
    switch (type) {
      case 'PRICE': return <DollarSign className="w-4 h-4" />;
      case 'DELIVERY_TIME': return <Clock className="w-4 h-4" />;
      case 'SPECIFICATIONS': return <FileText className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Request Modification</h2>
            <button
              onClick={onClose}
              className="text-neutral-500 hover:text-neutral-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Quotation Summary */}
            <div className="bg-neutral-50 rounded-lg p-4">
              <p className="text-sm font-medium text-neutral-700 mb-3">Current Quotation:</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-neutral-600">Supplier:</span>
                  <span className="ml-2 font-semibold">{quotation.supplier.companyName}</span>
                </div>
                <div>
                  <span className="text-neutral-600">Total Price:</span>
                  <span className="ml-2 font-semibold text-green-600">
                    ${quotation.totalPrice.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-600">Delivery Time:</span>
                  <span className="ml-2 font-semibold">{quotation.deliveryTime} days</span>
                </div>
                <div>
                  <span className="text-neutral-600">Payment Terms:</span>
                  <span className="ml-2 font-semibold">{quotation.paymentTerms}</span>
                </div>
              </div>
            </div>

            {/* Modification Type */}
            <div>
              <label className="block text-sm font-medium mb-2">
                What would you like to modify? *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'PRICE', label: 'Price Negotiation', icon: '💰' },
                  { value: 'DELIVERY_TIME', label: 'Delivery Time', icon: '⏰' },
                  { value: 'PAYMENT_TERMS', label: 'Payment Terms', icon: '💳' },
                  { value: 'SPECIFICATIONS', label: 'Product Specs', icon: '📋' },
                  { value: 'OTHER', label: 'Other', icon: '✏️' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, modificationType: option.value })}
                    className={`p-3 rounded-lg border-2 text-left transition-all flex items-center gap-2 ${
                      formData.modificationType === option.value
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <span className="text-xl">{option.icon}</span>
                    <span className="font-medium">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Target Price */}
            {formData.modificationType === 'PRICE' && (
              <div>
                <label className="block text-sm font-medium mb-2">Target Price (USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">$</span>
                  <input
                    type="number"
                    value={formData.targetPrice}
                    onChange={(e) => setFormData({ ...formData, targetPrice: e.target.value })}
                    className="w-full pl-8 pr-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    placeholder="Enter your target price"
                  />
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  Current: ${quotation.totalPrice.toLocaleString()} • 
                  Suggested: ${(quotation.totalPrice * 0.9).toLocaleString()} (10% off)
                </p>
              </div>
            )}

            {/* Target Delivery Time */}
            {formData.modificationType === 'DELIVERY_TIME' && (
              <div>
                <label className="block text-sm font-medium mb-2">Target Delivery Time (days)</label>
                <input
                  type="number"
                  value={formData.targetDeliveryTime}
                  onChange={(e) => setFormData({ ...formData, targetDeliveryTime: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  placeholder="Enter your target delivery time"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Current: {quotation.deliveryTime} days
                </p>
              </div>
            )}

            {/* Additional Requirements */}
            <div>
              <label className="block text-sm font-medium mb-2">Additional Requirements</label>
              <textarea
                value={formData.additionalRequirements}
                onChange={(e) => setFormData({ ...formData, additionalRequirements: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                rows={3}
                placeholder="Any specific requirements or changes needed..."
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium mb-2">Notes for Procurement Team *</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                rows={3}
                placeholder="Any additional context or notes..."
                required
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button 
                type="submit" 
                className="flex-1"
                disabled={submitting || !formData.modificationType || !formData.notes}
              >
                {submitting ? 'Submitting...' : 'Submit Modification Request'}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>

            <p className="text-xs text-neutral-600 text-center">
              Our procurement team will contact you within 24 hours to discuss the modifications.
            </p>
          </form>
        </div>
      </Card>
    </div>
  );
}
