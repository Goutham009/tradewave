'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { 
  Briefcase, Users, Star, TrendingUp, Mail, Phone, MoreVertical, 
  Plus, Eye, Edit, UserX, Loader2, BarChart3 
} from 'lucide-react';

interface Manager {
  id: number;
  name: string;
  email: string;
  phone: string;
  clients: number;
  revenue: string;
  rating: number;
  status: 'active' | 'on_leave' | 'inactive';
  pendingVerifications: number;
}

export default function AccountManagersPage() {
  const [managers, setManagers] = useState<Manager[]>([
    { id: 1, name: 'Sarah Johnson', email: 'am1@tradewave.io', phone: '+1-555-0101', clients: 45, revenue: '$2.4M', rating: 4.9, status: 'active', pendingVerifications: 3 },
    { id: 2, name: 'Michael Chen', email: 'am2@tradewave.io', phone: '+1-555-0102', clients: 42, revenue: '$2.1M', rating: 4.8, status: 'active', pendingVerifications: 5 },
    { id: 3, name: 'David Park', email: 'david.p@tradewave.io', phone: '+1-555-0103', clients: 38, revenue: '$1.9M', rating: 4.7, status: 'active', pendingVerifications: 2 },
    { id: 4, name: 'Lisa Wong', email: 'lisa.w@tradewave.io', phone: '+1-555-0104', clients: 35, revenue: '$1.7M', rating: 4.8, status: 'active', pendingVerifications: 4 },
    { id: 5, name: 'James Miller', email: 'james.m@tradewave.io', phone: '+1-555-0105', clients: 32, revenue: '$1.5M', rating: 4.6, status: 'active', pendingVerifications: 1 },
    { id: 6, name: 'Emily Davis', email: 'emily.d@tradewave.io', phone: '+1-555-0106', clients: 28, revenue: '$1.2M', rating: 4.7, status: 'on_leave', pendingVerifications: 0 },
  ]);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newManager, setNewManager] = useState({ name: '', email: '', phone: '' });
  const [saving, setSaving] = useState(false);

  const handleAddManager = async () => {
    if (!newManager.name || !newManager.email) return;
    
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newId = Math.max(...managers.map(m => m.id)) + 1;
    setManagers(prev => [...prev, {
      id: newId,
      name: newManager.name,
      email: newManager.email,
      phone: newManager.phone || '',
      clients: 0,
      revenue: '$0',
      rating: 0,
      status: 'active',
      pendingVerifications: 0,
    }]);
    
    setSaving(false);
    setShowAddModal(false);
    setNewManager({ name: '', email: '', phone: '' });
  };

  const handleAction = async (managerId: number, action: string) => {
    if (action === 'view') {
      window.location.href = `/admin/account-managers/analytics?id=${managerId}`;
    } else if (action === 'deactivate') {
      setManagers(prev => prev.map(m => 
        m.id === managerId ? { ...m, status: 'inactive' as const } : m
      ));
    } else if (action === 'activate') {
      setManagers(prev => prev.map(m => 
        m.id === managerId ? { ...m, status: 'active' as const } : m
      ));
    }
  };

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
        <Button className="bg-red-600 hover:bg-red-700" onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
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
                        <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white" onClick={() => handleAction(manager.id, 'view')}>
                          <BarChart3 className="w-4 h-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                            <DropdownMenuItem className="text-slate-300" onClick={() => handleAction(manager.id, 'view')}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Analytics
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-slate-300">
                              <Mail className="mr-2 h-4 w-4" />
                              Send Email
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-slate-300">
                              <Phone className="mr-2 h-4 w-4" />
                              Call
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-700" />
                            {manager.status === 'active' ? (
                              <DropdownMenuItem className="text-red-400" onClick={() => handleAction(manager.id, 'deactivate')}>
                                <UserX className="mr-2 h-4 w-4" />
                                Deactivate
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem className="text-green-400" onClick={() => handleAction(manager.id, 'activate')}>
                                <Users className="mr-2 h-4 w-4" />
                                Activate
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add New Manager Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl">Add New Account Manager</DialogTitle>
            <DialogDescription className="text-slate-400">
              Add a new account manager to your team.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-300">Full Name *</label>
              <Input
                value={newManager.name}
                onChange={(e) => setNewManager(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter full name"
                className="mt-1 bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300">Email *</label>
              <Input
                type="email"
                value={newManager.email}
                onChange={(e) => setNewManager(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
                className="mt-1 bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300">Phone</label>
              <Input
                value={newManager.phone}
                onChange={(e) => setNewManager(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter phone number"
                className="mt-1 bg-slate-700 border-slate-600 text-white"
              />
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowAddModal(false)} className="border-slate-600 text-slate-300">
              Cancel
            </Button>
            <Button 
              onClick={handleAddManager} 
              disabled={saving || !newManager.name || !newManager.email}
              className="bg-red-600 hover:bg-red-700"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Manager
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
