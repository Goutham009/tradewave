'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Truck,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Calendar,
  DollarSign,
  MapPin,
} from 'lucide-react';

interface ActiveOrder {
  id: string;
  transactionId: string;
  buyerName: string;
  requirement: string;
  supplier: string;
  value: number;
  stage: 'payment_pending' | 'in_production' | 'quality_check' | 'in_transit' | 'delivered';
  eta: string;
  lastUpdate: string;
  location: string;
  risk: 'low' | 'medium' | 'high';
}

const STAGE_CONFIG = {
  payment_pending: { label: 'Payment Pending', className: 'bg-yellow-500/20 text-yellow-400' },
  in_production: { label: 'In Production', className: 'bg-blue-500/20 text-blue-400' },
  quality_check: { label: 'Quality Check', className: 'bg-purple-500/20 text-purple-400' },
  in_transit: { label: 'In Transit', className: 'bg-indigo-500/20 text-indigo-400' },
  delivered: { label: 'Delivered', className: 'bg-green-500/20 text-green-400' },
};

const RISK_CONFIG = {
  low: 'bg-green-500/20 text-green-400',
  medium: 'bg-yellow-500/20 text-yellow-400',
  high: 'bg-red-500/20 text-red-400',
};

const MOCK_ACTIVE_ORDERS: ActiveOrder[] = [
  { id: 'ORD-101', transactionId: 'TXN-2024-101', buyerName: 'Acme Corporation', requirement: 'Steel Components', supplier: 'Steel Industries Ltd', value: 24500, stage: 'in_production', eta: '2024-02-05', lastUpdate: '2 hours ago', location: 'Pune, IN', risk: 'low' },
  { id: 'ORD-102', transactionId: 'TXN-2024-102', buyerName: 'Tech Solutions Inc', requirement: 'Industrial Chemicals', supplier: 'ChemPro Industries', value: 15000, stage: 'quality_check', eta: '2024-02-02', lastUpdate: '6 hours ago', location: 'Austin, US', risk: 'medium' },
  { id: 'ORD-103', transactionId: 'TXN-2024-103', buyerName: 'Fashion Hub Ltd', requirement: 'Cotton Fabric', supplier: 'Textile Masters', value: 42000, stage: 'in_transit', eta: '2024-02-09', lastUpdate: '1 day ago', location: 'Delhi, IN', risk: 'low' },
  { id: 'ORD-104', transactionId: 'TXN-2024-104', buyerName: 'Metro Supplies', requirement: 'Industrial Equipment', supplier: 'Prime Equip Co', value: 68000, stage: 'payment_pending', eta: '2024-02-12', lastUpdate: '3 hours ago', location: 'Chicago, US', risk: 'high' },
];

export default function ActiveOrdersPage() {
  const [search, setSearch] = useState('');

  const filteredOrders = MOCK_ACTIVE_ORDERS.filter((order) =>
    order.buyerName.toLowerCase().includes(search.toLowerCase()) ||
    order.requirement.toLowerCase().includes(search.toLowerCase()) ||
    order.supplier.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Active Orders</h1>
          <p className="text-slate-400">Track live orders and update clients with stage insights</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Package className="h-4 w-4 mr-2" />
          Export Status Report
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search buyer, supplier, requirement..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-slate-900 border-slate-700"
        />
      </div>

      <div className="grid gap-4">
        {filteredOrders.map((order) => (
          <Card key={order.id} className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Truck className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-white">{order.requirement}</h3>
                      <Badge className={STAGE_CONFIG[order.stage].className}>
                        {STAGE_CONFIG[order.stage].label}
                      </Badge>
                      <Badge className={RISK_CONFIG[order.risk]}>Risk: {order.risk}</Badge>
                    </div>
                    <p className="text-sm text-slate-400 mt-1">Buyer: {order.buyerName} • Supplier: {order.supplier}</p>
                    <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />${order.value.toLocaleString()}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />ETA {order.eta}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{order.location}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Updated {order.lastUpdate}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Link href={`/internal/orders/${order.transactionId}`}>
                    <Button variant="outline" className="border-slate-700 text-slate-300 hover:text-white">
                      View Timeline
                    </Button>
                  </Link>
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    Notify Client
                  </Button>
                  <Link href={`/internal/orders/history?order=${order.id}`}>
                    <Button variant="ghost" className="text-blue-400 hover:text-blue-300">
                      See History <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white">No active orders found</h3>
            <p className="text-slate-400">Try adjusting your search or filters.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
