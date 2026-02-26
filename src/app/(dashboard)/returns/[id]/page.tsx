'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  Link as LinkIcon,
  Package,
  Shield,
  Upload,
  XCircle,
} from 'lucide-react';

type ReturnStatus = 'REQUESTED' | 'PROCESSING' | 'APPROVED' | 'REVIEW_REQUIRED' | 'REJECTED' | 'REFUNDED';

type ReturnTimelineItem = {
  title: string;
  description: string;
  timestamp: string;
  state: 'done' | 'pending' | 'failed';
};

type ReturnDetail = {
  id: string;
  transactionId: string;
  orderNumber: string;
  orderTitle: string;
  reason: string;
  status: ReturnStatus;
  createdAt: string;
  condition: string;
  description: string;
  items: number;
  requestedAmount: number;
  restockingFee: number;
  shippingDeduction: number;
  netRefundAmount: number;
  currency: string;
  expectedResolutionDate: string;
  submittedBy: string;
  assignedReviewer: string;
  evidence: string[];
  timeline: ReturnTimelineItem[];
};

const RETURN_DETAILS: Record<string, ReturnDetail> = {
  'RET-2024-001': {
    id: 'RET-2024-001',
    transactionId: 'TXN-2024-001',
    orderNumber: 'PO-2024-001',
    orderTitle: 'Steel Components for Manufacturing',
    reason: 'DEFECTIVE_PRODUCT',
    status: 'PROCESSING',
    createdAt: '2024-02-02T09:40:00Z',
    condition: 'DAMAGED',
    description:
      '15% of delivered steel sheets show surface cracking and edge corrosion. This lot cannot be used on our production line.',
    items: 5,
    requestedAmount: 1250,
    restockingFee: 75,
    shippingDeduction: 25,
    netRefundAmount: 1150,
    currency: 'USD',
    expectedResolutionDate: '2024-02-09T18:00:00Z',
    submittedBy: 'Demo Company Ltd',
    assignedReviewer: 'Ops Review Team',
    evidence: ['defect-closeup-1.jpg', 'defect-closeup-2.jpg', 'inspection-summary.pdf'],
    timeline: [
      {
        title: 'Return request submitted',
        description: 'Buyer submitted request with product photos and inspection notes.',
        timestamp: '2024-02-02T09:40:00Z',
        state: 'done',
      },
      {
        title: 'Initial validation complete',
        description: 'Operations team validated linked transaction and order eligibility.',
        timestamp: '2024-02-02T10:12:00Z',
        state: 'done',
      },
      {
        title: 'Supplier response pending',
        description: 'Supplier has been notified and response window is active.',
        timestamp: '2024-02-03T08:00:00Z',
        state: 'pending',
      },
    ],
  },
  'RET-2024-002': {
    id: 'RET-2024-002',
    transactionId: 'TXN-2024-002',
    orderNumber: 'PO-2024-002',
    orderTitle: 'Electronic Circuit Boards',
    reason: 'WRONG_ITEM_DELIVERED',
    status: 'APPROVED',
    createdAt: '2024-01-28T11:00:00Z',
    condition: 'OPENED_UNUSED',
    description:
      'Shipment contained 6-layer PCB variant while requirement specified 8-layer industrial boards. Unused and repacked.',
    items: 2,
    requestedAmount: 890,
    restockingFee: 20,
    shippingDeduction: 10,
    netRefundAmount: 860,
    currency: 'USD',
    expectedResolutionDate: '2024-02-01T18:00:00Z',
    submittedBy: 'Demo Company Ltd',
    assignedReviewer: 'Returns Desk',
    evidence: ['packing-slip.jpg', 'sku-mismatch-photo.jpg'],
    timeline: [
      {
        title: 'Return submitted',
        description: 'Buyer submitted wrong-item claim with shipment evidence.',
        timestamp: '2024-01-28T11:00:00Z',
        state: 'done',
      },
      {
        title: 'Approved by reviewer',
        description: 'Claim approved and reverse-logistics arranged.',
        timestamp: '2024-01-29T16:20:00Z',
        state: 'done',
      },
      {
        title: 'Refund queued',
        description: 'Net refund approved and queued for release.',
        timestamp: '2024-01-30T09:00:00Z',
        state: 'pending',
      },
    ],
  },
  'RET-2026-001': {
    id: 'RET-2026-001',
    transactionId: 'TXN-S-003',
    orderNumber: 'SO-2026-003',
    orderTitle: 'Aluminum Sheets - 5mm',
    reason: 'TRANSIT_DAMAGE',
    status: 'REVIEW_REQUIRED',
    createdAt: '2026-03-03T08:10:00Z',
    condition: 'DAMAGED',
    description:
      'Outer pallet straps were cut in transit and 3 bundles show deep corner dents. Need partial claim assessment.',
    items: 3,
    requestedAmount: 2100,
    restockingFee: 0,
    shippingDeduction: 0,
    netRefundAmount: 2100,
    currency: 'USD',
    expectedResolutionDate: '2026-03-08T18:00:00Z',
    submittedBy: 'Rotterdam Trading BV',
    assignedReviewer: 'Claims Specialist',
    evidence: ['pallet-damage-1.jpg', 'pallet-damage-2.jpg', 'carrier-note.pdf'],
    timeline: [
      {
        title: 'Claim initiated',
        description: 'Transit damage claim submitted by buyer after delivery inspection.',
        timestamp: '2026-03-03T08:10:00Z',
        state: 'done',
      },
      {
        title: 'Carrier report requested',
        description: 'Waiting for carrier liability report before final amount approval.',
        timestamp: '2026-03-03T11:45:00Z',
        state: 'pending',
      },
    ],
  },
};

