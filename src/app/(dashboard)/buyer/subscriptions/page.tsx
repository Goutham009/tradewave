'use client';

import { useState, useEffect } from 'react';
import { 
  RefreshCw, Calendar, Package, Pause, Play, 
  Trash2, ChevronRight, DollarSign, Clock, Plus 
} from 'lucide-react';

interface RecurringOrderItem {
  id: string;
  productName: string;
  productCategory: string;
  quantity: number;
  quantityUnit: string;
  unitPrice: string;
  totalPrice: string;
}

interface RecurringOrder {
  id: string;
  subscriptionName: string;
  description: string | null;
  frequency: string;
  nextBillingDate: string;
  totalAmount: string;
  currency: string;
  subscriptionDiscount: string | null;
  status: string;
  supplier: {
    id: string;
    name: string;
    companyName: string;
    avatar: string | null;
  };
  lineItems: RecurringOrderItem[];
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<RecurringOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchSubscriptions();
  }, [statusFilter]);

  const fetchSubscriptions = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      
      const res = await fetch(`/api/buyer/recurring-orders?${params}`);
      const data = await res.json();
      setSubscriptions(data.recurringOrders || []);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePause = async (id: string) => {
    try {
      await fetch(`/api/buyer/recurring-orders/${id}/pause`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      fetchSubscriptions();
    } catch (error) {
      console.error('Error pausing subscription:', error);
    }
  };

  const handleResume = async (id: string) => {
    try {
      await fetch(`/api/buyer/recurring-orders/${id}/resume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      fetchSubscriptions();
    } catch (error) {
      console.error('Error resuming subscription:', error);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this subscription?')) return;
    
    try {
      await fetch(`/api/buyer/recurring-orders/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'User cancelled' })
      });
      fetchSubscriptions();
    } catch (error) {
      console.error('Error cancelling subscription:', error);
    }
  };

  const formatCurrency = (amount: string, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(parseFloat(amount));
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getFrequencyLabel = (freq: string) => {
    const labels: Record<string, string> = {
      WEEKLY: 'Weekly',
      MONTHLY: 'Monthly',
      QUARTERLY: 'Quarterly',
      YEARLY: 'Yearly',
      CUSTOM: 'Custom'
    };
    return labels[freq] || freq;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-700';
      case 'PAUSED': return 'bg-yellow-100 text-yellow-700';
      case 'CANCELLED': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscriptions</h1>
          <p className="text-gray-500 mt-1">Manage your recurring orders</p>
        </div>
        <a
          href="/buyer/subscriptions/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          New Subscription
        </a>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['', 'ACTIVE', 'PAUSED', 'CANCELLED'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status || 'All'}
          </button>
        ))}
      </div>

      {/* Subscriptions List */}
      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading...</div>
      ) : subscriptions.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <RefreshCw className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 mb-4">No subscriptions found</p>
          <a
            href="/buyer/subscriptions/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Create Subscription
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {subscriptions.map((subscription) => (
            <div key={subscription.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg text-gray-900">
                        {subscription.subscriptionName}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}>
                        {subscription.status}
                      </span>
                    </div>
                    <p className="text-gray-500 mt-1">
                      {subscription.supplier.companyName || subscription.supplier.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(subscription.totalAmount, subscription.currency)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {getFrequencyLabel(subscription.frequency)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Next: {formatDate(subscription.nextBillingDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{subscription.lineItems.length} items</span>
                  </div>
                  {subscription.subscriptionDiscount && (
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4 text-green-500" />
                      <span className="text-green-600">{subscription.subscriptionDiscount}% discount</span>
                    </div>
                  )}
                </div>

                {/* Line Items Preview */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="space-y-2">
                    {subscription.lineItems.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-700">{item.productName}</span>
                        <span className="text-gray-500">
                          {item.quantity} {item.quantityUnit} × {formatCurrency(item.unitPrice, subscription.currency)}
                        </span>
                      </div>
                    ))}
                    {subscription.lineItems.length > 3 && (
                      <p className="text-sm text-blue-600">
                        +{subscription.lineItems.length - 3} more items
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {subscription.status === 'ACTIVE' && (
                    <button
                      onClick={() => handlePause(subscription.id)}
                      className="flex items-center gap-1 px-3 py-2 text-yellow-600 hover:bg-yellow-50 rounded-lg text-sm"
                    >
                      <Pause className="w-4 h-4" />
                      Pause
                    </button>
                  )}
                  {subscription.status === 'PAUSED' && (
                    <button
                      onClick={() => handleResume(subscription.id)}
                      className="flex items-center gap-1 px-3 py-2 text-green-600 hover:bg-green-50 rounded-lg text-sm"
                    >
                      <Play className="w-4 h-4" />
                      Resume
                    </button>
                  )}
                  <a
                    href={`/buyer/subscriptions/${subscription.id}`}
                    className="flex items-center gap-1 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg text-sm"
                  >
                    View Details
                    <ChevronRight className="w-4 h-4" />
                  </a>
                  {subscription.status !== 'CANCELLED' && (
                    <button
                      onClick={() => handleCancel(subscription.id)}
                      className="flex items-center gap-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm ml-auto"
                    >
                      <Trash2 className="w-4 h-4" />
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
