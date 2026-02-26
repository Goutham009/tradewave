'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ArrowLeft,
  AlertCircle,
  DollarSign,
  User,
  Building2,
  CheckCircle,
  AlertTriangle,
  FileText,
  Send,
  Loader2,
  Eye,
  ShieldCheck,
  FileCheck,
  Clock,
} from 'lucide-react';

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  completed: boolean;
  required: boolean;
}

interface PaymentDocument {
  id: string;
  label: string;
  type: 'LC' | 'PAYMENT_RECEIPT' | 'INVOICE' | 'DELIVERY_PROOF';
  uploadedBy: string;
  uploadedAt: string;
  url: string;
  requiredForApproval: boolean;
}

const MOCK_TRANSACTION = {
  id: 'TXN-2024-001',
  orderId: 'ORD-2024-001',
  requirementTitle: 'Steel Coils - Grade A',
  buyer: { name: 'John Smith', company: 'Acme Corporation', email: 'john@acmecorp.com' },
  supplier: { name: 'Zhang Wei', company: 'Shanghai Steel Works', email: 'supplier1@steelworks.cn' },
  amount: 25000,
  adminMargin: 2500,
  supplierAmount: 22500,
  currency: 'USD',
  status: 'PAYMENT_PENDING',
  paymentMethod: 'Bank Transfer',
  createdAt: '2024-02-15T10:00:00Z',
};

const MOCK_DOCUMENTS: PaymentDocument[] = [
  {
    id: 'doc-lc-001',
    label: 'Buyer LC Document',
    type: 'LC',
    uploadedBy: 'John Smith',
    uploadedAt: '2024-02-15T11:05:00Z',
    url: '/mock-docs/lc-document.pdf',
    requiredForApproval: true,
  },
  {
    id: 'doc-pay-001',
    label: 'Bank Payment Receipt',
    type: 'PAYMENT_RECEIPT',
    uploadedBy: 'John Smith',
    uploadedAt: '2024-02-15T11:18:00Z',
    url: '/mock-docs/payment-receipt.pdf',
    requiredForApproval: true,
  },
  {
    id: 'doc-inv-001',
    label: 'Supplier Proforma Invoice',
    type: 'INVOICE',
    uploadedBy: 'Shanghai Steel Works',
    uploadedAt: '2024-02-15T12:00:00Z',
    url: '/mock-docs/proforma-invoice.pdf',
    requiredForApproval: false,
  },
];

const INITIAL_CHECKLIST: ChecklistItem[] = [
  { id: 'kyb_verified', label: 'Buyer KYB Verified', description: 'Confirm buyer has completed KYB verification', completed: true, required: true },
  { id: 'quote_accepted', label: 'Quote Accepted', description: 'Buyer has accepted the quotation', completed: true, required: true },
  { id: 'payment_received', label: 'Payment Received', description: 'Confirm buyer payment has been received in escrow', completed: false, required: true },
  { id: 'payment_verified', label: 'Payment Amount Verified', description: 'Verify payment amount matches invoice', completed: false, required: true },
  { id: 'supplier_notified', label: 'Supplier Notified', description: 'Supplier has been notified to begin production', completed: false, required: true },
  { id: 'production_started', label: 'Production Started', description: 'Supplier has confirmed production start', completed: false, required: false },
  { id: 'quality_check', label: 'Quality Check Scheduled', description: 'Quality inspection scheduled before shipment', completed: false, required: false },
  { id: 'shipping_arranged', label: 'Shipping Arranged', description: 'Logistics and shipping have been arranged', completed: false, required: false },
  { id: 'delivery_confirmed', label: 'Delivery Confirmed', description: 'Buyer has confirmed receipt of goods', completed: false, required: true },
  { id: 'supplier_paid', label: 'Supplier Paid', description: 'Release payment to supplier', completed: false, required: true },
];

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PAYMENT_PENDING: { label: 'Awaiting Payment', color: 'bg-yellow-500/20 text-yellow-400' },
  BUYER_PAID: { label: 'Buyer Paid', color: 'bg-blue-500/20 text-blue-400' },
  IN_ESCROW: { label: 'In Escrow', color: 'bg-purple-500/20 text-purple-400' },
  SUPPLIER_PAID: { label: 'Supplier Paid', color: 'bg-green-500/20 text-green-400' },
  COMPLETED: { label: 'Completed', color: 'bg-emerald-500/20 text-emerald-400' },
  REFUNDED: { label: 'Refunded', color: 'bg-orange-500/20 text-orange-400' },
  DISPUTED: { label: 'Disputed', color: 'bg-red-500/20 text-red-400' },
};

