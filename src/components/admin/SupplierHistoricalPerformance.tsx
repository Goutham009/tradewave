'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Package, Clock, Star, AlertTriangle } from 'lucide-react';

interface Transaction {
  id: string;
  productType: string;
  amount: number;
  completedAt: string;
  deliveredOnTime: boolean;
  rating: number | null;
}

interface Dispute {
  id: string;
  title: string;
  description: string;
  resolved: boolean;
  createdAt: string;
}

interface PerformanceData {
  totalTransactions: number;
  completedTransactions: number;
  successRate: number;
  onTimeDeliveries: number;
  onTimeDeliveryRate: number;
  averageRating: number;
  totalReviews: number;
  recentTransactions: Transaction[];
  disputes: Dispute[];
  qualityScore: number;
  communicationScore: number;
  reliabilityScore: number;
}

interface SupplierHistoricalPerformanceProps {
  supplierId: string;
}

const mockPerformanceData: PerformanceData = {
  totalTransactions: 156,
  completedTransactions: 148,
  successRate: 94.9,
  onTimeDeliveries: 140,
  onTimeDeliveryRate: 94.6,
  averageRating: 4.8,
  totalReviews: 132,
  recentTransactions: [
    {
      id: 'txn-001',
      productType: 'Industrial Sensors',
      amount: 45000,
      completedAt: '2024-01-15T10:30:00Z',
      deliveredOnTime: true,
      rating: 5.0,
    },
    {
      id: 'txn-002',
      productType: 'Automation Equipment',
      amount: 78000,
      completedAt: '2024-01-10T14:20:00Z',
      deliveredOnTime: true,
      rating: 4.8,
    },
    {
      id: 'txn-003',
      productType: 'Electronic Components',
      amount: 23000,
      completedAt: '2024-01-05T09:15:00Z',
      deliveredOnTime: false,
      rating: 4.2,
    },
    {
      id: 'txn-004',
      productType: 'Industrial Sensors',
      amount: 56000,
      completedAt: '2023-12-28T16:45:00Z',
      deliveredOnTime: true,
      rating: 4.9,
    },
    {
      id: 'txn-005',
      productType: 'Precision Instruments',
      amount: 34000,
      completedAt: '2023-12-20T11:00:00Z',
      deliveredOnTime: true,
      rating: null,
    },
  ],
  disputes: [
    {
      id: 'disp-001',
      title: 'Quality issue with batch #4521',
      description: 'Some units in the batch did not meet the specified tolerance levels.',
      resolved: true,
      createdAt: '2023-11-15T08:00:00Z',
    },
  ],
  qualityScore: 92,
  communicationScore: 95,
  reliabilityScore: 88,
};

export function SupplierHistoricalPerformance({ supplierId }: SupplierHistoricalPerformanceProps) {
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerformanceData();
  }, [supplierId]);

  const fetchPerformanceData = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setPerformanceData(mockPerformanceData);
    setLoading(false);
  };

  if (loading || !performanceData) {
    return (
      <Card className="p-8 text-center">
        <p className="text-neutral-500">Loading performance data...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <Package className="w-5 h-5 text-blue-500" />
            <p className="text-sm text-neutral-600">Total Transactions</p>
          </div>
          <p className="text-3xl font-bold">{performanceData.totalTransactions}</p>
          <p className="text-xs text-neutral-500 mt-1">All-time</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <p className="text-sm text-neutral-600">Success Rate</p>
          </div>
          <p className="text-3xl font-bold text-green-600">
            {performanceData.successRate.toFixed(1)}%
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            {performanceData.completedTransactions} completed
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-blue-500" />
            <p className="text-sm text-neutral-600">On-Time Delivery</p>
          </div>
          <p className="text-3xl font-bold text-blue-600">
            {performanceData.onTimeDeliveryRate.toFixed(1)}%
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            {performanceData.onTimeDeliveries} on-time
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <Star className="w-5 h-5 text-yellow-500" />
            <p className="text-sm text-neutral-600">Avg Rating</p>
          </div>
          <p className="text-3xl font-bold text-yellow-600">
            {performanceData.averageRating.toFixed(1)}/5.0
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            {performanceData.totalReviews} reviews
          </p>
        </Card>
      </div>

      {/* Transaction History */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">Transaction History</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-100">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold">Date</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Product</th>
                <th className="px-4 py-2 text-right text-sm font-semibold">Amount</th>
                <th className="px-4 py-2 text-center text-sm font-semibold">Delivery</th>
                <th className="px-4 py-2 text-center text-sm font-semibold">Rating</th>
                <th className="px-4 py-2 text-center text-sm font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {performanceData.recentTransactions.map((transaction) => (
                <tr key={transaction.id} className="border-t border-neutral-200">
                  <td className="px-4 py-3 text-sm">
                    {new Date(transaction.completedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {transaction.productType}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    ${transaction.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {transaction.deliveredOnTime ? (
                      <Badge variant="success">On Time</Badge>
                    ) : (
                      <Badge variant="warning">Delayed</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {transaction.rating ? (
                      <span className="flex items-center justify-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        {transaction.rating.toFixed(1)}
                      </span>
                    ) : (
                      <span className="text-neutral-400">N/A</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant="success">Completed</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Performance Trends */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">Performance Trends (Last 12 Months)</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Quality Score</span>
              <span className="text-sm font-bold">{performanceData.qualityScore}/100</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-3">
              <div 
                className="bg-green-500 h-3 rounded-full transition-all" 
                style={{ width: `${performanceData.qualityScore}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Communication Score</span>
              <span className="text-sm font-bold">{performanceData.communicationScore}/100</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-3">
              <div 
                className="bg-blue-500 h-3 rounded-full transition-all" 
                style={{ width: `${performanceData.communicationScore}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Reliability Score</span>
              <span className="text-sm font-bold">{performanceData.reliabilityScore}/100</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-3">
              <div 
                className="bg-purple-500 h-3 rounded-full transition-all" 
                style={{ width: `${performanceData.reliabilityScore}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Issues & Disputes */}
      {performanceData.disputes.length > 0 && (
        <Card className="p-6 border-red-200 bg-red-50">
          <h3 className="text-lg font-bold mb-4 text-red-700 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Issues & Disputes
          </h3>
          <div className="space-y-3">
            {performanceData.disputes.map((dispute) => (
              <div key={dispute.id} className="bg-white rounded p-3">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-semibold">{dispute.title}</p>
                  <Badge variant={dispute.resolved ? 'success' : 'destructive'}>
                    {dispute.resolved ? 'Resolved' : 'Open'}
                  </Badge>
                </div>
                <p className="text-sm text-neutral-600">{dispute.description}</p>
                <p className="text-xs text-neutral-500 mt-2">
                  {new Date(dispute.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
