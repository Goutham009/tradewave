'use client';

import { useState } from 'react';
import { TrendingDown, AlertTriangle, Users, Mail, Phone } from 'lucide-react';

const MOCK_CHURN_DATA = [
  { id: '1', name: 'Acme Corp', lastOrder: '60 days ago', totalSpent: 125000, riskScore: 85, reason: 'No activity' },
  { id: '2', name: 'Global Inc', lastOrder: '45 days ago', totalSpent: 89000, riskScore: 72, reason: 'Declining orders' },
  { id: '3', name: 'Tech Ltd', lastOrder: '30 days ago', totalSpent: 45000, riskScore: 55, reason: 'Support issues' },
];

export default function ChurnAnalysisPage() {
  const [atRisk] = useState(MOCK_CHURN_DATA);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Churn Analysis</h1>
        <p className="text-slate-400">Identify and retain at-risk buyers</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <TrendingDown className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Churn Rate</p>
              <p className="text-white text-xl font-bold">4.2%</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">At Risk</p>
              <p className="text-white text-xl font-bold">23 buyers</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Users className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Recovered</p>
              <p className="text-white text-xl font-bold">8 this month</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-white font-semibold">At-Risk Buyers</h2>
        </div>
        <div className="divide-y divide-slate-800">
          {atRisk.map((buyer) => (
            <div key={buyer.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  buyer.riskScore >= 70 ? 'bg-red-500/20' : 'bg-yellow-500/20'
                }`}>
                  <span className={`font-bold ${buyer.riskScore >= 70 ? 'text-red-400' : 'text-yellow-400'}`}>
                    {buyer.riskScore}
                  </span>
                </div>
                <div>
                  <p className="text-white font-medium">{buyer.name}</p>
                  <p className="text-slate-400 text-sm">Last order: {buyer.lastOrder}</p>
                  <p className="text-slate-500 text-xs">Reason: {buyer.reason}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-medium">${buyer.totalSpent.toLocaleString()}</p>
                <p className="text-slate-400 text-sm">lifetime value</p>
                <div className="flex gap-2 mt-2">
                  <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400">
                    <Mail className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400">
                    <Phone className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
