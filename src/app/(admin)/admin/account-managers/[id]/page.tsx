'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft, Users, Star, TrendingUp, Mail, Phone, Calendar,
  DollarSign, Package, Clock, CheckCircle, AlertTriangle, Building2,
  BarChart3, Target, Award, Briefcase
} from 'lucide-react';

interface Client {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  status: 'active' | 'pending' | 'churned';
  totalOrders: number;
  totalRevenue: number;
  lastOrderDate: string;
}

interface Manager {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinedDate: string;
  status: 'active' | 'on_leave' | 'inactive';
  clients: number;
  totalRevenue: number;
  rating: number;
  pendingVerifications: number;
  completedDeals: number;
  conversionRate: number;
  avgDealSize: number;
  monthlyTarget: number;
  currentMonthRevenue: number;
}

const MOCK_MANAGERS: Record<string, Manager> = {
  '1': { id: '1', name: 'Sarah Johnson', email: 'am1@tradewave.io', phone: '+1-555-0101', joinedDate: '2023-03-15', status: 'active', clients: 45, totalRevenue: 2400000, rating: 4.9, pendingVerifications: 3, completedDeals: 156, conversionRate: 78, avgDealSize: 15400, monthlyTarget: 300000, currentMonthRevenue: 245000 },
  '2': { id: '2', name: 'Michael Chen', email: 'am2@tradewave.io', phone: '+1-555-0102', joinedDate: '2023-05-20', status: 'active', clients: 42, totalRevenue: 2100000, rating: 4.8, pendingVerifications: 5, completedDeals: 134, conversionRate: 72, avgDealSize: 15700, monthlyTarget: 280000, currentMonthRevenue: 198000 },
  '3': { id: '3', name: 'David Park', email: 'david.p@tradewave.io', phone: '+1-555-0103', joinedDate: '2023-07-10', status: 'active', clients: 38, totalRevenue: 1900000, rating: 4.7, pendingVerifications: 2, completedDeals: 112, conversionRate: 68, avgDealSize: 17000, monthlyTarget: 250000, currentMonthRevenue: 180000 },
};

const MOCK_CLIENTS: Client[] = [
  { id: 'c1', companyName: 'Acme Corporation', contactName: 'John Smith', email: 'john@acme.com', status: 'active', totalOrders: 24, totalRevenue: 456000, lastOrderDate: '2024-02-10' },
  { id: 'c2', companyName: 'Global Imports Ltd', contactName: 'Lisa Wang', email: 'lisa@globalimports.com', status: 'active', totalOrders: 18, totalRevenue: 324000, lastOrderDate: '2024-02-08' },
  { id: 'c3', companyName: 'TechParts Inc', contactName: 'Mike Johnson', email: 'mike@techparts.com', status: 'active', totalOrders: 15, totalRevenue: 189000, lastOrderDate: '2024-02-05' },
  { id: 'c4', companyName: 'BuildRight Co', contactName: 'Sarah Lee', email: 'sarah@buildright.com', status: 'pending', totalOrders: 3, totalRevenue: 45000, lastOrderDate: '2024-01-28' },
  { id: 'c5', companyName: 'Fashion Hub', contactName: 'Emma Davis', email: 'emma@fashionhub.com', status: 'active', totalOrders: 12, totalRevenue: 156000, lastOrderDate: '2024-02-12' },
  { id: 'c6', companyName: 'ChemSolutions', contactName: 'David Kim', email: 'david@chemsolutions.com', status: 'churned', totalOrders: 8, totalRevenue: 92000, lastOrderDate: '2023-11-15' },
];

const RECENT_ACTIVITIES = [
  { id: 'a1', action: 'Closed deal', details: 'Acme Corp - $45,000 order', time: '2 hours ago', type: 'success' },
  { id: 'a2', action: 'Client meeting', details: 'Discovery call with BuildRight Co', time: '4 hours ago', type: 'info' },
  { id: 'a3', action: 'Quote sent', details: 'Fashion Hub - Textile materials', time: '1 day ago', type: 'info' },
  { id: 'a4', action: 'New client onboarded', details: 'ChemSolutions signed up', time: '2 days ago', type: 'success' },
  { id: 'a5', action: 'Follow-up required', details: 'TechParts Inc - Pending response', time: '3 days ago', type: 'warning' },
];

