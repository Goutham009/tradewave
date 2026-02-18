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
  AlertTriangle,
  RotateCcw,
  User,
  Building2,
  Package,
  DollarSign,
  Truck,
  Star,
  Clock,
  FileText,
  Shield,
  History,
} from 'lucide-react';

interface RequirementData {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  quantity: number;
  unit: string;
  budgetMin?: number;
  budgetMax?: number;
  currency: string;
  deliveryLocation: string;
  deliveryDeadline: string;
  status: string;
  isReorder?: boolean;
  originalTransactionId?: string;
  preferredSupplierId?: string;
  technicalSpecs?: string;
  requiredCertifications?: string[];
  qualityInspectionRequired?: boolean;
  paymentTerms?: string;
  incoterms?: string;
  specialInstructions?: string;
  createdAt: string;
  buyer: {
    id: string;
    name: string;
    companyName?: string;
    email: string;
  };
}

export default function AMVerifyRequirementPage() {
  const params = useParams();
  const router = useRouter();
  const [requirement, setRequirement] = useState<RequirementData | null>(null);
  const [buyerHistory, setBuyerHistory] = useState<any>(null);
  const [originalTransaction, setOriginalTransaction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [amNotes, setAmNotes] = useState('');
  const [checklist, setChecklist] = useState({
    descriptionClear: false,
    specComplete: false,
    budgetRealistic: false,
    timelineFeasible: false,
    docsAttached: false,
  });

  useEffect(() => {
    fetchRequirement();
  }, [params.id]);

  const fetchRequirement = async () => {
    try {
      const res = await fetch(`/api/am/requirements/${params.id}/verify`);
      if (res.ok) {
        const data = await res.json();
        setRequirement(data.requirement);
        setBuyerHistory(data.buyerHistory);
        setOriginalTransaction(data.originalTransaction);
      }
    } catch (error) {
      console.error('Failed to fetch requirement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: 'approve' | 'reject' | 'request_changes') => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/am/requirements/${params.id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, amNotes, checklist }),
      });
      if (res.ok) {
        router.push('/admin/leads');
      }
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const allChecked = Object.values(checklist).every(Boolean);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
      </div>
    );
  }

  if (!requirement) {
    // Demo fallback data
    return <DemoVerifyPage />;
  }

  return <VerifyContent
    requirement={requirement}
    buyerHistory={buyerHistory}
    originalTransaction={originalTransaction}
    amNotes={amNotes}
    setAmNotes={setAmNotes}
    checklist={checklist}
    setChecklist={setChecklist}
    allChecked={allChecked}
    submitting={submitting}
    handleAction={handleAction}
    router={router}
  />;
}

