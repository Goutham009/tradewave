'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  ArrowUpRight,
  Loader2,
  Package,
  FileText,
  AlertCircle,
} from 'lucide-react';

interface AdminQuotationRow {
  id: string;
  requirementId: string;
  requirementTitle: string;
  requirementQuantity: number;
  requirementUnit: string;
  requirementCreatedAt: string | null;
  buyerName: string;
  buyerCompany?: string;
  buyerEmail: string;
  category: string;
  supplierName: string;
  supplierEmail: string;
  amount: number;
  unitPrice: number;
  quantity: number;
  currency: string;
  status: string;
  validUntil: string;
  createdAt: string;
  leadTime?: number;
  notes?: string;
}

interface Quotation {
  id: string;
  supplierName: string;
  supplierEmail: string;
  amount: number;
  unitPrice: number;
  quantity: number;
  currency: string;
  status: string;
  validUntil: string;
  createdAt: string;
  deliveryDays: number;
  notes: string;
}

interface Requirement {
  id: string;
  title: string;
  buyerName: string;
  buyerEmail: string;
  buyerCompany: string;
  category: string;
  quantity: number;
  unit: string;
  description: string;
  createdAt: string;
  status: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  SUBMITTED: { label: 'Submitted', color: 'bg-blue-500/20 text-blue-400' },
  PENDING: { label: 'Pending', color: 'bg-blue-500/20 text-blue-400' },
  UNDER_REVIEW: { label: 'Under Review', color: 'bg-yellow-500/20 text-yellow-400' },
  APPROVED_BY_ADMIN: { label: 'Approved by Admin', color: 'bg-green-500/20 text-green-400' },
  VISIBLE_TO_BUYER: { label: 'Visible to Buyer', color: 'bg-cyan-500/20 text-cyan-400' },
  VERIFIED: { label: 'Verified', color: 'bg-emerald-500/20 text-emerald-400' },
  SHORTLISTED: { label: 'Shortlisted', color: 'bg-purple-500/20 text-purple-400' },
  SENT_TO_BUYER: { label: 'Sent to Buyer', color: 'bg-cyan-500/20 text-cyan-400' },
  ACCEPTED: { label: 'Accepted', color: 'bg-emerald-500/20 text-emerald-400' },
  REJECTED: { label: 'Rejected', color: 'bg-red-500/20 text-red-400' },
  DECLINED: { label: 'Declined', color: 'bg-red-500/20 text-red-400' },
  IN_NEGOTIATION: { label: 'In Negotiation', color: 'bg-amber-500/20 text-amber-400' },
};

