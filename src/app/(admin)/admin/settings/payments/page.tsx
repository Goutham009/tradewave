'use client';

import { useState } from 'react';
import { CreditCard, CheckCircle, Settings, Plus } from 'lucide-react';

const PAYMENT_GATEWAYS = [
  { id: '1', name: 'Stripe', status: 'ACTIVE', mode: 'LIVE', lastTransaction: '2024-01-15' },
  { id: '2', name: 'PayPal', status: 'ACTIVE', mode: 'LIVE', lastTransaction: '2024-01-14' },
  { id: '3', name: 'Bank Transfer', status: 'ACTIVE', mode: 'LIVE', lastTransaction: '2024-01-13' },
  { id: '4', name: 'Razorpay', status: 'INACTIVE', mode: 'TEST', lastTransaction: 'Never' },
];

export default function PaymentSettingsPage() {
  const [gateways] = useState(PAYMENT_GATEWAYS);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Payment Gateway</h1>
          <p className="text-slate-400">Configure payment processing options</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Gateway
        </button>
      </div>

      <div className="grid gap-4">
        {gateways.map((gateway) => (
          <div key={gateway.id} className="bg-slate-900 rounded-xl border border-slate-800 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${
                  gateway.status === 'ACTIVE' ? 'bg-green-500/20' : 'bg-slate-800'
                }`}>
                  <CreditCard className={`w-6 h-6 ${
                    gateway.status === 'ACTIVE' ? 'text-green-400' : 'text-slate-500'
                  }`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-white font-semibold">{gateway.name}</p>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      gateway.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'
                    }`}>
                      {gateway.status}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      gateway.mode === 'LIVE' ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {gateway.mode}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm mt-1">Last transaction: {gateway.lastTransaction}</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 flex items-center gap-2">
                <Settings className="w-4 h-4" /> Configure
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
        <h2 className="text-white font-semibold mb-4">Payment Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-slate-800">
            <div>
              <p className="text-white">Auto-capture payments</p>
              <p className="text-slate-400 text-sm">Automatically capture payments upon order confirmation</p>
            </div>
            <button className="w-12 h-6 bg-green-600 rounded-full relative">
              <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
            </button>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-slate-800">
            <div>
              <p className="text-white">Escrow for new sellers</p>
              <p className="text-slate-400 text-sm">Hold payments in escrow for unverified sellers</p>
            </div>
            <button className="w-12 h-6 bg-green-600 rounded-full relative">
              <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
