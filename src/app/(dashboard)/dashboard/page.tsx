'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { WelcomeTour } from '@/components/buyer/WelcomeTour';
import {
  FileText,
  Package,
  CreditCard,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Plus,
  Truck,
  Building2,
  Calendar,
  RefreshCw,
  Eye,
  MapPin,
  DollarSign,
  Timer,
  Filter,
  SortAsc,
} from 'lucide-react';

// Mock live orders data
const mockLiveOrders = [
  {
    id: 'TXN-2024-001',
    orderNumber: 'ORD-001',
    productName: 'Steel Components',
    quantity: 5000,
    unit: 'kg',
    supplierId: 'SUP-001',
    supplierName: 'Shanghai Steel Co.',
    amount: 22500,
    currency: 'USD',
    status: 'IN_TRANSIT',
    progress: 65,
    estimatedDelivery: '2024-01-29',
    createdAt: '2024-01-15',
    shipmentId: 'SHP-2024-001',
    isUrgent: false,
  },
  {
    id: 'TXN-2024-002',
    orderNumber: 'ORD-002',
    productName: 'Electronic Circuit Boards',
    quantity: 500,
    unit: 'units',
    supplierId: 'SUP-002',
    supplierName: 'Shenzhen Electronics',
    amount: 12500,
    currency: 'USD',
    status: 'PRODUCTION',
    progress: 35,
    estimatedDelivery: '2024-02-04',
    createdAt: '2024-01-14',
    shipmentId: null,
    isUrgent: false,
  },
  {
    id: 'TXN-2024-004',
    orderNumber: 'ORD-004',
    productName: 'Textile Materials',
    quantity: 2000,
    unit: 'meters',
    supplierId: 'SUP-003',
    supplierName: 'Mumbai Textiles Ltd',
    amount: 8500,
    currency: 'USD',
    status: 'OUT_FOR_DELIVERY',
    progress: 90,
    estimatedDelivery: '2024-01-25',
    createdAt: '2024-01-10',
    shipmentId: 'SHP-2024-002',
    isUrgent: true,
  },
  {
    id: 'TXN-2024-005',
    orderNumber: 'ORD-005',
    productName: 'Chemical Raw Materials',
    quantity: 1000,
    unit: 'liters',
    supplierId: 'SUP-004',
    supplierName: 'Global Chemicals Co.',
    amount: 15000,
    currency: 'USD',
    status: 'PENDING',
    progress: 10,
    estimatedDelivery: '2024-02-10',
    createdAt: '2024-01-20',
    shipmentId: null,
    isUrgent: false,
  },
];

const stats = [
  {
    name: 'Active Requirements',
    value: '12',
    change: '+2 this week',
    icon: FileText,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    name: 'Pending Quotations',
    value: '8',
    change: '3 new today',
    icon: Clock,
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
  },
  {
    name: 'In-Transit Orders',
    value: '5',
    change: '2 arriving soon',
    icon: Package,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
  },
  {
    name: 'Escrow Balance',
    value: '$124,500',
    change: 'Across 4 transactions',
    icon: CreditCard,
    color: 'text-green-500',
    bg: 'bg-green-500/10',
  },
];

const getStatusConfig = (status: string) => {
  const config: Record<string, { variant: any; label: string; color: string; bgColor: string }> = {
    PENDING: { variant: 'warning', label: 'Pending', color: 'text-yellow-600', bgColor: 'bg-yellow-500' },
    CONFIRMED: { variant: 'info', label: 'Confirmed', color: 'text-blue-600', bgColor: 'bg-blue-500' },
    PRODUCTION: { variant: 'warning', label: 'In Production', color: 'text-amber-600', bgColor: 'bg-amber-500' },
    IN_TRANSIT: { variant: 'info', label: 'In Transit', color: 'text-orange-600', bgColor: 'bg-orange-500' },
    OUT_FOR_DELIVERY: { variant: 'warning', label: 'Out for Delivery', color: 'text-orange-600', bgColor: 'bg-orange-500' },
    DELIVERED: { variant: 'success', label: 'Delivered', color: 'text-green-600', bgColor: 'bg-green-500' },
    COMPLETED: { variant: 'success', label: 'Completed', color: 'text-green-600', bgColor: 'bg-green-500' },
  };
  return config[status] || { variant: 'secondary', label: status, color: 'text-gray-600', bgColor: 'bg-gray-500' };
};

