'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  Clock,
  MessageSquare,
  Send,
  Loader2,
  FileText,
  Image as ImageIcon,
  DollarSign,
  User,
  Building2,
  Calendar,
  RefreshCw,
  ExternalLink,
  Scale,
  Gavel,
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pending Review', color: 'bg-yellow-500' },
  UNDER_REVIEW: { label: 'Under Review', color: 'bg-blue-500' },
  AWAITING_RESPONSE: { label: 'Awaiting Response', color: 'bg-purple-500' },
  RESOLVED: { label: 'Resolved', color: 'bg-green-500' },
  CLOSED: { label: 'Closed', color: 'bg-gray-500' },
  ESCALATED: { label: 'Escalated', color: 'bg-red-500' },
};

const DECISION_OPTIONS = [
  { value: 'FULL_REFUND', label: 'Full Refund to Buyer', description: 'Return 100% to buyer', buyerPercent: 100 },
  { value: 'PARTIAL_REFUND', label: 'Partial Refund', description: 'Custom split', buyerPercent: null },
  { value: 'SPLIT_50_50', label: 'Split 50/50', description: 'Equal distribution', buyerPercent: 50 },
  { value: 'FULL_PAYMENT', label: 'Full Payment to Supplier', description: 'Release 100% to supplier', buyerPercent: 0 },
  { value: 'NO_ACTION', label: 'No Action', description: 'Close without fund movement', buyerPercent: null },
];

