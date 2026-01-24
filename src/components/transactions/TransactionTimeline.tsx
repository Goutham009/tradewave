'use client';

import { Check, Clock, Package, Truck, CheckCircle, Star, DollarSign, AlertCircle, X } from 'lucide-react';
import { format } from 'date-fns';

interface TimelineStep {
  status: string;
  label: string;
  description?: string;
  timestamp?: Date | string | null;
  actor?: string;
  details?: Record<string, any>;
}

interface TransactionTimelineProps {
  currentStatus: string;
  statusHistory?: Array<{
    oldStatus: string;
    newStatus: string;
    createdAt: Date | string;
    changedBy?: { name: string } | null;
    reason?: string | null;
  }>;
  transaction?: {
    createdAt?: Date | string;
    shipmentDate?: Date | string | null;
    trackingNumber?: string | null;
    shippingProvider?: string | null;
    deliveryConfirmedAt?: Date | string | null;
    qualityAssessmentAt?: Date | string | null;
    qualityRating?: number | null;
    fundsReleasedAt?: Date | string | null;
    payoutAmount?: number | null;
  };
  userRole?: 'BUYER' | 'SUPPLIER' | 'ADMIN';
}

const TIMELINE_STEPS = [
  { status: 'INITIATED', label: 'Order Created', icon: Package },
  { status: 'PAID', label: 'Payment Received', icon: DollarSign },
  { status: 'SHIPPED', label: 'Shipped', icon: Truck },
  { status: 'DELIVERY_CONFIRMED', label: 'Delivery Confirmed', icon: CheckCircle },
  { status: 'QUALITY_PENDING', label: 'Quality Assessment', icon: Star },
  { status: 'QUALITY_APPROVED', label: 'Quality Approved', icon: Check },
  { status: 'FUNDS_RELEASED', label: 'Funds Released', icon: DollarSign },
  { status: 'COMPLETED', label: 'Completed', icon: CheckCircle },
];

const STATUS_ORDER: Record<string, number> = {
  'INITIATED': 0,
  'PAYMENT_PENDING': 1,
  'PAYMENT_RECEIVED': 2,
  'PAID': 2,
  'ESCROW_HELD': 2,
  'PRODUCTION': 3,
  'SHIPPED': 4,
  'IN_TRANSIT': 4,
  'DELIVERED': 5,
  'DELIVERY_CONFIRMED': 5,
  'QUALITY_PENDING': 6,
  'QUALITY_CHECK': 6,
  'QUALITY_APPROVED': 7,
  'QUALITY_REJECTED': 7,
  'FUNDS_RELEASING': 8,
  'FUNDS_RELEASED': 8,
  'ESCROW_RELEASED': 8,
  'COMPLETED': 9,
  'DISPUTED': -1,
  'DISPUTE_OPEN': -1,
  'CANCELLED': -2,
  'REFUNDED': -2,
};

function getStatusIndex(status: string): number {
  return STATUS_ORDER[status] ?? -1;
}

function isStepCompleted(stepStatus: string, currentStatus: string): boolean {
  const stepIndex = getStatusIndex(stepStatus);
  const currentIndex = getStatusIndex(currentStatus);
  return stepIndex < currentIndex;
}

function isStepCurrent(stepStatus: string, currentStatus: string): boolean {
  const stepIndex = getStatusIndex(stepStatus);
  const currentIndex = getStatusIndex(currentStatus);
  return stepIndex === currentIndex;
}

function getStepTimestamp(
  stepStatus: string,
  transaction?: TransactionTimelineProps['transaction'],
  statusHistory?: TransactionTimelineProps['statusHistory']
): Date | null {
  if (!transaction && !statusHistory) return null;

  // Check transaction fields first
  if (transaction) {
    switch (stepStatus) {
      case 'INITIATED':
        return transaction.createdAt ? new Date(transaction.createdAt) : null;
      case 'SHIPPED':
        return transaction.shipmentDate ? new Date(transaction.shipmentDate) : null;
      case 'DELIVERY_CONFIRMED':
        return transaction.deliveryConfirmedAt ? new Date(transaction.deliveryConfirmedAt) : null;
      case 'QUALITY_APPROVED':
      case 'QUALITY_PENDING':
        return transaction.qualityAssessmentAt ? new Date(transaction.qualityAssessmentAt) : null;
      case 'FUNDS_RELEASED':
        return transaction.fundsReleasedAt ? new Date(transaction.fundsReleasedAt) : null;
    }
  }

  // Check status history
  if (statusHistory) {
    const historyEntry = statusHistory.find(h => h.newStatus === stepStatus);
    if (historyEntry) {
      return new Date(historyEntry.createdAt);
    }
  }

  return null;
}