const getStatusBadge = (status: string) => {
  const config = getStatusConfig(status);
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<'delivery' | 'created' | 'value'>('delivery');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showWelcomeTour, setShowWelcomeTour] = useState(false);

  // Check if first-time login
  useEffect(() => {
    const tourDismissed = localStorage.getItem('tradewave_tour_completed');
    if (!tourDismissed) {
      setShowWelcomeTour(true);
    }
  }, []);

  const handleTourComplete = () => {
    localStorage.setItem('tradewave_tour_completed', 'true');
    setShowWelcomeTour(false);
  };

  const handleTourDismiss = () => {
    localStorage.setItem('tradewave_tour_completed', 'true');
    setShowWelcomeTour(false);
  };

  // Sort and filter orders
  const filteredOrders = mockLiveOrders
    .filter(order => statusFilter === 'all' || order.status === statusFilter)
    .sort((a, b) => {
      switch (sortBy) {
        case 'delivery':
          return new Date(a.estimatedDelivery).getTime() - new Date(b.estimatedDelivery).getTime();
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'value':
          return b.amount - a.amount;
        default:
          return 0;
      }
    });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastUpdated(new Date());
    setIsRefreshing(false);
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(handleRefresh, 30 * 1000);
    return () => clearInterval(interval);
  }, []);

  const activeOrders = mockLiveOrders.filter(o => o.status !== 'COMPLETED');
  const urgentCount = activeOrders.filter(o => o.isUrgent).length;
  const totalInTransit = activeOrders.reduce((sum, o) => sum + o.amount, 0);
  const avgDeliveryDays = Math.round(
    activeOrders.reduce((sum, o) => {
      const days = Math.ceil((new Date(o.estimatedDelivery).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return sum + Math.max(0, days);
    }, 0) / activeOrders.length
  );

  const kybStatus = (session?.user as any)?.kybStatus;
  const isKybDone = kybStatus === 'COMPLETED';

  return (
    <div className="space-y-8">
      {/* Welcome Tour for first-time users */}
      {showWelcomeTour && (
        <WelcomeTour
          userName={session?.user?.name || 'there'}
          userRole={(session?.user as any)?.role || 'BUYER'}
          onComplete={handleTourComplete}
          onDismiss={handleTourDismiss}
        />
      )}

      {/* KYB Banner — informational, shown to ALL users who haven't completed KYB */}
      {!isKybDone && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 shrink-0">
                <AlertCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900">Complete KYB to complete your first order</h3>
                <p className="text-sm text-blue-700 mt-0.5">
                  Verify your business to accept quotes, receive requirements, and start trading on Tradewave.
                </p>
              </div>
              <Link href="/kyb/submit">
                <Button size="sm" variant="gradient">Complete KYB</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back{session?.user?.name ? `, ${session.user.name}` : ''}! Here&apos;s an overview of your trade activities.
          </p>
        </div>
        <Link href="/requirements/new">
          <Button variant="gradient">
            <Plus className="mr-2 h-4 w-4" />
            New Requirement
          </Button>
        </Link>
      </div>

      {/* Quick Stats for Live Orders */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <Package className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{activeOrders.length}</span>
                  {urgentCount > 0 && (
                    <Badge variant="destructive" className="text-xs">{urgentCount} urgent</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">Active Orders</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">${totalInTransit.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground">Total in Transit</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                <Timer className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{avgDeliveryDays} days</div>
                <p className="text-sm text-muted-foreground">Avg. Delivery Time</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                <CheckCircle2 className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">12</div>
                <p className="text-sm text-muted-foreground">Completed This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Orders Section */}
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Live Orders
              <Badge variant="info">{activeOrders.length} Active</Badge>
            </CardTitle>
            <CardDescription>
              Track your orders in real-time • Last updated: {lastUpdated.toLocaleTimeString()}
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
            >
              <option value="delivery">Closest Delivery</option>
              <option value="created">Recently Created</option>
              <option value="value">Highest Value</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="PRODUCTION">Production</option>
              <option value="IN_TRANSIT">In Transit</option>
              <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
            </select>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              const daysUntilDelivery = Math.ceil(
                (new Date(order.estimatedDelivery).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
              );
              
              return (
                <div
                  key={order.id}
                  className={`rounded-lg border p-4 transition-shadow hover:shadow-md ${
                    order.isUrgent ? 'border-orange-300 bg-orange-50/50' : ''
                  }`}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    {/* Order Info */}
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${statusConfig.color.replace('text', 'bg')}/10`}>
                        <Package className={`h-6 w-6 ${statusConfig.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold">{order.orderNumber}</h4>
                          {getStatusBadge(order.status)}
                          {order.isUrgent && (
                            <Badge variant="destructive" className="text-xs">
                              <AlertCircle className="mr-1 h-3 w-3" />
                              Urgent
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm font-medium mt-1">
                          {order.quantity.toLocaleString()} {order.unit} {order.productName}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {order.supplierName}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Amount & Delivery */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-8">
                      <div className="text-left sm:text-right">
                        <p className="text-xl font-bold">${order.amount.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{order.currency}</p>
                      </div>
                      
                      <div className="min-w-[120px]">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">Progress</span>
                          <span className="text-xs font-medium">{order.progress}%</span>
                        </div>
                        <Progress value={order.progress} className="h-2" />
                      </div>

                      <div className="text-left sm:text-right min-w-[100px]">
                        <p className="text-sm flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(order.estimatedDelivery).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                        <p className={`text-xs ${
                          daysUntilDelivery <= 2 ? 'text-orange-600 font-medium' : 'text-muted-foreground'
                        }`}>
                          {daysUntilDelivery > 0 ? `${daysUntilDelivery} days left` : 'Today'}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 lg:flex-col">
                      <Link href={`/transactions/${order.id}`} className="flex-1 lg:flex-none">
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Button>
                      </Link>
                      {order.shipmentId && (
                        <Link href={`/shipments/${order.shipmentId}`} className="flex-1 lg:flex-none">
                          <Button variant="outline" size="sm" className="w-full">
                            <Truck className="mr-2 h-4 w-4" />
                            Track
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredOrders.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No orders match your filters</p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row gap-2 mt-6 pt-4 border-t">
            <Link href="/transactions" className="flex-1">
              <Button variant="outline" className="w-full">
                View All Orders
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/requirements/new" className="flex-1">
              <Button variant="gradient" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                New Requirement
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Grid - Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to get you started</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <Link href="/requirements/new">
                <div className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-accent">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                    <FileText className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Submit New Requirement</p>
                    <p className="text-sm text-muted-foreground">
                      Start a new sourcing request
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </Link>

              <Link href="/quotations">
                <div className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-accent">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
                    <Clock className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Review Pending Quotations</p>
                    <p className="text-sm text-muted-foreground">
                      8 quotations awaiting review
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </Link>

              <Link href="/shipments">
                <div className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-accent">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                    <Truck className="h-5 w-5 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Track Shipments</p>
                    <p className="text-sm text-muted-foreground">
                      3 shipments in transit
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Overview Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>Your trading activity summary</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.name} className="flex items-center gap-3 rounded-lg border p-4">
                    <div className={`rounded-lg p-2 ${stat.bg}`}>
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.name}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
