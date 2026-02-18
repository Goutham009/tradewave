'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  Package,
  Truck,
  DollarSign,
  Calendar,
  MapPin,
  Building2,
  Star,
  Loader2,
} from 'lucide-react';

export default function QuickReorderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const transactionId = searchParams.get('transactionId');
  const isModified = searchParams.get('modified') === 'true';

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState('2026-06-15');
  const [sameLocation, setSameLocation] = useState(true);
  const [newLocation, setNewLocation] = useState('');
  const [sendDirect, setSendDirect] = useState(true);
  const [modifiedQuantity, setModifiedQuantity] = useState('');
  const [modifiedSpecs, setModifiedSpecs] = useState('');

  // Demo previous order data
  const previousOrder = {
    id: transactionId || 'txn_past_001',
    product: 'Industrial Steel Pipes - Grade 304',
    supplier: 'Steel Masters China Ltd.',
    supplierId: 'sup_steel_masters_001',
    amount: 608400,
    quantity: 500,
    unit: 'MT',
    specifications: 'Grade: 304\nOuter Diameter: 6 inch\nWall Thickness: Schedule 40\nLength: 6m\nStandard: ASTM A312',
    deliveryLocation: 'Mumbai Port (JNPT), India',
    completedDate: '2026-02-10',
    rating: 5,
    review: 'Excellent quality, on-time delivery',
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/buyer/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: previousOrder.id,
          deliveryDate,
          deliveryLocation: sameLocation ? undefined : newLocation,
          sameLocation,
          sendDirectToSupplier: sendDirect,
          modifiedQuantity: isModified && modifiedQuantity ? parseInt(modifiedQuantity) : undefined,
          modifiedSpecs: isModified && modifiedSpecs ? modifiedSpecs : undefined,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      }
    } catch (error) {
      console.error('Reorder failed:', error);
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
            <h2 className="text-2xl font-bold text-green-900">Reorder Created!</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Your reorder has been submitted. Your Account Manager will verify the details shortly.
            </p>
            <div className="bg-white rounded-lg p-4 text-left text-sm space-y-2 max-w-sm mx-auto">
              <p className="font-medium">What Happens Next:</p>
              <div className="space-y-1 text-muted-foreground">
                <p>1. Your AM verifies details (2-4 hours)</p>
                <p>2. Admin reviews (4-8 hours)</p>
                <p>3. Request sent to {previousOrder.supplier}</p>
                <p>4. You receive their quote (usually within 24h)</p>
              </div>
            </div>
            <div className="flex gap-3 justify-center pt-4">
              <Button onClick={() => router.push('/buyer/dashboard')}>
                Back to Dashboard
              </Button>
              <Button variant="outline" onClick={() => router.push('/buyer/requirements')}>
                View Requirements
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
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <RotateCcw className="h-6 w-6 text-teal-600" />
            {isModified ? 'Modified Reorder' : 'Quick Reorder'}
          </h1>
          <p className="text-muted-foreground">
            {isModified ? 'Reorder with modifications from previous order' : 'Reorder the same product from the same supplier'}
          </p>
        </div>
      </div>

      {/* Previous Order Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="h-5 w-5" />
            Previous Order
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Product</p>
              <p className="font-medium">{previousOrder.product}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Supplier</p>
              <p className="font-medium flex items-center gap-1">
                <Building2 className="h-3 w-3" /> {previousOrder.supplier}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Quantity</p>
              <p className="font-medium">{previousOrder.quantity} {previousOrder.unit}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Amount</p>
              <p className="font-medium">${previousOrder.amount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Completed</p>
              <p className="font-medium">{previousOrder.completedDate}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Rating</p>
              <p className="text-yellow-500 font-medium">
                {'⭐'.repeat(previousOrder.rating)} {previousOrder.rating}/5
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reorder Confirmation */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            {isModified ? 'Modify & Reorder' : 'Quick Reorder Confirmation'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Auto-filled details */}
          {!isModified && (
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span>Product: {previousOrder.product}</span>
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span>Quantity: {previousOrder.quantity} {previousOrder.unit}</span>
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span>Specifications: Same as previous</span>
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span>Supplier: {previousOrder.supplier}</span>
              </div>
            </div>
          )}

          {/* Modified fields (only shown for modified reorder) */}
          {isModified && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">
                  Quantity ({previousOrder.unit})
                </label>
                <Input
                  type="number"
                  placeholder={`${previousOrder.quantity} (same as previous)`}
                  value={modifiedQuantity}
                  onChange={(e) => setModifiedQuantity(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Leave blank to keep same quantity ({previousOrder.quantity} {previousOrder.unit})
                </p>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">
                  Modified Specifications / Instructions
                </label>
                <Textarea
                  placeholder="Any changes to specifications or special instructions..."
                  value={modifiedSpecs}
                  onChange={(e) => setModifiedSpecs(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            </div>
          )}

          {/* Delivery Date */}
          <div>
            <label className="text-sm font-medium flex items-center gap-1 mb-1">
              <Calendar className="h-4 w-4" /> Delivery Date
            </label>
            <Input
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Delivery Location */}
          <div>
            <label className="text-sm font-medium flex items-center gap-1 mb-2">
              <MapPin className="h-4 w-4" /> Delivery Location
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 p-3 rounded-lg border cursor-pointer hover:bg-muted/50">
                <input
                  type="radio"
                  name="location"
                  checked={sameLocation}
                  onChange={() => setSameLocation(true)}
                />
                <span className="text-sm">Same ({previousOrder.deliveryLocation})</span>
              </label>
              <label className="flex items-center gap-2 p-3 rounded-lg border cursor-pointer hover:bg-muted/50">
                <input
                  type="radio"
                  name="location"
                  checked={!sameLocation}
                  onChange={() => setSameLocation(false)}
                />
                <span className="text-sm">Different location</span>
              </label>
              {!sameLocation && (
                <Input
                  placeholder="Enter new delivery location..."
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="mt-2"
                />
              )}
            </div>
          </div>

          {/* Send Direct */}
          <div>
            <label className="text-sm font-medium block mb-2">
              Send directly to {previousOrder.supplier}?
            </label>
            <div className="space-y-2">
              <label className="flex items-start gap-2 p-3 rounded-lg border cursor-pointer hover:bg-muted/50">
                <input
                  type="radio"
                  name="sendDirect"
                  checked={sendDirect}
                  onChange={() => setSendDirect(true)}
                  className="mt-1"
                />
                <div>
                  <p className="text-sm font-medium">Yes (faster - preferred supplier)</p>
                  <p className="text-xs text-muted-foreground">
                    Request sent directly to {previousOrder.supplier}. Expected quote within 24 hours.
                  </p>
                </div>
              </label>
              <label className="flex items-start gap-2 p-3 rounded-lg border cursor-pointer hover:bg-muted/50">
                <input
                  type="radio"
                  name="sendDirect"
                  checked={!sendDirect}
                  onChange={() => setSendDirect(false)}
                  className="mt-1"
                />
                <div>
                  <p className="text-sm font-medium">No, open to all suppliers</p>
                  <p className="text-xs text-muted-foreground">
                    Get quotes from multiple suppliers for comparison.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => router.back()} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting || (!sameLocation && !newLocation)}
              className="flex-1 bg-teal-600 hover:bg-teal-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Create Reorder
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
