'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, Users, Star, TrendingUp, Mail, Phone, MoreVertical } from 'lucide-react';

export default function AccountManagersPage() {
  const managers = [
    { id: 1, name: 'Sarah Johnson', email: 'sarah.j@tradewave.io', clients: 45, revenue: '$2.4M', rating: 4.9, status: 'active' },
    { id: 2, name: 'Mike Chen', email: 'mike.c@tradewave.io', clients: 42, revenue: '$2.1M', rating: 4.8, status: 'active' },
    { id: 3, name: 'David Park', email: 'david.p@tradewave.io', clients: 38, revenue: '$1.9M', rating: 4.7, status: 'active' },
    { id: 4, name: 'Lisa Wong', email: 'lisa.w@tradewave.io', clients: 35, revenue: '$1.7M', rating: 4.8, status: 'active' },
    { id: 5, name: 'James Miller', email: 'james.m@tradewave.io', clients: 32, revenue: '$1.5M', rating: 4.6, status: 'active' },
    { id: 6, name: 'Emily Davis', email: 'emily.d@tradewave.io', clients: 28, revenue: '$1.2M', rating: 4.7, status: 'on_leave' },
  ];

  const stats = [
    { label: 'Total Managers', value: '12', icon: Briefcase, color: 'text-blue-400' },
    { label: 'Active Now', value: '10', icon: Users, color: 'text-green-400' },
    { label: 'Avg. Rating', value: '4.7', icon: Star, color: 'text-yellow-400' },
    { label: 'Total Revenue', value: '$14.2M', icon: TrendingUp, color: 'text-emerald-400' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Account Managers</h1>
          <p className="text-slate-400 mt-1">Manage your account management team</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Users className="w-4 h-4 mr-2" />
          Add New Manager
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">{stat.label}</p>
                  <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                </div>
                <div className="p-3 bg-slate-700 rounded-lg">
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Managers List */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            All Account Managers
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
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Rating</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {managers.map((manager) => (
                  <tr key={manager.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                          {manager.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-medium text-white">{manager.name}</p>
                          <p className="text-sm text-slate-400">{manager.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-white">{manager.clients} clients</td>
                    <td className="py-3 px-4 text-emerald-400 font-medium">{manager.revenue}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-white">{manager.rating}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${manager.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        {manager.status === 'active' ? 'Active' : 'On Leave'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white">
                          <Mail className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white">
                          <Phone className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
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
