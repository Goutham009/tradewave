'use client';

import { Star, TrendingUp, Award, Eye } from 'lucide-react';

const TOP_SELLERS = [
  { rank: 1, name: 'Tech Supplies Co', revenue: 2500000, orders: 1250, rating: 4.9, growth: '+25%' },
  { rank: 2, name: 'Industrial Pro', revenue: 1800000, orders: 890, rating: 4.8, growth: '+18%' },
  { rank: 3, name: 'Office Solutions', revenue: 1500000, orders: 750, rating: 4.7, growth: '+22%' },
  { rank: 4, name: 'Global Traders', revenue: 1200000, orders: 620, rating: 4.6, growth: '+15%' },
  { rank: 5, name: 'Premium Goods', revenue: 980000, orders: 510, rating: 4.8, growth: '+20%' },
];

export default function TopSellersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Top Performers</h1>
        <p className="text-slate-400">Best performing sellers this month</p>
      </div>

      <div className="grid gap-4">
        {TOP_SELLERS.map((seller) => (
          <div key={seller.rank} className="bg-slate-900 rounded-xl border border-slate-800 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                  seller.rank === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                  seller.rank === 2 ? 'bg-slate-400/20 text-slate-300' :
                  seller.rank === 3 ? 'bg-orange-500/20 text-orange-400' :
                  'bg-slate-800 text-slate-400'
                }`}>
                  #{seller.rank}
                </div>
                <div>
                  <p className="text-white font-semibold text-lg">{seller.name}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="flex items-center gap-1 text-yellow-400 text-sm">
                      <Star className="w-4 h-4 fill-current" /> {seller.rating}
                    </span>
                    <span className="text-slate-400 text-sm">{seller.orders} orders</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-bold text-xl">${(seller.revenue / 1000000).toFixed(1)}M</p>
                <p className="text-green-400 text-sm flex items-center justify-end gap-1">
                  <TrendingUp className="w-4 h-4" /> {seller.growth}
                </p>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 text-sm flex items-center gap-2">
                <Eye className="w-4 h-4" /> View Profile
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