export default function QuotationDetailPage() {
  const params = useParams();
  const requirementId = params.requirementId as string;

  const [requirement, setRequirement] = useState<Requirement | null>(null);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequirementQuotations = useCallback(async () => {
    if (!requirementId) {
      setRequirement(null);
      setQuotations([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [requirementResponse, quotationsResponse] = await Promise.all([
        fetch(`/api/admin/requirements/${encodeURIComponent(requirementId)}`),
        fetch(`/api/admin/quotations?requirementId=${encodeURIComponent(requirementId)}&limit=200`),
      ]);

      const requirementPayload = await requirementResponse.json();
      const quotationsPayload = await quotationsResponse.json();

      const rows = Array.isArray(quotationsPayload?.data?.quotations)
        ? (quotationsPayload.data.quotations as AdminQuotationRow[])
        : [];

      const scopedRows = rows.filter((row) => row.requirementId === requirementId);

      if (requirementResponse.ok && requirementPayload?.success && requirementPayload?.data) {
        const req = requirementPayload.data;
        setRequirement({
          id: req.id,
          title: req.title,
          buyerName: req?.buyer?.name || req?.buyer?.companyName || 'Unknown Buyer',
          buyerEmail: req?.buyer?.email || '—',
          buyerCompany: req?.buyer?.companyName || req?.buyer?.name || 'Unknown Buyer',
          category: req.category || 'N/A',
          quantity: Number(req.quantity || 0),
          unit: req.unit || '',
          description: req.description || 'No description provided.',
          createdAt: req.createdAt || new Date().toISOString(),
          status: req.status || 'UNKNOWN',
        });
      } else if (scopedRows.length > 0) {
        const first = scopedRows[0];
        setRequirement({
          id: requirementId,
          title: first.requirementTitle || 'Requirement',
          buyerName: first.buyerName || 'Unknown Buyer',
          buyerEmail: first.buyerEmail || '—',
          buyerCompany: first.buyerCompany || first.buyerName || 'Unknown Buyer',
          category: first.category || 'N/A',
          quantity: Number(first.requirementQuantity || 0),
          unit: first.requirementUnit || '',
          description: 'Requirement details unavailable in this view.',
          createdAt: first.requirementCreatedAt || first.createdAt || new Date().toISOString(),
          status: 'UNKNOWN',
        });
      } else {
        setRequirement(null);
      }

      setQuotations(
        scopedRows.map((row) => ({
          id: row.id,
          supplierName: row.supplierName || 'Unknown Supplier',
          supplierEmail: row.supplierEmail || '',
          amount: Number(row.amount || 0),
          unitPrice: Number(row.unitPrice || 0),
          quantity: Number(row.quantity || 0),
          currency: row.currency || 'USD',
          status: row.status || 'SUBMITTED',
          validUntil: row.validUntil,
          createdAt: row.createdAt,
          deliveryDays: Number(row.leadTime || 0),
          notes: row.notes || '',
        }))
      );

      if (!requirementResponse.ok && !requirementPayload?.success && scopedRows.length === 0) {
        setError(requirementPayload?.error || 'Failed to load requirement details');
      }

      if (!quotationsResponse.ok || quotationsPayload?.status !== 'success') {
        setError(quotationsPayload?.error || 'Failed to load quotations');
      }
    } catch {
      setRequirement(null);
      setQuotations([]);
      setError('Network error while loading requirement quotations');
    } finally {
      setLoading(false);
    }
  }, [requirementId]);

  useEffect(() => {
    void fetchRequirementQuotations();
  }, [fetchRequirementQuotations]);

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(amount);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  if (error && !requirement) {
    return (
      <div className="p-6 text-center space-y-3">
        <AlertCircle className="h-10 w-10 mx-auto text-red-400" />
        <p className="text-slate-300">{error}</p>
        <Button variant="outline" className="border-slate-600 text-slate-200" onClick={() => void fetchRequirementQuotations()}>
          Retry
        </Button>
      </div>
    );
  }

  if (!requirement) {
    return (
      <div className="p-6 text-center">
        <p className="text-slate-400">Requirement not found</p>
        <Link href="/admin/quotations" className="text-blue-400 hover:underline mt-2 inline-block">Back to Quotations</Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/quotations" className="p-2 hover:bg-slate-700 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </Link>
          <div>
            <p className="text-xs font-mono text-slate-500">{requirement.id}</p>
            <h1 className="text-2xl font-bold text-white">{requirement.title}</h1>
            <p className="text-slate-400">{requirement.buyerCompany} • {requirement.category}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {error && <Badge className="bg-red-500/20 text-red-300">Partial data</Badge>}
          <Badge className="bg-slate-700 text-slate-200">{quotations.length} quotations</Badge>
        </div>
      </div>

      {/* Requirement Details */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Package className="w-5 h-5" /> Requirement Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-slate-400">Buyer</p>
              <p className="text-white font-medium">{requirement.buyerName}</p>
              <p className="text-sm text-slate-400">{requirement.buyerEmail}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Quantity Required</p>
              <p className="text-white font-medium">{requirement.quantity.toLocaleString()} {requirement.unit}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Created</p>
              <p className="text-white font-medium">{new Date(requirement.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Status</p>
              <p className="text-white font-medium">{requirement.status.replace(/_/g, ' ')}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs text-slate-400">Description</p>
            <p className="text-slate-300 mt-1">{requirement.description}</p>
          </div>
        </CardContent>
      </Card>

      {/* Quotations */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="w-5 h-5" /> Quotations ({quotations.length})
            </span>
          </CardTitle>
          <CardDescription className="text-slate-400">
            Each quotation shows status only. Open a quote to review, approve, add margin, and take actions.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {quotations.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-slate-600" />
              <p className="text-slate-400">No quotations received yet</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700">
              {quotations.map((q) => {
                return (
                  <div key={q.id} className="p-6 hover:bg-slate-700/30 transition-colors">
                    <div className="flex items-center justify-between gap-6">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                            {q.supplierName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-white">{q.supplierName}</p>
                            <p className="text-xs text-slate-400">{q.supplierEmail}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                          <div className="rounded-lg bg-slate-900 p-3">
                            <p className="text-xs text-slate-400">Supplier Price</p>
                            <p className="text-white font-semibold">{formatCurrency(q.amount, q.currency)}</p>
                          </div>
                          <div className="rounded-lg bg-slate-900 p-3">
                            <p className="text-xs text-slate-400">Delivery</p>
                            <p className="text-white font-semibold">
                              {q.deliveryDays > 0 ? `${q.deliveryDays} days` : '—'}
                            </p>
                          </div>
                          <div className="rounded-lg bg-slate-900 p-3">
                            <p className="text-xs text-slate-400">Valid Until</p>
                            <p className="text-white font-semibold">{new Date(q.validUntil).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <Badge className={STATUS_CONFIG[q.status]?.color || 'bg-slate-500/20 text-slate-400'}>
                          {STATUS_CONFIG[q.status]?.label || q.status}
                        </Badge>
                        <Link href={`/admin/quotations/${requirementId}/${q.id}`}>
                          <Button variant="outline" className="border-slate-600 text-slate-200">
                            Open Quote
                            <ArrowUpRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
