'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  CheckCircle,
  Package,
  Calendar,
  DollarSign,
  ArrowUpRight,
  ArrowRight,
} from 'lucide-react';

interface OrderHistoryItem {
  id: string;
  transactionId: string;
  buyerName: string;
  supplier: string;
  requirement: string;
  value: number;
  closedAt: string;
  outcome: 'completed' | 'cancelled' | 'disputed';
  rating: number;
}

const OUTCOME_CONFIG = {
  completed: { label: 'Completed', className: 'bg-green-500/20 text-green-400' },
  cancelled: { label: 'Cancelled', className: 'bg-slate-500/20 text-slate-400' },
  disputed: { label: 'Disputed', className: 'bg-red-500/20 text-red-400' },
};

const MOCK_HISTORY: OrderHistoryItem[] = [
  { id: 'ORD-080', transactionId: 'TXN-2024-080', buyerName: 'Acme Corporation', supplier: 'Steel Industries Ltd', requirement: 'Steel Components', value: 23800, closedAt: '2024-01-15', outcome: 'completed', rating: 4.8 },
  { id: 'ORD-079', transactionId: 'TXN-2024-079', buyerName: 'Tech Solutions Inc', supplier: 'ChemPro Industries', requirement: 'Industrial Chemicals', value: 14200, closedAt: '2024-01-10', outcome: 'completed', rating: 4.5 },
  { id: 'ORD-078', transactionId: 'TXN-2024-078', buyerName: 'Fashion Hub Ltd', supplier: 'Textile Masters', requirement: 'Cotton Fabric', value: 41000, closedAt: '2023-12-30', outcome: 'disputed', rating: 3.2 },
  { id: 'ORD-077', transactionId: 'TXN-2024-077', buyerName: 'Metro Supplies', supplier: 'Prime Equip Co', requirement: 'Industrial Equipment', value: 67000, closedAt: '2023-12-22', outcome: 'cancelled', rating: 0 },
];

export default function OrderHistoryPage() {
  const [search, setSearch] = useState('');

  const filteredOrders = MOCK_HISTORY.filter((order) =>
    order.buyerName.toLowerCase().includes(search.toLowerCase()) ||
    order.requirement.toLowerCase().includes(search.toLowerCase()) ||
    order.supplier.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Order History</h1>
          <p className="text-slate-400">Review past orders, outcomes, and client feedback</p>
        </div>
        <Button variant="outline" className="border-slate-700 text-slate-300 hover:text-white">
          <ArrowUpRight className="h-4 w-4 mr-2" />
          Export History
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
                  <div className="h-12 w-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-white">{order.requirement}</h3>
                      <Badge className={OUTCOME_CONFIG[order.outcome].className}>
                        {OUTCOME_CONFIG[order.outcome].label}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-400 mt-1">Buyer: {order.buyerName} • Supplier: {order.supplier}</p>
                    <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />${order.value.toLocaleString()}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Closed {order.closedAt}</span>
                      <span className="flex items-center gap-1"><Package className="h-3 w-3" />Order {order.id}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Link href={`/internal/orders/${order.transactionId}`}>
                    <Button variant="outline" className="border-slate-700 text-slate-300 hover:text-white">
                      View Summary
                    </Button>
                  </Link>
                  <Link href={`/internal/orders/active`}>
                    <Button variant="ghost" className="text-blue-400 hover:text-blue-300">
                      Track Active Orders <ArrowRight className="h-4 w-4 ml-1" />
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
            <Package className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white">No orders found</h3>
            <p className="text-slate-400">Try a different search term.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
