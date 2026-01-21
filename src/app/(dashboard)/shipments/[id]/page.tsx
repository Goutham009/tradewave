'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft,
  Truck,
  Package,
  MapPin,
  Calendar,
  Clock,
  RefreshCw,
  Building2,
  Ship,
  Plane,
  CheckCircle2,
  AlertTriangle,
  Navigation,
  ExternalLink,
  Phone,
  Mail,
  Globe,
  Box,
  Weight,
  Ruler,
  FileSignature,
  Copy,
  ChevronDown,
  ChevronRight,
  Loader2,
  Circle,
} from 'lucide-react';

// Mock shipment detail data
const shipmentDetail = {
  id: 'SHP-2024-001',
  trackingNumber: 'MAEU1234567',
  orderId: 'TXN-2024-001',
  orderTitle: 'Steel Components for Manufacturing',
  status: 'IN_TRANSIT',
  progress: 55,
  
  carrier: {
    name: 'Maersk Line',
    type: 'sea',
    phone: '+1 800 123 4567',
    email: 'support@maersk.com',
    website: 'https://www.maersk.com',
    trackingUrl: 'https://www.maersk.com/tracking/MAEU1234567',
  },
  
  service: {
    type: 'Sea Freight FCL',
    containerNumber: 'MSKU1234567',
    vesselName: 'MSC Gulsun',
    voyageNumber: 'VY-2024-0115',
  },
  
  package: {
    weight: '5000 kg',
    dimensions: '40ft Container',
    pieces: 1,
    description: 'Steel Components - Grade 304',
    signatureRequired: true,
  },
  
  origin: {
    address: 'Shanghai Port, China',
    fullAddress: 'Yangshan Deep Water Port, Shanghai, China 201308',
    coordinates: { lat: 30.6300, lng: 122.0500 },
    departedAt: '2024-01-22T10:00:00Z',
  },
  
  destination: {
    address: 'Mumbai Port, India',
    fullAddress: 'Jawaharlal Nehru Port, Navi Mumbai, Maharashtra, India 400707',
    coordinates: { lat: 18.9500, lng: 72.9500 },
    estimatedArrival: '2024-01-29T14:00:00Z',
  },
  
  currentLocation: {
    address: 'Singapore Strait (Transit)',
    coordinates: { lat: 1.2644, lng: 103.8225 },
    timestamp: '2024-01-25T08:30:00Z',
    speed: '18 knots',
    heading: 'West-Southwest',
  },
  
  timeline: {
    daysElapsed: 3,
    daysRemaining: 4,
    totalDays: 7,
  },
  
  events: [
    {
      id: '1',
      timestamp: '2024-01-22T08:00:00Z',
      status: 'PICKED_UP',
      title: 'Cargo Picked Up',
      location: 'Shanghai Steel Co. Warehouse',
      coordinates: { lat: 31.2304, lng: 121.4737 },
      description: 'Cargo collected from supplier warehouse and transported to port',
      completed: true,
    },
    {
      id: '2',
      timestamp: '2024-01-22T10:00:00Z',
      status: 'PORT_ARRIVAL',
      title: 'Arrived at Origin Port',
      location: 'Yangshan Deep Water Port, Shanghai',
      coordinates: { lat: 30.6300, lng: 122.0500 },
      description: 'Container delivered to port terminal for loading',
      completed: true,
    },
    {
      id: '3',
      timestamp: '2024-01-22T14:00:00Z',
      status: 'CUSTOMS_CLEARED',
      title: 'Export Customs Cleared',
      location: 'Shanghai Customs',
      coordinates: { lat: 30.6300, lng: 122.0500 },
      description: 'Export documentation verified and customs cleared',
      completed: true,
    },
    {
      id: '4',
      timestamp: '2024-01-22T18:00:00Z',
      status: 'LOADED',
      title: 'Loaded onto Vessel',
      location: 'Yangshan Deep Water Port',
      coordinates: { lat: 30.6300, lng: 122.0500 },
      description: 'Container MSKU1234567 loaded onto MSC Gulsun',
      details: {
        vesselName: 'MSC Gulsun',
        voyageNumber: 'VY-2024-0115',
        containerPosition: 'Bay 42, Row 06, Tier 86',
      },
      completed: true,
    },
    {
      id: '5',
      timestamp: '2024-01-23T06:00:00Z',
      status: 'DEPARTED',
      title: 'Vessel Departed',
      location: 'Port of Shanghai',
      coordinates: { lat: 30.6300, lng: 122.0500 },
      description: 'Vessel departed for Singapore transit',
      completed: true,
    },
    {
      id: '6',
      timestamp: '2024-01-25T08:30:00Z',
      status: 'IN_TRANSIT',
      title: 'In Transit - Singapore Strait',
      location: 'Singapore Strait',
      coordinates: { lat: 1.2644, lng: 103.8225 },
      description: 'Vessel currently passing through Singapore Strait',
      details: {
        speed: '18 knots',
        heading: 'West-Southwest',
        weather: 'Clear',
      },
      completed: false,
      current: true,
    },
    {
      id: '7',
      timestamp: null,
      status: 'PORT_ARRIVAL',
      title: 'Arrival at Destination Port',
      location: 'Jawaharlal Nehru Port, Mumbai',
      coordinates: { lat: 18.9500, lng: 72.9500 },
      description: 'Expected arrival at Mumbai port',
      expectedDate: '2024-01-29T14:00:00Z',
      completed: false,
    },
    {
      id: '8',
      timestamp: null,
      status: 'CUSTOMS_CLEARANCE',
      title: 'Import Customs Clearance',
      location: 'Mumbai Customs',
      description: 'Import documentation and customs clearance',
      expectedDate: '2024-01-30T10:00:00Z',
      completed: false,
    },
    {
      id: '9',
      timestamp: null,
      status: 'OUT_FOR_DELIVERY',
      title: 'Out for Delivery',
      location: 'Mumbai Distribution',
      description: 'Container dispatched for final delivery',
      expectedDate: '2024-01-31T08:00:00Z',
      completed: false,
    },
    {
      id: '10',
      timestamp: null,
      status: 'DELIVERED',
      title: 'Delivered',
      location: 'Buyer Warehouse, Mumbai',
      description: 'Cargo delivered to destination',
      expectedDate: '2024-01-31T14:00:00Z',
      completed: false,
    },
  ],
  
  supplier: {
    name: 'Shanghai Steel Co.',
    companyName: 'Shanghai Steel Manufacturing Co. Ltd',
    location: 'Shanghai, China',
    email: 'sales@shanghaisteel.com',
    phone: '+86 21 1234 5678',
  },
  
  createdAt: '2024-01-22T08:00:00Z',
  lastUpdated: '2024-01-25T08:30:00Z',
};

