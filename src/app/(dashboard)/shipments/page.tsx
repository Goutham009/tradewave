'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Search,
  Truck,
  Package,
  MapPin,
  Calendar,
  Clock,
  Eye,
  RefreshCw,
  Building2,
  Ship,
  Plane,
  CheckCircle2,
  AlertTriangle,
  Navigation,
} from 'lucide-react';

// Mock shipments data
const mockShipments = [
  {
    id: 'SHP-2024-001',
    trackingNumber: 'MAEU1234567',
    orderId: 'TXN-2024-001',
    orderTitle: 'Steel Components for Manufacturing',
    supplier: {
      name: 'Shanghai Steel Co.',
      location: 'Shanghai, China',
    },
    carrier: 'Maersk Line',
    carrierType: 'sea',
    status: 'IN_TRANSIT',
    progress: 55,
    origin: {
      address: 'Shanghai, China',
      coordinates: { lat: 31.2304, lng: 121.4737 },
    },
    destination: {
      address: 'Mumbai, India',
      coordinates: { lat: 19.0760, lng: 72.8777 },
    },
    currentLocation: {
      address: 'Singapore Port (Transit)',
      coordinates: { lat: 1.2644, lng: 103.8225 },
      timestamp: '2024-01-24T10:30:00Z',
    },
    estimatedDelivery: '2024-01-29',
    createdAt: '2024-01-22T08:00:00Z',
    weight: '5000 kg',
    containerNumber: 'MSKU1234567',
  },
  {
    id: 'SHP-2024-002',
    trackingNumber: 'DHL9876543210',
    orderId: 'TXN-2024-002',
    orderTitle: 'Electronic Circuit Boards',
    supplier: {
      name: 'Shenzhen Electronics',
      location: 'Shenzhen, China',
    },
    carrier: 'DHL Express',
    carrierType: 'air',
    status: 'OUT_FOR_DELIVERY',
    progress: 90,
    origin: {
      address: 'Shenzhen, China',
      coordinates: { lat: 22.5431, lng: 114.0579 },
    },
    destination: {
      address: 'Delhi, India',
      coordinates: { lat: 28.6139, lng: 77.2090 },
    },
    currentLocation: {
      address: 'Delhi Distribution Center',
      coordinates: { lat: 28.5562, lng: 77.1000 },
      timestamp: '2024-01-25T06:00:00Z',
    },
    estimatedDelivery: '2024-01-25',
    createdAt: '2024-01-20T14:00:00Z',
    weight: '150 kg',
    awbNumber: 'AWB-9876543210',
  },
  {
    id: 'SHP-2024-003',
    trackingNumber: 'FEDEX1122334455',
    orderId: 'TXN-2024-003',
    orderTitle: 'Textile Fabric Rolls',
    supplier: {
      name: 'Mumbai Textiles Ltd',
      location: 'Mumbai, India',
    },
    carrier: 'FedEx',
    carrierType: 'ground',
    status: 'DELIVERED',
    progress: 100,
    origin: {
      address: 'Mumbai, India',
      coordinates: { lat: 19.0760, lng: 72.8777 },
    },
    destination: {
      address: 'Chennai, India',
      coordinates: { lat: 13.0827, lng: 80.2707 },
    },
    currentLocation: {
      address: 'Chennai, India',
      coordinates: { lat: 13.0827, lng: 80.2707 },
      timestamp: '2024-01-19T14:30:00Z',
    },
    estimatedDelivery: '2024-01-20',
    deliveredAt: '2024-01-19T14:30:00Z',
    createdAt: '2024-01-12T09:00:00Z',
    weight: '800 kg',
  },
  {
    id: 'SHP-2024-004',
    trackingNumber: 'UPS7788990011',
    orderId: 'TXN-2024-004',
    orderTitle: 'Chemical Raw Materials',
    supplier: {
      name: 'Global Chemicals Co.',
      location: 'Singapore',
    },
    carrier: 'UPS',
    carrierType: 'sea',
    status: 'EXCEPTION',
    progress: 40,
    origin: {
      address: 'Singapore',
      coordinates: { lat: 1.3521, lng: 103.8198 },
    },
    destination: {
      address: 'Kolkata, India',
      coordinates: { lat: 22.5726, lng: 88.3639 },
    },
    currentLocation: {
      address: 'Singapore Customs',
      coordinates: { lat: 1.2644, lng: 103.8225 },
      timestamp: '2024-01-23T16:00:00Z',
    },
    estimatedDelivery: '2024-02-05',
    createdAt: '2024-01-18T11:00:00Z',
    weight: '2000 kg',
    exceptionReason: 'Customs documentation pending',
  },
];

