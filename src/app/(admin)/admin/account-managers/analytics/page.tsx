'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart3, TrendingUp, Users, DollarSign, 
  MessageSquare, Clock, ArrowUpRight, ArrowDownRight 
} from 'lucide-react';

export default function ManagerAnalyticsPage() {
  const stats = [
    { label: 'Total Clients Managed', value: '284', change: '+15.2%', positive: true, icon: Users },
    { label: 'Avg. Response Time', value: '1.8 hrs', change: '-12.5%', positive: true, icon: Clock },
    { label: 'Client Satisfaction', value: '94.5%', change: '+3.2%', positive: true, icon: MessageSquare },
    { label: 'Revenue Generated', value: '$14.2M', change: '+22.8%', positive: true, icon: DollarSign },
  ];

  const performanceByManager = [
    { name: 'Sarah Johnson', clients: 45, revenue: '$2.4M', satisfaction: '96%', responseTime: '1.2 hrs' },
    { name: 'Mike Chen', clients: 42, revenue: '$2.1M', satisfaction: '95%', responseTime: '1.5 hrs' },
    { name: 'David Park', clients: 38, revenue: '$1.9M', satisfaction: '94%', responseTime: '1.8 hrs' },
    { name: 'Lisa Wong', clients: 35, revenue: '$1.7M', satisfaction: '95%', responseTime: '1.6 hrs' },
    { name: 'James Miller', clients: 32, revenue: '$1.5M', satisfaction: '93%', responseTime: '2.0 hrs' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Manager Analytics</h1>
        <p className="text-slate-400 mt-1">Track account manager performance metrics</p>
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

      {/* Performance Table */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Performance by Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Manager</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Clients</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Revenue</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Satisfaction</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Avg. Response</th>
                </tr>
              </thead>
              <tbody>
                {performanceByManager.map((manager) => (
                  <tr key={manager.name} className="border-b border-slate-700/50 hover:bg-slate-700/30">
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
                    <td className="py-3 px-4 text-green-400">{manager.satisfaction}</td>
                    <td className="py-3 px-4 text-slate-300">{manager.responseTime}</td>
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
