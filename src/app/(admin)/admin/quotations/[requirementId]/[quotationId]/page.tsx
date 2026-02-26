'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  FileText,
  Loader2,
  Send,
  Star,
  ThumbsDown,
  ThumbsUp,
  AlertCircle,
  Banknote,
} from 'lucide-react';

type QuoteStatus =
  | 'SUBMITTED'
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'APPROVED_BY_ADMIN'
  | 'VISIBLE_TO_BUYER'
  | 'VERIFIED'
  | 'SHORTLISTED'
  | 'SENT_TO_BUYER'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'DECLINED'
  | 'IN_NEGOTIATION';

type Quotation = {
  id: string;
  supplierName: string;
  supplierEmail: string;
  supplierRating: number;
  amount: number;
  unitPrice: number;
  quantity: number;
  currency: string;
  status: QuoteStatus;
  validUntil: string;
  createdAt: string;
  deliveryDays: number;
  notes: string;
  adminMarginPercent?: number;
  adminMarginAmount?: number;
  buyerPrice?: number;
  requirementId?: string;
};

const STATUS_CONFIG: Record<string, string> = {
  SUBMITTED: 'bg-blue-500/20 text-blue-400',
  PENDING: 'bg-blue-500/20 text-blue-400',
  UNDER_REVIEW: 'bg-yellow-500/20 text-yellow-400',
  APPROVED_BY_ADMIN: 'bg-green-500/20 text-green-400',
  VISIBLE_TO_BUYER: 'bg-cyan-500/20 text-cyan-400',
  VERIFIED: 'bg-green-500/20 text-green-400',
  SHORTLISTED: 'bg-purple-500/20 text-purple-400',
  SENT_TO_BUYER: 'bg-cyan-500/20 text-cyan-400',
  ACCEPTED: 'bg-emerald-500/20 text-emerald-400',
  REJECTED: 'bg-red-500/20 text-red-400',
  DECLINED: 'bg-red-500/20 text-red-400',
  IN_NEGOTIATION: 'bg-yellow-500/20 text-yellow-400',
};

const DEFAULT_QUOTE: Quotation = {
  id: 'QUO-DEMO-001',
  supplierName: 'Demo Supplier Ltd',
  supplierEmail: 'demo@supplier.com',
  supplierRating: 4.5,
  amount: 10000,
  unitPrice: 100,
  quantity: 100,
  currency: 'USD',
  status: 'SUBMITTED',
  validUntil: new Date(Date.now() + 7 * 86400000).toISOString(),
  createdAt: new Date().toISOString(),
  deliveryDays: 12,
  notes: 'Demo quotation for detail review workflow.',
};

function formatCurrency(value: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(value);
}

