'use client';

import { useState } from 'react';
import { CreditCard, DollarSign, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';

const MOCK_PAYMENTS = [
  { id: 'PAY001', orderId: 'ORD001', buyer: 'Acme Corp', amount: 15000, method: 'Bank Transfer', status: 'COMPLETED', date: '2024-01-15' },
  { id: 'PAY002', orderId: 'ORD002', buyer: 'Global Inc', amount: 8500, method: 'Credit Card', status: 'PENDING', date: '2024-01-14' },
  { id: 'PAY003', orderId: 'ORD003', buyer: 'StartupXYZ', amount: 25000, method: 'Escrow', status: 'PROCESSING', date: '2024-01-13' },
];

export default function PaymentsPage() {
  const [payments] = useState(MOCK_PAYMENTS);

  const stats = [
    { label: 'Total Processed', value: '$1.2M', icon: DollarSign, color: 'text-green-400' },
    { label: 'Pending', value: '$45K', icon: Clock, color: 'text-yellow-400' },
    { label: 'Success Rate', value: '98.5%', icon: TrendingUp, color: 'text-blue-400' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Payment Management</h1>
        <p className="text-slate-400">Monitor and manage platform payments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-slate-900 rounded-xl border border-slate-800 p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-800 rounded-lg">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-slate-400 text-sm">{stat.label}</p>
                <p className="text-white text-xl font-bold">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-white font-semibold">Recent Payments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left p-4 text-slate-400 font-medium">Payment ID</th>
                <th className="text-left p-4 text-slate-400 font-medium">Order</th>
                <th className="text-left p-4 text-slate-400 font-medium">Buyer</th>
                <th className="text-left p-4 text-slate-400 font-medium">Amount</th>
                <th className="text-left p-4 text-slate-400 font-medium">Method</th>
                <th className="text-left p-4 text-slate-400 font-medium">Status</th>
                <th className="text-left p-4 text-slate-400 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                  <td className="p-4 text-white font-medium">{payment.id}</td>
                  <td className="p-4 text-slate-300">{payment.orderId}</td>
                  <td className="p-4 text-slate-300">{payment.buyer}</td>
                  <td className="p-4 text-white font-medium">${payment.amount.toLocaleString()}</td>
                  <td className="p-4 text-slate-300">{payment.method}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      payment.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                      payment.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400">{payment.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