export default function AccountManagerDetailPage() {
  const params = useParams();
  const [manager, setManager] = useState<Manager | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load mock data
    const id = params.id as string;
    const mockManager = MOCK_MANAGERS[id] || MOCK_MANAGERS['1'];
    setManager(mockManager);
    setClients(MOCK_CLIENTS);
    setLoading(false);
  }, [params.id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
  };

  if (loading || !manager) {
    return (
      <div className="p-6 flex items-center justify-center h-96">
        <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const targetProgress = Math.round((manager.currentMonthRevenue / manager.monthlyTarget) * 100);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/account-managers" className="p-2 hover:bg-slate-700 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold">
              {manager.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{manager.name}</h1>
              <p className="text-slate-400">Account Manager • Joined {new Date(manager.joinedDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={manager.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}>
            {manager.status === 'active' ? 'Active' : 'On Leave'}
          </Badge>
          <Button variant="outline" className="border-slate-600 text-slate-300">
            <Mail className="w-4 h-4 mr-2" /> Email
          </Button>
          <Button variant="outline" className="border-slate-600 text-slate-300">
            <Phone className="w-4 h-4 mr-2" /> Call
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Total Clients</p>
                <p className="text-2xl font-bold text-white">{manager.clients}</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Total Revenue</p>
                <p className="text-2xl font-bold text-emerald-400">{formatCurrency(manager.totalRevenue)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Completed Deals</p>
                <p className="text-2xl font-bold text-white">{manager.completedDeals}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Conversion Rate</p>
                <p className="text-2xl font-bold text-purple-400">{manager.conversionRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Rating</p>
                <p className="text-2xl font-bold text-yellow-400 flex items-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-400" />
                  {manager.rating}
                </p>
              </div>
              <Award className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Target Progress */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="w-5 h-5" /> Monthly Target Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400">Current: {formatCurrency(manager.currentMonthRevenue)}</span>
            <span className="text-slate-400">Target: {formatCurrency(manager.monthlyTarget)}</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-4">
            <div 
              className={`h-4 rounded-full ${targetProgress >= 100 ? 'bg-green-500' : targetProgress >= 75 ? 'bg-blue-500' : targetProgress >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
              style={{ width: `${Math.min(targetProgress, 100)}%` }}
            />
          </div>
          <p className="text-center mt-2 text-white font-medium">{targetProgress}% of target achieved</p>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="clients" className="space-y-4">
        <TabsList className="bg-slate-800 border border-slate-700">
          <TabsTrigger value="clients" className="data-[state=active]:bg-slate-700">Clients ({clients.length})</TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:bg-slate-700">Recent Activity</TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-slate-700">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="clients">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Building2 className="w-5 h-5" /> Assigned Clients
              </CardTitle>
              <CardDescription className="text-slate-400">All clients managed by {manager.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Company</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Contact</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Status</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Orders</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Revenue</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Last Order</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((client) => (
                      <tr key={client.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                        <td className="py-3 px-4">
                          <p className="font-medium text-white">{client.companyName}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-slate-300">{client.contactName}</p>
                          <p className="text-xs text-slate-500">{client.email}</p>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={
                            client.status === 'active' ? 'bg-green-500/20 text-green-400' :
                            client.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }>
                            {client.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-slate-300">{client.totalOrders}</td>
                        <td className="py-3 px-4 text-emerald-400 font-medium">{formatCurrency(client.totalRevenue)}</td>
                        <td className="py-3 px-4 text-slate-400">{new Date(client.lastOrderDate).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="w-5 h-5" /> Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {RECENT_ACTIVITIES.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 p-4 bg-slate-900 rounded-lg">
                    <div className={`w-2 h-2 mt-2 rounded-full ${
                      activity.type === 'success' ? 'bg-green-500' :
                      activity.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1">
                      <p className="font-medium text-white">{activity.action}</p>
                      <p className="text-sm text-slate-400">{activity.details}</p>
                      <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-slate-900 rounded-lg">
                  <span className="text-slate-400">Avg. Deal Size</span>
                  <span className="text-white font-bold">{formatCurrency(manager.avgDealSize)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-900 rounded-lg">
                  <span className="text-slate-400">Conversion Rate</span>
                  <span className="text-white font-bold">{manager.conversionRate}%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-900 rounded-lg">
                  <span className="text-slate-400">Client Retention</span>
                  <span className="text-white font-bold">92%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-900 rounded-lg">
                  <span className="text-slate-400">Avg. Response Time</span>
                  <span className="text-white font-bold">2.4 hrs</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Pending Tasks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-slate-900 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  <div className="flex-1">
                    <p className="text-white">{manager.pendingVerifications} Pending Verifications</p>
                    <p className="text-xs text-slate-400">Clients awaiting KYB review</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-900 rounded-lg">
                  <Package className="w-5 h-5 text-blue-400" />
                  <div className="flex-1">
                    <p className="text-white">8 Active Quotes</p>
                    <p className="text-xs text-slate-400">Quotes pending buyer decision</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-900 rounded-lg">
                  <Calendar className="w-5 h-5 text-purple-400" />
                  <div className="flex-1">
                    <p className="text-white">3 Scheduled Calls</p>
                    <p className="text-xs text-slate-400">Upcoming client meetings</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