function DemoVerifyPage() {
  const router = useRouter();
  const [amNotes, setAmNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [checklist, setChecklist] = useState({
    descriptionClear: false,
    specComplete: false,
    budgetRealistic: false,
    timelineFeasible: false,
    docsAttached: false,
  });

  const demoReq = {
    id: 'req_demo_001',
    title: 'Industrial Steel Pipes - Grade 304',
    description: 'High-quality stainless steel pipes for construction project. Must meet ASTM A312 standards.',
    category: 'Industrial Materials',
    subcategory: 'Steel Products',
    quantity: 500,
    unit: 'MT',
    budgetMin: 1100,
    budgetMax: 1300,
    currency: 'USD',
    deliveryLocation: 'Mumbai Port (JNPT), India',
    deliveryDeadline: '2026-06-15T00:00:00Z',
    status: 'PENDING_AM_VERIFICATION',
    isReorder: true,
    originalTransactionId: 'txn_001',
    preferredSupplierId: 'sup_001',
    technicalSpecs: 'Grade: 304\nOuter Diameter: 6 inch\nWall Thickness: Schedule 40\nLength: 6m\nStandard: ASTM A312',
    requiredCertifications: ['ISO_9001', 'MTC'],
    qualityInspectionRequired: true,
    paymentTerms: '30% Advance, 70% on Delivery',
    incoterms: 'CIF',
    specialInstructions: 'Bundle packing with end caps. Certificate of origin required.',
    createdAt: new Date().toISOString(),
    buyer: {
      id: 'usr_abc123',
      name: 'John Smith',
      companyName: 'ABC Corp',
      email: 'john@company.com',
    },
  };

  const demoBuyerHistory = {
    totalOrders: 12,
    totalSpent: 5200000,
    completedOrders: 11,
    lastTransaction: { id: 'txn_001', status: 'COMPLETED', amount: 608400, createdAt: '2026-02-10T00:00:00Z' },
    isExistingBuyer: true,
  };

  const demoOriginalTxn = {
    id: 'txn_001',
    amount: 608400,
    status: 'COMPLETED',
    createdAt: '2025-10-01T00:00:00Z',
    quotation: {
      supplier: { id: 'sup_001', name: 'Steel Masters', companyName: 'Steel Masters China Ltd.' },
    },
    review: { overallRating: 5, description: 'Excellent quality, on-time delivery' },
  };

  return <VerifyContent
    requirement={demoReq as any}
    buyerHistory={demoBuyerHistory}
    originalTransaction={demoOriginalTxn}
    amNotes={amNotes}
    setAmNotes={setAmNotes}
    checklist={checklist}
    setChecklist={setChecklist}
    allChecked={Object.values(checklist).every(Boolean)}
    submitting={submitting}
    handleAction={async (action: string) => {
      setSubmitting(true);
      setTimeout(() => {
        setSubmitting(false);
        router.push('/admin/leads');
      }, 1000);
    }}
    router={router}
  />;
}

function VerifyContent({
  requirement, buyerHistory, originalTransaction,
  amNotes, setAmNotes, checklist, setChecklist,
  allChecked, submitting, handleAction, router,
}: any) {
  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">
              Verify {requirement.isReorder ? 'Reorder' : 'New'} Requirement
            </h1>
            {requirement.isReorder && (
              <Badge className="bg-blue-600 text-white">REORDER</Badge>
            )}
            <Badge className="bg-yellow-600 text-white">{requirement.status?.replace(/_/g, ' ')}</Badge>
          </div>
          <p className="text-slate-400 mt-1">{requirement.title}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Requirement Details */}
        <div className="col-span-2 space-y-6">
          {/* Buyer Info */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2">
                <User className="h-5 w-5" />
                Buyer: {requirement.buyer?.companyName || requirement.buyer?.name}
                {buyerHistory?.isExistingBuyer && (
                  <Badge className="bg-green-600 text-white ml-2">Existing Customer</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">Total Orders</p>
                  <p className="text-white text-lg font-bold">{buyerHistory?.totalOrders || 0}</p>
                </div>
                <div>
                  <p className="text-slate-400">Total Spent</p>
                  <p className="text-white text-lg font-bold">
                    ${((buyerHistory?.totalSpent || 0) / 1000000).toFixed(1)}M
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Completed</p>
                  <p className="text-white text-lg font-bold">{buyerHistory?.completedOrders || 0}</p>
                </div>
                <div>
                  <p className="text-slate-400">Good Standing</p>
                  <p className="text-green-400 text-lg font-bold flex items-center gap-1">
                    <Shield className="h-4 w-4" /> YES
                  </p>
                </div>
              </div>
              {buyerHistory?.lastTransaction && (
                <div className="mt-3 pt-3 border-t border-slate-700 text-sm text-slate-400">
                  <History className="h-3 w-3 inline mr-1" />
                  Last order: {new Date(buyerHistory.lastTransaction.createdAt).toLocaleDateString()} -
                  ${Number(buyerHistory.lastTransaction.amount).toLocaleString()}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Original Transaction (if reorder) */}
          {requirement.isReorder && originalTransaction && (
            <Card className="bg-slate-800 border-blue-600/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-blue-400 flex items-center gap-2">
                  <RotateCcw className="h-5 w-5" />
                  Previous Transaction
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-slate-400">Supplier</p>
                    <p className="text-white font-medium">
                      {originalTransaction.quotation?.supplier?.companyName}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">Amount</p>
                    <p className="text-white font-medium">
                      ${Number(originalTransaction.amount).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">Rating</p>
                    <p className="text-yellow-400 font-medium">
                      {'⭐'.repeat(originalTransaction.review?.overallRating || 0)} {originalTransaction.review?.overallRating}/5
                    </p>
                  </div>
                </div>
                {originalTransaction.review?.description && (
                  <div className="bg-slate-700 rounded p-2 mt-2">
                    <p className="text-slate-300 italic">&quot;{originalTransaction.review.description}&quot;</p>
                  </div>
                )}
                <p className="text-slate-400">
                  Completed: {new Date(originalTransaction.createdAt).toLocaleDateString()}
                </p>
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
                  <p className="text-white">{requirement.category}{requirement.subcategory ? ` / ${requirement.subcategory}` : ''}</p>
                </div>
                <div>
                  <p className="text-slate-400">Quantity</p>
                  <p className="text-white font-medium">{requirement.quantity?.toLocaleString()} {requirement.unit}</p>
                </div>
                <div>
                  <p className="text-slate-400">Budget Range</p>
                  <p className="text-white font-medium">
                    {requirement.budgetMin && requirement.budgetMax
                      ? `${requirement.currency} ${Number(requirement.budgetMin).toLocaleString()} - ${Number(requirement.budgetMax).toLocaleString()} per ${requirement.unit}`
                      : 'Not specified'}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-slate-400">Description</p>
                <p className="text-slate-300">{requirement.description}</p>
              </div>

              {requirement.technicalSpecs && (
                <div>
                  <p className="text-slate-400">Technical Specifications</p>
                  <pre className="text-slate-300 whitespace-pre-wrap bg-slate-700 rounded p-2 text-xs mt-1">
                    {requirement.technicalSpecs}
                  </pre>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 flex items-center gap-1"><Truck className="h-3 w-3" /> Delivery</p>
                  <p className="text-white">{requirement.deliveryLocation}</p>
                  <p className="text-slate-400 text-xs">
                    By {new Date(requirement.deliveryDeadline).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 flex items-center gap-1"><DollarSign className="h-3 w-3" /> Payment</p>
                  <p className="text-white">{requirement.paymentTerms || 'Standard'}</p>
                  <p className="text-slate-400 text-xs">{requirement.incoterms || 'N/A'}</p>
                </div>
              </div>

              {requirement.requiredCertifications?.length > 0 && (
                <div>
                  <p className="text-slate-400">Required Certifications</p>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {requirement.requiredCertifications.map((cert: string) => (
                      <Badge key={cert} className="bg-slate-700 text-slate-300">{cert}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {requirement.specialInstructions && (
                <div>
                  <p className="text-slate-400">Special Instructions</p>
                  <p className="text-slate-300">{requirement.specialInstructions}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Verification */}
        <div className="space-y-6">
          {/* Reorder Summary */}
          {requirement.isReorder && (
            <Card className="bg-blue-900/30 border-blue-600/50">
              <CardContent className="pt-4 text-sm">
                <p className="text-blue-400 font-semibold mb-2">Reorder Details</p>
                <div className="space-y-1 text-slate-300">
                  <p>✓ Same product</p>
                  <p>✓ Same quantity</p>
                  <p>✓ Same specifications</p>
                  <p className="text-blue-400">• New delivery date: {new Date(requirement.deliveryDeadline).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Verification Checklist */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Verification Checklist
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { key: 'descriptionClear', label: 'Product description clear' },
                { key: 'specComplete', label: 'Specifications complete' },
                { key: 'budgetRealistic', label: 'Budget realistic' },
                { key: 'timelineFeasible', label: 'Delivery timeline feasible' },
                { key: 'docsAttached', label: 'Documents attached' },
              ].map((item) => (
                <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(checklist as any)[item.key]}
                    onChange={(e) =>
                      setChecklist((prev: any) => ({ ...prev, [item.key]: e.target.checked }))
                    }
                    className="rounded border-slate-600"
                  />
                  <span className="text-sm text-slate-300">{item.label}</span>
                </label>
              ))}
            </CardContent>
          </Card>

          {/* AM Notes */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm">AM Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={amNotes}
                onChange={(e) => setAmNotes(e.target.value)}
                placeholder={requirement.isReorder
                  ? 'Repeat order. Previous transaction went smoothly. Supplier reliable. Approved for direct send.'
                  : 'Existing buyer in good standing. New product category. Specs clear. Approved for admin review.'
                }
                className="bg-slate-700 border-slate-600 text-white min-h-[120px]"
              />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={submitting || !allChecked}
              onClick={() => handleAction('approve')}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {submitting ? 'Submitting...' : 'Approve & Submit to Admin'}
            </Button>
            <Button
              variant="outline"
              className="w-full border-yellow-600 text-yellow-400 hover:bg-yellow-600/10"
              disabled={submitting}
              onClick={() => handleAction('request_changes')}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Request Changes from Buyer
            </Button>
            <Button
              variant="outline"
              className="w-full border-red-600 text-red-400 hover:bg-red-600/10"
              disabled={submitting}
              onClick={() => handleAction('reject')}
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
