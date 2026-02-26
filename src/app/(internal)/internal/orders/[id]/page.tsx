'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ReferenceChainCard, type FlowReferences } from '@/components/flow/ReferenceChainCard';
import {
  ArrowLeft,
  BellRing,
  Building2,
  Calendar,
  Loader2,
  Mail,
  Package,
  Shield,
  User,
} from 'lucide-react';

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  resourceId?: string | null;
};

function filterNotificationsForTransaction(transaction: any, notifications: NotificationItem[]): NotificationItem[] {
  const transactionReferences = Object.values((transaction?.references || {}) as Record<string, unknown>)
    .map((value) => (typeof value === 'string' ? value : null))
    .filter((value): value is string => Boolean(value));

  const relatedResourceIds = new Set(
    [
      transaction?.id,
      transaction?.requirementId,
      transaction?.quotationId,
      transaction?.requirement?.id,
      transaction?.quotation?.id,
    ].filter(Boolean)
  );

  const relatedReferences = transactionReferences.map((ref) => ref.toUpperCase());

  return notifications.filter((notification) => {
    if (notification.resourceId && relatedResourceIds.has(notification.resourceId)) {
      return true;
    }

    const text = `${notification.title || ''} ${notification.message || ''}`.toUpperCase();
    return relatedReferences.some((reference) => text.includes(reference));
  });
}