const getStatusBadge = (status: string) => {
  const config: Record<string, { variant: any; label: string }> = {
    PICKED_UP: { variant: 'info', label: 'Picked Up' },
    IN_TRANSIT: { variant: 'info', label: 'In Transit' },
    OUT_FOR_DELIVERY: { variant: 'warning', label: 'Out for Delivery' },
    DELIVERED: { variant: 'success', label: 'Delivered' },
    EXCEPTION: { variant: 'destructive', label: 'Exception' },
  };
  const item = config[status] || { variant: 'secondary', label: status };
  return <Badge variant={item.variant}>{item.label}</Badge>;
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

export default function ShipmentDetailPage() {
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedEvents, setExpandedEvents] = useState<string[]>(['6']);

  const s = shipmentDetail;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLastUpdated(new Date());
    setIsRefreshing(false);
  };

  const toggleEvent = (id: string) => {
    setExpandedEvents((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const copyTrackingNumber = () => {
    navigator.clipboard.writeText(s.trackingNumber);
    alert('Tracking number copied!');
  };

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(handleRefresh, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/shipments">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Shipments
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{s.trackingNumber}</h1>
              <Button variant="ghost" size="sm" onClick={copyTrackingNumber}>
                <Copy className="h-4 w-4" />
              </Button>
              {getStatusBadge(s.status)}
            </div>
            <p className="text-muted-foreground">{s.orderTitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Updated: {lastUpdated.toLocaleTimeString()}
          </span>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <a href={s.carrier.trackingUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="gradient">
              <ExternalLink className="mr-2 h-4 w-4" />
              Track on {s.carrier.name}
            </Button>
          </a>
        </div>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardContent className="p-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Shipping Progress</span>
                <span className="text-lg font-bold">{s.progress}%</span>
              </div>
              <Progress value={s.progress} className="h-3 mb-4" />
              
              <div className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium">{s.origin.address}</p>
                  <p className="text-muted-foreground">
                    Departed: {new Date(s.origin.departedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-2 text-blue-600">
                    <Navigation className="h-4 w-4" />
                    <span className="font-medium">{s.currentLocation.address}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Current Location</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{s.destination.address}</p>
                  <p className="text-muted-foreground">
                    ETA: {new Date(s.destination.estimatedArrival).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="border-l pl-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-600">{s.timeline.daysElapsed}</p>
                  <p className="text-xs text-muted-foreground">Days Elapsed</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{s.timeline.daysRemaining}</p>
                  <p className="text-xs text-muted-foreground">Days Left</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{s.timeline.totalDays}</p>
                  <p className="text-xs text-muted-foreground">Total Days</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Map Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Live Tracking Map
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg flex items-center justify-center relative overflow-hidden">
                {/* Map placeholder - would integrate Google Maps or Mapbox here */}
                <div className="absolute inset-0 opacity-20">
                  <svg viewBox="0 0 100 50" className="w-full h-full">
                    <path
                      d="M 10 25 Q 30 10 50 25 T 90 25"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="0.5"
                      strokeDasharray="2"
                      className="text-blue-400"
                    />
                  </svg>
                </div>
                
                <div className="text-center z-10">
                  <div className="flex items-center justify-center gap-8 mb-4">
                    <div className="text-center">
                      <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-1"></div>
                      <p className="text-xs font-medium">Shanghai</p>
                    </div>
                    <div className="w-32 border-t-2 border-dashed border-blue-400 relative">
                      <div className="absolute left-1/2 -translate-x-1/2 -top-2 bg-blue-500 rounded-full p-1">
                        <Ship className="h-3 w-3 text-white" />
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="w-4 h-4 bg-red-500 rounded-full mx-auto mb-1"></div>
                      <p className="text-xs font-medium">Mumbai</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    Map integration available with Google Maps or Mapbox API
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Current: {s.currentLocation.coordinates.lat.toFixed(4)}°N, {s.currentLocation.coordinates.lng.toFixed(4)}°E
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-muted-foreground">Speed</p>
                  <p className="font-semibold">{s.currentLocation.speed}</p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-muted-foreground">Heading</p>
                  <p className="font-semibold">{s.currentLocation.heading}</p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-muted-foreground">Last Update</p>
                  <p className="font-semibold">
                    {new Date(s.currentLocation.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tracking Events Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Tracking Events
              </CardTitle>
              <CardDescription>Complete shipment journey timeline</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {s.events.map((event, idx) => (
                  <div key={event.id} className="relative">
                    {/* Connector Line */}
                    {idx < s.events.length - 1 && (
                      <div
                        className={`absolute left-3 top-8 w-0.5 h-full ${
                          event.completed ? 'bg-green-300' : 'bg-gray-200'
                        }`}
                      />
                    )}
                    
                    <div
                      className={`rounded-lg border p-4 cursor-pointer transition-colors ${
                        event.current
                          ? 'bg-blue-50 border-blue-200'
                          : event.completed
                          ? 'bg-green-50 border-green-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                      onClick={() => toggleEvent(event.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {event.current ? (
                            <div className="relative">
                              <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
                              <div className="absolute inset-0 animate-ping">
                                <Circle className="h-6 w-6 text-blue-300" />
                              </div>
                            </div>
                          ) : event.completed ? (
                            <CheckCircle2 className="h-6 w-6 text-green-500" />
                          ) : (
                            <Circle className="h-6 w-6 text-gray-300" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold flex items-center gap-2">
                              {event.title}
                              {event.current && (
                                <Badge variant="info" className="text-xs">Current</Badge>
                              )}
                            </h4>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {event.timestamp
                                  ? new Date(event.timestamp).toLocaleString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })
                                  : event.expectedDate
                                  ? `Expected: ${new Date(event.expectedDate).toLocaleDateString()}`
                                  : 'Pending'}
                              </span>
                              {expandedEvents.includes(event.id) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </div>
                          </div>
                          
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" />
                            {event.location}
                          </p>
                          
                          {expandedEvents.includes(event.id) && (
                            <div className="mt-3 pt-3 border-t space-y-2">
                              <p className="text-sm">{event.description}</p>
                              
                              {event.details && (
                                <div className="grid gap-2 sm:grid-cols-2 mt-2">
                                  {Object.entries(event.details).map(([key, value]) => (
                                    <div key={key} className="text-sm">
                                      <span className="text-muted-foreground capitalize">
                                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                                      </span>{' '}
                                      <span className="font-medium">{value}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              {event.coordinates && (
                                <p className="text-xs text-muted-foreground">
                                  📍 {event.coordinates.lat.toFixed(4)}°N, {event.coordinates.lng.toFixed(4)}°E
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Shipment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Shipment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipment ID</span>
                  <span className="font-mono">{s.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tracking #</span>
                  <span className="font-mono">{s.trackingNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order</span>
                  <Link href={`/transactions/${s.orderId}`}>
                    <span className="font-mono text-primary hover:underline">{s.orderId}</span>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Carrier Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                {getCarrierIcon(s.carrier.type)}
                Carrier
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="font-semibold">{s.carrier.name}</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{s.carrier.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{s.carrier.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a href={s.carrier.website} className="text-primary hover:underline">
                    {s.carrier.website.replace('https://', '')}
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Service Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service Type</span>
                <span>{s.service.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Container #</span>
                <span className="font-mono">{s.service.containerNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vessel</span>
                <span>{s.service.vesselName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Voyage #</span>
                <span className="font-mono">{s.service.voyageNumber}</span>
              </div>
            </CardContent>
          </Card>

          {/* Package Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Box className="h-4 w-4" />
                Package Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Weight className="h-3 w-3" /> Weight
                </span>
                <span>{s.package.weight}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Ruler className="h-3 w-3" /> Dimensions
                </span>
                <span>{s.package.dimensions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pieces</span>
                <span>{s.package.pieces}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <FileSignature className="h-3 w-3" /> Signature
                </span>
                <Badge variant={s.package.signatureRequired ? 'warning' : 'secondary'}>
                  {s.package.signatureRequired ? 'Required' : 'Not Required'}
                </Badge>
              </div>
              <div className="pt-2 border-t">
                <p className="text-muted-foreground">Description</p>
                <p className="font-medium">{s.package.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Supplier Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Supplier</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-semibold">{s.supplier.companyName}</p>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{s.supplier.location}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{s.supplier.email}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{s.supplier.phone}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
