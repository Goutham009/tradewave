'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  Package,
  Building2,
  Calendar,
  DollarSign,
  Truck,
  CheckCircle,
  Clock,
  Loader2,
  AlertCircle,
  User,
  Mail,
  MapPin,
  PartyPopper,
  RefreshCw,
  X,
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  INITIATED: { label: 'Initiated', color: 'secondary' },
  PAYMENT_PENDING: { label: 'Payment Pending', color: 'warning' },
  PAID: { label: 'Paid', color: 'info' },
  PAYMENT_RECEIVED: { label: 'Payment Received', color: 'info' },
  ESCROW_HELD: { label: 'Escrow Held', color: 'info' },
  SHIPPED: { label: 'Shipped', color: 'info' },
  DELIVERY_CONFIRMED: { label: 'Delivery Confirmed', color: 'success' },
  QUALITY_PENDING: { label: 'Quality Assessment', color: 'warning' },
  QUALITY_APPROVED: { label: 'Quality Approved', color: 'success' },
  QUALITY_REJECTED: { label: 'Quality Rejected', color: 'destructive' },
  FUNDS_RELEASED: { label: 'Funds Released', color: 'success' },
  COMPLETED: { label: 'Completed', color: 'success' },
  DISPUTED: { label: 'Disputed', color: 'destructive' },
};

const SHIPPING_PROVIDERS = [
  'FedEx',
  'DHL',
  'UPS',
  'USPS',
  'Maersk',
  'Local Courier',
  'Other',
];

