'use client';

import { useState } from 'react';
import { Megaphone, Plus, Edit, Trash2, Eye, Calendar } from 'lucide-react';

const MOCK_PROMOTIONS = [
  { id: '1', name: 'New Year Sale', discount: '20%', type: 'PERCENTAGE', startDate: '2024-01-01', endDate: '2024-01-31', status: 'ACTIVE', uses: 1250 },
  { id: '2', name: 'First Order Discount', discount: '$50', type: 'FIXED', startDate: '2024-01-01', endDate: '2024-12-31', status: 'ACTIVE', uses: 890 },
  { id: '3', name: 'Bulk Order Special', discount: '15%', type: 'PERCENTAGE', startDate: '2024-02-01', endDate: '2024-02-28', status: 'SCHEDULED', uses: 0 },
];

export default function PromotionsPage() {
  const [promotions] = useState(MOCK_PROMOTIONS);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Promotions</h1>
          <p className="text-slate-400">Manage platform-wide promotions and discounts</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create Promotion
        </button>
      </div>

      <div className="grid gap-4">
        {promotions.map((promo) => (
          <div key={promo.id} className="bg-slate-900 rounded-xl border border-slate-800 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Megaphone className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-white font-semibold">{promo.name}</p>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      promo.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {promo.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-slate-400">
                    <span className="text-blue-400 font-medium">{promo.discount} off</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {promo.startDate} - {promo.endDate}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-white font-semibold">{promo.uses.toLocaleString()}</p>
                  <p className="text-slate-400 text-sm">times used</p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400">
                    <Trash2 className="w-4 h-4" />
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
