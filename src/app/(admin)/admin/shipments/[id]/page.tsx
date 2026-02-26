'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  MapPin,
  Package,
  Truck,
} from 'lucide-react';

type ShipmentStatus =
  | 'PENDING'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'DELAYED'
  | 'LOST'
  | 'CANCELLED';

type ShipmentDetail = {
  id: string;
  trackingNumber: string;
  carrier: string;
  status: ShipmentStatus;
  originLocation: string;
  currentLocation: string;
  destinationLocation: string;
  estimatedDelivery: string;
  actualDelivery: string | null;
  buyerName: string;
  supplierName: string;
  amount: number;
  updates: Array<{ label: string; date: string; done: boolean }>;
};

const STATUS_BADGE: Record<ShipmentStatus, string> = {
  PENDING: 'bg-blue-500/20 text-blue-400',
  PICKED_UP: 'bg-cyan-500/20 text-cyan-400',
  IN_TRANSIT: 'bg-yellow-500/20 text-yellow-400',
  OUT_FOR_DELIVERY: 'bg-orange-500/20 text-orange-400',
  DELIVERED: 'bg-green-500/20 text-green-400',
  DELAYED: 'bg-red-500/20 text-red-400',
  LOST: 'bg-red-700/30 text-red-300',
  CANCELLED: 'bg-slate-500/20 text-slate-400',
};

const ALL_STATUSES: ShipmentStatus[] = [
  'PENDING',
  'PICKED_UP',
  'IN_TRANSIT',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'DELAYED',
  'LOST',
  'CANCELLED',
];

const SHIPMENT_MOCKS: Record<string, ShipmentDetail> = {
  sh1: {
    id: 'sh1',
    trackingNumber: 'TW-2024-001234',
    carrier: 'DHL',
    status: 'IN_TRANSIT',
    originLocation: 'Shanghai, China',
    currentLocation: 'Singapore Hub',
    destinationLocation: 'New York, USA',
    estimatedDelivery: new Date(Date.now() + 5 * 86400000).toISOString(),
    actualDelivery: null,
    buyerName: 'Acme Corp',
    supplierName: 'Steel Industries',
    amount: 45000,
    updates: [
      { label: 'Pickup confirmed', date: new Date(Date.now() - 4 * 86400000).toISOString(), done: true },
      { label: 'Export customs cleared', date: new Date(Date.now() - 3 * 86400000).toISOString(), done: true },
      { label: 'In transit', date: new Date(Date.now() - 2 * 86400000).toISOString(), done: true },
      { label: 'Out for delivery', date: new Date(Date.now() + 2 * 86400000).toISOString(), done: false },
      { label: 'Delivered', date: new Date(Date.now() + 5 * 86400000).toISOString(), done: false },
    ],
  },
};

function readableStatus(status: string) {
  return status.replace('_', ' ');
}

export default function AdminShipmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const shipmentId = params.id as string;

  const initialShipment = useMemo<ShipmentDetail>(() => {
    return (
      SHIPMENT_MOCKS[shipmentId] || {
        id: shipmentId,
        trackingNumber: `TW-${shipmentId.toUpperCase()}`,
        carrier: 'FedEx',
        status: 'PENDING',
        originLocation: 'Mumbai, India',
        currentLocation: 'Origin Facility',
        destinationLocation: 'Dubai, UAE',
        estimatedDelivery: new Date(Date.now() + 7 * 86400000).toISOString(),
        actualDelivery: null,
        buyerName: 'Buyer Company',
        supplierName: 'Supplier Company',
        amount: 15000,
        updates: [
          { label: 'Shipment created', date: new Date().toISOString(), done: true },
          { label: 'Pickup confirmed', date: new Date(Date.now() + 86400000).toISOString(), done: false },
          { label: 'In transit', date: new Date(Date.now() + 2 * 86400000).toISOString(), done: false },
        ],
      }
    );
  }, [shipmentId]);

  const [shipment, setShipment] = useState<ShipmentDetail>(initialShipment);

  const handleStatusChange = (nextStatus: ShipmentStatus) => {
    setShipment((prev) => ({
      ...prev,
      status: nextStatus,
      actualDelivery: nextStatus === 'DELIVERED' ? new Date().toISOString() : prev.actualDelivery,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/admin/shipments')} className="text-slate-400">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Shipments
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">Shipment Details</h1>
            <p className="font-mono text-sm text-slate-400">{shipment.trackingNumber}</p>
          </div>
        </div>
        <Badge className={STATUS_BADGE[shipment.status]}>{readableStatus(shipment.status)}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="bg-slate-800 border-slate-700 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Route & Tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg bg-slate-900 p-4">
                <p className="text-xs text-slate-400">Origin</p>
                <p className="text-white">{shipment.originLocation}</p>
              </div>
              <div className="rounded-lg bg-slate-900 p-4">
                <p className="text-xs text-slate-400">Current</p>
                <p className="text-yellow-400">{shipment.currentLocation}</p>
              </div>
              <div className="rounded-lg bg-slate-900 p-4">
                <p className="text-xs text-slate-400">Destination</p>
                <p className="text-white">{shipment.destinationLocation}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-slate-900 p-4">
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Estimated Delivery
                </p>
                <p className="text-white">{new Date(shipment.estimatedDelivery).toLocaleDateString()}</p>
              </div>
              <div className="rounded-lg bg-slate-900 p-4">
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Actual Delivery
                </p>
                <p className="text-white">
                  {shipment.actualDelivery ? new Date(shipment.actualDelivery).toLocaleDateString() : 'Pending'}
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-slate-900 p-4">
              <p className="mb-3 text-sm font-medium text-white">Tracking Timeline</p>
              <div className="space-y-3">
                {shipment.updates.map((update) => (
                  <div key={update.label} className="flex items-start gap-2">
                    <span
                      className={`mt-1 h-2.5 w-2.5 rounded-full ${update.done ? 'bg-green-400' : 'bg-slate-500'}`}
                    />
                    <div>
                      <p className={`${update.done ? 'text-slate-100' : 'text-slate-400'} text-sm`}>{update.label}</p>
                      <p className="text-xs text-slate-500">{new Date(update.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-base">Shipment Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="mb-2 text-xs text-slate-400">Update Status</p>
                <Select value={shipment.status} onValueChange={(value) => handleStatusChange(value as ShipmentStatus)}>
                  <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {ALL_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {readableStatus(status)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <MapPin className="mr-2 h-4 w-4" />
                Push Location Update
              </Button>
              <Button variant="outline" className="w-full border-slate-600 text-slate-300">
                <Package className="mr-2 h-4 w-4" />
                Notify Buyer & Supplier
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-base">Commercial Context</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-slate-400">Buyer</p>
              <p className="text-white">{shipment.buyerName}</p>
              <p className="pt-2 text-slate-400">Supplier</p>
              <p className="text-white">{shipment.supplierName}</p>
              <p className="pt-2 text-slate-400">Order Value</p>
              <p className="text-white">${shipment.amount.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
