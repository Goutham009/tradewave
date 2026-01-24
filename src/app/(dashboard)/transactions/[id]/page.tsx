'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  Package,
  Building2,
  Calendar,
  DollarSign,
  Truck,
  CheckCircle2,
  Clock,
  FileText,
  Link as LinkIcon,
  MapPin,
  CreditCard,
  Shield,
  Upload,
  Download,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle,
  Circle,
  User,
  Mail,
  Phone,
  AlertTriangle,
  PartyPopper,
  RefreshCw,
  Flag,
  X,
  ThumbsUp,
  Banknote,
} from 'lucide-react';

// Status configurations
const STATUS_CONFIG: Record<string, { label: string; color: string; progress: number }> = {
  INITIATED: { label: 'Initiated', color: 'secondary', progress: 5 },
  PAYMENT_PENDING: { label: 'Payment Pending', color: 'warning', progress: 10 },
  PAYMENT_RECEIVED: { label: 'Payment Received', color: 'info', progress: 20 },
  PAID: { label: 'Paid', color: 'info', progress: 25 },
  ESCROW_HELD: { label: 'Escrow Held', color: 'info', progress: 30 },
  PRODUCTION: { label: 'In Production', color: 'warning', progress: 40 },
  SHIPPED: { label: 'Shipped', color: 'info', progress: 50 },
  IN_TRANSIT: { label: 'In Transit', color: 'info', progress: 55 },
  CUSTOMS: { label: 'Customs Clearance', color: 'warning', progress: 60 },
  DELIVERED: { label: 'Delivered', color: 'success', progress: 65 },
  DELIVERY_CONFIRMED: { label: 'Delivery Confirmed', color: 'success', progress: 70 },
  QUALITY_PENDING: { label: 'Quality Assessment', color: 'warning', progress: 75 },
  QUALITY_CHECK: { label: 'Quality Check', color: 'info', progress: 75 },
  QUALITY_APPROVED: { label: 'Quality Approved', color: 'success', progress: 85 },
  QUALITY_REJECTED: { label: 'Quality Rejected', color: 'destructive', progress: 75 },
  FUNDS_RELEASING: { label: 'Releasing Funds', color: 'info', progress: 90 },
  FUNDS_RELEASED: { label: 'Funds Released', color: 'success', progress: 95 },
  ESCROW_RELEASED: { label: 'Escrow Released', color: 'success', progress: 95 },
  CONFIRMED: { label: 'Confirmed', color: 'success', progress: 90 },
  COMPLETED: { label: 'Completed', color: 'success', progress: 100 },
  DISPUTED: { label: 'Disputed', color: 'destructive', progress: 0 },
  DISPUTE_OPEN: { label: 'Dispute Open', color: 'destructive', progress: 0 },
  DISPUTE_RESOLVED: { label: 'Dispute Resolved', color: 'secondary', progress: 0 },
  CANCELLED: { label: 'Cancelled', color: 'destructive', progress: 0 },
  REFUNDED: { label: 'Refunded', color: 'secondary', progress: 0 },
};

const ESCROW_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pending', color: 'secondary' },
  HELD: { label: 'Funds Held', color: 'warning' },
  RELEASED: { label: 'Released', color: 'success' },
  DISPUTED: { label: 'Disputed', color: 'destructive' },
  REFUNDED: { label: 'Refunded', color: 'secondary' },
};

const getStatusBadge = (status: string) => {
  const config = STATUS_CONFIG[status] || { label: status, color: 'secondary' };
  return <Badge variant={config.color as any}>{config.label}</Badge>;
};

const getEscrowBadge = (status: string) => {
  const config = ESCROW_STATUS_CONFIG[status] || { label: status, color: 'secondary' };
  return <Badge variant={config.color as any}>{config.label}</Badge>;
};

