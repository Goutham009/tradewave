'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign,
  Package,
  Clock,
  Calendar,
  FileText,
  Send,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Calculator,
  Truck,
  Shield,
  Receipt,
} from 'lucide-react';

interface Requirement {
  id: string;
  title: string;
  description: string;
  category: string;
  quantity: number;
  unit: string;
  targetPrice: number | null;
  currency: string;
  deliveryLocation: string;
  deliveryDeadline: string;
  buyer?: {
    name: string;
    companyName: string;
  };
}

interface Supplier {
  id: string;
  name: string;
  companyName: string;
}

interface QuotationSubmitFormProps {
  requirement: Requirement;
  supplier: Supplier;
  onSuccess?: (quotation: any) => void;
  onCancel?: () => void;
}

export default function QuotationSubmitForm({
  requirement,
  supplier,
  onSuccess,
  onCancel,
}: QuotationSubmitFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    unitPrice: '',
    quantity: requirement.quantity.toString(),
    leadTime: '',
    validDays: '14',
    shipping: '',
    insurance: '',
    customs: '',
    taxes: '',
    notes: '',
    terms: '',
    samples: false,
    sampleCost: '',
  });

  // Calculate totals
  const unitPrice = parseFloat(formData.unitPrice) || 0;
  const quantity = parseInt(formData.quantity) || 0;
  const subtotal = unitPrice * quantity;
  const shipping = parseFloat(formData.shipping) || 0;
  const insurance = parseFloat(formData.insurance) || 0;
  const customs = parseFloat(formData.customs) || 0;
  const taxes = parseFloat(formData.taxes) || 0;
  const platformFee = subtotal * 0.02; // 2% platform fee
  const total = subtotal + shipping + insurance + customs + taxes + platformFee;

  // Calculate savings vs target price
  const savingsPercent = requirement.targetPrice && unitPrice > 0
    ? Math.round((1 - unitPrice / Number(requirement.targetPrice)) * 100)
    : null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requirementId: requirement.id,
          supplierId: supplier.id,
          unitPrice: parseFloat(formData.unitPrice),
          quantity: parseInt(formData.quantity),
          leadTime: parseInt(formData.leadTime),
          validDays: parseInt(formData.validDays),
          shipping: parseFloat(formData.shipping) || 0,
          insurance: parseFloat(formData.insurance) || 0,
          customs: parseFloat(formData.customs) || 0,
          taxes: parseFloat(formData.taxes) || 0,
          notes: formData.notes || null,
          terms: formData.terms || null,
          samples: formData.samples,
          sampleCost: formData.samples ? parseFloat(formData.sampleCost) : null,
        }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        setSuccess(true);
        if (onSuccess) {
          onSuccess(data.data.quotation);
        }
        setTimeout(() => {
          router.push('/quotations');
        }, 2000);
      } else {
        setError(data.error || 'Failed to submit quotation');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-green-600">Quotation Submitted!</h3>
          <p className="text-muted-foreground mt-2 text-center">
            Your quotation has been sent to the buyer. You&rsquo;ll be notified when they respond.
          </p>
          <Button className="mt-6" onClick={() => router.push('/quotations')}>
            View My Quotations
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Requirement Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Requirement Details
          </CardTitle>
          <CardDescription>You are submitting a quotation for this requirement</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-lg">{requirement.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{requirement.description}</p>
            </div>
            <Badge>{requirement.category}</Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
            <div>
              <p className="text-xs text-muted-foreground">Quantity</p>
              <p className="font-semibold">{requirement.quantity.toLocaleString()} {requirement.unit}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Target Price</p>
              <p className="font-semibold">
                {requirement.targetPrice 
                  ? `$${Number(requirement.targetPrice).toFixed(2)}/${requirement.unit}`
                  : 'Not specified'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Delivery Location</p>
              <p className="font-semibold">{requirement.deliveryLocation}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Deadline</p>
              <p className="font-semibold">{new Date(requirement.deliveryDeadline).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Pricing
          </CardTitle>
          <CardDescription>Enter your pricing details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unitPrice">Unit Price ({requirement.currency}) *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="unitPrice"
                  name="unitPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.unitPrice}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="pl-10"
                  required
                />
              </div>
              {savingsPercent !== null && (
                <p className={`text-xs ${savingsPercent > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {savingsPercent > 0 ? `${savingsPercent}% below` : `${Math.abs(savingsPercent)}% above`} target price
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shipping" className="flex items-center gap-1">
                <Truck className="h-3 w-3" /> Shipping
              </Label>
              <Input
                id="shipping"
                name="shipping"
                type="number"
                step="0.01"
                min="0"
                value={formData.shipping}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="insurance" className="flex items-center gap-1">
                <Shield className="h-3 w-3" /> Insurance
              </Label>
              <Input
                id="insurance"
                name="insurance"
                type="number"
                step="0.01"
                min="0"
                value={formData.insurance}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customs">Customs</Label>
              <Input
                id="customs"
                name="customs"
                type="number"
                step="0.01"
                min="0"
                value={formData.customs}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxes" className="flex items-center gap-1">
                <Receipt className="h-3 w-3" /> Taxes
              </Label>
              <Input
                id="taxes"
                name="taxes"
                type="number"
                step="0.01"
                min="0"
                value={formData.taxes}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Price Summary */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal ({quantity.toLocaleString()} × ${unitPrice.toFixed(2)})</span>
              <span>${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            {shipping > 0 && (
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
            )}
            {insurance > 0 && (
              <div className="flex justify-between text-sm">
                <span>Insurance</span>
                <span>${insurance.toFixed(2)}</span>
              </div>
            )}
            {customs > 0 && (
              <div className="flex justify-between text-sm">
                <span>Customs</span>
                <span>${customs.toFixed(2)}</span>
              </div>
            )}
            {taxes > 0 && (
              <div className="flex justify-between text-sm">
                <span>Taxes</span>
                <span>${taxes.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Platform Fee (2%)</span>
              <span>${platformFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Total</span>
              <span>${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery & Validity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Delivery & Validity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="leadTime">Lead Time (days) *</Label>
              <Input
                id="leadTime"
                name="leadTime"
                type="number"
                min="1"
                value={formData.leadTime}
                onChange={handleChange}
                placeholder="e.g., 14"
                required
              />
              <p className="text-xs text-muted-foreground">
                Days from order confirmation to delivery
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="validDays">Quote Valid For (days)</Label>
              <Input
                id="validDays"
                name="validDays"
                type="number"
                min="1"
                max="90"
                value={formData.validDays}
                onChange={handleChange}
              />
              <p className="text-xs text-muted-foreground">
                Quote expires after this period
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <input
              type="checkbox"
              id="samples"
              name="samples"
              checked={formData.samples}
              onChange={handleChange}
              className="h-4 w-4"
            />
            <div className="flex-1">
              <Label htmlFor="samples" className="cursor-pointer">Samples Available</Label>
              <p className="text-xs text-muted-foreground">Check if you can provide product samples</p>
            </div>
            {formData.samples && (
              <div className="w-32">
                <Input
                  name="sampleCost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.sampleCost}
                  onChange={handleChange}
                  placeholder="Cost"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Terms & Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Additional Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="terms">Payment & Delivery Terms</Label>
            <Textarea
              id="terms"
              name="terms"
              value={formData.terms}
              onChange={handleChange}
              placeholder="e.g., 50% advance, 50% before shipment. FOB Shanghai."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any additional information about your quotation..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-lg">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading || !formData.unitPrice || !formData.leadTime}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Submit Quotation
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
