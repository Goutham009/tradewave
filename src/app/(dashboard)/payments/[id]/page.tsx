'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  Building2,
  FileText,
  Shield,
  Link as LinkIcon,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Download,
  Upload,
} from 'lucide-react';

type PaymentStatus = 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED';
type PaymentType = 'ESCROW_DEPOSIT' | 'ESCROW_RELEASE' | 'PLATFORM_FEE';

type PaymentEvent = {
  title: string;
  description: string;
  timestamp: string;
  state: 'done' | 'pending' | 'failed';
};

type PaymentDetail = {
  id: string;
  transactionId: string;
  orderNumber: string;
  description: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  type: PaymentType;
  method: string;
  payer: string;
  beneficiary: string;
  createdAt: string;
  referenceNumber: string;
  receiptName?: string;
  receiptUploadedAt?: string;
  agreedTerms?: string;
  availableMethods?: string[];
  notes: string;
  timeline: PaymentEvent[];
};

const PAYMENT_DETAILS: Record<string, PaymentDetail> = {
  'PAY-2024-001': {
    id: 'PAY-2024-001',
    transactionId: 'TXN-2024-001',
    orderNumber: 'PO-2024-001',
    description: 'Steel Components - Escrow Deposit',
    amount: 22500,
    currency: 'USD',
    status: 'SUCCEEDED',
    type: 'ESCROW_DEPOSIT',
    method: 'Bank Transfer',
    payer: 'Demo Company Ltd',
    beneficiary: 'Tradewave Escrow Account',
    createdAt: '2024-01-15T10:30:00Z',
    referenceNumber: 'SWFT-88420011',
    receiptName: 'bank-slip-steel-components.pdf',
    receiptUploadedAt: '2024-01-15T10:12:00Z',
    notes: 'Escrow funded successfully. Supplier notified and production unlocked.',
    timeline: [
      {
        title: 'Payment initiated',
        description: 'Buyer initiated a bank transfer for escrow deposit.',
        timestamp: '2024-01-15T10:10:00Z',
        state: 'done',
      },
      {
        title: 'Receipt uploaded',
        description: 'Bank transfer receipt attached for verification.',
        timestamp: '2024-01-15T10:12:00Z',
        state: 'done',
      },
      {
        title: 'Admin verification complete',
        description: 'Operations team verified transfer and linked it to the order.',
        timestamp: '2024-01-15T10:28:00Z',
        state: 'done',
      },
      {
        title: 'Escrow credited',
        description: 'Funds moved to escrow and marked available.',
        timestamp: '2024-01-15T10:30:00Z',
        state: 'done',
      },
    ],
  },
  'PAY-2024-002': {
    id: 'PAY-2024-002',
    transactionId: 'TXN-2024-002',
    orderNumber: 'PO-2024-002',
    description: 'Electronic Circuit Boards - Escrow Deposit',
    amount: 12500,
    currency: 'USD',
    status: 'SUCCEEDED',
    type: 'ESCROW_DEPOSIT',
    method: 'Credit Card',
    payer: 'Demo Company Ltd',
    beneficiary: 'Tradewave Escrow Account',
    createdAt: '2024-01-14T14:00:00Z',
    referenceNumber: 'CARD-TSX-2024002',
    notes: 'Card payment auto-settled. No additional receipt required.',
    timeline: [
      {
        title: 'Authorization successful',
        description: 'Card payment was authorized by issuing bank.',
        timestamp: '2024-01-14T13:58:00Z',
        state: 'done',
      },
      {
        title: 'Captured to escrow',
        description: 'Authorized amount captured and allocated to escrow.',
        timestamp: '2024-01-14T14:00:00Z',
        state: 'done',
      },
    ],
  },
  'PAY-2024-003': {
    id: 'PAY-2024-003',
    transactionId: 'TXN-2024-003',
    orderNumber: 'PO-2024-003',
    description: 'Platform Fee - January 2024',
    amount: 450,
    currency: 'USD',
    status: 'SUCCEEDED',
    type: 'PLATFORM_FEE',
    method: 'Auto-deduct',
    payer: 'Demo Company Ltd',
    beneficiary: 'Tradewave Platform',
    createdAt: '2024-01-31T00:00:00Z',
    referenceNumber: 'FEE-2024-01-DEDUCT',
    notes: 'Monthly platform fee deducted from account balance.',
    timeline: [
      {
        title: 'Fee generated',
        description: 'Monthly billing cycle generated platform fee.',
        timestamp: '2024-01-30T23:59:00Z',
        state: 'done',
      },
      {
        title: 'Fee settled',
        description: 'Automatic deduction completed.',
        timestamp: '2024-01-31T00:00:00Z',
        state: 'done',
      },
    ],
  },
  'PAY-R-001': {
    id: 'PAY-R-001',
    transactionId: 'TXN-S-003',
    orderNumber: 'SO-2026-003',
    description: 'Aluminum Sheets - Escrow Release',
    amount: 360000,
    currency: 'USD',
    status: 'SUCCEEDED',
    type: 'ESCROW_RELEASE',
    method: 'Bank Transfer',
    payer: 'Tradewave Escrow Account',
    beneficiary: 'Apex Metals Pvt Ltd',
    createdAt: '2026-03-01T10:00:00Z',
    referenceNumber: 'REL-003-20260301',
    notes: 'Release approved after delivery and quality confirmation.',
    timeline: [
      {
        title: 'Release requested',
        description: 'Escrow release triggered after order completion milestones.',
        timestamp: '2026-03-01T08:15:00Z',
        state: 'done',
      },
      {
        title: 'Compliance checks passed',
        description: 'KYB, dispute, and document checks passed.',
        timestamp: '2026-03-01T09:35:00Z',
        state: 'done',
      },
      {
        title: 'Funds transferred',
        description: 'Payout transferred to supplier bank account.',
        timestamp: '2026-03-01T10:00:00Z',
        state: 'done',
      },
    ],
  },
  'PAY-R-002': {
    id: 'PAY-R-002',
    transactionId: 'TXN-S-001',
    orderNumber: 'SO-2026-001',
    description: 'Steel Pipes - Partial Payment',
    amount: 287500,
    currency: 'USD',
    status: 'PROCESSING',
    type: 'ESCROW_RELEASE',
    method: 'Bank Transfer',
    payer: 'Tradewave Escrow Account',
    beneficiary: 'Apex Metals Pvt Ltd',
    createdAt: '2026-03-10T14:00:00Z',
    referenceNumber: 'REL-001-20260310',
    notes: 'Release is pending final treasury confirmation before settlement.',
    timeline: [
      {
        title: 'Release requested',
        description: 'Supplier payout requested for milestone 2.',
        timestamp: '2026-03-10T13:20:00Z',
        state: 'done',
      },
      {
        title: 'Treasury review',
        description: 'Manual review in progress for bank transfer batch.',
        timestamp: '2026-03-10T14:00:00Z',
        state: 'pending',
      },
      {
        title: 'Funds credited',
        description: 'Funds will be credited after treasury release.',
        timestamp: '2026-03-11T09:00:00Z',
        state: 'pending',
      },
    ],
  },
  'ACT-P-001': {
    id: 'ACT-P-001',
    transactionId: 'TXN-2024-004',
    orderNumber: 'PO-2024-004',
    description: 'Chemical Raw Materials - Escrow deposit pending',
    amount: 15000,
    currency: 'USD',
    status: 'PENDING',
    type: 'ESCROW_DEPOSIT',
    method: 'Bank Transfer',
    payer: 'Demo Company Ltd',
    beneficiary: 'Tradewave Escrow Account',
    createdAt: '2024-02-05T09:30:00Z',
    referenceNumber: 'ACT-P-001-ESCROW',
    agreedTerms: 'Advance escrow deposit now. Remaining settlement follows agreed LC/credit milestones.',
    availableMethods: ['Advance', 'Letter of Credit', 'Trade Credit', 'Bank Transfer'],
    notes: 'Awaiting buyer action. Select the agreed payment structure before funding escrow.',
    timeline: [
      {
        title: 'Payment request created',
        description: 'Order moved to escrow funding stage with method options based on contract terms.',
        timestamp: '2024-02-05T09:30:00Z',
        state: 'done',
      },
      {
        title: 'Awaiting buyer payment instruction',
        description: 'Choose advance/LC/credit path and submit the supporting details.',
        timestamp: '2024-02-05T09:35:00Z',
        state: 'pending',
      },
    ],
  },
  'ACT-P-002': {
    id: 'ACT-P-002',
    transactionId: 'TXN-2024-002',
    orderNumber: 'PO-2024-002',
    description: 'Electronic Circuit Boards - Escrow top-up',
    amount: 2500,
    currency: 'USD',
    status: 'PROCESSING',
    type: 'ESCROW_DEPOSIT',
    method: 'Card',
    payer: 'Demo Company Ltd',
    beneficiary: 'Tradewave Escrow Account',
    createdAt: '2024-02-06T11:10:00Z',
    referenceNumber: 'ACT-P-002-TOPUP',
    agreedTerms: 'Top-up requested per order amendment. Settlement terms remain aligned with buyer-supplier agreement.',
    availableMethods: ['Advance', 'Card', 'Bank Transfer'],
    notes: 'Top-up request is under verification after payment instruction submission.',
    timeline: [
      {
        title: 'Top-up requested',
        description: 'Additional escrow amount requested due to revised shipment scope.',
        timestamp: '2024-02-06T10:40:00Z',
        state: 'done',
      },
      {
        title: 'Verification in progress',
        description: 'Ops team is validating submitted payment evidence.',
        timestamp: '2024-02-06T11:10:00Z',
        state: 'pending',
      },
    ],
  },
  'ACT-R-001': {
    id: 'ACT-R-001',
    transactionId: 'TXN-S-001',
    orderNumber: 'SO-2026-001',
    description: 'Steel Pipes - escrow release initiated',
    amount: 287500,
    currency: 'USD',
    status: 'PROCESSING',
    type: 'ESCROW_RELEASE',
    method: 'Bank Transfer',
    payer: 'Tradewave Escrow Account',
    beneficiary: 'Apex Metals Pvt Ltd',
    createdAt: '2026-03-12T10:00:00Z',
    referenceNumber: 'ACT-R-001-REL',
    agreedTerms: 'Release per shipment milestone completion and signed delivery acceptance.',
    availableMethods: ['Escrow Release', 'Bank Transfer'],
    notes: 'Release instruction submitted. Review payout details and confirm once funds land.',
    timeline: [
      {
        title: 'Release initiated',
        description: 'Escrow release process started after milestone completion.',
        timestamp: '2026-03-12T10:00:00Z',
        state: 'done',
      },
      {
        title: 'Awaiting beneficiary confirmation',
        description: 'Confirm payout in this detail view once funds are credited.',
        timestamp: '2026-03-12T10:05:00Z',
        state: 'pending',
      },
    ],
  },
  'ACT-R-002': {
    id: 'ACT-R-002',
    transactionId: 'TXN-S-002',
    orderNumber: 'SO-2026-002',
    description: 'Copper Wire - release under admin review',
    amount: 1760000,
    currency: 'USD',
    status: 'PROCESSING',
    type: 'ESCROW_RELEASE',
    method: 'Bank Transfer',
    payer: 'Tradewave Escrow Account',
    beneficiary: 'Apex Metals Pvt Ltd',
    createdAt: '2026-03-18T09:15:00Z',
    referenceNumber: 'ACT-R-002-REL',
    agreedTerms: 'Release blocked until final admin treasury checks are complete.',
    availableMethods: ['Escrow Release', 'Bank Transfer'],
    notes: 'Admin treasury review in progress. Confirmation will unlock final settlement step.',
    timeline: [
      {
        title: 'Release requested',
        description: 'Payout request submitted from order completion workflow.',
        timestamp: '2026-03-18T09:15:00Z',
        state: 'done',
      },
      {
        title: 'Admin treasury review',
        description: 'Manual checks running before payout can be marked settled.',
        timestamp: '2026-03-18T09:30:00Z',
        state: 'pending',
      },
    ],
  },
};

