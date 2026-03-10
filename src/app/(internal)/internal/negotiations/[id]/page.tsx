'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  MessageSquare,
  Clock,
  Send,
  CheckCircle,
  XCircle,
  Building2,
  User,
  History,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

type NegotiationStatus = 'ACTIVE' | 'COMPLETED' | 'ABANDONED' | 'EXPIRED' | string;

type NegotiationMessage = {
  id: string;
  senderId: string;
  senderRole: string;
  messageType: string;
  content: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

type NegotiationQuotation = {
  id: string;
  supplierName: string;
  supplierLocation: string;
  total: number;
  currency: string;
  status: string;
  leadTime: number;
  deliveryTimeline: number | null;
  isSelected: boolean;
};

type NegotiationThreadDetail = {
  id: string;
  status: NegotiationStatus;
  negotiationPoints: string[];
  buyerComments: string | null;
  requirement: {
    id: string;
    title: string;
    category: string;
    quantity: number;
    unit: string;
  };
  buyer: {
    id: string;
    name: string;
  };
  quotations: NegotiationQuotation[];
  selectedQuotationId: string | null;
  currentAmount: number | null;
  originalAmount: number | null;
  currency: string;
  messages: NegotiationMessage[];
  createdAt: string;
  lastActivity: string;
};

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: 'Active Negotiation', className: 'bg-blue-500/20 text-blue-400' },
  COMPLETED: { label: 'Completed', className: 'bg-green-500/20 text-green-400' },
  ABANDONED: { label: 'Abandoned', className: 'bg-red-500/20 text-red-400' },
  EXPIRED: { label: 'Expired', className: 'bg-slate-500/20 text-slate-300' },
};

const formatCurrency = (amount: number | null, currency = 'USD') => {
  if (amount === null) return 'N/A';
  return `${currency} ${amount.toLocaleString()}`;
};

const senderStyles: Record<string, string> = {
  BUYER: 'bg-blue-500/10 border-blue-500/30',
  ACCOUNT_MANAGER: 'bg-purple-500/10 border-purple-500/30',
  SUPPLIER: 'bg-green-500/10 border-green-500/30',
  SYSTEM: 'bg-slate-700/40 border-slate-600',
};