export default function PaymentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [transaction, setTransaction] = useState(MOCK_TRANSACTION);
  const [documents] = useState<PaymentDocument[]>(MOCK_DOCUMENTS);
  const [viewedDocuments, setViewedDocuments] = useState<Record<string, boolean>>({});
  const [checklist, setChecklist] = useState<ChecklistItem[]>(INITIAL_CHECKLIST);
  const [saving, setSaving] = useState(false);
  const [approving, setApproving] = useState(false);
  const [approvalNote, setApprovalNote] = useState('');

  const completedCount = checklist.filter(item => item.completed).length;
  const requiredCount = checklist.filter(item => item.required).length;
  const requiredCompleted = checklist.filter(item => item.required && item.completed).length;
  const progress = Math.round((completedCount / checklist.length) * 100);
  const requiredDocuments = documents.filter((doc) => doc.requiredForApproval);
  const viewedRequiredDocuments = requiredDocuments.filter((doc) => viewedDocuments[doc.id]).length;
  const canApprovePayment = viewedRequiredDocuments === requiredDocuments.length && requiredCompleted === requiredCount;

  const toggleItem = (itemId: string) => {
    setChecklist(prev => prev.map(item => 
      item.id === itemId ? { ...item, completed: !item.completed } : item
    ));
  };

  const handleSaveChecklist = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    alert('Checklist saved successfully');
  };

  const handleViewDocument = (document: PaymentDocument) => {
    setViewedDocuments((prev) => ({ ...prev, [document.id]: true }));
    window.open(document.url, '_blank', 'noopener,noreferrer');
  };

  const handleApprovePayment = async () => {
    if (!canApprovePayment) return;

    setApproving(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setTransaction((prev) => ({ ...prev, status: 'BUYER_PAID' }));
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === 'payment_received' || item.id === 'payment_verified'
          ? { ...item, completed: true }
          : item
      )
    );
    setApproving(false);
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()} className="text-slate-400">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">Transaction Details</h1>
            <p className="text-slate-400 font-mono">{transaction.id}</p>
          </div>
        </div>
        <Badge className={STATUS_CONFIG[transaction.status]?.color || 'bg-slate-500/20 text-slate-400'}>
          {STATUS_CONFIG[transaction.status]?.label || transaction.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Transaction Info */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Transaction Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-400">Requirement</p>
                  <p className="text-white font-medium">{transaction.requirementTitle}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Order ID</p>
                  <p className="text-white font-mono">{transaction.orderId}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Payment Method</p>
                  <p className="text-white">{transaction.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Created</p>
                  <p className="text-white">{new Date(transaction.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700">
                <div className="bg-slate-900 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-blue-400" />
                    <p className="text-sm text-slate-400">Buyer</p>
                  </div>
                  <p className="text-white font-medium">{transaction.buyer.name}</p>
                  <p className="text-sm text-slate-400">{transaction.buyer.company}</p>
                  <p className="text-xs text-slate-500">{transaction.buyer.email}</p>
                </div>
                <div className="bg-slate-900 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="h-4 w-4 text-purple-400" />
                    <p className="text-sm text-slate-400">Supplier</p>
                  </div>
                  <p className="text-white font-medium">{transaction.supplier.name}</p>
                  <p className="text-sm text-slate-400">{transaction.supplier.company}</p>
                  <p className="text-xs text-slate-500">{transaction.supplier.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Buyer Uploaded Documents */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileCheck className="h-5 w-5" />
                Submitted Payment Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {documents.map((document) => (
                  <div
                    key={document.id}
                    className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900 p-4"
                  >
                    <div>
                      <p className="font-medium text-white">{document.label}</p>
                      <p className="text-xs text-slate-400">
                        {document.type.replace('_', ' ')} • Uploaded by {document.uploadedBy} on {new Date(document.uploadedAt).toLocaleString()}
                      </p>
                      {document.requiredForApproval && (
                        <Badge className="mt-2 bg-red-500/20 text-red-400">Required for payment approval</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {viewedDocuments[document.id] ? (
                        <Badge className="bg-green-500/20 text-green-400">Viewed</Badge>
                      ) : (
                        <Badge className="bg-yellow-500/20 text-yellow-400">Not viewed</Badge>
                      )}
                      <Button
                        variant="outline"
                        className="border-slate-600 text-slate-300"
                        onClick={() => handleViewDocument(document)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Checklist */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Transaction Checklist
                </CardTitle>
                <div className="text-sm text-slate-400">
                  {completedCount}/{checklist.length} completed
                </div>
              </div>
              {/* Progress Bar */}
              <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {checklist.map((item) => (
                  <div 
                    key={item.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                      item.completed 
                        ? 'bg-green-500/10 border-green-500/30' 
                        : 'bg-slate-900 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <Checkbox
                      checked={item.completed}
                      onCheckedChange={() => toggleItem(item.id)}
                      className="mt-0.5 border-slate-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`font-medium ${item.completed ? 'text-green-400' : 'text-white'}`}>
                          {item.label}
                        </p>
                        {item.required && (
                          <Badge className="bg-red-500/20 text-red-400 text-xs">Required</Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-400">{item.description}</p>
                    </div>
                    {item.completed && (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end mt-4 pt-4 border-t border-slate-700">
                <Button onClick={handleSaveChecklist} disabled={saving} className="bg-green-600 hover:bg-green-700">
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Save Checklist
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Financial Summary */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Financial Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Amount</span>
                <span className="text-white font-bold text-xl">{formatCurrency(transaction.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Admin Margin</span>
                <span className="text-green-400">+{formatCurrency(transaction.adminMargin)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-700 pt-4">
                <span className="text-slate-400">Supplier Payout</span>
                <span className="text-purple-400 font-medium">{formatCurrency(transaction.supplierAmount)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Approval Guard */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-base flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                Approval Guardrails
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Required docs viewed</span>
                <span className={viewedRequiredDocuments === requiredDocuments.length ? 'text-green-400' : 'text-yellow-400'}>
                  {viewedRequiredDocuments}/{requiredDocuments.length}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Required checklist done</span>
                <span className={requiredCompleted === requiredCount ? 'text-green-400' : 'text-yellow-400'}>
                  {requiredCompleted}/{requiredCount}
                </span>
              </div>

              <textarea
                value={approvalNote}
                onChange={(e) => setApprovalNote(e.target.value)}
                placeholder="Add internal approval note..."
                className="min-h-[90px] w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-500"
              />

              {!canApprovePayment && (
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="mt-0.5 h-4 w-4" />
                    Review all required buyer uploads and complete mandatory checks before approving payment received.
                  </div>
                </div>
              )}

              <Button
                onClick={handleApprovePayment}
                disabled={!canApprovePayment || approving}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {approving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Approving Payment...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve Payment Received
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Status Summary */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Checklist Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Required Items</span>
                <span className={requiredCompleted === requiredCount ? 'text-green-400' : 'text-yellow-400'}>
                  {requiredCompleted}/{requiredCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Optional Items</span>
                <span className="text-slate-300">
                  {completedCount - requiredCompleted}/{checklist.length - requiredCount}
                </span>
              </div>
              {requiredCompleted < requiredCount && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mt-2">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5" />
                    <p className="text-sm text-yellow-200">
                      Complete all required items before proceeding.
                    </p>
                  </div>
                </div>
              )}
              {requiredCompleted === requiredCount && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mt-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400 mt-0.5" />
                    <p className="text-sm text-green-200">
                      All required items completed!
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Settlement Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full border-slate-600 text-slate-300 justify-start">
                <Send className="h-4 w-4 mr-2" />
                Send Payment Reminder
              </Button>
              <Button variant="outline" className="w-full border-slate-600 text-slate-300 justify-start">
                <Clock className="h-4 w-4 mr-2" />
                Escrow Release Timeline
              </Button>
              <Button variant="outline" className="w-full border-slate-600 text-slate-300 justify-start">
                <User className="h-4 w-4 mr-2" />
                Contact Buyer
              </Button>
              <Button variant="outline" className="w-full border-slate-600 text-slate-300 justify-start">
                <Building2 className="h-4 w-4 mr-2" />
                Contact Supplier
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