function getStatusBadge(status: ReturnStatus) {
  const map: Record<ReturnStatus, { variant: any; label: string }> = {
    REQUESTED: { variant: 'warning', label: 'Requested' },
    PROCESSING: { variant: 'info', label: 'Processing' },
    APPROVED: { variant: 'success', label: 'Approved' },
    REVIEW_REQUIRED: { variant: 'warning', label: 'Review Required' },
    REJECTED: { variant: 'destructive', label: 'Rejected' },
    REFUNDED: { variant: 'success', label: 'Refunded' },
  };
  const item = map[status];
  return <Badge variant={item.variant}>{item.label}</Badge>;
}

function getReturnById(returnId: string): ReturnDetail {
  const found = RETURN_DETAILS[returnId];
  if (found) {
    return found;
  }

  return {
    id: returnId,
    transactionId: 'TXN-UNKNOWN',
    orderNumber: 'ORDER-UNKNOWN',
    orderTitle: 'Linked order from recent submission',
    reason: 'OTHER',
    status: 'REQUESTED',
    createdAt: new Date().toISOString(),
    condition: 'UNDER_REVIEW',
    description: 'This return was recently submitted and is waiting for first-level validation.',
    items: 0,
    requestedAmount: 0,
    restockingFee: 0,
    shippingDeduction: 0,
    netRefundAmount: 0,
    currency: 'USD',
    expectedResolutionDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    submittedBy: 'Current User',
    assignedReviewer: 'Returns Desk',
    evidence: [],
    timeline: [
      {
        title: 'Return captured',
        description: 'Request received and queued for validation.',
        timestamp: new Date().toISOString(),
        state: 'pending',
      },
    ],
  };
}

