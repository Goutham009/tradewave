'use client';

import { BarChart3, TrendingUp, DollarSign, Package } from 'lucide-react';

export default function SellerAnalyticsPage() {
  const stats = [
    { label: 'Total Sellers', value: '1,234', change: '+12%', icon: BarChart3 },
    { label: 'Active Sellers', value: '987', change: '+8%', icon: TrendingUp },
    { label: 'Avg Revenue/Seller', value: '$45K', change: '+15%', icon: DollarSign },
    { label: 'Total Products', value: '15,678', change: '+22%', icon: Package },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Seller Analytics</h1>
        <p className="text-slate-400">Performance metrics for all sellers</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-slate-900 rounded-xl border border-slate-800 p-6">
            <div className="flex items-center justify-between">
              <stat.icon className="w-8 h-8 text-blue-400" />
              <span className="text-green-400 text-sm">{stat.change}</span>
            </div>
            <p className="text-2xl font-bold text-white mt-4">{stat.value}</p>
            <p className="text-slate-400 text-sm">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
        <h2 className="text-white font-semibold mb-4">Revenue Distribution</h2>
        <div className="h-64 flex items-center justify-center text-slate-500">
          Chart placeholder - Revenue by seller category
        </div>
      </div>
    </div>
  );
}
