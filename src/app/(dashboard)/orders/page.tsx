'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Search,
  Package,
  Building2,
  Calendar,
  Clock,
  Eye,
  Truck,
  DollarSign,
  Filter,
  Plus,
} from 'lucide-react';

// Mock orders data
const mockOrders = [
  {
    id: 'TXN-2024-001',
    orderNumber: 'ORD-2024-001',
    productName: 'Steel Components for Manufacturing',
    quantity: 5000,
    unit: 'kg',
    supplierName: 'Shanghai Steel Co.',
    amount: 24375,
    currency: 'USD',
    status: 'IN_TRANSIT',
    progress: 65,
    estimatedDelivery: '2024-01-29',
    createdAt: '2024-01-15',
    shipmentId: 'SHP-2024-001',
  },
  {
    id: 'TXN-2024-002',
    orderNumber: 'ORD-2024-002',
    productName: 'Electronic Circuit Boards',
    quantity: 500,
    unit: 'units',
    supplierName: 'Shenzhen Electronics',
    amount: 12500,
    currency: 'USD',
    status: 'PRODUCTION',
    progress: 35,
    estimatedDelivery: '2024-02-04',
    createdAt: '2024-01-14',
    shipmentId: null,
  },
  {
    id: 'TXN-2024-003',
    orderNumber: 'ORD-2024-003',
    productName: 'Textile Fabric Rolls',
    quantity: 2000,
    unit: 'meters',
    supplierName: 'Mumbai Textiles Ltd',
    amount: 11000,
    currency: 'USD',
    status: 'COMPLETED',
    progress: 100,
    estimatedDelivery: '2024-01-20',
    createdAt: '2024-01-05',
    shipmentId: 'SHP-2024-003',
  },
  {
    id: 'TXN-2024-004',
    orderNumber: 'ORD-2024-004',
    productName: 'Chemical Raw Materials',
    quantity: 1000,
    unit: 'liters',
    supplierName: 'Global Chemicals Co.',
    amount: 15000,
    currency: 'USD',
    status: 'PENDING',
    progress: 10,
    estimatedDelivery: '2024-02-10',
    createdAt: '2024-01-20',
    shipmentId: null,
  },
];

const getStatusBadge = (status: string) => {
  const config: Record<string, { variant: any; label: string }> = {
    PENDING: { variant: 'warning', label: 'Pending' },
    CONFIRMED: { variant: 'info', label: 'Confirmed' },
    PRODUCTION: { variant: 'warning', label: 'In Production' },
    IN_TRANSIT: { variant: 'info', label: 'In Transit' },
    DELIVERED: { variant: 'success', label: 'Delivered' },
    COMPLETED: { variant: 'success', label: 'Completed' },
  };
  const item = config[status] || { variant: 'secondary', label: status };
  return <Badge variant={item.variant}>{item.label}</Badge>;
};

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredOrders = mockOrders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.supplierName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = mockOrders.filter(o => o.status !== 'COMPLETED').length;
  const totalValue = mockOrders.reduce((sum, o) => sum + o.amount, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            View and manage all your orders
          </p>
        </div>
        <Link href="/requirements/new">
          <Button variant="gradient">
            <Plus className="mr-2 h-4 w-4" />
            New Requirement
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <Package className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{mockOrders.length}</div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                <Clock className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{activeCount}</div>
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
                <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground">Total Value</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                <Truck className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {mockOrders.filter(o => o.status === 'IN_TRANSIT').length}
                </div>
                <p className="text-sm text-muted-foreground">In Transit</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="PRODUCTION">In Production</option>
              <option value="IN_TRANSIT">In Transit</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="grid gap-4">
        {filteredOrders.map((order) => (
          <Card key={order.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                {/* Order Info */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{order.orderNumber}</h3>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-sm font-medium mt-1">{order.productName}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {order.supplierName}
                      </span>
                      <span>{order.quantity.toLocaleString()} {order.unit}</span>
                    </div>
                  </div>
                </div>

                {/* Amount & Progress */}
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
                    <p className="text-xs text-muted-foreground">Est. Delivery</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link href={`/orders/${order.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                  </Link>
                  {order.shipmentId && (
                    <Link href={`/shipments/${order.shipmentId}`}>
                      <Button variant="outline" size="sm">
                        <Truck className="mr-2 h-4 w-4" />
                        Track
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No orders found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Orders will appear here when quotations are accepted
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
