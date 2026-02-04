'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart3, TrendingUp, Building2, DollarSign, 
  Package, ArrowUpRight, ArrowDownRight 
} from 'lucide-react';

export default function SupplierAnalyticsPage() {
  const stats = [
    { label: 'Total Suppliers', value: '1,234', change: '+8.3%', positive: true, icon: Building2 },
    { label: 'Active Suppliers', value: '892', change: '+5.7%', positive: true, icon: Package },
    { label: 'Avg. Order Fulfillment', value: '94.2%', change: '+2.1%', positive: true, icon: TrendingUp },
    { label: 'Total GMV', value: '$12.4M', change: '+18.5%', positive: true, icon: DollarSign },
  ];

  const topCategories = [
    { name: 'Industrial Equipment', suppliers: 234, gmv: '$3.2M' },
    { name: 'Raw Materials', suppliers: 189, gmv: '$2.8M' },
    { name: 'Electronics Components', suppliers: 156, gmv: '$2.1M' },
    { name: 'Machinery & Parts', suppliers: 142, gmv: '$1.9M' },
    { name: 'Chemicals & Compounds', suppliers: 98, gmv: '$1.4M' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Supplier Analytics</h1>
        <p className="text-slate-400 mt-1">Track supplier performance and marketplace health</p>
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
                  <stat.icon className="w-6 h-6 text-emerald-400" />
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
            Top Supplier Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topCategories.map((category, index) => (
              <div key={category.name} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-4">
                  <span className="w-8 h-8 flex items-center justify-center bg-emerald-500/20 text-emerald-400 rounded-full font-bold">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-white">{category.name}</p>
                    <p className="text-sm text-slate-400">{category.suppliers} suppliers</p>
                  </div>
                </div>
                <span className="text-lg font-semibold text-green-400">{category.gmv}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
