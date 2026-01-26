'use client';

import { Users, UserPlus, UserCheck, TrendingUp } from 'lucide-react';

export default function UserGrowthPage() {
  const stats = [
    { label: 'Total Users', value: '12,456', change: '+18%', icon: Users },
    { label: 'New This Month', value: '1,234', change: '+25%', icon: UserPlus },
    { label: 'Verified Users', value: '8,901', change: '+12%', icon: UserCheck },
    { label: 'Active Rate', value: '78%', change: '+5%', icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">User Growth</h1>
        <p className="text-slate-400">Track user acquisition and retention</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <h2 className="text-white font-semibold mb-4">User Growth Trend</h2>
          <div className="h-64 flex items-center justify-center text-slate-500">
            Chart placeholder - Monthly user signups
          </div>
        </div>
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <h2 className="text-white font-semibold mb-4">User Distribution</h2>
          <div className="h-64 flex items-center justify-center text-slate-500">
            Chart placeholder - Buyers vs Sellers
          </div>
        </div>
      </div>
    </div>
  );
}
