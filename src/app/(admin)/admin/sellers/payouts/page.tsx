'use client';

import { useState } from 'react';
import { Wallet, Clock, CheckCircle, DollarSign, Send } from 'lucide-react';

const MOCK_PAYOUTS = [
  { id: 'PO001', seller: 'Tech Supplies Co', amount: 45000, status: 'PENDING', dueDate: '2024-01-20' },
  { id: 'PO002', seller: 'Industrial Pro', amount: 32000, status: 'PROCESSING', dueDate: '2024-01-18' },
  { id: 'PO003', seller: 'Office Solutions', amount: 28500, status: 'COMPLETED', dueDate: '2024-01-15' },
];

export default function SellerPayoutsPage() {
  const [payouts] = useState(MOCK_PAYOUTS);

  const stats = [
    { label: 'Pending Payouts', value: '$125K', icon: Clock, color: 'text-yellow-400' },
    { label: 'Processing', value: '$45K', icon: Send, color: 'text-blue-400' },
    { label: 'Completed Today', value: '$89K', icon: CheckCircle, color: 'text-green-400' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Seller Payouts</h1>
        <p className="text-slate-400">Manage seller payment disbursements</p>
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
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-white font-semibold">Payout Queue</h2>
          <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white text-sm">
            Process All Pending
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left p-4 text-slate-400 font-medium">Payout ID</th>
                <th className="text-left p-4 text-slate-400 font-medium">Seller</th>
                <th className="text-left p-4 text-slate-400 font-medium">Amount</th>
                <th className="text-left p-4 text-slate-400 font-medium">Status</th>
                <th className="text-left p-4 text-slate-400 font-medium">Due Date</th>
                <th className="text-left p-4 text-slate-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((payout) => (
                <tr key={payout.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                  <td className="p-4 text-white font-medium">{payout.id}</td>
                  <td className="p-4 text-slate-300">{payout.seller}</td>
                  <td className="p-4 text-white font-medium">${payout.amount.toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      payout.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                      payout.status === 'PROCESSING' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {payout.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400">{payout.dueDate}</td>
                  <td className="p-4">
                    {payout.status === 'PENDING' && (
                      <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm">
                        Process
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
