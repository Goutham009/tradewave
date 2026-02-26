'use client';

import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Building2,
  Calendar,
  ClipboardCheck,
  DollarSign,
  FileText,
  Package,
  Truck,
  User,
} from 'lucide-react';

type OrderStatus = 'PAYMENT_PENDING' | 'VERIFIED' | 'SHIPPED' | 'DELIVERED' | 'COMPLETED';

type OrderDetail = {
  id: string;
  title: string;
  requirementRef: string;
  buyerCompany: string;
  supplierCompany: string;
  quantity: number;
  unit: string;
  amount: number;
  status: OrderStatus;
  createdAt: string;
  eta: string;
  deliveryAddress: string;
  paymentMethod: string;
  milestones: Array<{ label: string; done: boolean }>;
};

const STATUS_STYLE: Record<OrderStatus, string> = {
  PAYMENT_PENDING: 'bg-yellow-500/20 text-yellow-400',
  VERIFIED: 'bg-blue-500/20 text-blue-400',
  SHIPPED: 'bg-cyan-500/20 text-cyan-400',
  DELIVERED: 'bg-emerald-500/20 text-emerald-400',
  COMPLETED: 'bg-green-500/20 text-green-400',
};

const ORDER_MOCKS: Record<string, OrderDetail> = {
  req1: {
    id: 'req1',
    title: 'Steel Coils - Grade A',
    requirementRef: 'REQ-2024-001',
    buyerCompany: 'Acme Corp',
    supplierCompany: 'Steel Industries Ltd',
    quantity: 500,
    unit: 'tons',
    amount: 22500,
    status: 'VERIFIED',
    createdAt: '2024-02-15T10:00:00Z',
    eta: '2024-03-18T00:00:00Z',
    deliveryAddress: 'Detroit, Michigan, USA',
    paymentMethod: 'Escrow + Bank Transfer',
    milestones: [
      { label: 'Buyer payment confirmed', done: true },
      { label: 'Admin quote verification', done: true },
      { label: 'Production confirmation', done: false },
      { label: 'Shipment dispatch', done: false },
      { label: 'Delivery confirmation', done: false },
    ],
  },
  req2: {
    id: 'req2',
    title: 'Steel Pipes Supply',
    requirementRef: 'REQ-2024-002',
    buyerCompany: 'Global Manufacturing Co.',
    supplierCompany: 'Steel Inc',
    quantity: 320,
    unit: 'tons',
    amount: 45000,
    status: 'COMPLETED',
    createdAt: '2024-02-10T10:00:00Z',
    eta: '2024-02-25T00:00:00Z',
    deliveryAddress: 'Houston, Texas, USA',
    paymentMethod: 'Escrow',
    milestones: [
      { label: 'Buyer payment confirmed', done: true },
      { label: 'Admin quote verification', done: true },
      { label: 'Production confirmation', done: true },
      { label: 'Shipment dispatch', done: true },
      { label: 'Delivery confirmation', done: true },
    ],
  },
};

function toReadableStatus(status: OrderStatus) {
  return status.replace('_', ' ');
}

export default function UserOrderDetailPage() {
  const params = useParams();
  const router = useRouter();

  const orderId = params.orderId as string;
  const userId = params.id as string;

  const order = useMemo<OrderDetail>(() => {
    const normalizedOrderId = orderId.split('-')[0];
    const existing = ORDER_MOCKS[normalizedOrderId];

    if (existing) {
      return existing;
    }

    return {
      id: orderId,
      title: 'Industrial Order',
      requirementRef: `REQ-${orderId.toUpperCase()}`,
      buyerCompany: 'Global Buyer Co.',
      supplierCompany: 'Trusted Supplier Ltd',
      quantity: 120,
      unit: 'units',
      amount: 12500,
      status: 'PAYMENT_PENDING',
      createdAt: new Date().toISOString(),
      eta: new Date(Date.now() + 7 * 86400000).toISOString(),
      deliveryAddress: 'Mumbai, India',
      paymentMethod: 'Escrow',
      milestones: [
        { label: 'Buyer payment confirmed', done: false },
        { label: 'Admin quote verification', done: false },
        { label: 'Production confirmation', done: false },
        { label: 'Shipment dispatch', done: false },
        { label: 'Delivery confirmation', done: false },
      ],
    };
  }, [orderId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push(`/admin/users/${userId}`)} className="text-slate-400">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to User
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">Order Details</h1>
            <p className="font-mono text-sm text-slate-400">{order.id}</p>
          </div>
        </div>
        <Badge className={STATUS_STYLE[order.status]}>{toReadableStatus(order.status)}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="bg-slate-800 border-slate-700 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Package className="h-5 w-5" />
              {order.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-slate-900 p-4">
                <p className="text-xs text-slate-400">Requirement</p>
                <p className="font-mono text-white">{order.requirementRef}</p>
              </div>
              <div className="rounded-lg bg-slate-900 p-4">
                <p className="text-xs text-slate-400">Order Value</p>
                <p className="text-xl font-bold text-white">
                  <DollarSign className="mr-1 inline h-4 w-4" />
                  {order.amount.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg bg-slate-900 p-4">
                <p className="text-xs text-slate-400">Buyer Company</p>
                <p className="text-white">{order.buyerCompany}</p>
              </div>
              <div className="rounded-lg bg-slate-900 p-4">
                <p className="text-xs text-slate-400">Supplier Company</p>
                <p className="text-white">{order.supplierCompany}</p>
              </div>
              <div className="rounded-lg bg-slate-900 p-4">
                <p className="text-xs text-slate-400">Quantity</p>
                <p className="text-white">{order.quantity.toLocaleString()} {order.unit}</p>
              </div>
              <div className="rounded-lg bg-slate-900 p-4">
                <p className="text-xs text-slate-400">Payment Method</p>
                <p className="text-white">{order.paymentMethod}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-slate-900 p-4">
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Created At
                </p>
                <p className="text-white">{new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <div className="rounded-lg bg-slate-900 p-4">
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <Truck className="h-3.5 w-3.5" />
                  ETA
                </p>
                <p className="text-white">{new Date(order.eta).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="rounded-lg bg-slate-900 p-4">
              <p className="mb-1 text-xs text-slate-400">Delivery Address</p>
              <p className="text-white">{order.deliveryAddress}</p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-base flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4" />
                Order Milestones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.milestones.map((milestone) => (
                <div key={milestone.label} className="flex items-start gap-2">
                  <span
                    className={`mt-1 h-2.5 w-2.5 rounded-full ${milestone.done ? 'bg-green-400' : 'bg-slate-500'}`}
                  />
                  <p className={`${milestone.done ? 'text-slate-200' : 'text-slate-400'} text-sm`}>{milestone.label}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-base">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700">
                <FileText className="mr-2 h-4 w-4" />
                Review Documents
              </Button>
              <Button variant="outline" className="w-full justify-start border-slate-600 text-slate-300">
                <Building2 className="mr-2 h-4 w-4" />
                Contact Supplier
              </Button>
              <Button variant="outline" className="w-full justify-start border-slate-600 text-slate-300">
                <User className="mr-2 h-4 w-4" />
                Contact Buyer
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
