'use client';

import { useState } from 'react';
import { AlertCircle, RefreshCw, Eye, Mail } from 'lucide-react';

const MOCK_FAILED = [
  { id: 'PAY010', orderId: 'ORD010', buyer: 'Test Corp', amount: 5000, reason: 'Insufficient funds', attempts: 3, lastAttempt: '2024-01-15 14:30' },
  { id: 'PAY011', orderId: 'ORD011', buyer: 'Demo Inc', amount: 12000, reason: 'Card declined', attempts: 2, lastAttempt: '2024-01-14 09:15' },
];

export default function FailedPaymentsPage() {
  const [payments] = useState(MOCK_FAILED);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Failed Payments</h1>
          <p className="text-slate-400">Payments requiring attention</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 rounded-full">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span className="text-red-400 text-sm font-medium">{payments.length} failed</span>
        </div>
      </div>

      <div className="grid gap-4">
        {payments.map((payment) => (
          <div key={payment.id} className="bg-slate-900 rounded-xl border border-red-500/30 p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-500/20 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold">{payment.id}</span>
                    <span className="text-slate-400">→</span>
                    <span className="text-slate-300">{payment.orderId}</span>
                  </div>
                  <p className="text-slate-400">{payment.buyer}</p>
                  <p className="text-red-400 text-sm mt-1">{payment.reason}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-semibold text-lg">${payment.amount.toLocaleString()}</div>
                <div className="text-slate-500 text-sm">{payment.attempts} attempts</div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800">
              <span className="text-slate-500 text-sm">Last attempt: {payment.lastAttempt}</span>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 text-sm flex items-center gap-1">
                  <Eye className="w-4 h-4" /> Details
                </button>
                <button className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-blue-400 text-sm flex items-center gap-1">
                  <RefreshCw className="w-4 h-4" /> Retry
                </button>
                <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 text-sm flex items-center gap-1">
                  <Mail className="w-4 h-4" /> Notify
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