export default function InternalOrderDetailPage() {
  const params = useParams();
  const transactionId = params.id as string;

  const [transaction, setTransaction] = useState<any>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        const transactionResponse = await fetch(`/api/transactions/${transactionId}`);
        const transactionData = await transactionResponse.json();

        if (transactionData.status !== 'success') {
          throw new Error(transactionData.error || 'Failed to fetch order detail');
        }

        const fetchedTransaction = transactionData.data.transaction;
        setTransaction(fetchedTransaction);

        const notificationsResponse = await fetch('/api/notifications?limit=100');
        const notificationsData = await notificationsResponse.json();

        if (notificationsData.status === 'success') {
          const relatedNotifications = filterNotificationsForTransaction(
            fetchedTransaction,
            notificationsData.data.notifications || []
          );
          setNotifications(relatedNotifications.slice(0, 8));
        } else {
          setNotifications([]);
        }
      } catch (fetchError) {
        console.error('Failed to fetch internal order detail:', fetchError);
        setError(fetchError instanceof Error ? fetchError.message : 'Unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (transactionId) {
      void fetchOrderDetail();
    }
  }, [transactionId]);

  const references = useMemo(
    () => ((transaction?.references || {}) as FlowReferences),
    [transaction?.references]
  );

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="py-10 text-center">
          <p className="text-red-300">{error || 'Order not found'}</p>
          <Link href="/internal/orders/active">
            <Button className="mt-4" variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Active Orders
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/internal/orders/active">
            <Button variant="outline" className="border-slate-700 text-slate-300 hover:text-white">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Order Traceability</h1>
            <p className="text-sm text-slate-400">
              {references.transactionReference || transaction.id}
            </p>
          </div>
        </div>
        <Badge className="bg-blue-500/20 text-blue-300">{transaction.status}</Badge>
      </div>

      <ReferenceChainCard
        references={references}
        className="bg-slate-900 border-slate-800"
        pendingLabel="Awaiting stage"
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Order Context</CardTitle>
              <CardDescription>Use this to brief buyers/suppliers during each handoff.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Requirement</span>
                <span className="text-white">{transaction.requirement?.title || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount</span>
                <span className="text-white font-semibold">
                  ${Number(transaction.amount || 0).toLocaleString()} {transaction.currency || 'USD'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Destination</span>
                <span className="text-white">{transaction.destination || transaction.requirement?.deliveryLocation || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Created</span>
                <span className="text-white">
                  {transaction.createdAt ? new Date(transaction.createdAt).toLocaleString() : '—'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Milestones</CardTitle>
              <CardDescription>Backend status transitions for this order flow.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {(transaction.milestones || []).length === 0 ? (
                <p className="text-sm text-slate-400">No milestones recorded yet.</p>
              ) : (
                transaction.milestones.map((milestone: any) => (
                  <div key={milestone.id} className="rounded-lg border border-slate-700 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-white">{String(milestone.status || '').replace(/_/g, ' ')}</p>
                      <p className="text-xs text-slate-400">
                        {milestone.timestamp ? new Date(milestone.timestamp).toLocaleString() : '—'}
                      </p>
                    </div>
                    {milestone.description && (
                      <p className="mt-1 text-xs text-slate-400">{milestone.description}</p>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Stakeholders</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="rounded-lg border border-slate-700 p-3">
                <p className="mb-2 text-xs uppercase tracking-wide text-slate-500">Buyer</p>
                <p className="flex items-center gap-2 text-white"><User className="h-4 w-4 text-slate-400" />{transaction.buyer?.name || '—'}</p>
                {transaction.buyer?.companyName && <p className="text-slate-300">{transaction.buyer.companyName}</p>}
                {transaction.buyer?.email && (
                  <p className="flex items-center gap-2 text-slate-400"><Mail className="h-3.5 w-3.5" />{transaction.buyer.email}</p>
                )}
              </div>

              <div className="rounded-lg border border-slate-700 p-3">
                <p className="mb-2 text-xs uppercase tracking-wide text-slate-500">Supplier</p>
                <p className="flex items-center gap-2 text-white"><Building2 className="h-4 w-4 text-slate-400" />{transaction.supplier?.companyName || transaction.supplier?.name || '—'}</p>
                {transaction.supplier?.email && (
                  <p className="flex items-center gap-2 text-slate-400"><Mail className="h-3.5 w-3.5" />{transaction.supplier.email}</p>
                )}
              </div>

              {transaction.estimatedDelivery && (
                <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-3">
                  <p className="flex items-center gap-2 text-blue-300">
                    <Calendar className="h-4 w-4" />
                    ETA {new Date(transaction.estimatedDelivery).toLocaleDateString()}
                  </p>
                </div>
              )}

              {transaction.escrow?.status && (
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3">
                  <p className="flex items-center gap-2 text-emerald-300">
                    <Shield className="h-4 w-4" />
                    Escrow {transaction.escrow.status}
                  </p>
                </div>
              )}

              {references.internalOrderId && (
                <div className="rounded-lg border border-slate-700 p-3">
                  <p className="mb-2 text-xs uppercase tracking-wide text-slate-500">Internal Order ID</p>
                  <p className="text-sm font-mono text-white">{references.internalOrderId}</p>
                </div>
              )}

              {references.buyerOrderId && (
                <div className="rounded-lg border border-slate-700 p-3">
                  <p className="mb-2 text-xs uppercase tracking-wide text-slate-500">Buyer PO</p>
                  <p className="text-sm font-mono text-white">{references.buyerOrderId}</p>
                </div>
              )}

              {references.supplierOrderId && (
                <div className="rounded-lg border border-slate-700 p-3">
                  <p className="mb-2 text-xs uppercase tracking-wide text-slate-500">Supplier SO</p>
                  <p className="text-sm font-mono text-white">{references.supplierOrderId}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BellRing className="h-5 w-5" />
                Related Notifications
              </CardTitle>
              <CardDescription>Notifications matched to this flow for your AM account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {notifications.length === 0 ? (
                <p className="text-sm text-slate-400">No related notifications found for this order.</p>
              ) : (
                notifications.map((notification) => (
                  <div key={notification.id} className="rounded-lg border border-slate-700 p-3">
                    <p className="text-sm font-medium text-white">{notification.title}</p>
                    <p className="mt-1 text-xs text-slate-400">{notification.message}</p>
                    <p className="mt-2 text-[11px] text-slate-500">
                      {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : '—'}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
        <div className="flex items-center gap-2 text-slate-300">
          <Package className="h-4 w-4" />
          <span className="text-sm">
            Use these canonical IDs when coordinating with procurement, admin, buyer, and supplier teams.
          </span>
        </div>
      </div>
    </div>
  );
}
