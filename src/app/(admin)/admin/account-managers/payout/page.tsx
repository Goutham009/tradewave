'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, CreditCard, Clock, CheckCircle, Calendar, Download } from 'lucide-react';

export default function ManagerPayoutPage() {
  const payoutStats = [
    { label: 'Total Commissions Due', value: '$78,450', icon: DollarSign, color: 'text-purple-400' },
    { label: 'Pending Approval', value: '$23,200', icon: Clock, color: 'text-yellow-400' },
    { label: 'Paid This Month', value: '$55,250', icon: CheckCircle, color: 'text-green-400' },
    { label: 'Next Payout Date', value: 'Jan 31', icon: Calendar, color: 'text-blue-400' },
  ];

  const pendingPayouts = [
    { id: 'MP-001', manager: 'Sarah Johnson', base: 8500, commission: 4000, bonus: 2500, total: 15000, period: 'Jan 2024', status: 'pending' },
    { id: 'MP-002', manager: 'Mike Chen', base: 8500, commission: 3200, bonus: 1800, total: 13500, period: 'Jan 2024', status: 'pending' },
    { id: 'MP-003', manager: 'David Park', base: 8000, commission: 2800, bonus: 1500, total: 12300, period: 'Jan 2024', status: 'approved' },
    { id: 'MP-004', manager: 'Lisa Wong', base: 8000, commission: 2500, bonus: 1200, total: 11700, period: 'Jan 2024', status: 'approved' },
    { id: 'MP-005', manager: 'James Miller', base: 7500, commission: 2200, bonus: 1000, total: 10700, period: 'Jan 2024', status: 'pending' },
  ];

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-500/20 text-yellow-400',
      approved: 'bg-green-500/20 text-green-400',
      paid: 'bg-blue-500/20 text-blue-400',
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Manager Payouts</h1>
          <p className="text-slate-400 mt-1">Manage salaries, commissions, and bonuses</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-slate-600 text-slate-300">
            <Download className="w-4 h-4 mr-2" />
            Export Payroll
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <CreditCard className="w-4 h-4 mr-2" />
            Process Payroll
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

      {/* Payroll Table */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-purple-400" />
            Pending Payroll - January 2024
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">ID</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Manager</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Base Salary</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Commission</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Bonus</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Total</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingPayouts.map((payout) => (
                  <tr key={payout.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="py-3 px-4 text-white font-mono">{payout.id}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                          {payout.manager.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="font-medium text-white">{payout.manager}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">${payout.base.toLocaleString()}</td>
                    <td className="py-3 px-4 text-blue-400">${payout.commission.toLocaleString()}</td>
                    <td className="py-3 px-4 text-green-400">${payout.bonus.toLocaleString()}</td>
                    <td className="py-3 px-4 text-purple-400 font-semibold">${payout.total.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(payout.status)}`}>
                        {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        {payout.status === 'pending' ? (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            Approve
                          </Button>
                        ) : (
                          <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                            Pay Now
                          </Button>
                        )}
                        <Button size="sm" variant="outline" className="border-slate-600 text-slate-300">
                          Details
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
