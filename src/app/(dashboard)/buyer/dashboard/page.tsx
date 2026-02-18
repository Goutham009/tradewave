'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  FileText,
  Clock,
  CheckCircle,
  Plus,
  Truck,
  Star,
  DollarSign,
  TrendingUp,
  Eye,
  ArrowRight,
  MessageSquare,
  Calendar,
  RotateCcw,
  User,
  Activity,
  CreditCard,
  ShoppingCart,
} from 'lucide-react';

// Demo data for returning buyer
const mockActiveOrders = [
  {
    id: 'txn_001',
    product: 'Aluminum Sheets',
    supplier: 'Global Metals Ltd.',
    status: 'IN_TRANSIT',
    trackingNumber: 'DHL 98765432',
    eta: '2026-02-20',
    amount: 156000,
  },
  {
    id: 'req_002',
    product: 'Copper Wire',
    supplier: null,
    status: 'AWAITING_QUOTES',
    trackingNumber: null,
    eta: null,
    amount: null,
    quotesReceived: 5,
    postedDate: '2026-02-08',
  },
];

const mockRecentActivity = [
  { id: '1', text: 'New quote from XYZ Corp for Copper Wire', time: '2h ago', icon: FileText },
  { id: '2', text: 'Shipment update: Aluminum Sheets arrived Mumbai', time: '5h ago', icon: Truck },
  { id: '3', text: 'Payment confirmed for Steel Pipes order', time: 'Yesterday', icon: CreditCard },
  { id: '4', text: 'Quality inspection passed for Titanium Rods', time: '2 days ago', icon: CheckCircle },
];

const mockFavoriteSuppliers = [
  { id: 'sup_001', name: 'Steel Masters China', rating: 5.0, orders: 5 },
  { id: 'sup_002', name: 'ABC Steel Industries', rating: 4.8, orders: 3 },
  { id: 'sup_003', name: 'Global Metals Ltd', rating: 4.7, orders: 4 },
];

const mockPastOrders = [
  {
    id: 'txn_past_001',
    product: 'Industrial Steel Pipes - Grade 304',
    supplier: 'Steel Masters China Ltd.',
    amount: 608400,
    status: 'COMPLETED',
    completedDate: '2026-02-10',
    rating: 5,
  },
  {
    id: 'txn_past_002',
    product: 'Titanium Rods - Grade 5',
    supplier: 'ABC Steel Industries',
    amount: 245000,
    status: 'COMPLETED',
    completedDate: '2026-01-15',
    rating: 4,
  },
];