export default function NegotiationDetailPage() {
  const params = useParams();
  const threadId = params.id as string;

  const [thread, setThread] = useState<NegotiationThreadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draftMessage, setDraftMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [selectingQuotationId, setSelectingQuotationId] = useState<string | null>(null);

  const fetchThread = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/negotiations/${encodeURIComponent(threadId)}`);
      const payload = await response.json();

      if (!response.ok || payload?.status !== 'success' || !payload?.thread) {
        setThread(null);
        setError(payload?.error || 'Failed to load negotiation details');
        return;
      }

      setThread(payload.thread as NegotiationThreadDetail);
    } catch {
      setThread(null);
      setError('Network error while loading negotiation details');
    } finally {
      setLoading(false);
    }
  }, [threadId]);

  useEffect(() => {
    void fetchThread();
  }, [fetchThread]);

  const handleSendMessage = useCallback(async () => {
    if (!thread || !draftMessage.trim() || thread.status !== 'ACTIVE') {
      return;
    }

    try {
      setSending(true);
      setError(null);

      const response = await fetch(`/api/negotiations/${encodeURIComponent(threadId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: draftMessage.trim(),
          messageType: 'TEXT',
        }),
      });

      const payload = await response.json();
      if (!response.ok || payload?.status !== 'success' || !payload?.message) {
        setError(payload?.error || 'Failed to send negotiation message');
        return;
      }

      setThread((prev) =>
        prev
          ? {
              ...prev,
              messages: [...prev.messages, payload.message as NegotiationMessage],
              lastActivity: payload.message.createdAt,
            }
          : prev
      );
      setDraftMessage('');
    } catch {
      setError('Network error while sending message');
    } finally {
      setSending(false);
    }
  }, [draftMessage, thread, threadId]);

  const handleSetStatus = useCallback(
    async (status: 'ACTIVE' | 'COMPLETED' | 'ABANDONED') => {
      if (!thread) return;

      try {
        setUpdatingStatus(true);
        setError(null);

        const response = await fetch(`/api/negotiations/${encodeURIComponent(threadId)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'SET_STATUS', status }),
        });

        const payload = await response.json();
        if (!response.ok || payload?.status !== 'success') {
          setError(payload?.error || 'Failed to update negotiation status');
          return;
        }

        setThread((prev) =>
          prev
            ? {
                ...prev,
                status,
                lastActivity: payload?.thread?.lastActivity || prev.lastActivity,
              }
            : prev
        );
      } catch {
        setError('Network error while updating status');
      } finally {
        setUpdatingStatus(false);
      }
    },
    [thread, threadId]
  );

  const handleSelectQuotation = useCallback(
    async (quotationId: string) => {
      if (!thread || thread.status !== 'ACTIVE') {
        return;
      }

      try {
        setSelectingQuotationId(quotationId);
        setError(null);

        const response = await fetch(`/api/negotiations/${encodeURIComponent(threadId)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'SELECT_QUOTATION', selectedQuotationId: quotationId }),
        });

        const payload = await response.json();
        if (!response.ok || payload?.status !== 'success') {
          setError(payload?.error || 'Failed to set selected quotation');
          return;
        }

        setThread((prev) => {
          if (!prev) return prev;
          const updatedQuotations = prev.quotations.map((quote) => ({
            ...quote,
            isSelected: quote.id === quotationId,
          }));
          const selectedQuote = updatedQuotations.find((quote) => quote.id === quotationId) || null;

          return {
            ...prev,
            selectedQuotationId: quotationId,
            quotations: updatedQuotations,
            currentAmount: selectedQuote ? selectedQuote.total : prev.currentAmount,
            currency: selectedQuote ? selectedQuote.currency : prev.currency,
            lastActivity: payload?.thread?.lastActivity || prev.lastActivity,
          };
        });
      } catch {
        setError('Network error while selecting quotation');
      } finally {
        setSelectingQuotationId(null);
      }
    },
    [thread, threadId]
  );

  const selectedQuotation = useMemo(
    () => thread?.quotations.find((quote) => quote.isSelected) || null,
    [thread]
  );

  const savings =
    thread && thread.originalAmount !== null && thread.currentAmount !== null
      ? thread.originalAmount - thread.currentAmount
      : null;
  const savingsPercent =
    savings !== null && thread && thread.originalAmount !== null && thread.originalAmount > 0
      ? ((savings / thread.originalAmount) * 100).toFixed(1)
      : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    );
  }

  if (error && !thread) {
    return (
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="py-12 text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto" />
          <h2 className="text-xl font-semibold text-white">Unable to load negotiation</h2>
          <p className="text-sm text-slate-400">{error}</p>
          <div className="flex items-center justify-center gap-2">
            <Link href="/internal/negotiations">
              <Button variant="outline" className="border-slate-700">Back</Button>
            </Link>
            <Button onClick={() => void fetchThread()} className="bg-blue-600 hover:bg-blue-700 text-white">
              <RefreshCw className="h-4 w-4 mr-2" />Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!thread) {
    return null;
  }

  const statusConfig =
    STATUS_CONFIG[thread.status] || { label: thread.status, className: 'bg-slate-500/20 text-slate-200' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/internal/negotiations">
            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{thread.requirement.title}</h1>
              <Badge className={statusConfig.className}>{statusConfig.label}</Badge>
            </div>
            <p className="text-slate-400">
              Started {new Date(thread.createdAt).toLocaleDateString()} • Last activity{' '}
              {new Date(thread.lastActivity).toLocaleString()}
            </p>
          </div>
        </div>

        {thread.status === 'ACTIVE' ? (
          <div className="flex gap-2">
            <Button
              onClick={() => void handleSetStatus('ABANDONED')}
              disabled={updatingStatus}
              variant="outline"
              className="border-red-600 text-red-400 hover:bg-red-500/10"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Mark Abandoned
            </Button>
            <Button
              onClick={() => void handleSetStatus('COMPLETED')}
              disabled={updatingStatus}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark Completed
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => void handleSetStatus('ACTIVE')}
            disabled={updatingStatus}
            variant="outline"
            className="border-slate-600 text-slate-200 hover:bg-slate-800"
          >
            Re-open Negotiation
          </Button>
        )}
      </div>

      {error && (
        <Card className="bg-red-950/30 border-red-800">
          <CardContent className="py-3 text-sm text-red-200">{error}</CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-blue-500/30">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-300">Current Negotiated Amount</p>
                  <p className="text-3xl font-bold text-white">
                    {formatCurrency(thread.currentAmount, thread.currency)}
                  </p>
                  {selectedQuotation && (
                    <p className="text-sm text-slate-400">
                      {selectedQuotation.supplierName} • {selectedQuotation.deliveryTimeline || selectedQuotation.leadTime}{' '}
                      days delivery
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-300">Baseline Amount</p>
                  <p className="text-2xl font-bold text-slate-100">
                    {formatCurrency(thread.originalAmount, thread.currency)}
                  </p>
                  <p className="text-sm text-green-400">
                    {savings === null || savingsPercent === null
                      ? 'Savings unavailable'
                      : `${formatCurrency(savings, thread.currency)} (${savingsPercent}% reduction)`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <History className="h-5 w-5 text-blue-400" />
                Negotiation History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {thread.messages.map((message) => {
                  const senderRole = message.senderRole || 'SYSTEM';
                  const senderTone = senderStyles[senderRole] || senderStyles.SYSTEM;
                  const isSupplier = senderRole === 'SUPPLIER';

                  return (
                    <div key={message.id} className={`flex gap-4 ${senderRole === 'BUYER' ? 'flex-row-reverse' : ''}`}>
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          senderRole === 'BUYER'
                            ? 'bg-blue-500/20'
                            : isSupplier
                              ? 'bg-green-500/20'
                              : 'bg-purple-500/20'
                        }`}
                      >
                        {isSupplier ? (
                          <Building2 className="h-5 w-5 text-green-400" />
                        ) : (
                          <User className="h-5 w-5 text-blue-400" />
                        )}
                      </div>

                      <div className={`flex-1 max-w-md ${senderRole === 'BUYER' ? 'text-right' : ''}`}>
                        <div className={`p-4 rounded-lg border ${senderTone}`}>
                          <div className="flex items-center justify-between mb-2 gap-2">
                            <Badge variant="outline" className="text-xs text-slate-300 border-slate-600">
                              {senderRole.replace('_', ' ')}
                            </Badge>
                            <span className="text-xs text-slate-500">
                              {new Date(message.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-slate-100">{message.content}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {thread.messages.length === 0 && (
                  <p className="text-sm text-slate-400">No negotiation messages yet.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-purple-400" />
                Send Negotiation Update
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-slate-400">Message</label>
                <Textarea
                  placeholder="Add an update, counter-offer context, or next step..."
                  value={draftMessage}
                  onChange={(e) => setDraftMessage(e.target.value)}
                  className="mt-1 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>

              <Button
                onClick={() => void handleSendMessage()}
                disabled={!draftMessage.trim() || sending || thread.status !== 'ACTIVE'}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Send className="h-4 w-4 mr-2" />
                {sending ? 'Sending...' : 'Send Negotiation Update'}
              </Button>

              {thread.status !== 'ACTIVE' && (
                <p className="text-xs text-slate-500">
                  Thread is {thread.status.toLowerCase()}. Re-open the thread to continue messaging.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Quotations in Negotiation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {thread.quotations.map((quote) => (
                <div key={quote.id} className="rounded-lg border border-slate-700 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-white">{quote.supplierName}</p>
                      <p className="text-sm text-slate-400">{quote.supplierLocation}</p>
                      <p className="text-sm text-slate-400 mt-1">
                        Delivery: {quote.deliveryTimeline || quote.leadTime} days
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-semibold text-white">
                        {formatCurrency(quote.total, quote.currency)}
                      </p>
                      <Badge className="mt-1 bg-slate-700 text-slate-200">{quote.status}</Badge>
                      {quote.isSelected && (
                        <Badge className="mt-1 ml-2 bg-emerald-500/20 text-emerald-300">Selected</Badge>
                      )}
                    </div>
                  </div>

                  {thread.status === 'ACTIVE' && !quote.isSelected && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 border-slate-600"
                      onClick={() => void handleSelectQuotation(quote.id)}
                      disabled={selectingQuotationId === quote.id}
                    >
                      {selectingQuotationId === quote.id ? 'Selecting...' : 'Set as Current Offer'}
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader><CardTitle className="text-white text-sm">Buyer Details</CardTitle></CardHeader>
            <CardContent>
              <p className="font-medium text-white">{thread.buyer.name}</p>
              <p className="text-sm text-slate-400">Buyer ID: {thread.buyer.id}</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader><CardTitle className="text-white text-sm">Supplier Details</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {thread.quotations.map((quote) => (
                <div key={quote.id} className="rounded border border-slate-700 p-2">
                  <p className="font-medium text-white text-sm">{quote.supplierName}</p>
                  <p className="text-xs text-slate-400">{quote.supplierLocation}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader><CardTitle className="text-white text-sm">Requirement</CardTitle></CardHeader>
            <CardContent>
              <p className="font-medium text-white">{thread.requirement.title}</p>
              <p className="text-sm text-slate-400">
                {thread.requirement.quantity} {thread.requirement.unit}
              </p>
              <p className="text-sm text-slate-400">{thread.requirement.category}</p>
              <p className="text-xs text-slate-500 mt-2">Requirement ID: {thread.requirement.id}</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white text-sm">Negotiation Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-300">
              <p className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-500" />
                Last activity: {new Date(thread.lastActivity).toLocaleString()}
              </p>
              <p>Messages: {thread.messages.length}</p>
              <p>Points: {thread.negotiationPoints.length ? thread.negotiationPoints.join(', ') : 'N/A'}</p>
              {thread.buyerComments && (
                <div className="rounded-lg bg-slate-800/70 border border-slate-700 p-2 mt-2">
                  <p className="text-xs text-slate-400 mb-1">Buyer notes</p>
                  <p className="text-xs text-slate-200">{thread.buyerComments}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
