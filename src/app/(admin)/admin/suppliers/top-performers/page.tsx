'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, TrendingUp, DollarSign, Package, Award } from 'lucide-react';

export default function SupplierTopPerformersPage() {
  const topSuppliers = [
    { rank: 1, name: 'Premium Industrial Co', category: 'Manufacturing', orders: 342, revenue: '$4.2M', fulfillment: '98.5%', rating: 4.9 },
    { rank: 2, name: 'Global Parts Supply', category: 'Components', orders: 298, revenue: '$3.1M', fulfillment: '97.8%', rating: 4.8 },
    { rank: 3, name: 'Elite Materials Ltd', category: 'Raw Materials', orders: 256, revenue: '$2.8M', fulfillment: '96.9%', rating: 4.8 },
    { rank: 4, name: 'TechSource Industries', category: 'Electronics', orders: 234, revenue: '$2.4M', fulfillment: '97.2%', rating: 4.7 },
    { rank: 5, name: 'Precision Machinery', category: 'Machinery', orders: 198, revenue: '$2.1M', fulfillment: '96.5%', rating: 4.7 },
    { rank: 6, name: 'Quality Chemicals Inc', category: 'Chemicals', orders: 176, revenue: '$1.8M', fulfillment: '95.8%', rating: 4.6 },
    { rank: 7, name: 'Atlas Steel Works', category: 'Metals', orders: 156, revenue: '$1.5M', fulfillment: '96.1%', rating: 4.6 },
    { rank: 8, name: 'Continental Supplies', category: 'General', orders: 142, revenue: '$1.3M', fulfillment: '95.2%', rating: 4.5 },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Top Performing Suppliers</h1>
          <p className="text-slate-400 mt-1">Suppliers with highest fulfillment and revenue</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 rounded-lg">
          <Award className="w-5 h-5 text-emerald-400" />
          <span className="text-emerald-400 font-medium">This Quarter</span>
        </div>
      </div>

      {/* Top 3 Highlight */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {topSuppliers.slice(0, 3).map((supplier, index) => (
          <Card key={supplier.rank} className={`bg-gradient-to-br ${index === 0 ? 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/50' : index === 1 ? 'from-slate-400/20 to-slate-500/10 border-slate-400/50' : 'from-amber-600/20 to-amber-700/10 border-amber-600/50'} border`}>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl font-bold ${index === 0 ? 'bg-yellow-500 text-yellow-900' : index === 1 ? 'bg-slate-400 text-slate-900' : 'bg-amber-600 text-amber-900'}`}>
                  #{supplier.rank}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">{supplier.name}</h3>
                <p className="text-sm text-slate-400">{supplier.category}</p>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-2xl font-bold text-white">{supplier.revenue}</p>
                    <p className="text-xs text-slate-400">Revenue</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-400">{supplier.fulfillment}</p>
                    <p className="text-xs text-slate-400">Fulfillment</p>
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
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Supplier</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Orders</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Revenue</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Fulfillment</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Rating</th>
                </tr>
              </thead>
              <tbody>
                {topSuppliers.map((supplier) => (
                  <tr key={supplier.rank} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="py-3 px-4">
                      <span className={`w-8 h-8 inline-flex items-center justify-center rounded-full font-bold ${supplier.rank <= 3 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-700 text-slate-300'}`}>
                        {supplier.rank}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-white">{supplier.name}</p>
                      <p className="text-sm text-slate-400">{supplier.category}</p>
                    </td>
                    <td className="py-3 px-4 text-white">{supplier.orders}</td>
                    <td className="py-3 px-4 text-white font-medium">{supplier.revenue}</td>
                    <td className="py-3 px-4 text-green-400">{supplier.fulfillment}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-white">{supplier.rating}</span>
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
