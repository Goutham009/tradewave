'use client';

import { useState } from 'react';
import { AlertTriangle, Shield, Eye, Ban, CheckCircle } from 'lucide-react';

const MOCK_ALERTS = [
  { id: '1', type: 'Suspicious Login', user: 'user123@example.com', risk: 'HIGH', details: 'Multiple failed attempts from different IPs', timestamp: '2024-01-15 14:30' },
  { id: '2', type: 'Unusual Transaction', user: 'buyer@company.com', risk: 'MEDIUM', details: 'Transaction 5x larger than average', timestamp: '2024-01-15 12:15' },
  { id: '3', type: 'Account Takeover Attempt', user: 'seller@business.com', risk: 'HIGH', details: 'Password reset from new device', timestamp: '2024-01-15 10:00' },
];

export default function FraudDetectionPage() {
  const [alerts] = useState(MOCK_ALERTS);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Fraud Detection</h1>
          <p className="text-slate-400">Monitor and investigate suspicious activities</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 rounded-full">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <span className="text-red-400 text-sm font-medium">{alerts.length} active alerts</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">High Risk</p>
              <p className="text-white text-xl font-bold">2</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <Shield className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Medium Risk</p>
              <p className="text-white text-xl font-bold">1</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Resolved Today</p>
              <p className="text-white text-xl font-bold">5</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {alerts.map((alert) => (
          <div key={alert.id} className={`bg-slate-900 rounded-xl border p-6 ${
            alert.risk === 'HIGH' ? 'border-red-500/50' : 'border-yellow-500/50'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${
                  alert.risk === 'HIGH' ? 'bg-red-500/20' : 'bg-yellow-500/20'
                }`}>
                  <AlertTriangle className={`w-6 h-6 ${
                    alert.risk === 'HIGH' ? 'text-red-400' : 'text-yellow-400'
                  }`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-white font-semibold">{alert.type}</p>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      alert.risk === 'HIGH' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {alert.risk} RISK
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm">{alert.user}</p>
                  <p className="text-slate-500 text-sm mt-1">{alert.details}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="text-slate-500 text-sm">{alert.timestamp}</span>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 text-sm flex items-center gap-1">
                    <Eye className="w-4 h-4" /> Investigate
                  </button>
                  <button className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 rounded-lg text-green-400 text-sm flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Dismiss
                  </button>
                  <button className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 text-sm flex items-center gap-1">
                    <Ban className="w-4 h-4" /> Block
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
