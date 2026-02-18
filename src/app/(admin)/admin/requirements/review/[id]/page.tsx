'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Shield,
  ShieldCheck,
  ShieldAlert,
  User,
  Building2,
  Package,
  DollarSign,
  Truck,
  Send,
  Users,
  AlertTriangle,
  Target,
  RotateCcw,
  Clock,
  TrendingUp,
} from 'lucide-react';

export default function AdminRequirementReviewPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [sendTo, setSendTo] = useState<'direct' | 'procurement'>('procurement');
  const [selectedOfficer, setSelectedOfficer] = useState('');
  const [priority, setPriority] = useState('NORMAL');

  // Demo data for preview
  const requirement = {
    id: params.id,
    title: 'Industrial Steel Pipes - Grade 304',
    description: 'High-quality stainless steel pipes for construction project.',
    category: 'Industrial Materials',
    subcategory: 'Steel Products',
    quantity: 500,
    unit: 'MT',
    budgetMin: 1100,
    budgetMax: 1300,
    currency: 'USD',
    deliveryLocation: 'Mumbai Port (JNPT), India',
    deliveryDeadline: '2026-06-15',
    status: 'PENDING_ADMIN_REVIEW',
    isReorder: true,
    originalTransactionId: 'txn_001',
    preferredSupplierId: 'sup_001',
    amVerified: true,
    amVerifiedAt: new Date().toISOString(),
    amNotes: 'Repeat order. Previous transaction went smoothly. Supplier reliable. Approved for direct send.',
    createdAt: new Date().toISOString(),
    buyer: {
      name: 'John Smith',
      companyName: 'ABC Corp',
    },
    preferredSupplier: {
      name: 'Steel Masters',
      companyName: 'Steel Masters China Ltd.',
      rating: 5.0,
      isTrusted: true,
    },
  };

  const buyerRiskProfile = {
    totalOrders: 12,
    totalSpent: 5200000,
    paymentRecord: '100% on-time',
    goodStanding: true,
    riskScore: 'LOW',
    completedOrders: 11,
    avgOrderValue: 433333,
    onTimePaymentRatio: 1.0,
  };

  const originalTransaction = {
    id: 'txn_001',
    amount: 608400,
    status: 'COMPLETED',
    completedAt: '2026-04-07',
    supplier: 'Steel Masters China Ltd.',
    rating: 5,
    review: 'Excellent quality, on-time delivery',
  };

  const procurementOfficers = [
    { id: 'po_priya_001', name: 'Priya Singh' },
    { id: 'po_raj_002', name: 'Raj Patel' },
    { id: 'po_mike_003', name: 'Mike Chen' },
  ];

  useEffect(() => {
    // In production, fetch from API
    setTimeout(() => setLoading(false), 300);
  }, []);

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/requirements/${params.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          adminNotes,
          sendTo,
          assignedProcurementOfficerId: sendTo === 'procurement' ? selectedOfficer : null,
          procurementPriority: priority,
          sentDirectlyToSupplier: sendTo === 'direct',
        }),
      });
      if (res.ok) {
        router.push('/admin/leads');
      }
    } catch (error) {
      console.error('Review failed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    setSubmitting(true);
    try {
      await fetch(`/api/admin/requirements/${params.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', adminNotes }),
      });
      router.push('/admin/leads');
    } catch (error) {
      console.error('Reject failed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">
              Review {requirement.isReorder ? 'Reorder' : 'New'} Requirement
            </h1>
            {requirement.isReorder && (
              <Badge className="bg-blue-600 text-white">REORDER</Badge>
            )}
            {buyerRiskProfile.goodStanding && (
              <Badge className="bg-green-600 text-white">GOOD STANDING</Badge>
            )}
          </div>
          <p className="text-slate-400 mt-1">
            {requirement.buyer.companyName} - {requirement.title}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left: Details */}
        <div className="col-span-2 space-y-6">
          {/* Buyer Risk Profile */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-400" />
                Buyer Risk Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="bg-slate-700 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-white">{buyerRiskProfile.totalOrders}</p>
                  <p className="text-xs text-slate-400">Total Orders</p>
                </div>
                <div className="bg-slate-700 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-white">
                    ${(buyerRiskProfile.totalSpent / 1000000).toFixed(1)}M
                  </p>
                  <p className="text-xs text-slate-400">Total Spent</p>
                </div>
                <div className="bg-slate-700 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-green-400">{buyerRiskProfile.paymentRecord}</p>
                  <p className="text-xs text-slate-400">Payment Record</p>
                </div>
                <div className="bg-slate-700 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-green-400">{buyerRiskProfile.riskScore}</p>
                  <p className="text-xs text-slate-400">Risk Score</p>
                </div>
              </div>

              {/* Risk Assessment */}
              <div className="space-y-2 text-sm">
                <p className="text-slate-400 font-medium mb-2">Risk Assessment:</p>
                {[
                  { check: true, text: 'Existing customer in good standing' },
                  { check: requirement.isReorder, text: 'Repeat supplier with good history' },
                  { check: true, text: 'Similar order value to previous' },
                  { check: true, text: 'No red flags' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {item.check ? (
                      <ShieldCheck className="h-4 w-4 text-green-400" />
                    ) : (
                      <ShieldAlert className="h-4 w-4 text-yellow-400" />
                    )}
                    <span className="text-slate-300">{item.text}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Original Transaction (if reorder) */}
          {requirement.isReorder && (
            <Card className="bg-slate-800 border-blue-600/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-blue-400 flex items-center gap-2">
                  <RotateCcw className="h-5 w-5" />
                  Previous Transaction: {originalTransaction.id}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400">Supplier</p>
                    <p className="text-white font-medium">{originalTransaction.supplier}</p>
                    <Badge className="bg-green-600/20 text-green-400 mt-1">Trusted</Badge>
                  </div>
                  <div>
                    <p className="text-slate-400">Amount</p>
                    <p className="text-white font-medium">${originalTransaction.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Rating</p>
                    <p className="text-yellow-400 font-medium">
                      {'⭐'.repeat(originalTransaction.rating)} {originalTransaction.rating}/5
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">Completed</p>
                    <p className="text-white font-medium">{originalTransaction.completedAt}</p>
                  </div>
                </div>
                {originalTransaction.review && (
                  <div className="bg-slate-700 rounded p-2 mt-3">
                    <p className="text-sm text-slate-300 italic">&quot;{originalTransaction.review}&quot;</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Requirement Details */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2">
                <Package className="h-5 w-5" />
                Requirement Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400">Product</p>
                  <p className="text-white font-medium">{requirement.title}</p>
                </div>
                <div>
                  <p className="text-slate-400">Category</p>
                  <p className="text-white">{requirement.category}</p>
                </div>
                <div>
                  <p className="text-slate-400">Quantity</p>
                  <p className="text-white font-medium">{requirement.quantity} {requirement.unit}</p>
                </div>
                <div>
                  <p className="text-slate-400">Budget Range</p>
                  <p className="text-white font-medium">
                    {requirement.currency} {requirement.budgetMin?.toLocaleString()} - {requirement.budgetMax?.toLocaleString()} / {requirement.unit}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 flex items-center gap-1"><Truck className="h-3 w-3" /> Delivery</p>
                  <p className="text-white">{requirement.deliveryLocation}</p>
                  <p className="text-slate-400 text-xs">By {requirement.deliveryDeadline}</p>
                </div>
                <div>
                  <p className="text-slate-400">Total Value</p>
                  <p className="text-white font-medium">
                    {requirement.currency} {(requirement.budgetMin * requirement.quantity).toLocaleString()} - {(requirement.budgetMax * requirement.quantity).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* AM Verification */}
              {requirement.amVerified && (
                <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-3 mt-4">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <p className="text-green-400 font-medium text-sm">AM Verified</p>
                    <span className="text-xs text-slate-400">
                      {new Date(requirement.amVerifiedAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slate-300 text-sm">{requirement.amNotes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Actions */}
        <div className="space-y-6">
          {/* Requirement Verification */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm">Requirement Verification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {[
                'Product specs clear',
                'Budget market-appropriate',
                'Delivery realistic',
                'No red flags',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-green-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Send To Decision */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm">Send To:</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {requirement.isReorder && requirement.preferredSupplier && (
                <label className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${sendTo === 'direct' ? 'border-blue-500 bg-blue-900/20' : 'border-slate-600 hover:border-slate-500'}">
                  <input
                    type="radio"
                    name="sendTo"
                    checked={sendTo === 'direct'}
                    onChange={() => setSendTo('direct')}
                    className="mt-1"
                  />
                  <div>
                    <p className="text-white font-medium flex items-center gap-2">
                      <Target className="h-4 w-4 text-blue-400" />
                      Direct to {requirement.preferredSupplier.companyName}
                    </p>
                    <p className="text-xs text-slate-400">Faster - preferred supplier relationship</p>
                  </div>
                </label>
              )}

              <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${sendTo === 'procurement' ? 'border-blue-500 bg-blue-900/20' : 'border-slate-600 hover:border-slate-500'}`}>
                <input
                  type="radio"
                  name="sendTo"
                  checked={sendTo === 'procurement'}
                  onChange={() => setSendTo('procurement')}
                  className="mt-1"
                />
                <div>
                  <p className="text-white font-medium flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-400" />
                    Procurement for matching
                  </p>
                  <p className="text-xs text-slate-400">Match with 8-10 suppliers</p>
                </div>
              </label>

              {sendTo === 'procurement' && (
                <div className="space-y-3 mt-2">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Assign to Procurement Officer:</label>
                    <select
                      value={selectedOfficer}
                      onChange={(e) => setSelectedOfficer(e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
                    >
                      <option value="">Select Officer</option>
                      {procurementOfficers.map((o) => (
                        <option key={o.id} value={o.id}>{o.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Priority:</label>
                    <div className="flex gap-2">
                      {['NORMAL', 'HIGH', 'URGENT'].map((p) => (
                        <button
                          key={p}
                          onClick={() => setPriority(p)}
                          className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                            priority === p
                              ? p === 'URGENT' ? 'bg-red-600 text-white' :
                                p === 'HIGH' ? 'bg-orange-600 text-white' :
                                'bg-blue-600 text-white'
                              : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Admin Notes */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm">Admin Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder={requirement.isReorder
                  ? 'Approved. Send directly to supplier.'
                  : 'Trusted buyer. New product. Approved for procurement matching.'
                }
                className="bg-slate-700 border-slate-600 text-white min-h-[100px]"
              />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={submitting}
              onClick={handleApprove}
            >
              <Send className="h-4 w-4 mr-2" />
              {submitting ? 'Processing...' : sendTo === 'direct'
                ? `Approve & Send to ${requirement.preferredSupplier?.companyName || 'Supplier'}`
                : 'Approve & Assign to Procurement'
              }
            </Button>
            <Button
              variant="outline"
              className="w-full border-red-600 text-red-400 hover:bg-red-600/10"
              disabled={submitting}
              onClick={handleReject}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
