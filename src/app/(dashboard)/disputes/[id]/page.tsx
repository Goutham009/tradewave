'use client';

import { useState, useEffect, useRef } from 'react';
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
  Paperclip,
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  UNDER_REVIEW: { label: 'Under Review', color: 'bg-blue-100 text-blue-800', icon: Clock },
  AWAITING_RESPONSE: { label: 'Awaiting Response', color: 'bg-purple-100 text-purple-800', icon: MessageSquare },
  RESOLVED: { label: 'Resolved', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  CLOSED: { label: 'Closed', color: 'bg-gray-100 text-gray-800', icon: CheckCircle },
  ESCALATED: { label: 'Escalated', color: 'bg-red-100 text-red-800', icon: AlertTriangle },
};

const REASON_LABELS: Record<string, string> = {
  QUALITY_ISSUE: 'Quality Issues',
  NOT_RECEIVED: 'Item Not Received',
  DIFFERENT_ITEM: 'Different Item Received',
  QUANTITY_MISMATCH: 'Quantity Mismatch',
  LATE_DELIVERY: 'Late Delivery',
  PAYMENT_NOT_RECEIVED: 'Payment Not Received',
  OTHER: 'Other',
};

export default function DisputeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const disputeId = params.id as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [dispute, setDispute] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Message form
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    fetchDispute();
  }, [disputeId]);

  useEffect(() => {
    scrollToBottom();
  }, [dispute?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
      } else {
        setError(data.error || 'Failed to send message');
      }
    } catch (err) {
      setError('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !dispute) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertTriangle className="h-12 w-12 text-red-500" />
          <h3 className="mt-4 text-lg font-semibold">Error Loading Dispute</h3>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <Button className="mt-4" onClick={() => router.push('/disputes')}>
            Back to Disputes
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!dispute) return null;

  const statusConfig = STATUS_CONFIG[dispute.status] || STATUS_CONFIG.PENDING;
  const StatusIcon = statusConfig.icon;
  const isResolved = dispute.status === 'RESOLVED' || dispute.status === 'CLOSED';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link href="/disputes">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold">Dispute #{dispute.id.slice(0, 8)}</h1>
              <Badge className={statusConfig.color}>
                <StatusIcon className="mr-1 h-3 w-3" />
                {statusConfig.label}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Filed {new Date(dispute.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={refreshDispute} disabled={refreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Resolution Banner */}
      {isResolved && dispute.adminDecision && (
        <Card className={dispute.buyerAmount > 0 ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <CheckCircle className={`h-8 w-8 ${dispute.buyerAmount > 0 ? 'text-green-600' : 'text-blue-600'}`} />
              <div>
                <h3 className="text-lg font-semibold">Dispute Resolved</h3>
                <p className="text-muted-foreground mt-1">
                  Decision: <strong>{dispute.adminDecision.replace(/_/g, ' ')}</strong>
                </p>
                {dispute.resolutionReason && (
                  <p className="mt-2 text-sm">{dispute.resolutionReason}</p>
                )}
                <div className="flex gap-6 mt-4">
                  {dispute.buyerAmount > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground">Your Refund</p>
                      <p className="text-xl font-bold text-green-600">
                        ${dispute.buyerAmount.toLocaleString()}
                      </p>
                    </div>
                  )}
                  {dispute.supplierAmount > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground">Supplier Payment</p>
                      <p className="text-xl font-bold">
                        ${dispute.supplierAmount.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dispute Details */}
          <Card>
            <CardHeader>
              <CardTitle>Dispute Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Reason</p>
                  <p className="font-medium">{REASON_LABELS[dispute.reason] || dispute.reason}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Requested Resolution</p>
                  <p className="font-medium">{dispute.requestedResolution.replace(/_/g, ' ')}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Description</p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="whitespace-pre-wrap">{dispute.description}</p>
                </div>
              </div>

              {/* Evidence */}
              {dispute.evidenceUrls && dispute.evidenceUrls.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Evidence Submitted</p>
                  <div className="flex flex-wrap gap-2">
                    {dispute.evidenceUrls.map((url: string, index: number) => (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                          <ImageIcon className="h-4 w-4 text-blue-500" />
                        ) : (
                          <FileText className="h-4 w-4 text-orange-500" />
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Messages ({dispute.messages?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[500px] overflow-y-auto mb-4">
                {dispute.messages && dispute.messages.length > 0 ? (
                  dispute.messages.map((msg: any) => {
                    const isOwn = msg.userId === session?.user?.id;
                    const isAdminMsg = msg.isAdmin;
                    
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-4 ${
                            isAdminMsg
                              ? 'bg-purple-50 border border-purple-200'
                              : isOwn
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-medium ${isOwn && !isAdminMsg ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                              {isAdminMsg ? '🛡️ Admin' : msg.user?.name || msg.user?.email || 'User'}
                            </span>
                            <span className={`text-xs ${isOwn && !isAdminMsg ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                              {new Date(msg.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="whitespace-pre-wrap text-sm">{msg.message}</p>
                          
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {msg.attachments.map((url: string, i: number) => (
                                <a
                                  key={i}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-xs underline"
                                >
                                  <Paperclip className="h-3 w-3" />
                                  Attachment {i + 1}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No messages yet</p>
                    <p className="text-sm">Start the conversation about this dispute</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              {!isResolved && (
                <div className="flex gap-2">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    rows={2}
                    className="resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
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
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Transaction Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Transaction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">ID</span>
                <Link 
                  href={`/transactions/${dispute.transactionId}`}
                  className="text-sm font-mono text-primary hover:underline"
                >
                  {dispute.transactionId.slice(0, 12)}...
                </Link>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Amount</span>
                <span className="font-semibold">
                  {dispute.transaction?.currency || 'USD'} {Number(dispute.transaction?.amount || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant="secondary">{dispute.transaction?.status}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Filed By */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Filed By</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{dispute.filedByUser?.name || dispute.filedByUser?.email}</span>
              </div>
              {dispute.filedByUser?.companyName && (
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span>{dispute.filedByUser.companyName}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{new Date(dispute.createdAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <div>
                    <p className="font-medium">Dispute Filed</p>
                    <p className="text-muted-foreground">
                      {new Date(dispute.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                {dispute.reviewedByAdminId && (
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    <div>
                      <p className="font-medium">Under Review</p>
                      <p className="text-muted-foreground">
                        Admin assigned
                      </p>
                    </div>
                  </div>
                )}
                {dispute.resolvedAt && (
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <div>
                      <p className="font-medium">Resolved</p>
                      <p className="text-muted-foreground">
                        {new Date(dispute.resolvedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Blockchain Record */}
          {dispute.blockchainHash && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Blockchain Record</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs font-mono break-all bg-gray-50 p-2 rounded">
                  {dispute.blockchainHash}
                </div>
                {dispute.blockchainTxId && (
                  <a
                    href={`https://sepolia.etherscan.io/tx/${dispute.blockchainTxId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1 mt-2"
                  >
                    View on Etherscan <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
