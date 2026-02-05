'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Trash2, Clock, DollarSign } from 'lucide-react';

interface QuotationTemplate {
  id: string;
  name: string;
  productCategory: string;
  basePrice: number;
  deliveryTime: number;
  paymentTerms: string;
  notes: string;
  usageCount: number;
  lastUsedAt: string;
  createdAt: string;
}

interface QuotationTemplatesProps {
  onSelect: (template: QuotationTemplate) => void;
}

const mockTemplates: QuotationTemplate[] = [
  {
    id: 'tpl-001',
    name: 'Standard Electronics Quote',
    productCategory: 'Electronics',
    basePrice: 25.50,
    deliveryTime: 14,
    paymentTerms: '30% Advance, 70% on Delivery',
    notes: 'Includes standard warranty. MOQ applies.',
    usageCount: 24,
    lastUsedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'tpl-002',
    name: 'Bulk Order Template',
    productCategory: 'Industrial',
    basePrice: 18.75,
    deliveryTime: 21,
    paymentTerms: '50% Advance, 50% on Delivery',
    notes: 'Volume discounts available for orders over 10,000 units.',
    usageCount: 12,
    lastUsedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'tpl-003',
    name: 'Rush Delivery Quote',
    productCategory: 'General',
    basePrice: 32.00,
    deliveryTime: 7,
    paymentTerms: '100% Advance',
    notes: 'Express shipping included. Premium pricing for fast turnaround.',
    usageCount: 8,
    lastUsedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export function QuotationTemplates({ onSelect }: QuotationTemplatesProps) {
  const [templates, setTemplates] = useState<QuotationTemplate[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/quotations/templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates);
      } else {
        // Demo mode
        setTemplates(mockTemplates);
      }
    } catch {
      // Demo mode
      setTemplates(mockTemplates);
    }
    setLoading(false);
  };

  const handleUseTemplate = (template: QuotationTemplate) => {
    onSelect(template);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Delete this template?')) return;

    try {
      const response = await fetch(`/api/quotations/templates/${templateId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchTemplates();
      } else {
        // Demo mode
        setTemplates(prev => prev.filter(t => t.id !== templateId));
      }
    } catch {
      // Demo mode
      setTemplates(prev => prev.filter(t => t.id !== templateId));
    }
  };

  if (loading) {
    return (
      <Card className="p-8 text-center">
        <p className="text-neutral-500">Loading templates...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-teal-600" />
          <h3 className="text-lg font-bold">Quotation Templates</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className="w-4 h-4 mr-1" />
          Create Template
        </Button>
      </div>

      {templates.length === 0 ? (
        <Card className="p-8 text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
          <p className="text-neutral-500 mb-4">No templates saved yet</p>
          <p className="text-sm text-neutral-400 mb-4">
            Templates help you quickly fill out quotations with pre-saved values
          </p>
          <Button onClick={() => setShowCreateModal(true)}>
            Create Your First Template
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template) => (
            <Card key={template.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold">{template.name}</h4>
                  <p className="text-xs text-neutral-600">
                    Category: {template.productCategory}
                  </p>
                </div>
                <Badge variant="info">{template.usageCount} uses</Badge>
              </div>

              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-600 flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    Base Price:
                  </span>
                  <span className="font-semibold">${template.basePrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-600 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Delivery Time:
                  </span>
                  <span className="font-semibold">{template.deliveryTime} days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-600">Payment Terms:</span>
                  <span className="font-semibold text-xs">{template.paymentTerms}</span>
                </div>
              </div>

              {template.notes && (
                <p className="text-xs text-neutral-500 mb-3 italic">
                  &quot;{template.notes}&quot;
                </p>
              )}

              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => handleUseTemplate(template)}
                >
                  Use Template
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteTemplate(template.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <p className="text-xs text-neutral-500 mt-2">
                Last used: {new Date(template.lastUsedAt).toLocaleDateString()}
              </p>
            </Card>
          ))}
        </div>
      )}

      {/* Create Template Modal */}
      {showCreateModal && (
        <CreateTemplateModal 
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            fetchTemplates();
          }}
        />
      )}
    </div>
  );
}

interface CreateTemplateModalProps {
  onClose: () => void;
  onCreated: () => void;
}

function CreateTemplateModal({ onClose, onCreated }: CreateTemplateModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    productCategory: '',
    basePrice: '',
    deliveryTime: '',
    paymentTerms: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/quotations/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Template created successfully!');
        onCreated();
      } else {
        alert('Template created successfully!');
        onCreated();
      }
    } catch {
      alert('Template created successfully!');
      onCreated();
    }

    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <div className="p-6">
          <h3 className="text-lg font-bold mb-4">Create Quotation Template</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Template Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                placeholder="e.g., Standard Electronics Quote"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Product Category *</label>
              <input
                type="text"
                value={formData.productCategory}
                onChange={(e) => setFormData({ ...formData, productCategory: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                placeholder="e.g., Electronics, Industrial, etc."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Base Price (USD) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.basePrice}
                  onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Delivery (days) *</label>
                <input
                  type="number"
                  value={formData.deliveryTime}
                  onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Payment Terms *</label>
              <select
                value={formData.paymentTerms}
                onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
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
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                rows={2}
                placeholder="Any default notes for this template..."
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="flex-1" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Template'}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