export default function TransactionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const transactionId = params.id as string;

  const [transaction, setTransaction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('timeline');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  // Delivery confirmation form
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  
  // Quality assessment form
  const [showQualityForm, setShowQualityForm] = useState(false);
  const [qualityRating, setQualityRating] = useState(0);
  const [qualityNotes, setQualityNotes] = useState('');
  const [qualityIssues, setQualityIssues] = useState<string[]>([]);

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

  const handleAction = async (action: string) => {
    setActionLoading(action);
    setError(null);
    setActionSuccess(null);

    try {
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await response.json();

      if (data.status === 'success') {
        if (data.data.fundsReleased) {
          setActionSuccess('🎉 All conditions met! Funds have been released to the supplier.');
        } else if (action === 'CONFIRMDELIVERY' || action === 'CONFIRM_DELIVERY') {
          setActionSuccess('Delivery confirmed successfully!');
        } else if (action === 'APPROVEQUALITY' || action === 'APPROVE_QUALITY') {
          setActionSuccess('Quality approved successfully!');
        }
        await fetchTransaction();
      } else {
        setError(data.error || `Failed to ${action.toLowerCase()}`);
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDispute = async () => {
    if (!disputeReason.trim()) {
      setError('Please provide a reason for the dispute');
      return;
    }

    setActionLoading('DISPUTE');
    try {
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'DISPUTE', reason: disputeReason }),
      });
      const data = await response.json();

      if (data.status === 'success') {
        setActionSuccess('Dispute has been opened. Our team will review it shortly.');
        setShowDisputeModal(false);
        setDisputeReason('');
        await fetchTransaction();
      } else {
        setError(data.error || 'Failed to open dispute');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeliveryConfirmation = async () => {
    if (!deliveryLocation.trim()) {
      setError('Please provide delivery location');
      return;
    }

    setActionLoading('DELIVERY');
    try {
      const response = await fetch(`/api/transactions/${transactionId}/delivery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deliveryLocation,
          deliveryDate: new Date().toISOString(),
          notes: deliveryNotes,
        }),
      });
      const data = await response.json();

      if (data.success) {
        setActionSuccess('Delivery confirmed! Please assess the quality of goods.');
        setShowDeliveryForm(false);
        setDeliveryLocation('');
        setDeliveryNotes('');
        await fetchTransaction();
      } else {
        setError(data.error || 'Failed to confirm delivery');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleQualityAssessment = async (approvalStatus: 'APPROVED' | 'REJECTED') => {
    if (qualityRating === 0) {
      setError('Please select a rating');
      return;
    }
    if (!qualityNotes.trim() || qualityNotes.length < 10) {
      setError('Please provide detailed notes (minimum 10 characters)');
      return;
    }
    if (approvalStatus === 'APPROVED' && qualityRating < 3) {
      setError('Cannot approve with rating less than 3');
      return;
    }
    if (approvalStatus === 'REJECTED' && qualityRating > 2) {
      setError('Cannot reject with rating greater than 2');
      return;
    }

    setActionLoading(approvalStatus === 'APPROVED' ? 'APPROVE' : 'REJECT');
    try {
      const response = await fetch(`/api/transactions/${transactionId}/quality`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: qualityRating,
          notes: qualityNotes,
          issues: qualityIssues,
          approvalStatus,
        }),
      });
      const data = await response.json();

      if (data.success) {
        if (approvalStatus === 'APPROVED') {
          setActionSuccess('Quality approved! Funds are being released to the supplier.');
        } else {
          setActionSuccess('Quality rejected. A dispute has been opened for review.');
        }
        setShowQualityForm(false);
        setQualityRating(0);
        setQualityNotes('');
        setQualityIssues([]);
        await fetchTransaction();
      } else {
        setError(data.error || 'Failed to submit quality assessment');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setActionLoading(null);
    }
  };

  const toggleIssue = (issue: string) => {
    setQualityIssues(prev => 
      prev.includes(issue) 
        ? prev.filter(i => i !== issue)
        : [...prev, issue]
    );
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
          <AlertTriangle className="h-12 w-12 text-red-500" />
          <h3 className="mt-4 text-lg font-semibold">Error Loading Transaction</h3>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <Button className="mt-4" onClick={() => router.push('/transactions')}>
            Back to Transactions
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!transaction) return null;

  const t = transaction;
  const progress = STATUS_CONFIG[t.status]?.progress || 0;
  const canConfirmDelivery = ['DELIVERED', 'IN_TRANSIT', 'SHIPPED'].includes(t.status) && 
    !t.deliveryConfirmedAt && (t.escrow ? !t.escrow.deliveryConfirmed : true);
  const canAssessQuality = ['QUALITY_PENDING', 'DELIVERY_CONFIRMED'].includes(t.status) || 
    (t.deliveryConfirmedAt && !t.qualityAssessmentAt);
  const canApproveQuality = t.escrow?.deliveryConfirmed && !t.escrow?.qualityApproved;
  const allConditionsMet = t.escrow?.deliveryConfirmed && t.escrow?.qualityApproved && t.escrow?.documentsVerified;
  const fundsReleased = t.escrow?.status === 'RELEASED' || t.status === 'FUNDS_RELEASED';
  const isDisputed = t.status === 'DISPUTED' || t.status === 'DISPUTE_OPEN' || t.status === 'QUALITY_REJECTED';

  return (
    <div className="space-y-6">
      {/* Funds Released Celebration Banner */}
      {fundsReleased && (
        <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                <PartyPopper className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Transaction Complete!</h3>
                <p className="opacity-90">All conditions met. Funds have been released to the supplier.</p>
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
          <Link href="/transactions">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold">{t.id}</h1>
              {getStatusBadge(t.status)}
              {t.escrow && getEscrowBadge(t.escrow.status)}
            </div>
            <p className="text-muted-foreground">{t.requirement?.title}</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={refreshTransaction} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {t.trackingNumber && (
            <Button variant="outline" size="sm">
              <ExternalLink className="mr-2 h-4 w-4" />
              Track Shipment
            </Button>
          )}
        </div>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Order Progress</h3>
              <p className="text-sm text-muted-foreground">
                {t.estimatedDelivery 
                  ? `Expected: ${new Date(t.estimatedDelivery).toLocaleDateString()}`
                  : 'Delivery date pending'}
              </p>
            </div>
            <span className="text-2xl font-bold">{progress}%</span>
          </div>
          <Progress value={progress} className="h-3" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Order</span>
            <span>Payment</span>
            <span>Shipped</span>
            <span>Delivered</span>
            <span>Complete</span>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons for Buyer */}
      {(canConfirmDelivery || canAssessQuality) && !isDisputed && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Actions Required</h3>
            <div className="flex flex-wrap gap-3">
              {canConfirmDelivery && (
                <Button
                  variant="gradient"
                  onClick={() => setShowDeliveryForm(true)}
                >
                  <Truck className="mr-2 h-4 w-4" />
                  Confirm Delivery Received
                </Button>
              )}
              {canAssessQuality && (
                <Button
                  variant="gradient"
                  onClick={() => setShowQualityForm(true)}
                >
                  <ThumbsUp className="mr-2 h-4 w-4" />
                  Assess Quality
                </Button>
              )}
              {!isDisputed && t.escrow?.status === 'HELD' && (
                <Button
                  variant="outline"
                  onClick={() => setShowDisputeModal(true)}
                >
                  <Flag className="mr-2 h-4 w-4" />
                  Raise Dispute
                </Button>
              )}
            </div>
            {canConfirmDelivery && (
              <p className="text-sm text-muted-foreground mt-3">
                Please confirm once you have received the goods in good condition.
              </p>
            )}
            {canAssessQuality && (
              <p className="text-sm text-muted-foreground mt-3">
                Inspect the goods and rate the quality. Funds will be released upon approval.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="flex gap-2 border-b overflow-x-auto">
            {['timeline', 'escrow', 'order', 'documents'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab === 'escrow' ? 'Escrow & Funds' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Timeline Tab - Activity Log */}
          {activeTab === 'timeline' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Activity Log
                </CardTitle>
                <CardDescription>Complete history of this transaction</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {t.milestones && t.milestones.length > 0 ? (
                    t.milestones.map((milestone: any, idx: number) => (
                      <div key={milestone.id} className="relative">
                        {idx < t.milestones.length - 1 && (
                          <div className="absolute left-3 top-8 w-0.5 h-full bg-gray-200" />
                        )}
                        <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                          <div className="flex-shrink-0 mt-0.5">
                            <CheckCircle className="h-6 w-6 text-green-500" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold">{milestone.status.replace(/_/g, ' ')}</h4>
                              <span className="text-xs text-muted-foreground">
                                {new Date(milestone.timestamp).toLocaleString()}
                              </span>
                            </div>
                            {milestone.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {milestone.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No activity yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Escrow Tab */}
          {activeTab === 'escrow' && t.escrow && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Escrow Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className={`flex items-center justify-between p-4 rounded-lg border ${
                    fundsReleased ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
                  }`}>
                    <div className="flex items-center gap-3">
                      {fundsReleased ? (
                        <Banknote className="h-6 w-6 text-green-600" />
                      ) : (
                        <Shield className="h-6 w-6 text-yellow-600" />
                      )}
                      <div>
                        <p className={`font-medium ${fundsReleased ? 'text-green-800' : 'text-yellow-800'}`}>
                          {fundsReleased ? 'Funds Released to Supplier' : 'Funds Held in Escrow'}
                        </p>
                        <p className={`text-sm ${fundsReleased ? 'text-green-600' : 'text-yellow-600'}`}>
                          {t.escrow.releaseDate 
                            ? `Released: ${new Date(t.escrow.releaseDate).toLocaleString()}`
                            : t.escrow.holdDate 
                              ? `Held since: ${new Date(t.escrow.holdDate).toLocaleString()}`
                              : 'Pending deposit'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">${Number(t.escrow.amount).toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">{t.escrow.currency}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Release Conditions</h4>
                    <div className="space-y-3">
                      <div className={`flex items-center justify-between rounded-lg border p-3 ${
                        t.escrow.deliveryConfirmed ? 'bg-green-50 border-green-200' : 'bg-gray-50'
                      }`}>
                        <div className="flex items-center gap-3">
                          {t.escrow.deliveryConfirmed ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <Circle className="h-5 w-5 text-gray-400" />
                          )}
                          <span className={t.escrow.deliveryConfirmed ? 'text-green-800' : ''}>
                            Delivery Confirmed
                          </span>
                        </div>
                        {t.escrow.deliveryConfirmedAt && (
                          <span className="text-xs text-muted-foreground">
                            {new Date(t.escrow.deliveryConfirmedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      <div className={`flex items-center justify-between rounded-lg border p-3 ${
                        t.escrow.qualityApproved ? 'bg-green-50 border-green-200' : 'bg-gray-50'
                      }`}>
                        <div className="flex items-center gap-3">
                          {t.escrow.qualityApproved ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <Circle className="h-5 w-5 text-gray-400" />
                          )}
                          <span className={t.escrow.qualityApproved ? 'text-green-800' : ''}>
                            Quality Approved
                          </span>
                        </div>
                        {t.escrow.qualityApprovedAt && (
                          <span className="text-xs text-muted-foreground">
                            {new Date(t.escrow.qualityApprovedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      <div className={`flex items-center justify-between rounded-lg border p-3 ${
                        t.escrow.documentsVerified ? 'bg-green-50 border-green-200' : 'bg-gray-50'
                      }`}>
                        <div className="flex items-center gap-3">
                          {t.escrow.documentsVerified ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <Circle className="h-5 w-5 text-gray-400" />
                          )}
                          <span className={t.escrow.documentsVerified ? 'text-green-800' : ''}>
                            Documents Verified
                          </span>
                        </div>
                        {t.escrow.documentsVerifiedAt && (
                          <span className="text-xs text-muted-foreground">
                            {new Date(t.escrow.documentsVerifiedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {!fundsReleased && (
                      <p className="text-sm text-muted-foreground mt-4">
                        Funds will be automatically released when all conditions are met.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Payment Info */}
              {t.payments && t.payments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Payment Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {t.payments.map((payment: any) => (
                      <div key={payment.id} className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Amount</span>
                          <span className="font-bold">${Number(payment.amount).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Method</span>
                          <span>{payment.method}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status</span>
                          <Badge variant={payment.status === 'SUCCEEDED' ? 'success' : 'secondary'}>
                            {payment.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Order Tab */}
          {activeTab === 'order' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3">Product Information</h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border p-3">
                      <p className="text-sm text-muted-foreground">Product</p>
                      <p className="font-medium">{t.requirement?.title || 'N/A'}</p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-sm text-muted-foreground">Category</p>
                      <p className="font-medium">{t.requirement?.category || 'N/A'}</p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-sm text-muted-foreground">Quantity</p>
                      <p className="font-medium">
                        {t.quotation?.quantity?.toLocaleString() || t.requirement?.quantity?.toLocaleString() || 'N/A'} {t.requirement?.unit || ''}
                      </p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                      <p className="font-medium">${Number(t.amount).toLocaleString()} {t.currency}</p>
                    </div>
                  </div>
                </div>

                {t.requirement?.specifications && Object.keys(t.requirement.specifications).length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Specifications</h4>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {Object.entries(t.requirement.specifications).map(([key, value]: [string, any]) => (
                        <div key={key} className="flex justify-between rounded-lg border p-3">
                          <span className="text-muted-foreground">{key}</span>
                          <span className="font-medium">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Shipping Info */}
                {(t.carrier || t.trackingNumber || t.destination) && (
                  <div>
                    <h4 className="font-medium mb-3">Shipping Information</h4>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {t.carrier && (
                        <div className="rounded-lg border p-3">
                          <p className="text-sm text-muted-foreground">Carrier</p>
                          <p className="font-medium">{t.carrier}</p>
                        </div>
                      )}
                      {t.trackingNumber && (
                        <div className="rounded-lg border p-3">
                          <p className="text-sm text-muted-foreground">Tracking Number</p>
                          <p className="font-medium font-mono">{t.trackingNumber}</p>
                        </div>
                      )}
                      {t.origin && (
                        <div className="rounded-lg border p-3">
                          <p className="text-sm text-muted-foreground">Origin</p>
                          <p className="font-medium">{t.origin}</p>
                        </div>
                      )}
                      {t.destination && (
                        <div className="rounded-lg border p-3">
                          <p className="text-sm text-muted-foreground">Destination</p>
                          <p className="font-medium">{t.destination}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documents
                </CardTitle>
                <CardDescription>Transaction documents and verification status</CardDescription>
              </CardHeader>
              <CardContent>
                {t.documents && t.documents.length > 0 ? (
                  <div className="space-y-3">
                    {t.documents.map((doc: any) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{doc.name || doc.type}</p>
                            <p className="text-sm text-muted-foreground">
                              {doc.uploadedAt
                                ? `Uploaded ${new Date(doc.uploadedAt).toLocaleDateString()}`
                                : 'Not uploaded yet'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {doc.documentHash && (
                            <span className="text-xs font-mono text-muted-foreground">
                              {doc.documentHash.slice(0, 10)}...
                            </span>
                          )}
                          <Badge variant={doc.verified ? 'success' : 'secondary'}>
                            {doc.verified ? 'Verified' : 'Pending'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No documents uploaded yet</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-primary/5 rounded-lg">
                <p className="text-3xl font-bold">${Number(t.amount).toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">{t.currency}</p>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order ID</span>
                  <span className="font-mono text-xs">{t.id.slice(0, 12)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  {getStatusBadge(t.status)}
                </div>
                {t.escrow && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Escrow</span>
                    {getEscrowBadge(t.escrow.status)}
                  </div>
                )}
              </div>

              {/* Quick Actions in Sidebar */}
              {canConfirmDelivery && (
                <Button 
                  variant="gradient" 
                  className="w-full"
                  onClick={() => handleAction('CONFIRMDELIVERY')}
                  disabled={actionLoading === 'CONFIRMDELIVERY'}
                >
                  {actionLoading === 'CONFIRMDELIVERY' ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Truck className="mr-2 h-4 w-4" />
                  )}
                  Confirm Delivery
                </Button>
              )}
              {canApproveQuality && (
                <Button 
                  variant="gradient" 
                  className="w-full"
                  onClick={() => handleAction('APPROVEQUALITY')}
                  disabled={actionLoading === 'APPROVEQUALITY'}
                >
                  {actionLoading === 'APPROVEQUALITY' ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ThumbsUp className="mr-2 h-4 w-4" />
                  )}
                  Approve Quality
                </Button>
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

          {/* Supplier Info */}
          {t.supplier && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Supplier</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span>{t.supplier.companyName || t.supplier.name}</span>
                </div>
                {t.supplier.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{t.supplier.location}</span>
                  </div>
                )}
                {t.supplier.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{t.supplier.email}</span>
                  </div>
                )}
                {t.supplier.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{t.supplier.phone}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Escrow Protection Card */}
          {t.escrow && !fundsReleased && (
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
          )}
        </div>
      </div>

      {/* Dispute Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flag className="h-5 w-5 text-red-500" />
                Raise a Dispute
              </CardTitle>
              <CardDescription>
                If there's an issue with this transaction, you can raise a dispute. Our team will review it.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Reason for Dispute *</label>
                <Textarea
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder="Describe the issue in detail..."
                  rows={4}
                  className="mt-1"
                />
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <p className="text-sm text-yellow-800">
                    Opening a dispute will freeze the escrow funds until the issue is resolved.
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDisputeModal(false);
                    setDisputeReason('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDispute}
                  disabled={actionLoading === 'DISPUTE' || !disputeReason.trim()}
                >
                  {actionLoading === 'DISPUTE' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Dispute'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delivery Confirmation Modal */}
      {showDeliveryForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-green-500" />
                Confirm Delivery
              </CardTitle>
              <CardDescription>
                Please confirm that you have received the goods.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Delivery Location *</label>
                <input
                  type="text"
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                  placeholder="Enter delivery address or location"
                  className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Notes (Optional)</label>
                <Textarea
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="Any additional notes about the delivery..."
                  rows={3}
                  className="mt-1"
                />
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                  <p className="text-sm text-blue-800">
                    After confirming delivery, you'll need to assess the quality of goods.
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeliveryForm(false);
                    setDeliveryLocation('');
                    setDeliveryNotes('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="gradient"
                  onClick={handleDeliveryConfirmation}
                  disabled={actionLoading === 'DELIVERY' || !deliveryLocation.trim()}
                >
                  {actionLoading === 'DELIVERY' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Confirming...
                    </>
                  ) : (
                    'Confirm Delivery'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quality Assessment Modal */}
      {showQualityForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <Card className="w-full max-w-lg my-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ThumbsUp className="h-5 w-5 text-blue-500" />
                Quality Assessment
              </CardTitle>
              <CardDescription>
                Rate the quality of goods received. This determines fund release.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Star Rating */}
              <div>
                <label className="text-sm font-medium">Quality Rating *</label>
                <div className="flex gap-2 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setQualityRating(star)}
                      className={`p-2 rounded-lg transition-colors ${
                        qualityRating >= star
                          ? 'text-yellow-400'
                          : 'text-gray-300 hover:text-yellow-200'
                      }`}
                    >
                      <svg
                        className="w-8 h-8 fill-current"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {qualityRating === 0 && 'Select a rating'}
                  {qualityRating === 1 && 'Very Poor - Major issues'}
                  {qualityRating === 2 && 'Poor - Significant problems'}
                  {qualityRating === 3 && 'Acceptable - Minor issues'}
                  {qualityRating === 4 && 'Good - Meets expectations'}
                  {qualityRating === 5 && 'Excellent - Exceeds expectations'}
                </p>
              </div>

              {/* Quality Issues */}
              <div>
                <label className="text-sm font-medium">Issues Found (if any)</label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {['Damaged', 'Wrong Item', 'Missing Parts', 'Quality Issue', 'Wrong Quantity', 'Late Delivery'].map((issue) => (
                    <button
                      key={issue}
                      type="button"
                      onClick={() => toggleIssue(issue)}
                      className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                        qualityIssues.includes(issue)
                          ? 'bg-red-50 border-red-300 text-red-700'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {issue}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-sm font-medium">Detailed Notes *</label>
                <Textarea
                  value={qualityNotes}
                  onChange={(e) => setQualityNotes(e.target.value)}
                  placeholder="Describe the quality of goods received (minimum 10 characters)..."
                  rows={4}
                  className="mt-1"
                />
              </div>

              {/* Rating Guidelines */}
              <div className={`rounded-lg p-3 ${
                qualityRating >= 3 ? 'bg-green-50 border border-green-200' : 
                qualityRating > 0 ? 'bg-red-50 border border-red-200' : 
                'bg-gray-50 border border-gray-200'
              }`}>
                <div className="flex items-start gap-2">
                  {qualityRating >= 3 ? (
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  ) : qualityRating > 0 ? (
                    <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-gray-500 mt-0.5" />
                  )}
                  <p className={`text-sm ${
                    qualityRating >= 3 ? 'text-green-800' : 
                    qualityRating > 0 ? 'text-red-800' : 
                    'text-gray-600'
                  }`}>
                    {qualityRating >= 3 
                      ? 'You can approve the quality. Funds will be released to the supplier.'
                      : qualityRating > 0
                        ? 'Rating ≤2 requires rejection. A dispute will be opened for resolution.'
                        : 'Rate ≥3 to approve, or ≤2 to reject and open a dispute.'
                    }
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowQualityForm(false);
                    setQualityRating(0);
                    setQualityNotes('');
                    setQualityIssues([]);
                  }}
                >
                  Cancel
                </Button>
                {qualityRating <= 2 && qualityRating > 0 && (
                  <Button
                    variant="destructive"
                    onClick={() => handleQualityAssessment('REJECTED')}
                    disabled={actionLoading === 'REJECT' || !qualityNotes.trim() || qualityNotes.length < 10}
                  >
                    {actionLoading === 'REJECT' ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Rejecting...
                      </>
                    ) : (
                      'Reject Quality'
                    )}
                  </Button>
                )}
                {qualityRating >= 3 && (
                  <Button
                    variant="gradient"
                    onClick={() => handleQualityAssessment('APPROVED')}
                    disabled={actionLoading === 'APPROVE' || !qualityNotes.trim() || qualityNotes.length < 10}
                  >
                    {actionLoading === 'APPROVE' ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Approving...
                      </>
                    ) : (
                      'Approve Quality'
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
