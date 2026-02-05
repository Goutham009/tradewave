'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, TrendingDown, Clock, Users, BarChart3 } from 'lucide-react';

interface OperationsAnalyticsDashboardProps {
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
}

interface FunnelStage {
  stage: string;
  count: number;
  conversionRate: number;
  dropOffRate: number;
}

interface ConversionFunnel {
  totalRequirements: number;
  totalQuotationsReceived: number;
  totalQuotationsAccepted: number;
  totalPaymentsCompleted: number;
  totalDelivered: number;
  stages: FunnelStage[];
}

interface StageTiming {
  requirementToQuotation: number;
  quotationToAcceptance: number;
  acceptanceToPayment: number;
  paymentToDelivery: number;
  totalAverageTime: number;
}

interface ProcurementPerformance {
  accountManagerId: string;
  accountManagerName: string;
  totalAssignedRequirements: number;
  verifiedRequirements: number;
  averageVerificationTime: number;
  conversionRate: number;
}

interface SupplierAcceptance {
  supplierId: string;
  supplierName: string;
  companyName: string;
  totalQuotations: number;
  acceptedQuotations: number;
  rejectedQuotations: number;
  acceptanceRate: number;
  averageResponseTime: number;
  tier: string;
}

export function OperationsAnalyticsDashboard({ dateRange }: OperationsAnalyticsDashboardProps) {
  const [conversionFunnel, setConversionFunnel] = useState<ConversionFunnel | null>(null);
  const [averageTimes, setAverageTimes] = useState<StageTiming | null>(null);
  const [procurementPerformance, setProcurementPerformance] = useState<ProcurementPerformance[]>([]);
  const [supplierAcceptance, setSupplierAcceptance] = useState<SupplierAcceptance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const params = `startDate=${dateRange.startDate.toISOString()}&endDate=${dateRange.endDate.toISOString()}`;

      const [funnelRes, timesRes, procurementRes, supplierRes] = await Promise.all([
        fetch(`/api/admin/analytics/conversion-funnel?${params}`),
        fetch(`/api/admin/analytics/average-times?${params}`),
        fetch(`/api/admin/analytics/procurement-performance?${params}`),
        fetch(`/api/admin/analytics/supplier-acceptance?${params}`),
      ]);

      if (funnelRes.ok) setConversionFunnel(await funnelRes.json());
      if (timesRes.ok) setAverageTimes(await timesRes.json());
      if (procurementRes.ok) setProcurementPerformance(await procurementRes.json());
      if (supplierRes.ok) setSupplierAcceptance(await supplierRes.json());
    } catch (error) {
      console.error('Analytics fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Conversion Funnel */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Conversion Funnel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {conversionFunnel?.stages.map((stage, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <p className="font-semibold text-white">{stage.stage}</p>
                    <p className="text-sm text-slate-400">{stage.count.toLocaleString()} items</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-400">{stage.conversionRate.toFixed(1)}%</p>
                    {stage.dropOffRate > 0 && (
                      <p className="text-sm text-red-400">-{stage.dropOffRate.toFixed(1)}% drop-off</p>
                    )}
                  </div>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-400 h-3 rounded-full transition-all"
                    style={{ width: `${stage.conversionRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Funnel Summary */}
          <div className="mt-6 pt-6 border-t border-slate-700 grid grid-cols-5 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-white">{conversionFunnel?.totalRequirements || 0}</p>
              <p className="text-xs text-slate-400">Requirements</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{conversionFunnel?.totalQuotationsReceived || 0}</p>
              <p className="text-xs text-slate-400">Quoted</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{conversionFunnel?.totalQuotationsAccepted || 0}</p>
              <p className="text-xs text-slate-400">Accepted</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{conversionFunnel?.totalPaymentsCompleted || 0}</p>
              <p className="text-xs text-slate-400">Paid</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">{conversionFunnel?.totalDelivered || 0}</p>
              <p className="text-xs text-slate-400">Delivered</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Average Time Per Stage */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Average Time Per Stage (hours)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-700/50 p-4 rounded-lg">
              <p className="text-sm text-slate-400 mb-1">Requirement → Quotation</p>
              <p className="text-2xl font-bold text-white">{averageTimes?.requirementToQuotation || 0}h</p>
            </div>
            <div className="bg-slate-700/50 p-4 rounded-lg">
              <p className="text-sm text-slate-400 mb-1">Quotation → Acceptance</p>
              <p className="text-2xl font-bold text-white">{averageTimes?.quotationToAcceptance || 0}h</p>
            </div>
            <div className="bg-slate-700/50 p-4 rounded-lg">
              <p className="text-sm text-slate-400 mb-1">Acceptance → Payment</p>
              <p className="text-2xl font-bold text-white">{averageTimes?.acceptanceToPayment || 0}h</p>
            </div>
            <div className="bg-slate-700/50 p-4 rounded-lg">
              <p className="text-sm text-slate-400 mb-1">Payment → Delivery</p>
              <p className="text-2xl font-bold text-white">{averageTimes?.paymentToDelivery || 0}h</p>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-slate-700">
            <p className="text-sm text-slate-400 mb-1">Total Average Cycle Time</p>
            <p className="text-3xl font-bold text-blue-400">{averageTimes?.totalAverageTime || 0}h</p>
            <p className="text-sm text-slate-500 mt-1">
              ≈ {((averageTimes?.totalAverageTime || 0) / 24).toFixed(1)} days
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Procurement Team Performance */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5" />
            Procurement Team Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Account Manager</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">Assigned</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">Verified</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">Avg Time (h)</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">Conversion</th>
                </tr>
              </thead>
              <tbody>
                {procurementPerformance.map((manager) => (
                  <tr key={manager.accountManagerId} className="border-b border-slate-700/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                          {manager.accountManagerName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="font-medium text-white">{manager.accountManagerName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-white">{manager.totalAssignedRequirements}</td>
                    <td className="py-3 px-4 text-right text-white">{manager.verifiedRequirements}</td>
                    <td className="py-3 px-4 text-right text-white">{manager.averageVerificationTime}</td>
                    <td className="py-3 px-4 text-right">
                      <Badge className={manager.conversionRate >= 50 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}>
                        {manager.conversionRate.toFixed(1)}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Supplier Acceptance Rates */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Top Suppliers by Acceptance Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Supplier</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Company</th>
                  <th className="text-center py-3 px-4 text-slate-400 font-medium">Tier</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">Quotes</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">Accepted</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">Rate</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">Resp. Time</th>
                </tr>
              </thead>
              <tbody>
                {supplierAcceptance.slice(0, 10).map((supplier) => (
                  <tr key={supplier.supplierId} className="border-b border-slate-700/50">
                    <td className="py-3 px-4 font-medium text-white">{supplier.supplierName}</td>
                    <td className="py-3 px-4 text-slate-300">{supplier.companyName}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge className={
                        supplier.tier === 'TRUSTED' ? 'bg-green-500/20 text-green-400' :
                        supplier.tier === 'STANDARD' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }>
                        {supplier.tier}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right text-white">{supplier.totalQuotations}</td>
                    <td className="py-3 px-4 text-right text-white">{supplier.acceptedQuotations}</td>
                    <td className="py-3 px-4 text-right">
                      <Badge className={supplier.acceptanceRate >= 30 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}>
                        {supplier.acceptanceRate.toFixed(1)}%
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-300">{supplier.averageResponseTime}h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
