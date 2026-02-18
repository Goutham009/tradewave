'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Search, Package, Building2, Calendar, Clock, Eye, Truck,
  DollarSign, Plus, ArrowDownLeft, ArrowUpRight,
} from 'lucide-react';

// ── Mock: Purchase Orders (as buyer) ──
const mockPurchaseOrders = [
  { id: 'TXN-2024-001', orderNumber: 'PO-2024-001', productName: 'Steel Components for Manufacturing', quantity: 5000, unit: 'kg', counterparty: 'Shanghai Steel Co.', amount: 24375, currency: 'USD', status: 'IN_TRANSIT', progress: 65, estimatedDelivery: '2024-01-29', createdAt: '2024-01-15', shipmentId: 'SHP-2024-001' },
  { id: 'TXN-2024-002', orderNumber: 'PO-2024-002', productName: 'Electronic Circuit Boards', quantity: 500, unit: 'units', counterparty: 'Shenzhen Electronics', amount: 12500, currency: 'USD', status: 'PRODUCTION', progress: 35, estimatedDelivery: '2024-02-04', createdAt: '2024-01-14', shipmentId: null },
  { id: 'TXN-2024-003', orderNumber: 'PO-2024-003', productName: 'Textile Fabric Rolls', quantity: 2000, unit: 'meters', counterparty: 'Mumbai Textiles Ltd', amount: 11000, currency: 'USD', status: 'COMPLETED', progress: 100, estimatedDelivery: '2024-01-20', createdAt: '2024-01-05', shipmentId: 'SHP-2024-003' },
  { id: 'TXN-2024-004', orderNumber: 'PO-2024-004', productName: 'Chemical Raw Materials', quantity: 1000, unit: 'liters', counterparty: 'Global Chemicals Co.', amount: 15000, currency: 'USD', status: 'PENDING', progress: 10, estimatedDelivery: '2024-02-10', createdAt: '2024-01-20', shipmentId: null },
];

// ── Mock: Sales Orders (as supplier) ──
const mockSalesOrders = [
  { id: 'TXN-S-001', orderNumber: 'SO-2026-001', productName: 'Industrial Steel Pipes - Grade 304', quantity: 500, unit: 'MT', counterparty: 'Global Imports Inc.', amount: 575000, currency: 'USD', status: 'PRODUCTION', progress: 40, estimatedDelivery: '2026-05-15', createdAt: '2026-02-15', shipmentId: null },
  { id: 'TXN-S-002', orderNumber: 'SO-2026-002', productName: 'Copper Wire - Industrial Grade', quantity: 200, unit: 'MT', counterparty: 'Euro Manufacturing GmbH', amount: 1760000, currency: 'USD', status: 'CONFIRMED', progress: 15, estimatedDelivery: '2026-06-01', createdAt: '2026-02-12', shipmentId: null },
  { id: 'TXN-S-003', orderNumber: 'SO-2026-003', productName: 'Aluminum Sheets - 5mm', quantity: 150, unit: 'MT', counterparty: 'Rotterdam Trading BV', amount: 360000, currency: 'USD', status: 'COMPLETED', progress: 100, estimatedDelivery: '2026-03-30', createdAt: '2026-01-20', shipmentId: 'SHP-S-003' },
];

const getStatusBadge = (status: string) => {
  const config: Record<string, { variant: any; label: string }> = {
    PENDING: { variant: 'warning', label: 'Pending' }, CONFIRMED: { variant: 'info', label: 'Confirmed' },
    PRODUCTION: { variant: 'warning', label: 'In Production' }, IN_TRANSIT: { variant: 'info', label: 'In Transit' },
    DELIVERED: { variant: 'success', label: 'Delivered' }, COMPLETED: { variant: 'success', label: 'Completed' },
  };
  const item = config[status] || { variant: 'secondary', label: status };
  return <Badge variant={item.variant}>{item.label}</Badge>;
};

export default function OrdersPage() {
  const [view, setView] = useState<'purchase' | 'sales'>('purchase');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const orders = view === 'purchase' ? mockPurchaseOrders : mockSalesOrders;

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) || order.productName.toLowerCase().includes(searchQuery.toLowerCase()) || order.counterparty.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch && (statusFilter === 'all' || order.status === statusFilter);
  });

  const activeCount = orders.filter(o => o.status !== 'COMPLETED').length;
  const totalValue = orders.reduce((sum, o) => sum + o.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">Manage your purchase and sales orders</p>
        </div>
        <Link href="/requirements/new">
          <Button variant="gradient"><Plus className="mr-2 h-4 w-4" />New Requirement</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10"><Package className="h-5 w-5 text-blue-500" /></div><div><div className="text-2xl font-bold">{orders.length}</div><p className="text-sm text-muted-foreground">Total Orders</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10"><Clock className="h-5 w-5 text-orange-500" /></div><div><div className="text-2xl font-bold text-orange-600">{activeCount}</div><p className="text-sm text-muted-foreground">Active</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10"><DollarSign className="h-5 w-5 text-green-500" /></div><div><div className="text-2xl font-bold">${totalValue.toLocaleString()}</div><p className="text-sm text-muted-foreground">Total Value</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10"><Truck className="h-5 w-5 text-purple-500" /></div><div><div className="text-2xl font-bold">{orders.filter(o => o.status === 'IN_TRANSIT').length}</div><p className="text-sm text-muted-foreground">In Transit</p></div></div></CardContent></Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="inline-flex rounded-lg border border-input p-1 bg-muted/30">
              <button onClick={() => { setView('purchase'); setStatusFilter('all'); }} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'purchase' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                <ArrowUpRight className="h-3.5 w-3.5" />Purchase Orders
              </button>
              <button onClick={() => { setView('sales'); setStatusFilter('all'); }} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'sales' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                <ArrowDownLeft className="h-3.5 w-3.5" />Sales Orders
              </button>
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search orders..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
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
                <div className="flex items-start gap-4 flex-1">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10"><Package className="h-6 w-6 text-primary" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap"><h3 className="font-semibold">{order.orderNumber}</h3>{getStatusBadge(order.status)}</div>
                    <p className="text-sm font-medium mt-1">{order.productName}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{order.counterparty}</span>
                      <span>{order.quantity.toLocaleString()} {order.unit}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-8">
                  <div className="text-left sm:text-right">
                    <p className="text-xl font-bold">${order.amount.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{order.currency}</p>
                  </div>
                  <div className="min-w-[120px]">
                    <div className="flex items-center justify-between mb-1"><span className="text-xs text-muted-foreground">Progress</span><span className="text-xs font-medium">{order.progress}%</span></div>
                    <Progress value={order.progress} className="h-2" />
                  </div>
                  <div className="text-left sm:text-right min-w-[100px]">
                    <p className="text-sm flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(order.estimatedDelivery).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                    <p className="text-xs text-muted-foreground">Est. Delivery</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/orders/${order.id}`}><Button variant="outline" size="sm"><Eye className="mr-2 h-4 w-4" />View Details</Button></Link>
                  {order.shipmentId && <Link href={`/shipments/${order.shipmentId}`}><Button variant="outline" size="sm"><Truck className="mr-2 h-4 w-4" />Track</Button></Link>}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <Card><CardContent className="flex flex-col items-center justify-center py-12"><Package className="h-12 w-12 text-muted-foreground" /><h3 className="mt-4 text-lg font-semibold">No orders found</h3><p className="mt-2 text-sm text-muted-foreground">{view === 'purchase' ? 'Purchase orders appear when quotations are accepted' : 'Sales orders appear when buyers accept your quotes'}</p></CardContent></Card>
      )}
    </div>
  );
}
