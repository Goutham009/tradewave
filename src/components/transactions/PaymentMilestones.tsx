'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, ExternalLink, DollarSign, Package, Truck, Shield, FileCheck } from 'lucide-react';

interface PaymentMilestonesProps {
  transactionId: string;
}

interface MilestoneData {
  quotationAcceptedAt?: string;
  contractGeneratedAt?: string;
  contractTxHash?: string;
  paymentDepositedAt?: string;
  depositTxHash?: string;
  amount?: number;
  currency?: string;
  shipmentStartedAt?: string;
  customsClearedAt?: string;
  deliveryConfirmedAt?: string;
  paymentReleasedAt?: string;
  releaseTxHash?: string;
}

const BLOCKCHAIN_EXPLORER = process.env.NEXT_PUBLIC_BLOCKCHAIN_EXPLORER || 'https://sepolia.etherscan.io';

export function PaymentMilestones({ transactionId }: PaymentMilestonesProps) {
  const [milestones, setMilestones] = useState<MilestoneData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMilestones();
    const interval = setInterval(fetchMilestones, 30000);
    return () => clearInterval(interval);
  }, [transactionId]);

  const fetchMilestones = async () => {
    try {
      const response = await fetch(`/api/transactions/${transactionId}/milestones`);
      if (response.ok) {
        const data = await response.json();
        setMilestones(data);
      }
    } catch (error) {
      console.error('Failed to fetch milestones:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-neutral-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-neutral-100 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (!milestones) {
    return (
      <Card className="p-6">
        <p className="text-neutral-500">No payment information available</p>
      </Card>
    );
  }

  const steps = [
    {
      id: 'quotation_accepted',
      title: 'Quotation Accepted',
      description: 'Buyer selected supplier',
      icon: FileCheck,
      status: milestones.quotationAcceptedAt ? 'completed' : 'pending',
      timestamp: milestones.quotationAcceptedAt,
    },
    {
      id: 'contract_generated',
      title: 'Smart Contract Generated',
      description: 'Escrow contract created on blockchain',
      icon: Shield,
      status: milestones.contractGeneratedAt ? 'completed' : 'pending',
      timestamp: milestones.contractGeneratedAt,
      txHash: milestones.contractTxHash,
    },
    {
      id: 'payment_deposited',
      title: 'Payment Deposited',
      description: milestones.amount ? `${milestones.amount} ${milestones.currency || 'USD'} in escrow` : 'Funds held in escrow',
      icon: DollarSign,
      status: milestones.paymentDepositedAt ? 'completed' : 'pending',
      timestamp: milestones.paymentDepositedAt,
      txHash: milestones.depositTxHash,
    },
    {
      id: 'shipment_started',
      title: 'Shipment Started',
      description: 'Goods dispatched by supplier',
      icon: Package,
      status: milestones.shipmentStartedAt ? 'completed' : 'pending',
      timestamp: milestones.shipmentStartedAt,
    },
    {
      id: 'customs_cleared',
      title: 'Customs Cleared',
      description: 'Import clearance completed',
      icon: Shield,
      status: milestones.customsClearedAt ? 'completed' : 'pending',
      timestamp: milestones.customsClearedAt,
    },
    {
      id: 'delivery_confirmed',
      title: 'Delivery Confirmed',
      description: 'Buyer confirmed receipt of goods',
      icon: Truck,
      status: milestones.deliveryConfirmedAt ? 'completed' : 'pending',
      timestamp: milestones.deliveryConfirmedAt,
    },
    {
      id: 'payment_released',
      title: 'Payment Released',
      description: 'Supplier received payment from escrow',
      icon: DollarSign,
      status: milestones.paymentReleasedAt ? 'completed' : 'pending',
      timestamp: milestones.paymentReleasedAt,
      txHash: milestones.releaseTxHash,
    },
  ];

  const currentStepIndex = steps.findIndex(s => s.status === 'pending');
  const completedSteps = steps.filter(s => s.status === 'completed').length;
  const progress = (completedSteps / steps.length) * 100;

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Payment & Delivery Timeline</h3>
        <Badge variant={currentStepIndex === -1 ? 'success' : 'warning'}>
          {currentStepIndex === -1 ? 'Completed' : `${completedSteps}/${steps.length} Steps`}
        </Badge>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-teal-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = step.status === 'completed';
          const isCurrent = index === currentStepIndex;

          return (
            <div key={step.id} className="flex gap-4 mb-8 last:mb-0">
              {/* Timeline Indicator */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : isCurrent
                      ? 'bg-blue-500 text-white animate-pulse'
                      : 'bg-neutral-200 text-neutral-500'
                  }`}
                >
                  {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-0.5 h-16 ${isCompleted ? 'bg-green-500' : 'bg-neutral-200'}`} />
                )}
              </div>

              {/* Step Content */}
              <div className="flex-1 pb-4">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h4 className={`font-semibold ${isCompleted || isCurrent ? 'text-neutral-900' : 'text-neutral-400'}`}>
                      {step.title}
                    </h4>
                    <p className="text-sm text-neutral-600">{step.description}</p>
                  </div>
                  <Badge
                    variant={isCompleted ? 'success' : isCurrent ? 'warning' : 'default'}
                  >
                    {isCompleted ? 'Completed' : isCurrent ? 'In Progress' : 'Pending'}
                  </Badge>
                </div>

                {step.timestamp && (
                  <p className="text-xs text-neutral-500 mt-1">
                    {new Date(step.timestamp).toLocaleString()}
                  </p>
                )}

                {step.txHash && (
                  <a
                    href={`${BLOCKCHAIN_EXPLORER}/tx/${step.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 mt-1"
                  >
                    View Transaction <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Current Status Summary */}
      <div className={`mt-6 p-4 rounded-lg border ${
        currentStepIndex === -1 
          ? 'bg-green-50 border-green-200' 
          : 'bg-blue-50 border-blue-200'
      }`}>
        <p className={`text-sm font-medium ${
          currentStepIndex === -1 ? 'text-green-900' : 'text-blue-900'
        }`}>
          {currentStepIndex === -1
            ? '✅ Transaction Complete! Payment has been released to supplier.'
            : `⏳ Current Status: ${steps[currentStepIndex]?.title}`}
        </p>
      </div>
    </Card>
  );
}
