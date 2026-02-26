'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, ArrowLeft, Camera, FileText, Package } from 'lucide-react';

type EligibleOrder = {
  transactionId: string;
  orderNumber: string;
  title: string;
  deliveredAt: string;
  amount: number;
  currency: string;
};

const ELIGIBLE_ORDERS: EligibleOrder[] = [
  {
    transactionId: 'TXN-2024-001',
    orderNumber: 'PO-2024-001',
    title: 'Steel Components for Manufacturing',
    deliveredAt: '2024-01-29T12:00:00Z',
    amount: 24375,
    currency: 'USD',
  },
  {
    transactionId: 'TXN-2024-002',
    orderNumber: 'PO-2024-002',
    title: 'Electronic Circuit Boards',
    deliveredAt: '2024-01-25T16:30:00Z',
    amount: 12500,
    currency: 'USD',
  },
  {
    transactionId: 'TXN-S-003',
    orderNumber: 'SO-2026-003',
    title: 'Aluminum Sheets - 5mm',
    deliveredAt: '2026-02-28T12:00:00Z',
    amount: 360000,
    currency: 'USD',
  },
];

const RETURN_REASONS = [
  'DEFECTIVE_PRODUCT',
  'WRONG_ITEM_DELIVERED',
  'TRANSIT_DAMAGE',
  'QUALITY_MISMATCH',
  'OTHER',
];

const CONDITION_OPTIONS = ['UNOPENED', 'OPENED_UNUSED', 'USED', 'DAMAGED'];

export default function NewReturnRequestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [transactionId, setTransactionId] = useState(searchParams.get('transactionId') || ELIGIBLE_ORDERS[0].transactionId);
  const [reason, setReason] = useState(RETURN_REASONS[0]);
  const [condition, setCondition] = useState(CONDITION_OPTIONS[0]);
  const [description, setDescription] = useState('');
  const [refundMethod, setRefundMethod] = useState('ORIGINAL_PAYMENT');
  const [photos, setPhotos] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const selectedOrder = useMemo(() => {
    return ELIGIBLE_ORDERS.find((order) => order.transactionId === transactionId) || ELIGIBLE_ORDERS[0];
  }, [transactionId]);

  const handlePhotoUpload = (files: FileList | null) => {
    if (!files) {
      return;
    }
    const names = Array.from(files).map((file) => file.name);
    setPhotos(names);
  };

  const handleSubmit = async () => {
    setError('');

    if (!description.trim() || description.trim().length < 20) {
      setError('Please add at least 20 characters describing the issue.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        transactionId,
        reason,
        condition,
        description,
        refundMethod,
        photoUrls: photos,
      };

      const response = await fetch('/api/returns/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        const returnId = result.return?.id || `RET-${Date.now()}`;
        router.push(`/returns/${returnId}`);
        return;
      }

      const fallbackId = `RET-${Date.now()}`;
      router.push(`/returns/${fallbackId}`);
    } catch {
      const fallbackId = `RET-${Date.now()}`;
      router.push(`/returns/${fallbackId}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Link href="/returns" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Returns & Claims
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">New Return Request</h1>
        <p className="text-muted-foreground">Link your request to an order, upload evidence, and submit for review.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Return Details</CardTitle>
            <CardDescription>Provide complete issue details to speed up approval.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="transaction">Order</Label>
              <select
                id="transaction"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {ELIGIBLE_ORDERS.map((order) => (
                  <option key={order.transactionId} value={order.transactionId}>
                    {order.orderNumber} • {order.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <select
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {RETURN_REASONS.map((item) => (
                    <option key={item} value={item}>
                      {item.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="condition">Item Condition</Label>
                <select
                  id="condition"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {CONDITION_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Issue Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe defects, mismatches, and impact on your operations..."
                rows={6}
              />
              <p className="text-xs text-muted-foreground">Minimum 20 characters. Include issue quantity and clear evidence context.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="refundMethod">Refund Method</Label>
              <Input
                id="refundMethod"
                value={refundMethod}
                onChange={(e) => setRefundMethod(e.target.value)}
                placeholder="ORIGINAL_PAYMENT"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Upload Proof Photos / Files
              </Label>
              <input
                type="file"
                multiple
                className="w-full text-sm"
                onChange={(e) => handlePhotoUpload(e.target.files)}
              />
              {photos.length > 0 && (
                <div className="rounded-md border p-3 text-sm space-y-1">
                  {photos.map((photo) => (
                    <p key={photo}>{photo}</p>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" asChild>
                <Link href="/returns">Cancel</Link>
              </Button>
              <Button variant="gradient" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Return Request'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Linked Order Summary</CardTitle>
            <CardDescription>Return is tied directly to this order and transaction.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="rounded-md border p-3">
              <p className="text-muted-foreground">Order</p>
              <Link href={`/orders/${selectedOrder.transactionId}`} className="font-medium text-primary hover:underline">
                {selectedOrder.orderNumber}
              </Link>
              <p className="text-muted-foreground mt-1">{selectedOrder.title}</p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-muted-foreground">Transaction</p>
              <p className="font-mono">{selectedOrder.transactionId}</p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-muted-foreground">Delivered on</p>
              <p className="font-medium">{new Date(selectedOrder.deliveredAt).toLocaleDateString()}</p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-muted-foreground">Order value</p>
              <p className="font-semibold">{selectedOrder.currency} {selectedOrder.amount.toLocaleString()}</p>
            </div>
            <div className="rounded-md bg-muted/40 p-3 text-xs text-muted-foreground flex gap-2">
              <FileText className="h-4 w-4 mt-0.5" />
              Requests with complete descriptions and evidence are processed faster by operations.
            </div>
            <div className="rounded-md bg-muted/40 p-3 text-xs text-muted-foreground flex gap-2">
              <Package className="h-4 w-4 mt-0.5" />
              You can track status updates from the return detail page after submission.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