export default function SupplierTransactionPage() {
  const router = useRouter();
  const params = useParams();
  const transactionId = params.id as string;

  const [transaction, setTransaction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Shipment form state
  const [showShipmentForm, setShowShipmentForm] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shippingProvider, setShippingProvider] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');
  const [shipmentNotes, setShipmentNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTransaction();
  }, [transactionId]);

  const fetchTransaction = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/transactions/${transactionId}`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setTransaction(data.data.transaction);
      } else {
        setError(data.error || 'Failed to fetch transaction');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const refreshTransaction = async () => {
    setRefreshing(true);
    await fetchTransaction();
    setRefreshing(false);
  };

  const handleShipmentSubmit = async () => {
    if (!trackingNumber || trackingNumber.length < 3) {
      setError('Please enter a valid tracking number (minimum 3 characters)');
      return;
    }
    if (!shippingProvider) {
      setError('Please select a shipping provider');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/transactions/${transactionId}/shipment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackingNumber,
          shippingProvider,
          estimatedDelivery: estimatedDelivery || undefined,
          notes: shipmentNotes || undefined,
        }),
      });
      const data = await response.json();

      if (data.success) {
        setActionSuccess('Shipment confirmed! The buyer has been notified.');
        setShowShipmentForm(false);
        setTrackingNumber('');
        setShippingProvider('');
        setEstimatedDelivery('');
        setShipmentNotes('');
        await fetchTransaction();
      } else {
        setError(data.error || 'Failed to confirm shipment');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !transaction) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <h3 className="mt-4 text-lg font-semibold">Error Loading Transaction</h3>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <Button className="mt-4" onClick={() => router.push('/supplier/orders')}>
            Back to Orders
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!transaction) return null;

  const t = transaction;
  const canShip = ['PAID', 'PAYMENT_RECEIVED', 'ESCROW_HELD'].includes(t.status);
  const fundsReleased = t.status === 'FUNDS_RELEASED' || t.escrow?.status === 'RELEASED';
  const statusConfig = STATUS_CONFIG[t.status] || { label: t.status, color: 'secondary' };

  return (
    <div className="space-y-6">
      {/* Funds Released Banner */}
      {fundsReleased && (
        <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                <PartyPopper className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Payment Released!</h3>
                <p className="opacity-90">
                  ${t.payoutAmount ? Number(t.payoutAmount).toLocaleString() : Number(t.amount).toLocaleString()} has been released to your account.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success/Error Messages */}
      {actionSuccess && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-green-800">{actionSuccess}</p>
            <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setActionSuccess(null)}>
              <X className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}
      {error && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-800">{error}</p>
            <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setError(null)}>
              <X className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link href="/supplier/orders">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold">Order {t.id.slice(0, 8)}...</h1>
              <Badge variant={statusConfig.color as any}>{statusConfig.label}</Badge>
            </div>
            <p className="text-muted-foreground">{t.requirement?.title}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={refreshTransaction} disabled={refreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ship Order Action Card */}
          {canShip && !showShipmentForm && (
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Truck className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">Ready to Ship</h3>
                    <p className="text-muted-foreground mt-1">
                      Payment confirmed. Please ship the order and provide tracking details.
                    </p>
                    <Button className="mt-4" onClick={() => setShowShipmentForm(true)}>
                      <Truck className="mr-2 h-4 w-4" />
                      Confirm Shipment
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Shipment Form */}
          {showShipmentForm && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Shipment Details
                </CardTitle>
                <CardDescription>
                  Enter tracking information to confirm shipment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Tracking Number *</label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter tracking number"
                    className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Shipping Provider *</label>
                  <select
                    value={shippingProvider}
                    onChange={(e) => setShippingProvider(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select provider...</option>
                    {SHIPPING_PROVIDERS.map((provider) => (
                      <option key={provider} value={provider}>
                        {provider}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Estimated Delivery Date</label>
                  <input
                    type="date"
                    value={estimatedDelivery}
                    onChange={(e) => setEstimatedDelivery(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Notes (Optional)</label>
                  <Textarea
                    value={shipmentNotes}
                    onChange={(e) => setShipmentNotes(e.target.value)}
                    placeholder="Any special instructions or notes..."
                    rows={3}
                    className="mt-1"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowShipmentForm(false);
                      setTrackingNumber('');
                      setShippingProvider('');
                      setEstimatedDelivery('');
                      setShipmentNotes('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleShipmentSubmit}
                    disabled={submitting || !trackingNumber || !shippingProvider}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Confirming...
                      </>
                    ) : (
                      <>
                        <Truck className="mr-2 h-4 w-4" />
                        Confirm Shipment
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Status Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Order Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Status Message */}
                <div className={`p-4 rounded-lg ${
                  t.status === 'QUALITY_APPROVED' || t.status === 'FUNDS_RELEASED'
                    ? 'bg-green-50 border border-green-200'
                    : t.status === 'QUALITY_REJECTED' || t.status === 'DISPUTED'
                      ? 'bg-red-50 border border-red-200'
                      : 'bg-blue-50 border border-blue-200'
                }`}>
                  <p className={`font-medium ${
                    t.status === 'QUALITY_APPROVED' || t.status === 'FUNDS_RELEASED'
                      ? 'text-green-800'
                      : t.status === 'QUALITY_REJECTED' || t.status === 'DISPUTED'
                        ? 'text-red-800'
                        : 'text-blue-800'
                  }`}>
                    {getStatusMessage(t.status)}
                  </p>
                </div>

                {/* Milestones */}
                {t.milestones && t.milestones.length > 0 && (
                  <div className="space-y-3 pt-4 border-t">
                    <h4 className="font-medium">Activity Log</h4>
                    {t.milestones.map((milestone: any) => (
                      <div key={milestone.id} className="flex items-start gap-3 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-medium">{milestone.status.replace(/_/g, ' ')}</p>
                          <p className="text-muted-foreground">
                            {new Date(milestone.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border p-3">
                  <p className="text-sm text-muted-foreground">Product</p>
                  <p className="font-medium">{t.requirement?.title || 'N/A'}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-sm text-muted-foreground">Quantity</p>
                  <p className="font-medium">
                    {t.quotation?.quantity?.toLocaleString() || t.requirement?.quantity?.toLocaleString() || 'N/A'} {t.requirement?.unit || ''}
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-sm text-muted-foreground">Delivery Address</p>
                  <p className="font-medium">{t.destination || t.requirement?.deliveryLocation || 'N/A'}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-sm text-muted-foreground">Order Date</p>
                  <p className="font-medium">{new Date(t.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Shipment Info */}
              {t.trackingNumber && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-medium mb-3">Shipment Information</h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border p-3 bg-gray-50">
                      <p className="text-sm text-muted-foreground">Tracking Number</p>
                      <p className="font-mono font-medium">{t.trackingNumber}</p>
                    </div>
                    <div className="rounded-lg border p-3 bg-gray-50">
                      <p className="text-sm text-muted-foreground">Carrier</p>
                      <p className="font-medium">{t.shippingProvider || t.carrier || 'N/A'}</p>
                    </div>
                    {t.shipmentDate && (
                      <div className="rounded-lg border p-3 bg-gray-50">
                        <p className="text-sm text-muted-foreground">Shipped Date</p>
                        <p className="font-medium">{new Date(t.shipmentDate).toLocaleDateString()}</p>
                      </div>
                    )}
                    {t.estimatedDelivery && (
                      <div className="rounded-lg border p-3 bg-gray-50">
                        <p className="text-sm text-muted-foreground">Est. Delivery</p>
                        <p className="font-medium">{new Date(t.estimatedDelivery).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Payment Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-primary/5 rounded-lg">
                <p className="text-3xl font-bold">${Number(t.amount).toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">{t.currency}</p>
              </div>

              {fundsReleased && t.payoutAmount && (
                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Order Amount</span>
                    <span>${Number(t.amount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Platform Fee (2%)</span>
                    <span>-${t.platformFee ? Number(t.platformFee).toLocaleString() : (Number(t.amount) * 0.02).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-medium pt-2 border-t">
                    <span>Your Payout</span>
                    <span className="text-green-600">${Number(t.payoutAmount).toLocaleString()}</span>
                  </div>
                </div>
              )}

              {!fundsReleased && (
                <p className="text-sm text-muted-foreground text-center">
                  Funds will be released after buyer confirms delivery and approves quality.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Buyer Info */}
          {t.buyer && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Buyer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{t.buyer.name}</span>
                </div>
                {t.buyer.companyName && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{t.buyer.companyName}</span>
                  </div>
                )}
                {t.buyer.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{t.buyer.email}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Delivery Address */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{t.destination || t.requirement?.deliveryLocation || 'Not specified'}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function getStatusMessage(status: string): string {
  const messages: Record<string, string> = {
    INITIATED: 'Waiting for buyer payment.',
    PAYMENT_PENDING: 'Buyer payment is processing.',
    PAID: 'Payment confirmed! Ready to ship.',
    PAYMENT_RECEIVED: 'Payment confirmed! Ready to ship.',
    ESCROW_HELD: 'Funds held in escrow. Ready to ship.',
    SHIPPED: 'Shipment confirmed. Waiting for buyer to confirm delivery.',
    DELIVERY_CONFIRMED: 'Buyer confirmed delivery. Awaiting quality assessment.',
    QUALITY_PENDING: 'Quality assessment in progress.',
    QUALITY_APPROVED: 'Quality approved! Funds will be released soon.',
    QUALITY_REJECTED: 'Quality rejected. Dispute opened for resolution.',
    FUNDS_RELEASED: 'Funds released to your account!',
    COMPLETED: 'Order completed successfully.',
    DISPUTED: 'This order is under dispute.',
  };
  return messages[status] || 'Processing...';
}
