'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Trophy, DollarSign, Users, Award } from 'lucide-react';

export default function ManagerTopPerformersPage() {
  const topManagers = [
    { rank: 1, name: 'Sarah Johnson', clients: 45, revenue: '$2.4M', satisfaction: '96%', deals: 89, bonus: '$12,500' },
    { rank: 2, name: 'Mike Chen', clients: 42, revenue: '$2.1M', satisfaction: '95%', deals: 78, bonus: '$10,200' },
    { rank: 3, name: 'David Park', clients: 38, revenue: '$1.9M', satisfaction: '94%', deals: 72, bonus: '$9,100' },
    { rank: 4, name: 'Lisa Wong', clients: 35, revenue: '$1.7M', satisfaction: '95%', deals: 65, bonus: '$8,400' },
    { rank: 5, name: 'James Miller', clients: 32, revenue: '$1.5M', satisfaction: '93%', deals: 58, bonus: '$7,200' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Top Performing Managers</h1>
          <p className="text-slate-400 mt-1">Account managers with best performance metrics</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-lg">
          <Trophy className="w-5 h-5 text-purple-400" />
          <span className="text-purple-400 font-medium">This Quarter</span>
        </div>
      </div>

      {/* Top 3 Highlight */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {topManagers.slice(0, 3).map((manager, index) => (
          <Card key={manager.rank} className={`bg-gradient-to-br ${index === 0 ? 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/50' : index === 1 ? 'from-slate-400/20 to-slate-500/10 border-slate-400/50' : 'from-amber-600/20 to-amber-700/10 border-amber-600/50'} border`}>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl font-bold ${index === 0 ? 'bg-yellow-500 text-yellow-900' : index === 1 ? 'bg-slate-400 text-slate-900' : 'bg-amber-600 text-amber-900'}`}>
                  #{manager.rank}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">{manager.name}</h3>
                <p className="text-sm text-slate-400">{manager.clients} clients managed</p>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-2xl font-bold text-white">{manager.revenue}</p>
                    <p className="text-xs text-slate-400">Revenue</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-400">{manager.bonus}</p>
                    <p className="text-xs text-slate-400">Bonus</p>
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
            <Award className="w-5 h-5 text-yellow-400" />
            Performance Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Rank</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Manager</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Clients</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Revenue</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Satisfaction</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Deals Closed</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Bonus</th>
                </tr>
              </thead>
              <tbody>
                {topManagers.map((manager) => (
                  <tr key={manager.rank} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="py-3 px-4">
                      <span className={`w-8 h-8 inline-flex items-center justify-center rounded-full font-bold ${manager.rank <= 3 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-700 text-slate-300'}`}>
                        {manager.rank}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                          {manager.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="font-medium text-white">{manager.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-white">{manager.clients}</td>
                    <td className="py-3 px-4 text-emerald-400 font-medium">{manager.revenue}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-white">{manager.satisfaction}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-white">{manager.deals}</td>
                    <td className="py-3 px-4 text-green-400 font-medium">{manager.bonus}</td>
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