export default function ReturnDetailPage() {
  const params = useParams();
  const returnId = params.id as string;
  const ret = getReturnById(returnId);

  const totalDeductions = ret.restockingFee + ret.shippingDeduction;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/returns" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Returns & Claims
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Return Request Details</h1>
          <p className="text-muted-foreground">Return ID {ret.id}</p>
        </div>
        {getStatusBadge(ret.status)}
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Requested Amount</p>
            <p className="text-xl font-bold mt-1">{ret.currency} {ret.requestedAmount.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Net Refund</p>
            <p className="text-xl font-bold mt-1 text-green-600">{ret.currency} {ret.netRefundAmount.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Items Claimed</p>
            <p className="text-xl font-bold mt-1">{ret.items}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Expected Resolution</p>
            <p className="text-sm font-semibold mt-1">{new Date(ret.expectedResolutionDate).toLocaleDateString()}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              Linked Order Context
            </CardTitle>
            <CardDescription>Every return request remains tied to its exact order and transaction.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="rounded-md border p-3">
              <p className="text-muted-foreground">Order</p>
              <Link href={`/orders/${ret.transactionId}`} className="font-medium text-primary hover:underline">
                {ret.orderNumber}
              </Link>
              <p className="text-muted-foreground mt-1">{ret.orderTitle}</p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-muted-foreground">Transaction</p>
              <p className="font-mono">{ret.transactionId}</p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-muted-foreground">Reason</p>
              <p className="font-medium">{ret.reason.replace(/_/g, ' ')}</p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-muted-foreground">Condition</p>
              <p className="font-medium">{ret.condition.replace(/_/g, ' ')}</p>
            </div>
            <div className="rounded-md bg-muted/40 p-3 text-sm flex gap-2">
              <Shield className="h-4 w-4 mt-0.5 text-green-600" />
              Submitted by <span className="font-medium">{ret.submittedBy}</span>. Assigned to{' '}
              <span className="font-medium">{ret.assignedReviewer}</span>.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Refund Breakdown
            </CardTitle>
            <CardDescription>Transparent deductions and net amount preview for this return.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-md border p-3">
              <span className="text-muted-foreground">Requested refund</span>
              <span className="font-medium">{ret.currency} {ret.requestedAmount.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <span className="text-muted-foreground">Restocking fee</span>
              <span className="font-medium text-red-600">-{ret.currency} {ret.restockingFee.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <span className="text-muted-foreground">Shipping deduction</span>
              <span className="font-medium text-red-600">-{ret.currency} {ret.shippingDeduction.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <span className="text-muted-foreground">Total deductions</span>
              <span className="font-medium">{ret.currency} {totalDeductions.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between rounded-md border bg-green-50 p-3">
              <span className="font-medium text-green-700">Net refundable amount</span>
              <span className="font-bold text-green-700">{ret.currency} {ret.netRefundAmount.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Claim Description & Evidence
          </CardTitle>
          <CardDescription>All submitted notes and files used for this claim.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border p-4 text-sm">{ret.description}</div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Uploaded evidence</p>
            {ret.evidence.length > 0 ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {ret.evidence.map((fileName) => (
                  <div key={fileName} className="rounded-md border p-3 text-sm flex items-center justify-between">
                    <span>{fileName}</span>
                    <Button size="sm" variant="outline">Open</Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">No files uploaded yet.</div>
            )}
            <label className="inline-flex items-center gap-2 text-sm border rounded-md px-3 py-2 cursor-pointer hover:bg-muted/40">
              <Upload className="h-4 w-4" />
              Add more evidence
              <input type="file" className="hidden" multiple />
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status Timeline</CardTitle>
          <CardDescription>Step-by-step progress of this return claim.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {ret.timeline.map((event) => (
            <div key={`${event.title}-${event.timestamp}`} className="rounded-md border p-3 flex items-start gap-3">
              {event.state === 'done' && <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />}
              {event.state === 'pending' && <Clock className="h-5 w-5 text-amber-600 mt-0.5" />}
              {event.state === 'failed' && <XCircle className="h-5 w-5 text-red-600 mt-0.5" />}
              <div>
                <p className="font-medium">{event.title}</p>
                <p className="text-sm text-muted-foreground">{event.description}</p>
                <p className="text-xs text-muted-foreground mt-1">{new Date(event.timestamp).toLocaleString()}</p>
              </div>
            </div>
          ))}

          {ret.status === 'REVIEW_REQUIRED' && (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5" />
              Additional reviewer verification is required before final decision.
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          Submitted on {new Date(ret.createdAt).toLocaleString()}
        </p>
        <div className="flex gap-2">
          <Link href={`/orders/${ret.transactionId}`}>
            <Button variant="outline">
              <Package className="mr-2 h-4 w-4" />
              Open Linked Order
            </Button>
          </Link>
          <Link href="/returns">
            <Button variant="gradient">Done</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