export default function BuyerDashboardPage() {
  const { data: session } = useSession();
  const userName = session?.user?.name || 'there';

  const stats = {
    activeOrders: 2,
    totalOrders: 12,
    totalSpent: 5200000,
    avgRating: 4.7,
  };

  const accountManager = {
    name: 'Sarah Johnson',
    email: 'sarah@tradewave.io',
    phone: '+1 555-0123',
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: any; label: string }> = {
      IN_TRANSIT: { variant: 'warning', label: 'In Transit' },
      AWAITING_QUOTES: { variant: 'info', label: 'Awaiting Quotes' },
      COMPLETED: { variant: 'success', label: 'Completed' },
      PENDING_PAYMENT: { variant: 'destructive', label: 'Pending Payment' },
      PRODUCTION: { variant: 'secondary', label: 'In Production' },
    };
    const c = config[status] || { variant: 'secondary', label: status.replace(/_/g, ' ') };
    return <Badge variant={c.variant}>{c.label}</Badge>;
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {userName}!</h1>
          <p className="text-muted-foreground">Here&apos;s your procurement overview</p>
        </div>
        <Link href="/buyer/requirements/new">
          <Button variant="gradient">
            <Plus className="w-4 h-4 mr-2" />
            New Requirement
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Active Orders', value: stats.activeOrders, icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Total Orders', value: stats.totalOrders, icon: Package, color: 'text-teal-600', bg: 'bg-teal-50' },
          { label: 'Total Spent', value: `$${(stats.totalSpent / 1000000).toFixed(1)}M`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Avg Rating', value: `${stats.avgRating}`, icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-50' },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${s.bg} rounded-lg flex items-center justify-center`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Active Orders */}
        <div className="col-span-2 space-y-6">
          {/* Active Orders */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Truck className="h-5 w-5 text-blue-600" />
                Active Orders ({mockActiveOrders.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockActiveOrders.map((order) => (
                <div key={order.id} className="p-4 rounded-lg border border-neutral-200 hover:border-teal-300 transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        {order.status === 'IN_TRANSIT' ? (
                          <Truck className="h-4 w-4 text-blue-500" />
                        ) : (
                          <Clock className="h-4 w-4 text-amber-500" />
                        )}
                        <p className="font-semibold">{order.product}</p>
                      </div>
                      {order.supplier && (
                        <p className="text-sm text-muted-foreground ml-6">Supplier: {order.supplier}</p>
                      )}
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                  <div className="ml-6 text-sm text-muted-foreground">
                    {order.trackingNumber && (
                      <p>Track: {order.trackingNumber}</p>
                    )}
                    {order.eta && (
                      <p>ETA: {new Date(order.eta).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    )}
                    {order.quotesReceived !== undefined && (
                      <p>Quotes received: {order.quotesReceived} | Posted: {new Date(order.postedDate!).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    )}
                  </div>
                  <div className="mt-3 ml-6">
                    {order.status === 'IN_TRANSIT' ? (
                      <Link href={`/shipments/${order.id}`}>
                        <Button size="sm" variant="outline">
                          Track Shipment <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </Link>
                    ) : (
                      <Link href={`/buyer/quotations/compare?requirementId=${order.id}`}>
                        <Button size="sm" variant="outline">
                          View Quotes <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Past Orders with Reorder */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Recent Completed Orders
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockPastOrders.map((order) => (
                <div key={order.id} className="p-4 rounded-lg border border-neutral-200">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">{order.product}</p>
                      <p className="text-sm text-muted-foreground">
                        Supplier: {order.supplier}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Completed: {order.completedDate} | Amount: ${order.amount.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(order.status)}
                      <p className="text-yellow-500 text-sm mt-1">
                        {'⭐'.repeat(order.rating)} {order.rating}/5
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Link href={`/buyer/reorder?transactionId=${order.id}`}>
                      <Button size="sm" variant="outline" className="border-teal-300 text-teal-700 hover:bg-teal-50">
                        <RotateCcw className="h-3 w-3 mr-1" /> Reorder Same
                      </Button>
                    </Link>
                    <Link href={`/buyer/reorder?transactionId=${order.id}&modified=true`}>
                      <Button size="sm" variant="outline">
                        Reorder Modified
                      </Button>
                    </Link>
                    <Link href={`/transactions/${order.id}`}>
                      <Button size="sm" variant="ghost">
                        <Eye className="h-3 w-3 mr-1" /> View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Activity className="h-4 w-4" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockRecentActivity.map((item) => (
                <div key={item.id} className="flex items-start gap-2">
                  <item.icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm">{item.text}</p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Favorite Suppliers */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Star className="h-4 w-4 text-yellow-500" />
                Favorite Suppliers ({mockFavoriteSuppliers.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockFavoriteSuppliers.map((sup) => (
                <div key={sup.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{sup.name}</p>
                    <p className="text-xs text-muted-foreground">{sup.orders} orders</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-medium">{sup.rating}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Account Manager */}
          <Card className="border-teal-200 bg-teal-50/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-teal-600" />
                Your Account Manager
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold text-teal-900">{accountManager.name}</p>
              <p className="text-xs text-muted-foreground mt-1">{accountManager.email}</p>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" className="flex-1 text-xs">
                  <MessageSquare className="h-3 w-3 mr-1" /> Message
                </Button>
                <Button size="sm" variant="outline" className="flex-1 text-xs">
                  <Calendar className="h-3 w-3 mr-1" /> Schedule Call
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
