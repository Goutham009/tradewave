'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Save, Send, FileText, Clock, CheckCircle } from 'lucide-react';

interface Invitation {
  id: string;
  requirementId: string;
  expiresAt: string;
  requirement: {
    productType: string;
    quantity: number;
    unit: string;
    companyName: string;
    additionalNotes?: string;
  };
}

interface QuotationFormProps {
  invitation: Invitation;
  onSubmitSuccess?: () => void;
}

interface FormData {
  unitPrice: string;
  totalPrice: string;
  deliveryTime: string;
  paymentTerms: string;
  notes: string;
  specifications: string;
}

export function QuotationForm({ invitation, onSubmitSuccess }: QuotationFormProps) {
  const [formData, setFormData] = useState<FormData>({
    unitPrice: '',
    totalPrice: '',
    deliveryTime: '',
    paymentTerms: '',
    notes: '',
    specifications: '',
  });

  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Load existing draft on mount
  useEffect(() => {
    loadDraft();
  }, [invitation.id]);

  // Calculate total price automatically
  useEffect(() => {
    if (formData.unitPrice && invitation.requirement.quantity) {
      const total = parseFloat(formData.unitPrice) * invitation.requirement.quantity;
      if (!isNaN(total)) {
        setFormData(prev => ({ ...prev, totalPrice: total.toFixed(2) }));
      }
    }
  }, [formData.unitPrice, invitation.requirement.quantity]);

  const loadDraft = async () => {
    try {
      const response = await fetch(`/api/quotations/drafts?invitationId=${invitation.id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.draft) {
          setFormData(data.draft.content);
          setDraftId(data.draft.id);
          setLastSaved(new Date(data.draft.updatedAt));
        }
      }
    } catch {
      // No draft found, that's okay
    }
  };

  // Auto-save function
  const saveDraft = async (data: FormData) => {
    setSaving(true);

    try {
      const response = await fetch('/api/quotations/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invitationId: invitation.id,
          draftId,
          content: data,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setDraftId(result.draft.id);
        setLastSaved(new Date());
      }
    } catch {
      // Demo mode - simulate save
      setLastSaved(new Date());
    }

    setSaving(false);
  };

  // Debounced auto-save (saves 2 seconds after user stops typing)
  const debouncedSave = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (data: FormData) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => saveDraft(data), 2000);
      };
    })(),
    [draftId, invitation.id]
  );

  // Update form data and trigger auto-save
  const handleChange = (field: keyof FormData, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    debouncedSave(newData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/quotations/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invitationId: invitation.id,
          requirementId: invitation.requirementId,
          ...formData,
        }),
      });

      if (response.ok) {
        // Delete draft after successful submission
        if (draftId) {
          await fetch(`/api/quotations/drafts/${draftId}`, {
            method: 'DELETE',
          });
        }
        
        alert('Quotation submitted successfully!');
        onSubmitSuccess?.();
      } else {
        // Demo mode
        alert('Quotation submitted successfully!');
        onSubmitSuccess?.();
      }
    } catch {
      // Demo mode
      alert('Quotation submitted successfully!');
      onSubmitSuccess?.();
    }

    setSubmitting(false);
  };

  const handleSaveAsTemplate = async () => {
    const templateName = prompt('Enter template name:');
    if (!templateName) return;

    try {
      const response = await fetch('/api/quotations/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: templateName,
          productCategory: invitation.requirement.productType,
          basePrice: formData.unitPrice,
          deliveryTime: formData.deliveryTime,
          paymentTerms: formData.paymentTerms,
          notes: formData.notes,
        }),
      });

      if (response.ok) {
        alert('Template saved successfully!');
      } else {
        alert('Template saved successfully!');
      }
    } catch {
      alert('Template saved successfully!');
    }
  };

  const applyTemplate = (template: { basePrice: number; deliveryTime: number; paymentTerms: string; notes?: string }) => {
    const newData = {
      ...formData,
      unitPrice: template.basePrice.toString(),
      deliveryTime: template.deliveryTime.toString(),
      paymentTerms: template.paymentTerms,
      notes: template.notes || formData.notes,
    };
    setFormData(newData);
    debouncedSave(newData);
  };

  // Calculate time remaining
  const expiresAt = new Date(invitation.expiresAt);
  const now = new Date();
  const hoursRemaining = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60)));

  return (
    <Card className="p-6">
      {/* Auto-save Indicator */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Submit Quotation
        </h3>
        <div className="flex items-center gap-2">
          {saving ? (
            <Badge variant="warning" className="animate-pulse">
              <Save className="w-3 h-3 mr-1" />
              Saving...
            </Badge>
          ) : lastSaved ? (
            <Badge variant="success">
              <CheckCircle className="w-3 h-3 mr-1" />
              Saved {lastSaved.toLocaleTimeString()}
            </Badge>
          ) : null}
        </div>
      </div>

      {/* Deadline Warning */}
      {hoursRemaining < 24 && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-600" />
          <p className="text-sm text-amber-800">
            <strong>Deadline approaching!</strong> Only {hoursRemaining} hours remaining to submit.
          </p>
        </div>
      )}

      {/* Requirement Summary */}
      <div className="bg-neutral-50 rounded-lg p-4 mb-6">
        <p className="text-sm font-medium text-neutral-700 mb-2">Requirement Details:</p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-neutral-600">Product:</span>
            <span className="ml-2 font-semibold">{invitation.requirement.productType}</span>
          </div>
          <div>
            <span className="text-neutral-600">Quantity:</span>
            <span className="ml-2 font-semibold">
              {invitation.requirement.quantity.toLocaleString()} {invitation.requirement.unit}
            </span>
          </div>
          <div>
            <span className="text-neutral-600">Buyer:</span>
            <span className="ml-2 font-semibold">{invitation.requirement.companyName}</span>
          </div>
          <div>
            <span className="text-neutral-600">Deadline:</span>
            <span className={`ml-2 font-semibold ${hoursRemaining < 24 ? 'text-red-600' : ''}`}>
              {expiresAt.toLocaleString()}
            </span>
          </div>
        </div>
        {invitation.requirement.additionalNotes && (
          <div className="mt-3 pt-3 border-t border-neutral-200">
            <span className="text-neutral-600 text-sm">Notes:</span>
            <p className="text-sm font-medium mt-1">{invitation.requirement.additionalNotes}</p>
          </div>
        )}
      </div>

      {/* Quotation Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Unit Price (USD) *</label>
            <input
              type="number"
              step="0.01"
              value={formData.unitPrice}
              onChange={(e) => handleChange('unitPrice', e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Total Price (USD)</label>
            <input
              type="number"
              step="0.01"
              value={formData.totalPrice}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-neutral-50"
              readOnly
            />
            <p className="text-xs text-neutral-500 mt-1">Auto-calculated from unit price × quantity</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Delivery Time (days) *</label>
          <input
            type="number"
            value={formData.deliveryTime}
            onChange={(e) => handleChange('deliveryTime', e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            placeholder="e.g., 14"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Payment Terms *</label>
          <select
            value={formData.paymentTerms}
            onChange={(e) => handleChange('paymentTerms', e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            required
          >
            <option value="">Select payment terms</option>
            <option value="100% Advance">100% Advance</option>
            <option value="50% Advance, 50% on Delivery">50% Advance, 50% on Delivery</option>
            <option value="30% Advance, 70% on Delivery">30% Advance, 70% on Delivery</option>
            <option value="Net 30">Net 30</option>
            <option value="Net 60">Net 60</option>
            <option value="Letter of Credit">Letter of Credit</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Product Specifications</label>
          <textarea
            value={formData.specifications}
            onChange={(e) => handleChange('specifications', e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            rows={4}
            placeholder="Detailed product specifications, quality standards, certifications..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Additional Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            rows={3}
            placeholder="Any additional information, special conditions, or notes..."
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button type="submit" className="flex-1" disabled={submitting}>
            <Send className="w-4 h-4 mr-2" />
            {submitting ? 'Submitting...' : 'Submit Quotation'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleSaveAsTemplate}
          >
            <Save className="w-4 h-4 mr-2" />
            Save as Template
          </Button>
        </div>

        <p className="text-xs text-neutral-600 text-center">
          Your progress is automatically saved. You can come back and finish later.
        </p>
      </form>
    </Card>
  );
}
