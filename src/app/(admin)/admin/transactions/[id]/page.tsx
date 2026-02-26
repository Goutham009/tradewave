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
  ClipboardList,
  DollarSign,
  Loader2,
  Mail,
  Receipt,
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

const STATUS_STYLES: Record<string, string> = {
  INITIATED: 'bg-slate-500/20 text-slate-300',
  PAYMENT_PENDING: 'bg-yellow-500/20 text-yellow-300',
  PAYMENT_RECEIVED: 'bg-blue-500/20 text-blue-300',
  ESCROW_HELD: 'bg-cyan-500/20 text-cyan-300',
  PRODUCTION: 'bg-purple-500/20 text-purple-300',
  IN_TRANSIT: 'bg-indigo-500/20 text-indigo-300',
  DELIVERED: 'bg-emerald-500/20 text-emerald-300',
  COMPLETED: 'bg-green-500/20 text-green-300',
  DISPUTED: 'bg-red-500/20 text-red-300',
  CANCELLED: 'bg-slate-500/20 text-slate-300',
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

export default function AdminTransactionDetailPage() {
  const params = useParams();
  const transactionId = params.id as string;

  const [transaction, setTransaction] = useState<any>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactionDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/transactions/${transactionId}`);
        const data = await response.json();

        if (data.status !== 'success') {
          throw new Error(data.error || 'Failed to load transaction details');
        }

        const fetchedTransaction = data.data.transaction;
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
        console.error('Failed to load admin transaction detail:', fetchError);
        setError(fetchError instanceof Error ? fetchError.message : 'Unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (transactionId) {
      void fetchTransactionDetails();
    }
  }, [transactionId]);

  const references = useMemo(
    () => ((transaction?.references || {}) as FlowReferences),
    [transaction?.references]
  );

  const statusClass = STATUS_STYLES[transaction?.status || ''] || 'bg-slate-500/20 text-slate-300';
  const requirementId = transaction?.requirementId || transaction?.requirement?.id;

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="py-10 text-center">
          <p className="text-red-300">{error || 'Transaction not found'}</p>
          <Link href="/admin/transactions">
            <Button className="mt-4" variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Transactions
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
          <Link href="/admin/transactions">
            <Button variant="outline" className="border-slate-600 text-slate-300">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">{transaction.id}</h1>
            <p className="text-sm text-slate-400">
              {references.transactionReference || 'Transaction reference pending'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge className={statusClass}>{transaction.status}</Badge>
          {transaction.escrow?.status && (
            <Badge className="bg-blue-500/20 text-blue-300">Escrow: {transaction.escrow.status}</Badge>
          )}
        </div>
      </div>

      <ReferenceChainCard
        references={references}
        className="bg-slate-800 border-slate-700"
        pendingLabel="Awaiting stage"
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Transaction Snapshot
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Amount</span>
                <span className="font-semibold text-white">
                  ${Number(transaction.amount || 0).toLocaleString()} {transaction.currency || 'USD'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Requirement</span>
                <span className="text-white">{transaction.requirement?.title || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Created</span>
                <span className="text-white">
                  {transaction.createdAt ? new Date(transaction.createdAt).toLocaleString() : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Last Updated</span>
                <span className="text-white">
                  {transaction.updatedAt ? new Date(transaction.updatedAt).toLocaleString() : '—'}
                </span>
              </div>

              <div className="flex gap-2 pt-3">
                {requirementId && (
                  <Link href={`/admin/requirements/${requirementId}`}>
                    <Button size="sm" variant="outline" className="border-slate-600 text-slate-300">
                      <ClipboardList className="mr-2 h-4 w-4" />
                      Requirement
                    </Button>
                  </Link>
                )}
                {requirementId && (
                  <Link href={`/admin/quotations/${requirementId}`}>
                    <Button size="sm" variant="outline" className="border-slate-600 text-slate-300">
                      <DollarSign className="mr-2 h-4 w-4" />
                      Quotations
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Milestone Timeline</CardTitle>
              <CardDescription>Operational status updates from the backend workflow.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {(transaction.milestones || []).length === 0 ? (
                <p className="text-sm text-slate-400">No milestones available yet.</p>
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
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Parties</CardTitle>
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
              {transaction.escrow && (
                <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-3">
                  <p className="flex items-center gap-2 text-blue-300">
                    <Shield className="h-4 w-4" />
                    Escrow: {transaction.escrow.status}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BellRing className="h-5 w-5" />
                Related Notifications
              </CardTitle>
              <CardDescription>Notifications tied to this transaction and its references.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {notifications.length === 0 ? (
                <p className="text-sm text-slate-400">No related notifications found for your account.</p>
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
    </div>
  );
}
