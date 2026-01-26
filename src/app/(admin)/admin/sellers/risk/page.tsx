'use client';

import { AlertTriangle, TrendingDown, Eye, Mail, Ban } from 'lucide-react';

const AT_RISK_SELLERS = [
  { id: '1', name: 'QuickShip Ltd', issue: 'High complaint rate', riskLevel: 'HIGH', complaints: 15, rating: 2.8 },
  { id: '2', name: 'Budget Supplies', issue: 'Late deliveries', riskLevel: 'MEDIUM', complaints: 8, rating: 3.2 },
  { id: '3', name: 'New Vendor Co', issue: 'Quality concerns', riskLevel: 'HIGH', complaints: 12, rating: 3.0 },
];

export default function AtRiskSellersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">At-Risk Sellers</h1>
          <p className="text-slate-400">Sellers requiring attention</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/20 rounded-full">
          <AlertTriangle className="w-4 h-4 text-yellow-400" />
          <span className="text-yellow-400 text-sm font-medium">{AT_RISK_SELLERS.length} at risk</span>
        </div>
      </div>

      <div className="grid gap-4">
        {AT_RISK_SELLERS.map((seller) => (
          <div key={seller.id} className={`bg-slate-900 rounded-xl border p-6 ${
            seller.riskLevel === 'HIGH' ? 'border-red-500/50' : 'border-yellow-500/50'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${
                  seller.riskLevel === 'HIGH' ? 'bg-red-500/20' : 'bg-yellow-500/20'
                }`}>
                  <AlertTriangle className={`w-6 h-6 ${
                    seller.riskLevel === 'HIGH' ? 'text-red-400' : 'text-yellow-400'
                  }`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-white font-semibold">{seller.name}</p>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      seller.riskLevel === 'HIGH' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {seller.riskLevel} RISK
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm mt-1">{seller.issue}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="text-red-400">{seller.complaints} complaints</span>
                    <span className="text-slate-400">Rating: {seller.rating}/5</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400">
                  <Mail className="w-4 h-4" />
                </button>
                <button className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400">
                  <Ban className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
