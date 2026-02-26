'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Building2, Star, MapPin, Package, DollarSign, Clock, Mail, Phone, Globe, CheckCircle, TrendingUp, FileText, Calendar } from 'lucide-react';
import Link from 'next/link';

const MOCK_SUPPLIER = {
  id: 'SUP-001',
  name: 'Steel Industries Ltd',
  status: 'verified',
  rating: 4.8,
  location: 'Mumbai, India',
  category: 'Raw Materials',
  contact: { name: 'Mike Chen', email: 'mike@steelindustries.com', phone: '+91 98765 43210' },
  website: 'https://steelindustries.com',
  joinedDate: '2022-03-15',
  stats: { totalOrders: 156, completedOrders: 152, onTimeRate: 98, avgResponseTime: '2 hrs', totalValue: 450000, avgOrderValue: 2885 },
  products: ['Steel Sheets', 'Steel Rods', 'Aluminum', 'Iron', 'Copper Wire'],
  certifications: ['ISO 9001:2015', 'ISO 14001', 'OHSAS 18001'],
  recentOrders: [
    { id: 'ORD-001', buyer: 'Acme Corp', product: 'Steel Components', amount: 24000, date: '2024-01-18', status: 'delivered' },
    { id: 'ORD-002', buyer: 'Tech Solutions', product: 'Aluminum Sheets', amount: 18500, date: '2024-01-15', status: 'in_transit' },
    { id: 'ORD-003', buyer: 'Global Traders', product: 'Steel Rods', amount: 32000, date: '2024-01-10', status: 'delivered' },
    { id: 'ORD-004', buyer: 'Fashion Hub', product: 'Iron Fittings', amount: 8500, date: '2024-01-05', status: 'delivered' },
  ],
  reviews: [
    { id: 1, buyer: 'Acme Corp', rating: 5, comment: 'Excellent quality and fast delivery. Highly recommended!', date: '2024-01-19' },
    { id: 2, buyer: 'Tech Solutions', rating: 4, comment: 'Good products, slightly delayed but communicated well.', date: '2024-01-16' },
    { id: 3, buyer: 'Global Traders', rating: 5, comment: 'Best steel supplier we have worked with.', date: '2024-01-12' },
  ],
};

export default function SupplierDetailPage() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const s = MOCK_SUPPLIER;

  const getStatusBadge = (status: string) => {
    const config: Record<string, string> = { delivered: 'bg-green-500/20 text-green-400', in_transit: 'bg-blue-500/20 text-blue-400', processing: 'bg-yellow-500/20 text-yellow-400' };
    return <Badge className={config[status] || 'bg-slate-500/20 text-slate-400'}>{status.replace('_', ' ')}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/internal/suppliers">
          <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white"><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
        </Link>
      </div>

      {/* Header Card */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <div className="h-20 w-20 rounded-xl bg-green-500/20 flex items-center justify-center">
              <Building2 className="h-10 w-10 text-green-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white">{s.name}</h1>
                <Badge className="bg-green-500/20 text-green-400"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>
                <div className="flex items-center gap-1 text-yellow-400">
                  <Star className="h-5 w-5 fill-current" />
                  <span className="font-bold">{s.rating}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-2 text-slate-400">
                <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{s.location}</span>
                <span className="flex items-center gap-1"><Package className="h-4 w-4" />{s.category}</span>
                <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />Member since {s.joinedDate}</span>
              </div>
              <div className="flex items-center gap-4 mt-3">
                <span className="flex items-center gap-1 text-slate-300"><Mail className="h-4 w-4 text-slate-400" />{s.contact.email}</span>
                <span className="flex items-center gap-1 text-slate-300"><Phone className="h-4 w-4 text-slate-400" />{s.contact.phone}</span>
                <a href={s.website} target="_blank" className="flex items-center gap-1 text-blue-400 hover:underline"><Globe className="h-4 w-4" />Website</a>
              </div>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">Send Requirement</Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Orders', value: s.stats.totalOrders, icon: Package, color: 'text-blue-400' },
          { label: 'Completed', value: s.stats.completedOrders, icon: CheckCircle, color: 'text-green-400' },
          { label: 'On-Time Rate', value: `${s.stats.onTimeRate}%`, icon: Clock, color: 'text-purple-400' },
          { label: 'Avg Response', value: s.stats.avgResponseTime, icon: Clock, color: 'text-yellow-400' },
          { label: 'Total Value', value: `$${(s.stats.totalValue / 1000).toFixed(0)}K`, icon: DollarSign, color: 'text-green-400' },
          { label: 'Avg Order', value: `$${s.stats.avgOrderValue}`, icon: TrendingUp, color: 'text-indigo-400' },
        ].map((stat) => (
          <Card key={stat.label} className="bg-slate-900 border-slate-800">
            <CardContent className="pt-4">
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
              <p className="text-2xl font-bold text-white mt-2">{stat.value}</p>
              <p className="text-sm text-slate-400">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="overview" className="data-[state=active]:bg-slate-700 text-slate-300 data-[state=active]:text-white">Overview</TabsTrigger>
          <TabsTrigger value="orders" className="data-[state=active]:bg-slate-700 text-slate-300 data-[state=active]:text-white">Recent Orders</TabsTrigger>
          <TabsTrigger value="reviews" className="data-[state=active]:bg-slate-700 text-slate-300 data-[state=active]:text-white">Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader><CardTitle className="text-white">Products & Services</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {s.products.map((p) => <Badge key={p} className="bg-slate-800 text-slate-300">{p}</Badge>)}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader><CardTitle className="text-white">Certifications</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {s.certifications.map((c) => <Badge key={c} className="bg-green-500/10 text-green-400"><CheckCircle className="h-3 w-3 mr-1" />{c}</Badge>)}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              <div className="space-y-3">
                {s.recentOrders.map((o) => (
                  <div key={o.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                    <div>
                      <p className="font-medium text-white">{o.product}</p>
                      <p className="text-sm text-slate-400">{o.buyer} • {o.date}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-semibold text-green-400">${o.amount.toLocaleString()}</p>
                      {getStatusBadge(o.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              <div className="space-y-4">
                {s.reviews.map((r) => (
                  <div key={r.id} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-white">{r.buyer}</p>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />)}
                      </div>
                    </div>
                    <p className="text-slate-300">{r.comment}</p>
                    <p className="text-xs text-slate-500 mt-2">{r.date}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
