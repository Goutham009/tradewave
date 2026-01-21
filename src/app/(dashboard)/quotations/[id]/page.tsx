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
  Building2,
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  Clock,
  DollarSign,
  Truck,
  Package,
  FileText,
  Shield,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Award,
  ThumbsUp,
  MessageSquare,
  Loader2,
} from 'lucide-react';

const getStatusBadge = (status: string) => {
  const variants: Record<string, { variant: any; label: string }> = {
    PENDING: { variant: 'warning', label: 'Pending Review' },
    SUBMITTED: { variant: 'info', label: 'Submitted' },
    UNDER_REVIEW: { variant: 'info', label: 'Under Review' },
    SHORTLISTED: { variant: 'success', label: 'Shortlisted' },
    ACCEPTED: { variant: 'success', label: 'Accepted' },
    REJECTED: { variant: 'destructive', label: 'Rejected' },
    EXPIRED: { variant: 'secondary', label: 'Expired' },
  };
  const config = variants[status] || { variant: 'secondary', label: status };
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export default function QuotationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const quotationId = params.id as string;
  
  const [quotation, setQuotation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isShortlisting, setIsShortlisting] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchQuotation();
  }, [quotationId]);

  const fetchQuotation = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/quotations/${quotationId}`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setQuotation(data.data.quotation);
      } else {
        setError(data.error || 'Failed to fetch quotation');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      const response = await fetch(`/api/quotations/${quotationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ACCEPT' }),
      });
      const data = await response.json();
      
      if (data.status === 'success') {
        setActionSuccess('Quotation accepted! Redirecting to transaction...');
        setQuotation((prev: any) => ({ ...prev, status: 'ACCEPTED' }));
        setTimeout(() => {
          router.push(`/transactions/${data.data.transaction.id}`);
        }, 2000);
      } else {
        setError(data.error || 'Failed to accept quotation');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setIsAccepting(false);
    }
  };

  const handleReject = async () => {
    setIsRejecting(true);
    try {
      const response = await fetch(`/api/quotations/${quotationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'REJECT', rejectionReason }),
      });
      const data = await response.json();
      
      if (data.status === 'success') {
        setQuotation((prev: any) => ({ ...prev, status: 'REJECTED' }));
        setShowRejectModal(false);
        setActionSuccess('Quotation rejected');
      } else {
        setError(data.error || 'Failed to reject quotation');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setIsRejecting(false);
    }
  };

  const handleShortlist = async () => {
    setIsShortlisting(true);
    try {
      const response = await fetch(`/api/quotations/${quotationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SHORTLIST' }),
      });
      const data = await response.json();
      
      if (data.status === 'success') {
        setQuotation((prev: any) => ({ ...prev, status: 'SHORTLISTED' }));
        setActionSuccess('Quotation shortlisted');
      } else {
        setError(data.error || 'Failed to shortlist quotation');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setIsShortlisting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !quotation) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertTriangle className="h-12 w-12 text-red-500" />
          <h3 className="mt-4 text-lg font-semibold">Error Loading Quotation</h3>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <Button className="mt-4" onClick={() => router.push('/quotations')}>
            Back to Quotations
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!quotation) return null;

  const q = quotation;
  const canTakeAction = ['PENDING', 'SUBMITTED', 'UNDER_REVIEW', 'SHORTLISTED'].includes(q.status) && !q.isExpired;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/quotations">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Quotations
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{q.id}</h1>
              {getStatusBadge(q.status)}
            </div>
            <p className="text-muted-foreground">
              For: {q.requirement.title}
            </p>
          </div>
        </div>
        {canTakeAction && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowRejectModal(true)}
              disabled={isRejecting}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
            {q.status !== 'SHORTLISTED' && (
              <Button 
                variant="outline"
                onClick={handleShortlist}
                disabled={isShortlisting}
              >
                <Star className="mr-2 h-4 w-4" />
                {isShortlisting ? 'Shortlisting...' : 'Shortlist'}
              </Button>
            )}
            <Button 
              variant="gradient" 
              onClick={handleAccept}
              disabled={isAccepting}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              {isAccepting ? 'Accepting...' : 'Accept Quotation'}
            </Button>
          </div>
        )}

        {/* Success/Error Messages */}
        {actionSuccess && (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
            <CheckCircle2 className="h-4 w-4" />
            {actionSuccess}
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Supplier Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Supplier Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <div>
                    <h3 className="text-xl font-bold">{q.supplier.companyName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {q.supplier.verified && (
                        <Badge variant="success" className="text-xs">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Verified Supplier
                        </Badge>
                      )}
                      <span className="text-sm text-muted-foreground">
                        {q.supplier.yearsInBusiness} years in business
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {q.supplier.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {q.supplier.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {q.supplier.phone}
                    </span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-1 justify-end">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-2xl font-bold">{q.supplier.rating}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {q.supplier.totalReviews} reviews
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{q.supplier.responseRate}%</p>
                  <p className="text-xs text-muted-foreground">Response Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{q.supplier.onTimeDelivery}%</p>
                  <p className="text-xs text-muted-foreground">On-Time Delivery</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{q.supplier.qualityScore}</p>
                  <p className="text-xs text-muted-foreground">Quality Score</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                {q.supplier.certifications.map((cert: string) => (
                  <Badge key={cert} variant="outline" className="flex items-center gap-1">
                    <Award className="h-3 w-3" />
                    {cert}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Product Specifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Product Specifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold mb-4">{q.product.name}</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {Object.entries(q.product.specifications).map(([key, value]: [string, unknown]) => (
                  <div key={key} className="flex justify-between rounded-lg border p-3">
                    <span className="text-muted-foreground">{key}</span>
                    <span className="font-medium">{String(value)}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center gap-4 mt-4 pt-4 border-t text-sm">
                <span>
                  <strong>MOQ:</strong> {q.product.moq.toLocaleString()} {q.requirement.unit}
                </span>
                {q.product.sampleAvailable && (
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    Sample available (${q.product.sampleCost})
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pricing Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pricing Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Unit Price × {q.pricing.quantity.toLocaleString()}
                  </span>
                  <span>${q.pricing.unitPrice}/unit</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${q.pricing.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping ({q.delivery.shippingMethod})</span>
                  <span>${q.pricing.shipping.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Insurance</span>
                  <span>${q.pricing.insurance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform Fee</span>
                  <span>${q.pricing.platformFee.toLocaleString()}</span>
                </div>
                {q.pricing.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-${q.pricing.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between pt-3 border-t text-lg font-bold">
                  <span>Total</span>
                  <span>${q.pricing.total.toLocaleString()} {q.pricing.currency}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <h4 className="font-medium mb-2">Payment Terms</h4>
                <p className="text-sm text-muted-foreground">{q.pricing.paymentTerms}</p>
                <div className="flex gap-2 mt-2">
                  {q.pricing.paymentMethods.map((method: string) => (
                    <Badge key={method} variant="outline">{method}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Delivery Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Estimated Delivery</p>
                  <p className="text-xl font-bold">
                    {new Date(q.delivery.estimatedDate).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                  <p className="text-sm text-muted-foreground">Lead time: {q.delivery.leadTime}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Shipping Method</p>
                  <p className="text-lg font-semibold">{q.delivery.shippingMethod}</p>
                  <p className="text-sm text-muted-foreground">Incoterm: {q.delivery.incoterm}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">From</p>
                  <p className="font-medium">{q.delivery.origin}</p>
                </div>
                <div className="flex-1 mx-4 border-t-2 border-dashed relative">
                  <Truck className="absolute left-1/2 -translate-x-1/2 -top-3 h-6 w-6 bg-background text-primary" />
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">To</p>
                  <p className="font-medium">{q.delivery.destination}</p>
                </div>
              </div>

              {q.delivery.additionalFees.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-medium mb-2">Additional Fees</h4>
                  <div className="space-y-2">
                    {q.delivery.additionalFees.map((fee: { name: string; amount: number }) => (
                      <div key={fee.name} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{fee.name}</span>
                        <span>${fee.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Terms & Conditions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Terms & Conditions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-sans">
                {q.terms}
              </pre>
            </CardContent>
          </Card>

          {/* Customer Reviews */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Customer Reviews for {q.supplier.name}
              </CardTitle>
              <CardDescription>
                {q.supplier.totalReviews} reviews • {q.supplier.rating} average rating
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {q.reviews.map((review: { id: string; buyer: string; company: string; rating: number; comment: string; date: string }) => (
                  <div key={review.id} className="rounded-lg border p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{review.buyer}</p>
                        <p className="text-sm text-muted-foreground">{review.company}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="mt-2 text-sm">{review.comment}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{review.date}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Summary */}
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Quick Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-primary/5 rounded-lg">
                <p className="text-3xl font-bold">${q.pricing.total.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">{q.pricing.currency} Total</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Unit Price</span>
                  <span className="font-medium">${q.pricing.unitPrice}/{q.requirement.unit}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Quantity</span>
                  <span className="font-medium">{q.pricing.quantity.toLocaleString()} {q.requirement.unit}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Lead Time</span>
                  <span className="font-medium">{q.delivery.leadTime}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Valid Until</span>
                  <span className="font-medium">{new Date(q.validUntil).toLocaleDateString()}</span>
                </div>
              </div>

              {canTakeAction && (
                <div className="pt-4 border-t space-y-2">
                  <Button 
                    variant="gradient" 
                    className="w-full"
                    onClick={handleAccept}
                    disabled={isAccepting}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    {isAccepting ? 'Accepting...' : 'Accept Quotation'}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setShowRejectModal(true)}
                    disabled={isRejecting}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                </div>
              )}

              {q.status === 'ACCEPTED' && q.hasTransaction && (
                <div className="pt-4 border-t">
                  <Link href={`/transactions`}>
                    <Button variant="gradient" className="w-full">
                      <Truck className="mr-2 h-4 w-4" />
                      View Transaction
                    </Button>
                  </Link>
                </div>
              )}

              <div className="pt-4 border-t">
                <Button variant="outline" className="w-full">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Contact Supplier
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Escrow Protection */}
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Shield className="h-6 w-6 text-green-600" />
                <div>
                  <h4 className="font-semibold text-green-800">Escrow Protection</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Your payment is held securely until you confirm delivery and quality.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Warning if expiring soon */}
          {new Date(q.validUntil) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && (
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                  <div>
                    <h4 className="font-semibold text-yellow-800">Expiring Soon</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      This quotation expires on {new Date(q.validUntil).toLocaleDateString()}.
                      Review and respond promptly.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                Reject Quotation
              </CardTitle>
              <CardDescription>
                Are you sure you want to reject this quotation? This action cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Reason (optional)</label>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Provide a reason for rejecting this quotation..."
                  rows={3}
                  className="mt-1"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={isRejecting}
                >
                  {isRejecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Rejecting...
                    </>
                  ) : (
                    'Reject Quotation'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