export default function AdminDisputeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const disputeId = params.id as string;

  const [dispute, setDispute] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Resolution form
  const [showResolutionForm, setShowResolutionForm] = useState(false);
  const [decision, setDecision] = useState('');
  const [resolutionAmount, setResolutionAmount] = useState('');
  const [resolutionReason, setResolutionReason] = useState('');
  const [resolving, setResolving] = useState(false);

  // Message form
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    fetchDispute();
  }, [disputeId]);

  const fetchDispute = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/disputes/${disputeId}`);
      const data = await res.json();

      if (data.success) {
        setDispute(data.dispute);
      } else {
        setError(data.error || 'Failed to fetch dispute');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const refreshDispute = async () => {
    setRefreshing(true);
    await fetchDispute();
    setRefreshing(false);
  };

  const handleResolve = async () => {
    if (!decision) {
      setError('Please select a decision');
      return;
    }
    if (decision === 'PARTIAL_REFUND' && !resolutionAmount) {
      setError('Please enter the refund amount');
      return;
    }
    if (!resolutionReason || resolutionReason.length < 10) {
      setError('Please provide a detailed reason (minimum 10 characters)');
      return;
    }

    setResolving(true);
    setError('');

    try {
      const res = await fetch(`/api/disputes/${disputeId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminDecision: decision,
          resolutionAmount: resolutionAmount ? parseFloat(resolutionAmount) : undefined,
          resolutionReason,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setShowResolutionForm(false);
        await fetchDispute();
      } else {
        setError(data.error || 'Failed to resolve dispute');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setResolving(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    setSendingMessage(true);
    try {
      const res = await fetch(`/api/disputes/${disputeId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage.trim() }),
      });

      const data = await res.json();

      if (data.success) {
        setNewMessage('');
        await fetchDispute();
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSendingMessage(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/disputes/${disputeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        await fetchDispute();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (error && !dispute) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertTriangle className="h-12 w-12 text-red-500" />
          <h3 className="mt-4 text-lg font-semibold text-white">Error Loading Dispute</h3>
          <p className="mt-2 text-sm text-slate-400">{error}</p>
          <Button className="mt-4" onClick={() => router.push('/admin/disputes')}>
            Back to Disputes
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!dispute) return null;

  const transactionAmount = Number(dispute.transaction?.amount || 0);
  const isResolved = dispute.status === 'RESOLVED' || dispute.status === 'CLOSED';
  const statusConfig = STATUS_CONFIG[dispute.status] || STATUS_CONFIG.PENDING;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/disputes">
            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-white">Dispute #{dispute.id.slice(0, 8)}</h1>
              <Badge className={`${statusConfig.color} text-white`}>
                {statusConfig.label}
              </Badge>
            </div>
            <p className="text-slate-400">
              Filed {new Date(dispute.createdAt).toLocaleDateString()} by {dispute.filedByUser?.name || dispute.filedByUser?.email}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refreshDispute} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {!isResolved && (
            <Button onClick={() => setShowResolutionForm(true)}>
              <Gavel className="mr-2 h-4 w-4" />
              Resolve Dispute
            </Button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
          {error}
        </div>
      )}

      {/* Resolution Form Modal */}
      {showResolutionForm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Scale className="h-5 w-5" />
                Resolve Dispute
              </CardTitle>
              <CardDescription className="text-slate-400">
                Transaction Amount: ${transactionAmount.toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Decision Options */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">Decision *</label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {DECISION_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setDecision(opt.value)}
                      className={`p-4 border rounded-lg text-left transition-all ${
                        decision === opt.value
                          ? 'border-blue-500 bg-blue-500/20'
                          : 'border-slate-600 hover:border-slate-500 bg-slate-700/50'
                      }`}
                    >
                      <p className="font-medium text-white">{opt.label}</p>
                      <p className="text-sm text-slate-400 mt-1">{opt.description}</p>
                      {opt.buyerPercent !== null && (
                        <div className="mt-2 text-xs">
                          <span className="text-green-400">Buyer: {opt.buyerPercent}%</span>
                          <span className="mx-2 text-slate-500">|</span>
                          <span className="text-blue-400">Supplier: {100 - opt.buyerPercent}%</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Partial Refund Amount */}
              {decision === 'PARTIAL_REFUND' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Refund Amount to Buyer *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="number"
                      value={resolutionAmount}
                      onChange={(e) => setResolutionAmount(e.target.value)}
                      placeholder="0.00"
                      max={transactionAmount}
                      step="0.01"
                      className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {resolutionAmount && (
                    <div className="mt-2 text-sm">
                      <span className="text-green-400">
                        Buyer: ${parseFloat(resolutionAmount).toLocaleString()}
                      </span>
                      <span className="mx-2 text-slate-500">|</span>
                      <span className="text-blue-400">
                        Supplier: ${(transactionAmount - parseFloat(resolutionAmount)).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Resolution Reason *
                </label>
                <Textarea
                  value={resolutionReason}
                  onChange={(e) => setResolutionReason(e.target.value)}
                  placeholder="Explain the reasoning behind this decision..."
                  rows={4}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>

              {/* Preview */}
              {decision && decision !== 'NO_ACTION' && (
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <h4 className="font-medium text-white mb-2">Fund Distribution Preview</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-green-500/20 rounded-lg">
                      <p className="text-sm text-slate-400">Buyer Receives</p>
                      <p className="text-2xl font-bold text-green-400">
                        ${(decision === 'FULL_REFUND' 
                          ? transactionAmount 
                          : decision === 'SPLIT_50_50' 
                            ? transactionAmount / 2 
                            : decision === 'PARTIAL_REFUND' 
                              ? parseFloat(resolutionAmount || '0') 
                              : 0
                        ).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-blue-500/20 rounded-lg">
                      <p className="text-sm text-slate-400">Supplier Receives</p>
                      <p className="text-2xl font-bold text-blue-400">
                        ${(decision === 'FULL_PAYMENT' 
                          ? transactionAmount 
                          : decision === 'SPLIT_50_50' 
                            ? transactionAmount / 2 
                            : decision === 'PARTIAL_REFUND' 
                              ? transactionAmount - parseFloat(resolutionAmount || '0') 
                              : 0
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowResolutionForm(false);
                    setDecision('');
                    setResolutionAmount('');
                    setResolutionReason('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleResolve}
                  disabled={resolving || !decision || !resolutionReason}
                >
                  {resolving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resolving...
                    </>
                  ) : (
                    <>
                      <Gavel className="mr-2 h-4 w-4" />
                      Confirm Resolution
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Resolution Result */}
          {isResolved && (
            <Card className="bg-green-900/30 border-green-700">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">Dispute Resolved</h3>
                    <p className="text-slate-300 mt-1">
                      Decision: <strong>{dispute.adminDecision?.replace(/_/g, ' ')}</strong>
                    </p>
                    {dispute.resolutionReason && (
                      <p className="mt-2 text-sm text-slate-400">{dispute.resolutionReason}</p>
                    )}
                    <div className="flex gap-6 mt-4">
                      <div>
                        <p className="text-sm text-slate-400">Buyer</p>
                        <p className="text-xl font-bold text-green-400">
                          ${(dispute.buyerAmount || 0).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Supplier</p>
                        <p className="text-xl font-bold text-blue-400">
                          ${(dispute.supplierAmount || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Dispute Details */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Dispute Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-700 p-4 bg-slate-700/50">
                  <p className="text-sm text-slate-400">Reason</p>
                  <p className="font-medium text-white">{dispute.reason?.replace(/_/g, ' ')}</p>
                </div>
                <div className="rounded-lg border border-slate-700 p-4 bg-slate-700/50">
                  <p className="text-sm text-slate-400">Requested Resolution</p>
                  <p className="font-medium text-white">{dispute.requestedResolution?.replace(/_/g, ' ')}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-400 mb-2">Description</p>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="whitespace-pre-wrap text-slate-200">{dispute.description}</p>
                </div>
              </div>

              {/* Evidence */}
              {dispute.evidenceUrls && dispute.evidenceUrls.length > 0 && (
                <div>
                  <p className="text-sm text-slate-400 mb-2">Evidence</p>
                  <div className="flex flex-wrap gap-2">
                    {dispute.evidenceUrls.map((url: string, index: number) => (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors text-white"
                      >
                        {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                          <ImageIcon className="h-4 w-4 text-blue-400" />
                        ) : (
                          <FileText className="h-4 w-4 text-orange-400" />
                        )}
                        <span className="text-sm">Evidence {index + 1}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Messages */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Messages ({dispute.messages?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[400px] overflow-y-auto mb-4">
                {dispute.messages && dispute.messages.length > 0 ? (
                  dispute.messages.map((msg: any) => (
                    <div key={msg.id} className="flex gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        msg.isAdmin ? 'bg-purple-500' : 'bg-slate-600'
                      }`}>
                        {msg.isAdmin ? '🛡️' : <User className="h-4 w-4 text-white" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-white">
                            {msg.isAdmin ? 'Admin' : msg.user?.name || msg.user?.email}
                          </span>
                          <span className="text-xs text-slate-500">
                            {new Date(msg.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <div className={`rounded-lg p-3 ${
                          msg.isAdmin ? 'bg-purple-500/20' : 'bg-slate-700'
                        }`}>
                          <p className="text-sm text-slate-200 whitespace-pre-wrap">{msg.message}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No messages yet</p>
                  </div>
                )}
              </div>

              {/* Admin Message Input */}
              <div className="flex gap-2">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Send a message as admin..."
                  rows={2}
                  className="resize-none bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                />
                <Button
                  onClick={sendMessage}
                  disabled={sendingMessage || !newMessage.trim()}
                  className="self-end"
                >
                  {sendingMessage ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          {!isResolved && (
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {dispute.status === 'PENDING' && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => updateStatus('UNDER_REVIEW')}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    Mark Under Review
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => updateStatus('AWAITING_RESPONSE')}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Request Response
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-red-400 hover:text-red-300"
                  onClick={() => updateStatus('ESCALATED')}
                >
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Escalate
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Transaction Info */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-base">Transaction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Amount</span>
                <span className="font-semibold text-white">
                  ${transactionAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Status</span>
                <Badge variant="secondary">{dispute.transaction?.status}</Badge>
              </div>
              <Link 
                href={`/admin/transactions/${dispute.transactionId}`}
                className="block text-sm text-blue-400 hover:underline"
              >
                View Transaction →
              </Link>
            </CardContent>
          </Card>

          {/* Parties */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-base">Parties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="text-slate-400 mb-1">Buyer</p>
                <p className="text-white">{dispute.transaction?.buyer?.name}</p>
                <p className="text-slate-400 text-xs">{dispute.transaction?.buyer?.email}</p>
              </div>
              <div>
                <p className="text-slate-400 mb-1">Supplier</p>
                <p className="text-white">{dispute.transaction?.supplier?.name}</p>
                <p className="text-slate-400 text-xs">{dispute.transaction?.supplier?.email}</p>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-base">Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <div>
                    <p className="font-medium text-white">Filed</p>
                    <p className="text-slate-500">{new Date(dispute.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                {dispute.resolvedAt && (
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    <div>
                      <p className="font-medium text-white">Resolved</p>
                      <p className="text-slate-500">{new Date(dispute.resolvedAt).toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