function getStatusBadge(status: PaymentStatus) {
  const map: Record<PaymentStatus, { variant: any; label: string }> = {
    PENDING: { variant: 'warning', label: 'Pending' },
    PROCESSING: { variant: 'info', label: 'Processing' },
    SUCCEEDED: { variant: 'success', label: 'Succeeded' },
    FAILED: { variant: 'destructive', label: 'Failed' },
    REFUNDED: { variant: 'secondary', label: 'Refunded' },
  };
  const item = map[status];
  return <Badge variant={item.variant}>{item.label}</Badge>;
}

function getPaymentById(paymentId: string): PaymentDetail {
  const existing = PAYMENT_DETAILS[paymentId];
  if (existing) {
    return existing;
  }

  return {
    id: paymentId,
    transactionId: 'TXN-UNKNOWN',
    orderNumber: 'ORDER-UNKNOWN',
    description: 'Payment record generated from recent activity',
    amount: 0,
    currency: 'USD',
    status: 'PROCESSING',
    type: 'ESCROW_DEPOSIT',
    method: 'Bank Transfer',
    payer: 'Unknown payer',
    beneficiary: 'Unknown beneficiary',
    createdAt: new Date().toISOString(),
    referenceNumber: `REF-${paymentId}`,
    notes: 'This record is temporary and was generated from an in-session action.',
    timeline: [
      {
        title: 'Payment action captured',
        description: 'Payment was initiated from the payments dashboard.',
        timestamp: new Date().toISOString(),
        state: 'pending',
      },
    ],
  };
}