const getStatusBadge = (status: string) => {
  const config: Record<string, { variant: any; label: string; icon: any }> = {
    PICKED_UP: { variant: 'info', label: 'Picked Up', icon: Package },
    IN_TRANSIT: { variant: 'info', label: 'In Transit', icon: Truck },
    OUT_FOR_DELIVERY: { variant: 'warning', label: 'Out for Delivery', icon: Navigation },
    DELIVERED: { variant: 'success', label: 'Delivered', icon: CheckCircle2 },
    EXCEPTION: { variant: 'destructive', label: 'Exception', icon: AlertTriangle },
  };
  const item = config[status] || { variant: 'secondary', label: status, icon: Package };
  const Icon = item.icon;
  return (
    <Badge variant={item.variant} className="flex items-center gap-1">
      <Icon className="h-3 w-3" />
      {item.label}
    </Badge>
  );
};

const getCarrierIcon = (type: string) => {
  switch (type) {
    case 'sea':
      return <Ship className="h-5 w-5" />;
    case 'air':
      return <Plane className="h-5 w-5" />;
    default:
      return <Truck className="h-5 w-5" />;
  }
};

export default function ShipmentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredShipments = mockShipments.filter((shipment) => {
    const matchesSearch =
      shipment.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.orderTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.supplier.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || shipment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLastUpdated(new Date());
    setIsRefreshing(false);
  };

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      handleRefresh();
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const activeCount = mockShipments.filter(
    (s) => !['DELIVERED'].includes(s.status)
  ).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Shipment Tracking</h1>
          <p className="text-muted-foreground">
            Track your shipments in real-time
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
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
                <div className="text-2xl font-bold">{mockShipments.length}</div>
                <p className="text-sm text-muted-foreground">Total Shipments</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                <Truck className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{activeCount}</div>
                <p className="text-sm text-muted-foreground">In Transit</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {mockShipments.filter((s) => s.status === 'DELIVERED').length}
                </div>
                <p className="text-sm text-muted-foreground">Delivered</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {mockShipments.filter((s) => s.status === 'EXCEPTION').length}
                </div>
                <p className="text-sm text-muted-foreground">Exceptions</p>
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
                placeholder="Search by tracking number, order ID, or supplier..."
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
              <option value="PICKED_UP">Picked Up</option>
              <option value="IN_TRANSIT">In Transit</option>
              <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
              <option value="DELIVERED">Delivered</option>
              <option value="EXCEPTION">Exception</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Shipments List */}
      <div className="grid gap-4">
        {filteredShipments.map((shipment) => (
          <Card
            key={shipment.id}
            className={`hover:shadow-md transition-shadow ${
              shipment.status === 'EXCEPTION' ? 'border-red-200' : ''
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                      shipment.status === 'DELIVERED'
                        ? 'bg-green-500/10 text-green-500'
                        : shipment.status === 'EXCEPTION'
                        ? 'bg-red-500/10 text-red-500'
                        : 'bg-blue-500/10 text-blue-500'
                    }`}
                  >
                    {getCarrierIcon(shipment.carrierType)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{shipment.trackingNumber}</h3>
                      {getStatusBadge(shipment.status)}
                    </div>
                    <p className="text-sm font-medium">{shipment.orderTitle}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        {shipment.supplier.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Truck className="h-4 w-4" />
                        {shipment.carrier}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Order</p>
                  <Link href={`/transactions/${shipment.orderId}`}>
                    <span className="font-mono text-sm text-primary hover:underline">
                      {shipment.orderId}
                    </span>
                  </Link>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Shipping Progress</span>
                  <span className="text-sm font-medium">{shipment.progress}%</span>
                </div>
                <Progress
                  value={shipment.progress}
                  className={`h-2 ${
                    shipment.status === 'EXCEPTION' ? '[&>div]:bg-red-500' : ''
                  }`}
                />
              </div>

              {/* Route Info */}
              <div className="flex items-center justify-between mb-4 p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{shipment.origin.address}</span>
                </div>
                <div className="flex-1 mx-4 border-t-2 border-dashed relative">
                  <div className="absolute left-1/2 -translate-x-1/2 -top-3 bg-background px-2">
                    <span className="text-xs text-muted-foreground">
                      {shipment.currentLocation.address}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{shipment.destination.address}</span>
                </div>
              </div>

              {/* Exception Warning */}
              {shipment.status === 'EXCEPTION' && shipment.exceptionReason && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-800">Exception Alert</p>
                    <p className="text-sm text-red-600">{shipment.exceptionReason}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    ETA: {new Date(shipment.estimatedDelivery).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Updated: {new Date(shipment.currentLocation.timestamp).toLocaleString()}
                  </span>
                </div>
                <Link href={`/shipments/${shipment.id}`}>
                  <Button variant="outline" size="sm">
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredShipments.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Truck className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No shipments found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Shipments will appear here when orders are shipped
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