export default function TransactionTimeline({
  currentStatus,
  statusHistory,
  transaction,
  userRole = 'BUYER',
}: TransactionTimelineProps) {
  const isDisputed = currentStatus === 'DISPUTED' || currentStatus === 'DISPUTE_OPEN' || currentStatus === 'QUALITY_REJECTED';
  const isCancelled = currentStatus === 'CANCELLED' || currentStatus === 'REFUNDED';

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Transaction Progress</h3>
      
      {/* Status Alert */}
      {isDisputed && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <p className="font-medium text-red-800">Dispute Opened</p>
            <p className="text-sm text-red-600">This transaction is under review due to quality issues.</p>
          </div>
        </div>
      )}

      {isCancelled && (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg flex items-start gap-3">
          <X className="w-5 h-5 text-gray-600 mt-0.5" />
          <div>
            <p className="font-medium text-gray-800">Transaction {currentStatus === 'REFUNDED' ? 'Refunded' : 'Cancelled'}</p>
            <p className="text-sm text-gray-600">This transaction has been terminated.</p>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="relative">
        {TIMELINE_STEPS.map((step, index) => {
          const isCompleted = isStepCompleted(step.status, currentStatus);
          const isCurrent = isStepCurrent(step.status, currentStatus);
          const timestamp = getStepTimestamp(step.status, transaction, statusHistory);
          const Icon = step.icon;

          return (
            <div key={step.status} className="relative pb-8 last:pb-0">
              {/* Connector Line */}
              {index < TIMELINE_STEPS.length - 1 && (
                <div
                  className={`absolute left-4 top-8 w-0.5 h-full -ml-px ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}

              <div className="relative flex items-start gap-4">
                {/* Icon */}
                <div
                  className={`
                    flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0
                    ${isCompleted ? 'bg-green-500 text-white' : ''}
                    ${isCurrent ? 'bg-blue-500 text-white ring-4 ring-blue-100' : ''}
                    ${!isCompleted && !isCurrent ? 'bg-gray-100 text-gray-400' : ''}
                  `}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : isCurrent ? (
                    <Clock className="w-4 h-4 animate-pulse" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p
                      className={`font-medium ${
                        isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-400'
                      }`}
                    >
                      {step.label}
                    </p>
                    {timestamp && (
                      <span className="text-xs text-gray-500">
                        {format(timestamp, 'MMM d, yyyy h:mm a')}
                      </span>
                    )}
                  </div>

                  {/* Step Details */}
                  {isCurrent && (
                    <p className="text-sm text-blue-600 mt-1">
                      {getStepMessage(step.status, userRole)}
                    </p>
                  )}

                  {/* Additional Info */}
                  {isCompleted && step.status === 'SHIPPED' && transaction?.trackingNumber && (
                    <p className="text-sm text-gray-500 mt-1">
                      Tracking: {transaction.trackingNumber} ({transaction.shippingProvider})
                    </p>
                  )}

                  {isCompleted && step.status === 'QUALITY_APPROVED' && transaction?.qualityRating && (
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < transaction.qualityRating! ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  {isCompleted && step.status === 'FUNDS_RELEASED' && transaction?.payoutAmount && (
                    <p className="text-sm text-green-600 mt-1">
                      ${Number(transaction.payoutAmount).toFixed(2)} released
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getStepMessage(status: string, userRole: string): string {
  const messages: Record<string, Record<string, string>> = {
    INITIATED: {
      BUYER: 'Your order has been created. Awaiting payment.',
      SUPPLIER: 'New order received. Awaiting buyer payment.',
      ADMIN: 'Transaction initiated.',
    },
    PAID: {
      BUYER: 'Payment received. Waiting for supplier to ship.',
      SUPPLIER: 'Payment confirmed. Please ship the order.',
      ADMIN: 'Payment received. Awaiting shipment.',
    },
    SHIPPED: {
      BUYER: 'Order has been shipped. Track your delivery.',
      SUPPLIER: 'Shipment confirmed. Awaiting delivery confirmation.',
      ADMIN: 'Order shipped. Awaiting delivery.',
    },
    DELIVERY_CONFIRMED: {
      BUYER: 'Please assess the quality of goods received.',
      SUPPLIER: 'Buyer confirmed delivery. Awaiting quality assessment.',
      ADMIN: 'Delivery confirmed. Quality assessment pending.',
    },
    QUALITY_PENDING: {
      BUYER: 'Please rate the quality of goods within 7 days.',
      SUPPLIER: 'Quality assessment in progress.',
      ADMIN: 'Quality assessment pending.',
    },
    QUALITY_APPROVED: {
      BUYER: 'Quality approved. Funds being released to supplier.',
      SUPPLIER: 'Quality approved! Funds will be released soon.',
      ADMIN: 'Quality approved. Processing fund release.',
    },
    FUNDS_RELEASED: {
      BUYER: 'Payment released to supplier.',
      SUPPLIER: 'Funds released to your account!',
      ADMIN: 'Funds released.',
    },
    COMPLETED: {
      BUYER: 'Transaction completed successfully.',
      SUPPLIER: 'Transaction completed successfully.',
      ADMIN: 'Transaction completed.',
    },
  };

  return messages[status]?.[userRole] || 'Processing...';
}
