'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, TrendingUp, DollarSign, ShoppingCart, Award } from 'lucide-react';

export default function BuyerTopPerformersPage() {
  const topBuyers = [
    { rank: 1, name: 'TechCorp Industries', company: 'Manufacturing', orders: 156, totalSpend: '$2.4M', growth: '+34%', rating: 4.9 },
    { rank: 2, name: 'Global Materials Ltd', company: 'Construction', orders: 142, totalSpend: '$1.9M', growth: '+28%', rating: 4.8 },
    { rank: 3, name: 'Pacific Trading Co', company: 'Import/Export', orders: 128, totalSpend: '$1.7M', growth: '+22%', rating: 4.7 },
    { rank: 4, name: 'Sunrise Manufacturing', company: 'Electronics', orders: 115, totalSpend: '$1.5M', growth: '+19%', rating: 4.8 },
    { rank: 5, name: 'Delta Enterprises', company: 'Automotive', orders: 98, totalSpend: '$1.3M', growth: '+15%', rating: 4.6 },
    { rank: 6, name: 'Prime Industries', company: 'Chemicals', orders: 89, totalSpend: '$1.1M', growth: '+12%', rating: 4.7 },
    { rank: 7, name: 'Atlas Solutions', company: 'Machinery', orders: 76, totalSpend: '$980K', growth: '+10%', rating: 4.5 },
    { rank: 8, name: 'Nordic Supplies', company: 'Raw Materials', orders: 72, totalSpend: '$890K', growth: '+8%', rating: 4.6 },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Top Performing Buyers</h1>
          <p className="text-slate-400 mt-1">Buyers with highest order volume and spend</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 rounded-lg">
          <Award className="w-5 h-5 text-yellow-400" />
          <span className="text-yellow-400 font-medium">This Month</span>
        </div>
      </div>

      {/* Top 3 Highlight */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {topBuyers.slice(0, 3).map((buyer, index) => (
          <Card key={buyer.rank} className={`bg-gradient-to-br ${index === 0 ? 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/50' : index === 1 ? 'from-slate-400/20 to-slate-500/10 border-slate-400/50' : 'from-amber-600/20 to-amber-700/10 border-amber-600/50'} border`}>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl font-bold ${index === 0 ? 'bg-yellow-500 text-yellow-900' : index === 1 ? 'bg-slate-400 text-slate-900' : 'bg-amber-600 text-amber-900'}`}>
                  #{buyer.rank}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">{buyer.name}</h3>
                <p className="text-sm text-slate-400">{buyer.company}</p>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-2xl font-bold text-white">{buyer.totalSpend}</p>
                    <p className="text-xs text-slate-400">Total Spend</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-400">{buyer.growth}</p>
                    <p className="text-xs text-slate-400">Growth</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Full Leaderboard */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            Full Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Rank</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Buyer</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Orders</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Total Spend</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Growth</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Rating</th>
                </tr>
              </thead>
              <tbody>
                {topBuyers.map((buyer) => (
                  <tr key={buyer.rank} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="py-3 px-4">
                      <span className={`w-8 h-8 inline-flex items-center justify-center rounded-full font-bold ${buyer.rank <= 3 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-700 text-slate-300'}`}>
                        {buyer.rank}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-white">{buyer.name}</p>
                      <p className="text-sm text-slate-400">{buyer.company}</p>
                    </td>
                    <td className="py-3 px-4 text-white">{buyer.orders}</td>
                    <td className="py-3 px-4 text-white font-medium">{buyer.totalSpend}</td>
                    <td className="py-3 px-4 text-green-400">{buyer.growth}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-white">{buyer.rating}</span>
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