export default function AdminQuotationDetailPage() {
  const params = useParams();
  const router = useRouter();

  const requirementId = params.requirementId as string;
  const quotationId = params.quotationId as string;

  const [quote, setQuote] = useState<Quotation>({ ...DEFAULT_QUOTE, id: quotationId });
  const [reviewNote, setReviewNote] = useState('');
  const [marginMode, setMarginMode] = useState<'percent' | 'fixed'>('percent');
  const [marginValue, setMarginValue] = useState<number>(10);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionResult, setActionResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [txnCreating, setTxnCreating] = useState(false);
  const [txnResult, setTxnResult] = useState<{ type: 'success' | 'error'; message: string; transactionId?: string } | null>(null);

  // Fetch real quotation data
  const fetchQuote = useCallback(async () => {
    try {
      const res = await fetch(`/api/quotations/${quotationId}`);
      const data = await res.json();
      if (data.status === 'success' && data.data?.quotation) {
        const q = data.data.quotation;
        setQuote({
          id: q.id,
          supplierName: q.supplier?.companyName || q.supplier?.name || 'Unknown Supplier',
          supplierEmail: q.supplier?.email || '',
          supplierRating: q.supplier?.rating || q.supplier?.totalReviews ? 4.5 : 0,
          amount: Number(q.pricing?.total || q.total || q.amount || 0),
          unitPrice: Number(q.pricing?.unitPrice || q.unitPrice || 0),
          quantity: q.pricing?.quantity || q.quantity || 0,
          currency: q.pricing?.currency || q.currency || 'USD',
          status: q.status,
          validUntil: q.validUntil,
          createdAt: q.createdAt,
          deliveryDays: q.delivery?.leadTime ? parseInt(q.delivery.leadTime) : (q.leadTime || 14),
          notes: q.notes || q.terms || '',
          adminMarginPercent: q.marginPercentage || undefined,
          adminMarginAmount: q.marginAmount ? Number(q.marginAmount) : undefined,
          buyerPrice: q.supplierPricePerUnit ? Number(q.total) : undefined,
          requirementId: q.requirementId || q.requirement?.id,
        });
        if (q.marginPercentage) setMarginValue(q.marginPercentage);
      }
    } catch (err) {
      console.error('Failed to fetch quotation:', err);
    }
  }, [quotationId]);

  useEffect(() => {
    void fetchQuote();
  }, [fetchQuote]);

  // Admin review action (approve/reject/request_revision)
  const handleReviewAction = async (action: 'approve' | 'reject' | 'request_revision') => {
    setActionLoading(action);
    setActionResult(null);
    try {
      const body: Record<string, unknown> = {
        action,
        adminNotes: reviewNote || undefined,
      };
      if (action === 'approve') {
        body.marginType = marginMode === 'percent' ? 'PERCENTAGE' : 'FIXED_AMOUNT';
        body.marginPercentage = marginMode === 'percent' ? marginValue : undefined;
        body.marginAmount = marginMode === 'fixed' ? marginValue : undefined;
      }

      const res = await fetch(`/api/admin/quotations/${quotationId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (res.ok && data.status === 'success') {
        const newStatus = action === 'approve' ? 'APPROVED_BY_ADMIN' : action === 'reject' ? 'REJECTED' : 'UNDER_REVIEW';
        setQuote((prev) => ({ ...prev, status: newStatus as QuoteStatus }));
        if (data.pricing) {
          setQuote((prev) => ({
            ...prev,
            adminMarginPercent: data.pricing.marginType === 'PERCENTAGE' ? marginValue : undefined,
            adminMarginAmount: data.pricing.margin,
            buyerPrice: data.pricing.buyerTotal,
          }));
        }
        setActionResult({ type: 'success', message: action === 'approve' ? 'Quote approved and visible to buyer' : action === 'reject' ? 'Quote rejected' : 'Revision requested' });
      } else {
        setActionResult({ type: 'error', message: data.error || 'Action failed' });
      }
    } catch (err) {
      setActionResult({ type: 'error', message: 'Network error' });
    } finally {
      setActionLoading(null);
    }
  };

  // Create Transaction from accepted quotation
  const handleCreateTransaction = async () => {
    setTxnCreating(true);
    setTxnResult(null);
    try {
      const res = await fetch('/api/admin/transactions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quotationId: quote.id,
          adminNotes: reviewNote || undefined,
          advancePercentage: 30,
        }),
      });
      const data = await res.json();

      if (res.ok && data.status === 'success') {
        setTxnResult({
          type: 'success',
          message: data.message || 'Transaction created successfully',
          transactionId: data.transaction?.id,
        });
      } else {
        setTxnResult({
          type: 'error',
          message: data.error || data.message || 'Failed to create transaction',
        });
      }
    } catch (err) {
      setTxnResult({ type: 'error', message: 'Network error creating transaction' });
    } finally {
      setTxnCreating(false);
    }
  };

  const applyMargin = () => {
    const marginAmount =
      marginMode === 'percent' ? quote.amount * (marginValue / 100) : marginValue;
    const marginPercent =
      marginMode === 'percent' ? marginValue : Number(((marginValue / quote.amount) * 100).toFixed(2));

    setQuote((prev) => ({
      ...prev,
      adminMarginAmount: marginAmount,
      adminMarginPercent: marginPercent,
      buyerPrice: prev.amount + marginAmount,
    }));
  };

  const isAccepted = quote.status === 'ACCEPTED';
  const isTerminal = ['REJECTED', 'DECLINED'].includes(quote.status);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push(`/admin/quotations/${requirementId}`)} className="text-slate-400">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Quotations
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">Quotation Detail</h1>
            <p className="font-mono text-sm text-slate-400">{quote.id}</p>
          </div>
        </div>
        <Badge className={STATUS_CONFIG[quote.status] || 'bg-slate-500/20 text-slate-400'}>{quote.status.replace(/_/g, ' ')}</Badge>
      </div>

      {/* Action result banner */}
      {actionResult && (
        <div className={`rounded-lg border px-4 py-3 text-sm ${actionResult.type === 'success' ? 'border-green-500/30 bg-green-900/20 text-green-300' : 'border-red-500/30 bg-red-900/20 text-red-300'}`}>
          {actionResult.type === 'success' ? <CheckCircle2 className="mr-2 inline h-4 w-4" /> : <AlertCircle className="mr-2 inline h-4 w-4" />}
          {actionResult.message}
        </div>
      )}

      {/* Transaction creation result */}
      {txnResult && (
        <div className={`rounded-lg border px-4 py-3 text-sm ${txnResult.type === 'success' ? 'border-green-500/30 bg-green-900/20 text-green-300' : 'border-red-500/30 bg-red-900/20 text-red-300'}`}>
          {txnResult.type === 'success' ? <CheckCircle2 className="mr-2 inline h-4 w-4" /> : <AlertCircle className="mr-2 inline h-4 w-4" />}
          {txnResult.message}
          {txnResult.transactionId && (
            <Button
              size="sm"
              variant="outline"
              className="ml-3 border-green-500/30 text-green-300"
              onClick={() => router.push(`/admin/transactions/${txnResult.transactionId}`)}
            >
              View Transaction <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="bg-slate-800 border-slate-700 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Supplier Quotation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-lg bg-slate-900 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-white">{quote.supplierName}</p>
                  <p className="text-sm text-slate-400">{quote.supplierEmail}</p>
                </div>
                <div className="flex items-center gap-1 text-yellow-400">
                  <Star className="h-4 w-4 fill-yellow-400" />
                  <span>{quote.supplierRating}</span>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg bg-slate-900 p-4">
                <p className="text-xs text-slate-400">Supplier Price</p>
                <p className="text-xl font-bold text-white">{formatCurrency(quote.amount, quote.currency)}</p>
              </div>
              <div className="rounded-lg bg-slate-900 p-4">
                <p className="text-xs text-slate-400">Unit Price</p>
                <p className="text-xl font-bold text-white">{formatCurrency(quote.unitPrice, quote.currency)}</p>
              </div>
              <div className="rounded-lg bg-slate-900 p-4">
                <p className="text-xs text-slate-400">Delivery</p>
                <p className="text-xl font-bold text-white">{quote.deliveryDays} days</p>
              </div>
            </div>

            {quote.buyerPrice && (
              <div className="rounded-lg border border-green-500/30 bg-green-900/20 p-4">
                <p className="text-xs text-green-300">Buyer Price ({quote.adminMarginPercent}% margin)</p>
                <p className="text-2xl font-bold text-green-300">
                  {formatCurrency(quote.buyerPrice, quote.currency)}
                </p>
                <p className="text-xs text-green-400">Margin amount: {formatCurrency(quote.adminMarginAmount || 0, quote.currency)}</p>
              </div>
            )}

            <div className="rounded-lg bg-slate-900 p-4">
              <p className="mb-1 text-xs text-slate-400">Supplier Notes</p>
              <p className="text-sm text-slate-300">{quote.notes || 'No supplier notes shared.'}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs text-slate-400">Submitted At</p>
                <p className="text-white">{new Date(quote.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Valid Until</p>
                <p className="text-white">{new Date(quote.validUntil).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Create Transaction — shown only when quote is ACCEPTED */}
          {isAccepted && !txnResult?.transactionId && (
            <Card className="bg-emerald-900/30 border-emerald-500/30">
              <CardHeader>
                <CardTitle className="text-emerald-300 text-base flex items-center gap-2">
                  <Banknote className="h-5 w-5" />
                  Create Transaction
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-emerald-200/80">
                  This quotation has been accepted by the buyer. Create a transaction to set up escrow and allow payment.
                </p>
                <Button
                  onClick={handleCreateTransaction}
                  disabled={txnCreating}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  {txnCreating ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</>
                  ) : (
                    <><Banknote className="mr-2 h-4 w-4" /> Create Transaction (30% advance)</>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Review Actions — hidden once accepted or rejected */}
          {!isAccepted && !isTerminal && (
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-base">Review Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  onClick={() => handleReviewAction('approve')}
                  disabled={!!actionLoading}
                  className="w-full justify-start bg-green-600 hover:bg-green-700"
                >
                  {actionLoading === 'approve' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ThumbsUp className="mr-2 h-4 w-4" />}
                  Approve & Send to Buyer
                </Button>
                <Button
                  onClick={() => handleReviewAction('reject')}
                  disabled={!!actionLoading}
                  variant="outline"
                  className="w-full justify-start border-red-600 text-red-400"
                >
                  {actionLoading === 'reject' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ThumbsDown className="mr-2 h-4 w-4" />}
                  Reject Quote
                </Button>
                <Button
                  onClick={() => handleReviewAction('request_revision')}
                  disabled={!!actionLoading}
                  variant="outline"
                  className="w-full justify-start border-yellow-600 text-yellow-300"
                >
                  {actionLoading === 'request_revision' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                  Request Revision
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Margin Controls — hidden once accepted or rejected */}
          {!isAccepted && !isTerminal && (
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-base">Margin Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={marginMode === 'percent' ? 'default' : 'outline'}
                    onClick={() => setMarginMode('percent')}
                    className={marginMode === 'percent' ? 'bg-slate-100 text-slate-900 hover:bg-slate-200' : 'border-slate-600 text-slate-300'}
                  >
                    % Margin
                  </Button>
                  <Button
                    size="sm"
                    variant={marginMode === 'fixed' ? 'default' : 'outline'}
                    onClick={() => setMarginMode('fixed')}
                    className={marginMode === 'fixed' ? 'bg-slate-100 text-slate-900 hover:bg-slate-200' : 'border-slate-600 text-slate-300'}
                  >
                    Fixed
                  </Button>
                </div>
                <Input
                  type="number"
                  min={0}
                  value={marginValue}
                  onChange={(e) => setMarginValue(Number(e.target.value))}
                  className="bg-slate-900 border-slate-700 text-white"
                />
                <Button onClick={applyMargin} className="w-full bg-yellow-600 hover:bg-yellow-700">
                  <DollarSign className="mr-2 h-4 w-4" /> Apply Margin
                </Button>
              </CardContent>
            </Card>
          )}

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-base">Admin Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Textarea
                placeholder="Add review notes, concerns, or internal guidance..."
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                className="min-h-[120px] bg-slate-900 border-slate-700 text-white"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
