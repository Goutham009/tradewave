'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, CreditCard, Clock, CheckCircle, AlertCircle, Download } from 'lucide-react';

export default function SupplierPayoutPage() {
  const payoutStats = [
    { label: 'Total Payouts Due', value: '$892,450', icon: DollarSign, color: 'text-emerald-400' },
    { label: 'Pending Processing', value: '$234,560', icon: Clock, color: 'text-yellow-400' },
    { label: 'Processed This Month', value: '$657,890', icon: CheckCircle, color: 'text-green-400' },
    { label: 'On Hold', value: '$45,200', icon: AlertCircle, color: 'text-red-400' },
  ];

  const pendingPayouts = [
    { id: 'SP-001', supplier: 'Premium Industrial Co', amount: 45000, orders: 12, date: '2024-01-20', status: 'pending' },
    { id: 'SP-002', supplier: 'Global Parts Supply', amount: 38500, orders: 9, date: '2024-01-19', status: 'pending' },
    { id: 'SP-003', supplier: 'Elite Materials Ltd', amount: 52000, orders: 15, date: '2024-01-18', status: 'processing' },
    { id: 'SP-004', supplier: 'TechSource Industries', amount: 28900, orders: 7, date: '2024-01-17', status: 'processing' },
    { id: 'SP-005', supplier: 'Precision Machinery', amount: 67800, orders: 18, date: '2024-01-16', status: 'pending' },
  ];

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-500/20 text-yellow-400',
      processing: 'bg-blue-500/20 text-blue-400',
      completed: 'bg-green-500/20 text-green-400',
      hold: 'bg-red-500/20 text-red-400',
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Supplier Payouts</h1>
          <p className="text-slate-400 mt-1">Manage supplier payments and settlements</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-slate-600 text-slate-300">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700">
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
            Pending Supplier Payouts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Payout ID</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Supplier</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Amount</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Orders</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Date</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingPayouts.map((payout) => (
                  <tr key={payout.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="py-3 px-4 text-white font-mono">{payout.id}</td>
                    <td className="py-3 px-4 text-white">{payout.supplier}</td>
                    <td className="py-3 px-4 text-emerald-400 font-semibold">${payout.amount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-slate-300">{payout.orders} orders</td>
                    <td className="py-3 px-4 text-slate-400">{payout.date}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(payout.status)}`}>
                        {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" className="border-slate-600 text-slate-300">
                          Hold
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
