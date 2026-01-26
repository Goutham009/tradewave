'use client';

import { MapPin, Globe, TrendingUp } from 'lucide-react';

const TOP_REGIONS = [
  { country: 'United States', users: 4500, revenue: 2500000, growth: '+15%' },
  { country: 'United Kingdom', users: 2100, revenue: 1200000, growth: '+22%' },
  { country: 'Germany', users: 1800, revenue: 980000, growth: '+18%' },
  { country: 'India', users: 1500, revenue: 450000, growth: '+45%' },
  { country: 'Australia', users: 890, revenue: 620000, growth: '+12%' },
];

export default function GeoAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Geographic Analysis</h1>
        <p className="text-slate-400">User and revenue distribution by region</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Globe className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Countries</p>
              <p className="text-white text-xl font-bold">45</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <MapPin className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Top Region</p>
              <p className="text-white text-xl font-bold">North America</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Fastest Growing</p>
              <p className="text-white text-xl font-bold">Asia Pacific</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
        <h2 className="text-white font-semibold mb-4">World Map</h2>
        <div className="h-64 flex items-center justify-center text-slate-500 bg-slate-800/50 rounded-lg">
          Map visualization placeholder
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-white font-semibold">Top Regions by Revenue</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left p-4 text-slate-400 font-medium">Country</th>
                <th className="text-left p-4 text-slate-400 font-medium">Users</th>
                <th className="text-left p-4 text-slate-400 font-medium">Revenue</th>
                <th className="text-left p-4 text-slate-400 font-medium">Growth</th>
              </tr>
            </thead>
            <tbody>
              {TOP_REGIONS.map((region) => (
                <tr key={region.country} className="border-b border-slate-800 hover:bg-slate-800/50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span className="text-white font-medium">{region.country}</span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-300">{region.users.toLocaleString()}</td>
                  <td className="p-4 text-white font-medium">${(region.revenue / 1000000).toFixed(1)}M</td>
                  <td className="p-4">
                    <span className="text-green-400">{region.growth}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
