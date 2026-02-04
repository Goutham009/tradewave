'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, CreditCard, Clock, CheckCircle, AlertCircle, Download } from 'lucide-react';

export default function BuyerPayoutPage() {
  const payoutStats = [
    { label: 'Total Refunds Due', value: '$45,230', icon: DollarSign, color: 'text-blue-400' },
    { label: 'Pending Processing', value: '$12,450', icon: Clock, color: 'text-yellow-400' },
    { label: 'Processed This Month', value: '$32,780', icon: CheckCircle, color: 'text-green-400' },
    { label: 'Failed/Disputed', value: '$2,100', icon: AlertCircle, color: 'text-red-400' },
  ];

  const pendingPayouts = [
    { id: 'PO-001', buyer: 'TechCorp Industries', amount: 4500, reason: 'Order cancellation refund', date: '2024-01-20', status: 'pending' },
    { id: 'PO-002', buyer: 'Global Materials Ltd', amount: 2800, reason: 'Quality dispute settlement', date: '2024-01-19', status: 'pending' },
    { id: 'PO-003', buyer: 'Pacific Trading Co', amount: 1950, reason: 'Shipping damage claim', date: '2024-01-18', status: 'processing' },
    { id: 'PO-004', buyer: 'Sunrise Manufacturing', amount: 3200, reason: 'Partial order refund', date: '2024-01-17', status: 'processing' },
  ];

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-500/20 text-yellow-400',
      processing: 'bg-blue-500/20 text-blue-400',
      completed: 'bg-green-500/20 text-green-400',
      failed: 'bg-red-500/20 text-red-400',
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Buyer Payouts</h1>
          <p className="text-slate-400 mt-1">Manage refunds and payouts to buyers</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-slate-600 text-slate-300">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button className="bg-green-600 hover:bg-green-700">
            <CreditCard className="w-4 h-4 mr-2" />
            Process All Pending
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {payoutStats.map((stat) => (
          <Card key={stat.label} className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">{stat.label}</p>
                  <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                </div>
                <div className="p-3 bg-slate-700 rounded-lg">
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pending Payouts */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            Pending Payouts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Payout ID</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Buyer</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Amount</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Reason</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Date</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingPayouts.map((payout) => (
                  <tr key={payout.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="py-3 px-4 text-white font-mono">{payout.id}</td>
                    <td className="py-3 px-4 text-white">{payout.buyer}</td>
                    <td className="py-3 px-4 text-green-400 font-semibold">${payout.amount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-slate-300">{payout.reason}</td>
                    <td className="py-3 px-4 text-slate-400">{payout.date}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(payout.status)}`}>
                        {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" className="border-slate-600 text-slate-300">
                          Review
                        </Button>
                      </div>
                    </td>
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
