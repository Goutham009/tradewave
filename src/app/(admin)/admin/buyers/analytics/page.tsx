'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart3, TrendingUp, Users, DollarSign, 
  ShoppingCart, ArrowUpRight, ArrowDownRight 
} from 'lucide-react';

export default function BuyerAnalyticsPage() {
  const stats = [
    { label: 'Total Buyers', value: '2,847', change: '+12.5%', positive: true, icon: Users },
    { label: 'Active Buyers', value: '1,923', change: '+8.2%', positive: true, icon: ShoppingCart },
    { label: 'Avg. Order Value', value: '$4,250', change: '+15.3%', positive: true, icon: DollarSign },
    { label: 'Retention Rate', value: '78.5%', change: '-2.1%', positive: false, icon: TrendingUp },
  ];

  const topCategories = [
    { name: 'Industrial Equipment', orders: 456, revenue: '$1.2M' },
    { name: 'Raw Materials', orders: 389, revenue: '$980K' },
    { name: 'Electronics', orders: 312, revenue: '$756K' },
    { name: 'Machinery Parts', orders: 278, revenue: '$634K' },
    { name: 'Chemicals', orders: 234, revenue: '$512K' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Buyer Analytics</h1>
        <p className="text-slate-400 mt-1">Track buyer performance and trends</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                  <div className={`flex items-center gap-1 mt-1 text-sm ${stat.positive ? 'text-green-400' : 'text-red-400'}`}>
                    {stat.positive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    {stat.change}
                  </div>
                </div>
                <div className="p-3 bg-slate-700 rounded-lg">
                  <stat.icon className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top Categories */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Top Purchasing Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topCategories.map((category, index) => (
              <div key={category.name} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-4">
                  <span className="w-8 h-8 flex items-center justify-center bg-blue-500/20 text-blue-400 rounded-full font-bold">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-white">{category.name}</p>
                    <p className="text-sm text-slate-400">{category.orders} orders</p>
                  </div>
                </div>
                <span className="text-lg font-semibold text-green-400">{category.revenue}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