export default function PaymentDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const paymentId = params.id as string;
  const view = searchParams.get('view') === 'received' ? 'received' : 'paid';
  const isActionMode = searchParams.get('mode') === 'action';
  const payment = getPaymentById(paymentId);
  const [fundsConfirmed, setFundsConfirmed] = useState(payment.status === 'SUCCEEDED');
  const availableMethods = payment.availableMethods?.length ? payment.availableMethods : [payment.method];
  const agreedTerms = payment.agreedTerms || 'Follow the mutually agreed payment terms between buyer and supplier for this order.';
  const showReceivedConfirmation = view === 'received' && payment.type === 'ESCROW_RELEASE';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href={`/payments?view=${view}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to {view === 'received' ? 'Payments Received' : 'Payments Made'}
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Payment Details</h1>
          <p className="text-muted-foreground">Payment ID {payment.id}</p>
        </div>
        <div className="flex items-center gap-2">
          {showReceivedConfirmation && fundsConfirmed && <Badge variant="success">Confirmed by You</Badge>}
          {isActionMode && <Badge variant="info">Action Required</Badge>}
          {getStatusBadge(payment.status)}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Amount</p>
            <p className="text-2xl font-bold mt-1">
              {payment.type === 'ESCROW_RELEASE' ? '+' : '-'}{payment.currency} {payment.amount.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{payment.description}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Method</p>
            <p className="text-lg font-semibold mt-1 flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              {payment.method}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Ref: {payment.referenceNumber}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Created On</p>
            <p className="text-lg font-semibold mt-1 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {new Date(payment.createdAt).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Settlement Terms & Actions
          </CardTitle>
          <CardDescription>
            Final payment execution happens here based on buyer-supplier agreed terms (advance, LC, credit, or release milestones).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Agreed Terms</p>
            <p className="text-sm mt-1">{agreedTerms}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {availableMethods.map((method) => (
              <Badge key={method} variant="outline">{method}</Badge>
            ))}
          </div>

          {view === 'paid' ? (
            <div className="rounded-md border p-3 text-sm text-muted-foreground">
              Choose the agreed method and complete payment evidence in this detail view. For bank transfer, upload the transfer proof below.
            </div>
          ) : (
            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={() => setFundsConfirmed(true)}
                disabled={fundsConfirmed}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {fundsConfirmed ? 'Funds Received Confirmed' : 'Confirm Funds Received'}
              </Button>
              <p className="text-xs text-muted-foreground">
                Confirm only after your bank confirms the credited payout amount.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              Linked Order & Transaction
            </CardTitle>
            <CardDescription>Every payment is explicitly mapped to an order and transaction reference.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between border rounded-md p-3">
              <span className="text-muted-foreground">Order ID</span>
              <Link href={`/orders/${payment.transactionId}`} className="font-mono text-primary hover:underline">
                {payment.orderNumber}
              </Link>
            </div>
            <div className="flex items-center justify-between border rounded-md p-3">
              <span className="text-muted-foreground">Transaction ID</span>
              <Link href={`/orders/${payment.transactionId}`} className="font-mono text-primary hover:underline">
                {payment.transactionId}
              </Link>
            </div>
            <div className="flex items-center justify-between border rounded-md p-3">
              <span className="text-muted-foreground">Payer</span>
              <span className="font-medium">{payment.payer}</span>
            </div>
            <div className="flex items-center justify-between border rounded-md p-3">
              <span className="text-muted-foreground">Beneficiary</span>
              <span className="font-medium">{payment.beneficiary}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Receipt & Verification
            </CardTitle>
            <CardDescription>
              {view === 'paid'
                ? 'Upload and verification state for bank-transfer based records.'
                : 'Payout confirmation and settlement evidence for received funds.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {view === 'paid' ? (
              payment.receiptName ? (
                <div className="rounded-md border p-3 space-y-2">
                  <p className="text-sm font-medium">Uploaded receipt</p>
                  <p className="text-sm text-muted-foreground">{payment.receiptName}</p>
                  {payment.receiptUploadedAt && (
                    <p className="text-xs text-muted-foreground">Uploaded on {new Date(payment.receiptUploadedAt).toLocaleString()}</p>
                  )}
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download receipt
                  </Button>
                </div>
              ) : (
                <div className="rounded-md border border-dashed p-3">
                  <p className="text-sm text-muted-foreground mb-2">No receipt attached yet.</p>
                  <label className="inline-flex items-center gap-2 text-sm border rounded-md px-3 py-2 cursor-pointer hover:bg-muted/40">
                    <Upload className="h-4 w-4" />
                    Upload receipt
                    <input type="file" className="hidden" />
                  </label>
                </div>
              )
            ) : (
              <div className="rounded-md border p-3 space-y-2">
                <p className="text-sm font-medium">Payout settlement record</p>
                <p className="text-sm text-muted-foreground">Reference: {payment.referenceNumber}</p>
                <p className="text-xs text-muted-foreground">
                  {fundsConfirmed ? 'Supplier confirmation captured in this view.' : 'Awaiting supplier confirmation in this view.'}
                </p>
              </div>
            )}
            <div className="rounded-md bg-muted/40 p-3 text-sm flex gap-2">
              <Shield className="h-4 w-4 mt-0.5 text-green-600" />
              <span>{payment.notes}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Timeline</CardTitle>
          <CardDescription>Audit trail of payment processing, verification, and settlement.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {payment.timeline.map((event) => (
            <div key={`${event.title}-${event.timestamp}`} className="flex items-start gap-3 rounded-md border p-3">
              {event.state === 'done' && <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />}
              {event.state === 'pending' && <Clock className="h-5 w-5 text-amber-600 mt-0.5" />}
              {event.state === 'failed' && <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />}
              <div>
                <p className="font-medium">{event.title}</p>
                <p className="text-sm text-muted-foreground">{event.description}</p>
                <p className="text-xs text-muted-foreground mt-1">{new Date(event.timestamp).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Link href={`/orders/${payment.transactionId}`}>
          <Button variant="outline">
            <Building2 className="mr-2 h-4 w-4" />
            Open Linked Order
          </Button>
        </Link>
        <Link href={`/payments?view=${view}`}>
          <Button variant="gradient">Done</Button>
        </Link>
      </div>
    </div>
  );
}
