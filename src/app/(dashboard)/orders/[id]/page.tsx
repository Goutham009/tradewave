'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft,
  Package,
  Building2,
  Calendar,
  Clock,
  DollarSign,
  Truck,
  FileText,
  MessageSquare,
  Download,
  Printer,
  ExternalLink,
  CheckCircle2,
  Circle,
  Loader2,
  Shield,
  CreditCard,
  MapPin,
  Star,
  Phone,
  Mail,
  Globe,
  AlertTriangle,
  Eye,
  Share2,
  Upload,
  Link as LinkIcon,
  ChevronDown,
  ChevronRight,
  Ship,
  Box,
  Weight,
  FileCheck,
  Hash,
} from 'lucide-react';

// Mock order detail data - comprehensive
const orderDetail = {
  id: 'TXN-2024-001',
  orderNumber: 'ORD-2024-001',
  status: 'IN_TRANSIT',
  progress: 65,
  createdAt: '2024-01-15T14:30:00Z',
  updatedAt: '2024-01-25T10:15:00Z',

  requirement: {
    id: 'REQ-2024-001',
    title: 'Steel Components for Manufacturing',
    category: 'Raw Materials',
    quantity: 5000,
    unit: 'kg',
    description: 'High-quality stainless steel sheets for manufacturing automotive components. Must meet ISO standards.',
    specifications: {
      'Grade': '304 Stainless Steel',
      'Thickness': '2mm - 5mm',
      'Width': '1000mm - 1500mm',
      'Finish': 'Mill Finish / 2B',
      'Certification': 'Mill Test Certificate required',
    },
    deliveryLocation: 'Mumbai, Maharashtra, India',
    deadline: '2024-02-01',
  },

  quotation: {
    id: 'QUO-2024-001',
    unitPrice: 4.5,
    quantity: 5000,
    acceptedAt: '2024-01-15T14:00:00Z',
  },

  supplier: {
    id: 'SUP-001',
    name: 'Shanghai Steel Co.',
    companyName: 'Shanghai Steel Manufacturing Co. Ltd',
    logo: null,
    rating: 4.8,
    reviewCount: 156,
    verified: true,
    location: 'Shanghai, China',
    email: 'sales@shanghaisteel.com',
    phone: '+86 21 1234 5678',
    website: 'www.shanghaisteel.com',
    responseRate: 98,
    onTimeDelivery: 95,
  },

  buyer: {
    name: 'Demo User',
    company: 'Demo Company Ltd',
    email: 'demo@tradewave.io',
    phone: '+91 98765 43210',
  },

  payment: {
    method: 'Wire Transfer',
    status: 'COMPLETED',
    paidAt: '2024-01-15T15:00:00Z',
    transactionId: 'PAY-2024-001-WIRE',
    breakdown: {
      unitPrice: 4.5,
      quantity: 5000,
      subtotal: 22500,
      shipping: 1200,
      insurance: 225,
      platformFee: 450,
      taxes: 0,
      total: 24375,
    },
    currency: 'USD',
    invoiceUrl: '/invoices/INV-2024-001.pdf',
  },

  escrow: {
    id: 'ESC-2024-001',
    status: 'HELD',
    amount: 24375,
    currency: 'USD',
    heldAt: '2024-01-15T15:05:00Z',
    autoReleaseDate: '2024-02-15',
    conditions: [
      { id: '1', type: 'DELIVERY_CONFIRMED', description: 'Delivery confirmed by buyer', satisfied: false, satisfiedAt: null },
      { id: '2', type: 'QUALITY_APPROVED', description: 'Quality approved by buyer', satisfied: false, satisfiedAt: null },
      { id: '3', type: 'DOCUMENTS_VERIFIED', description: 'All documents verified', satisfied: true, satisfiedAt: '2024-01-20T09:00:00Z' },
    ],
  },

  shipment: {
    id: 'SHP-2024-001',
    trackingNumber: 'MAEU1234567',
    carrier: {
      name: 'Maersk Line',
      type: 'sea',
      phone: '+1 800 123 4567',
      trackingUrl: 'https://www.maersk.com/tracking/MAEU1234567',
    },
    status: 'IN_TRANSIT',
    origin: 'Shanghai, China',
    destination: 'Mumbai, India',
    currentLocation: {
      address: 'Singapore Strait (Transit)',
      coordinates: { lat: 1.2644, lng: 103.8225 },
      timestamp: '2024-01-25T08:30:00Z',
    },
    estimatedDelivery: '2024-01-29',
    shippedAt: '2024-01-22T10:00:00Z',
    vessel: 'MSC Gulsun',
    containerNumber: 'MSKU1234567',
  },

  documents: {
    buyer: [
      { id: 'DOC-B1', name: 'Purchase Order', type: 'PDF', size: '245 KB', uploadedAt: '2024-01-15T14:35:00Z', url: '/docs/po.pdf' },
      { id: 'DOC-B2', name: 'Delivery Instructions', type: 'PDF', size: '128 KB', uploadedAt: '2024-01-15T14:40:00Z', url: '/docs/delivery.pdf' },
    ],
    supplier: [
      { id: 'DOC-S1', name: 'Commercial Invoice', type: 'PDF', size: '312 KB', uploadedAt: '2024-01-17T10:00:00Z', url: '/docs/invoice.pdf', verified: true, hash: '0x1a2b3c4d...5e6f7g8h' },
      { id: 'DOC-S2', name: 'Certificate of Origin', type: 'PDF', size: '189 KB', uploadedAt: '2024-01-17T10:30:00Z', url: '/docs/coo.pdf', verified: true, hash: '0x9i8j7k6l...5m4n3o2p' },
      { id: 'DOC-S3', name: 'Quality Certificate', type: 'PDF', size: '456 KB', uploadedAt: '2024-01-20T14:00:00Z', url: '/docs/quality.pdf', verified: true, hash: '0xq1r2s3t4...u5v6w7x8' },
      { id: 'DOC-S4', name: 'Packing List', type: 'PDF', size: '167 KB', uploadedAt: '2024-01-22T08:00:00Z', url: '/docs/packing.pdf', verified: true, hash: '0xy9z0a1b2...c3d4e5f6' },
      { id: 'DOC-S5', name: 'Bill of Lading', type: 'PDF', size: '534 KB', uploadedAt: '2024-01-22T10:00:00Z', url: '/docs/bol.pdf', verified: true, hash: '0xg7h8i9j0...k1l2m3n4' },
    ],
  },

  timeline: [
    { step: 1, title: 'Order Placed', status: 'completed', timestamp: '2024-01-15T14:30:00Z', description: 'Quotation accepted, order created' },
    { step: 2, title: 'Payment Confirmed', status: 'completed', timestamp: '2024-01-15T15:00:00Z', description: 'Payment of $24,375 received' },
    { step: 3, title: 'Escrow Created', status: 'completed', timestamp: '2024-01-15T15:05:00Z', description: 'Funds secured in escrow' },
    { step: 4, title: 'Production Started', status: 'completed', timestamp: '2024-01-17T09:00:00Z', description: 'Supplier started production' },
    { step: 5, title: 'Quality Check', status: 'completed', timestamp: '2024-01-20T14:00:00Z', description: 'Quality inspection passed' },
    { step: 6, title: 'Shipped', status: 'completed', timestamp: '2024-01-22T10:00:00Z', description: 'Cargo loaded onto vessel' },
    { step: 7, title: 'In Transit', status: 'in_progress', timestamp: '2024-01-25T08:30:00Z', description: 'Currently at Singapore Strait' },
    { step: 8, title: 'Delivered', status: 'pending', timestamp: null, description: 'Awaiting delivery' },
    { step: 9, title: 'Completed', status: 'pending', timestamp: null, description: 'Order completion' },
  ],
};

type OrderDetail = typeof orderDetail;
type TimelineItem = OrderDetail['timeline'][number];
type EscrowCondition = OrderDetail['escrow']['conditions'][number];
type BuyerDocument = OrderDetail['documents']['buyer'][number];
type SupplierDocument = OrderDetail['documents']['supplier'][number];

const ORDER_OVERRIDES: Record<string, any> = {
  'TXN-2024-001': {
    orderNumber: 'PO-2024-001',
    status: 'IN_TRANSIT',
    progress: 65,
  },
  'TXN-2024-002': {
    orderNumber: 'PO-2024-002',
    status: 'PRODUCTION',
    progress: 35,
    createdAt: '2024-01-14T10:20:00Z',
    requirement: {
      id: 'REQ-2024-002',
      title: 'Electronic Circuit Boards',
      category: 'Electronics',
      quantity: 500,
      unit: 'units',
      description: 'Industrial-grade PCBs for harsh manufacturing environments.',
      deliveryLocation: 'Bangalore, India',
      deadline: '2024-02-04',
    },
    quotation: {
      id: 'QUO-2024-003',
      unitPrice: 25,
      quantity: 500,
    },
    supplier: {
      id: 'SUP-002',
      name: 'Shenzhen Electronics',
      companyName: 'Shenzhen Electronics Manufacturing Ltd',
      location: 'Shenzhen, China',
      email: 'sales@sz-electronics.com',
      phone: '+86 755 8899 0022',
      rating: 4.7,
      onTimeDelivery: 93,
    },
    payment: {
      status: 'COMPLETED',
      method: 'Credit Card',
      transactionId: 'PAY-2024-002-CARD',
      breakdown: {
        unitPrice: 25,
        quantity: 500,
        subtotal: 12500,
        shipping: 0,
        insurance: 0,
        platformFee: 0,
        taxes: 0,
        total: 12500,
      },
    },
    shipment: {
      id: 'SHP-2024-002',
      trackingNumber: 'DHL9876543210',
      carrier: {
        name: 'DHL Express',
        type: 'air',
        trackingUrl: 'https://www.dhl.com/global-en/home/tracking.html?tracking-id=DHL9876543210',
      },
      status: 'OUT_FOR_DELIVERY',
      origin: 'Shenzhen, China',
      destination: 'Delhi, India',
      currentLocation: {
        address: 'Delhi Distribution Center',
        timestamp: '2024-01-25T06:00:00Z',
      },
      estimatedDelivery: '2024-01-25',
      shippedAt: '2024-01-22T10:00:00Z',
      vessel: 'Air Cargo',
      containerNumber: 'AIR-DEL-2202',
    },
  },
  'TXN-2024-003': {
    orderNumber: 'PO-2024-003',
    status: 'COMPLETED',
    progress: 100,
    createdAt: '2024-01-05T11:40:00Z',
    requirement: {
      id: 'REQ-2024-003',
      title: 'Textile Fabric Rolls',
      category: 'Textiles',
      quantity: 2000,
      unit: 'meters',
      description: 'Cotton blend rolls with export-grade finishing.',
      deliveryLocation: 'Chennai, India',
      deadline: '2024-01-20',
    },
    quotation: {
      id: 'QUO-2024-010',
      unitPrice: 5.5,
      quantity: 2000,
    },
    supplier: {
      id: 'SUP-003',
      name: 'Mumbai Textiles Ltd',
      companyName: 'Mumbai Textiles Export House',
      location: 'Mumbai, India',
      email: 'exports@mumbai-textiles.com',
      phone: '+91 22 4000 7788',
      rating: 4.4,
      onTimeDelivery: 96,
    },
    payment: {
      status: 'COMPLETED',
      method: 'Bank Transfer',
      transactionId: 'PAY-2024-003-WIRE',
      breakdown: {
        unitPrice: 5.5,
        quantity: 2000,
        subtotal: 11000,
        shipping: 0,
        insurance: 0,
        platformFee: 0,
        taxes: 0,
        total: 11000,
      },
    },
    shipment: {
      id: 'SHP-2024-003',
      trackingNumber: 'FEDEX1122334455',
      carrier: {
        name: 'FedEx',
        type: 'ground',
        trackingUrl: 'https://www.fedex.com/fedextrack/?tracknumbers=FEDEX1122334455',
      },
      status: 'DELIVERED',
      origin: 'Mumbai, India',
      destination: 'Chennai, India',
      currentLocation: {
        address: 'Delivered - Chennai, India',
        timestamp: '2024-01-19T14:30:00Z',
      },
      estimatedDelivery: '2024-01-20',
      shippedAt: '2024-01-17T08:00:00Z',
      vessel: 'Ground Freight',
      containerNumber: 'FDX-CHE-778',
    },
  },
  'TXN-2024-004': {
    orderNumber: 'PO-2024-004',
    status: 'PENDING',
    progress: 10,
    createdAt: '2024-01-20T09:00:00Z',
    requirement: {
      id: 'REQ-2024-004',
      title: 'Chemical Raw Materials',
      category: 'Chemicals',
      quantity: 1000,
      unit: 'liters',
      description: 'Industrial-grade chemical additives for polymer production.',
      deliveryLocation: 'Kolkata, India',
      deadline: '2024-02-10',
    },
    quotation: {
      id: 'QUO-2024-011',
      unitPrice: 15,
      quantity: 1000,
    },
    supplier: {
      id: 'SUP-004',
      name: 'Global Chemicals Co.',
      companyName: 'Global Chemicals Company Pvt Ltd',
      location: 'Singapore',
      email: 'sales@globalchemicals.com',
      phone: '+65 7000 0044',
      rating: 4.3,
      onTimeDelivery: 90,
    },
    payment: {
      status: 'PENDING',
      method: 'Bank Transfer',
      transactionId: 'PAY-2024-004-PENDING',
      breakdown: {
        unitPrice: 15,
        quantity: 1000,
        subtotal: 15000,
        shipping: 0,
        insurance: 0,
        platformFee: 0,
        taxes: 0,
        total: 15000,
      },
    },
    shipment: {
      id: 'SHP-2024-004',
      trackingNumber: 'UPS7788990011',
      carrier: {
        name: 'UPS',
        type: 'sea',
        trackingUrl: 'https://www.ups.com/track?tracknum=UPS7788990011',
      },
      status: 'EXCEPTION',
      origin: 'Singapore',
      destination: 'Kolkata, India',
      currentLocation: {
        address: 'Singapore Customs',
        timestamp: '2024-01-23T16:00:00Z',
      },
      estimatedDelivery: '2024-02-05',
      shippedAt: '2024-01-21T08:00:00Z',
      vessel: 'Ocean Cargo',
      containerNumber: 'UPS-SEA-041',
    },
  },
  'TXN-S-001': {
    orderNumber: 'SO-2026-001',
    status: 'PRODUCTION',
    progress: 40,
    requirement: {
      id: 'REQ-S-001',
      title: 'Industrial Steel Pipes - Grade 304',
      category: 'Industrial Materials',
      quantity: 500,
      unit: 'MT',
      deliveryLocation: 'Rotterdam, Netherlands',
      deadline: '2026-05-15',
    },
    payment: {
      status: 'PROCESSING',
      method: 'Bank Transfer',
      transactionId: 'PAY-S-001-PROCESSING',
      breakdown: {
        unitPrice: 1150,
        quantity: 500,
        subtotal: 575000,
        shipping: 0,
        insurance: 0,
        platformFee: 0,
        taxes: 0,
        total: 575000,
      },
    },
  },
  'TXN-S-002': {
    orderNumber: 'SO-2026-002',
    status: 'CONFIRMED',
    progress: 15,
    requirement: {
      id: 'REQ-S-002',
      title: 'Copper Wire - Industrial Grade',
      category: 'Metals & Alloys',
      quantity: 200,
      unit: 'MT',
      deliveryLocation: 'Amsterdam, Netherlands',
      deadline: '2026-06-01',
    },
    payment: {
      status: 'PROCESSING',
      method: 'Bank Transfer',
      transactionId: 'PAY-S-002-PROCESSING',
      breakdown: {
        unitPrice: 8800,
        quantity: 200,
        subtotal: 1760000,
        shipping: 0,
        insurance: 0,
        platformFee: 0,
        taxes: 0,
        total: 1760000,
      },
    },
  },
  'TXN-S-003': {
    orderNumber: 'SO-2026-003',
    status: 'COMPLETED',
    progress: 100,
    requirement: {
      id: 'REQ-S-003',
      title: 'Aluminum Sheets - 5mm',
      category: 'Metals & Alloys',
      quantity: 150,
      unit: 'MT',
      deliveryLocation: 'Rotterdam, Netherlands',
      deadline: '2026-03-30',
    },
    payment: {
      status: 'COMPLETED',
      method: 'Bank Transfer',
      transactionId: 'PAY-S-003-DONE',
      breakdown: {
        unitPrice: 2400,
        quantity: 150,
        subtotal: 360000,
        shipping: 0,
        insurance: 0,
        platformFee: 0,
        taxes: 0,
        total: 360000,
      },
    },
    shipment: {
      id: 'SHP-S-003',
      trackingNumber: 'DHL5555002',
      carrier: {
        name: 'DHL',
        type: 'air',
        trackingUrl: 'https://www.dhl.com/global-en/home/tracking.html?tracking-id=DHL5555002',
      },
      status: 'DELIVERED',
      origin: 'Mumbai, India',
      destination: 'Amsterdam, Netherlands',
      currentLocation: {
        address: 'Delivered - Amsterdam, Netherlands',
        timestamp: '2026-02-28T12:00:00Z',
      },
      estimatedDelivery: '2026-02-28',
      shippedAt: '2026-02-21T09:00:00Z',
      vessel: 'Air Cargo',
      containerNumber: 'DHL-AIR-003',
    },
  },
};

function getOrderById(orderId: string): OrderDetail {
  const override = ORDER_OVERRIDES[orderId];
  if (!override) {
    return orderDetail;
  }

  return {
    ...orderDetail,
    ...override,
    id: orderId,
    requirement: {
      ...orderDetail.requirement,
      ...(override.requirement || {}),
    },
    quotation: {
      ...orderDetail.quotation,
      ...(override.quotation || {}),
    },
    supplier: {
      ...orderDetail.supplier,
      ...(override.supplier || {}),
    },
    payment: {
      ...orderDetail.payment,
      ...(override.payment || {}),
      breakdown: {
        ...orderDetail.payment.breakdown,
        ...((override.payment && override.payment.breakdown) || {}),
      },
    },
    escrow: {
      ...orderDetail.escrow,
      ...(override.escrow || {}),
      conditions: (override.escrow && override.escrow.conditions) || orderDetail.escrow.conditions,
    },
    shipment: {
      ...orderDetail.shipment,
      ...(override.shipment || {}),
      carrier: {
        ...orderDetail.shipment.carrier,
        ...((override.shipment && override.shipment.carrier) || {}),
      },
      currentLocation: {
        ...orderDetail.shipment.currentLocation,
        ...((override.shipment && override.shipment.currentLocation) || {}),
      },
    },
    timeline: override.timeline || orderDetail.timeline,
  } as OrderDetail;
}

const tabs = [
  { id: 'overview', label: 'Overview', icon: Package },
  { id: 'payment', label: 'Payment Details', icon: CreditCard },
  { id: 'shipment', label: 'Shipment Tracking', icon: Truck },
  { id: 'documents', label: 'Documents', icon: FileText },
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

const getEscrowBadge = (status: string) => {
  const config: Record<string, { variant: any; label: string }> = {
    PENDING: { variant: 'secondary', label: 'Pending' },
    HELD: { variant: 'warning', label: 'Funds Held' },
    RELEASING: { variant: 'info', label: 'Releasing' },
    RELEASED: { variant: 'success', label: 'Released' },
  };
  const item = config[status] || { variant: 'secondary', label: status };
  return <Badge variant={item.variant}>{item.label}</Badge>;
};

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedTimeline, setExpandedTimeline] = useState(true);

  const order = getOrderById(orderId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <Link href="/orders">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold">{order.orderNumber}</h1>
              {getStatusBadge(order.status)}
              {getEscrowBadge(order.escrow.status)}
            </div>
            <p className="text-muted-foreground mt-1">{order.requirement.title}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Created: {new Date(order.createdAt).toLocaleDateString('en-US', { 
                month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' 
              })}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Progress Timeline - Horizontal */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between overflow-x-auto pb-2">
            {order.timeline.slice(0, 5).map((step: TimelineItem, idx: number) => (
              <div key={step.step} className="flex items-center flex-1 min-w-[100px]">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                      step.status === 'completed'
                        ? 'bg-green-500 text-white'
                        : step.status === 'in_progress'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step.status === 'completed' ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : step.status === 'in_progress' ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      step.step
                    )}
                  </div>
                  <p className="text-xs mt-1 text-center font-medium">{step.title}</p>
                </div>
                {idx < 4 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      step.status === 'completed' ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <div className="border-b">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              {/* Order Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-lg border p-3">
                      <p className="text-sm text-muted-foreground">Order ID</p>
                      <p className="font-mono font-medium">{order.id}</p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-sm text-muted-foreground">Status</p>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                      <p className="text-xl font-bold">${order.payment.breakdown.total.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Requirement Details */}
                  <div>
                    <h4 className="font-medium mb-3">Requirement Details</h4>
                    <div className="rounded-lg border p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{order.requirement.title}</p>
                          <p className="text-sm text-muted-foreground">{order.requirement.category}</p>
                        </div>
                        <Badge variant="outline">{order.requirement.quantity.toLocaleString()} {order.requirement.unit}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{order.requirement.description}</p>
                      
                      <div className="grid gap-2 sm:grid-cols-2 pt-2 border-t">
                        {Object.entries(order.requirement.specifications).map(([key, value]: [string, unknown]) => (
                          <div key={key} className="text-sm">
                            <span className="text-muted-foreground">{key}:</span>{' '}
                            <span className="font-medium">{String(value)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center gap-4 pt-2 border-t text-sm">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          {order.requirement.deliveryLocation}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          Deadline: {new Date(order.requirement.deadline).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Supplier Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Supplier Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10">
                      <Building2 className="h-8 w-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{order.supplier.companyName}</h3>
                        {order.supplier.verified && (
                          <Badge variant="success" className="text-xs">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{order.supplier.rating}</span>
                        <span className="text-sm text-muted-foreground">({order.supplier.reviewCount} reviews)</span>
                      </div>
                      <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {order.supplier.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {order.supplier.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {order.supplier.phone}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{order.supplier.responseRate}%</p>
                      <p className="text-xs text-muted-foreground">Response Rate</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{order.supplier.onTimeDelivery}%</p>
                      <p className="text-xs text-muted-foreground">On-Time Delivery</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Timeline */}
              <Card>
                <CardHeader className="cursor-pointer" onClick={() => setExpandedTimeline(!expandedTimeline)}>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Order Timeline
                    </span>
                    {expandedTimeline ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                  </CardTitle>
                </CardHeader>
                {expandedTimeline && (
                  <CardContent>
                    <div className="space-y-4">
                      {order.timeline.map((step: TimelineItem, idx: number) => (
                        <div key={step.step} className="relative">
                          {idx < order.timeline.length - 1 && (
                            <div
                              className={`absolute left-3 top-8 w-0.5 h-full ${
                                step.status === 'completed' ? 'bg-green-300' : 'bg-gray-200'
                              }`}
                            />
                          )}
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              {step.status === 'completed' ? (
                                <CheckCircle2 className="h-6 w-6 text-green-500" />
                              ) : step.status === 'in_progress' ? (
                                <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
                              ) : (
                                <Circle className="h-6 w-6 text-gray-300" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p className="font-medium">{step.title}</p>
                                {step.timestamp && (
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(step.timestamp).toLocaleString('en-US', {
                                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                    })}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{step.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            </>
          )}

          {/* Payment Tab */}
          {activeTab === 'payment' && (
            <>
              {/* Payment Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className={`flex items-center justify-between p-4 rounded-lg ${
                    order.payment.status === 'COMPLETED' ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
                  }`}>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className={`h-6 w-6 ${order.payment.status === 'COMPLETED' ? 'text-green-600' : 'text-yellow-600'}`} />
                      <div>
                        <p className="font-medium">Payment {order.payment.status === 'COMPLETED' ? 'Completed' : 'Pending'}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.payment.paidAt && new Date(order.payment.paidAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">${order.payment.breakdown.total.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">{order.payment.currency}</p>
                    </div>
                  </div>

                  {/* Breakdown */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Unit Price × {order.payment.breakdown.quantity.toLocaleString()}
                      </span>
                      <span>${order.payment.breakdown.unitPrice}/unit</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${order.payment.breakdown.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>${order.payment.breakdown.shipping.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Insurance</span>
                      <span>${order.payment.breakdown.insurance.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Platform Fee</span>
                      <span>${order.payment.breakdown.platformFee.toLocaleString()}</span>
                    </div>
                    {order.payment.breakdown.taxes > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Taxes</span>
                        <span>${order.payment.breakdown.taxes.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-3 border-t text-lg font-bold">
                      <span>Total</span>
                      <span>${order.payment.breakdown.total.toLocaleString()} {order.payment.currency}</span>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="grid gap-3 sm:grid-cols-2 pt-4 border-t">
                    <div className="rounded-lg border p-3">
                      <p className="text-sm text-muted-foreground">Payment Method</p>
                      <p className="font-medium">{order.payment.method}</p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-sm text-muted-foreground">Transaction ID</p>
                      <p className="font-mono text-sm">{order.payment.transactionId}</p>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Download Invoice
                  </Button>
                </CardContent>
              </Card>

              {/* Escrow Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Escrow Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-3">
                      <Shield className="h-6 w-6 text-yellow-600" />
                      <div>
                        <p className="font-medium text-yellow-800">Funds Held in Escrow</p>
                        <p className="text-sm text-yellow-600">ID: {order.escrow.id}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">${order.escrow.amount.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">{order.escrow.currency}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Release Conditions</h4>
                    <div className="space-y-3">
                      {order.escrow.conditions.map((condition: EscrowCondition) => (
                        <div
                          key={condition.id}
                          className={`flex items-center justify-between rounded-lg border p-3 ${
                            condition.satisfied ? 'bg-green-50 border-green-200' : 'bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {condition.satisfied ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            ) : (
                              <Circle className="h-5 w-5 text-gray-400" />
                            )}
                            <span className={condition.satisfied ? 'text-green-800' : ''}>
                              {condition.description}
                            </span>
                          </div>
                          {condition.satisfiedAt && (
                            <span className="text-xs text-muted-foreground">
                              {new Date(condition.satisfiedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <strong>Auto-Release Date:</strong> {new Date(order.escrow.autoReleaseDate).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Funds will be automatically released if no issues are reported by this date.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Shipment Tab */}
          {activeTab === 'shipment' && (
            <>
              {/* Shipment Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Shipment Tracking
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Current Status */}
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3">
                      <Ship className="h-6 w-6 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-800">In Transit</p>
                        <p className="text-sm text-blue-600">{order.shipment.currentLocation.address}</p>
                      </div>
                    </div>
                    <a href={order.shipment.carrier.trackingUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Track on {order.shipment.carrier.name}
                      </Button>
                    </a>
                  </div>

                  {/* Map Placeholder */}
                  <div className="aspect-video bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg flex items-center justify-center relative overflow-hidden">
                    <div className="text-center z-10">
                      <div className="flex items-center justify-center gap-8 mb-4">
                        <div className="text-center">
                          <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-1"></div>
                          <p className="text-xs font-medium">{order.shipment.origin}</p>
                        </div>
                        <div className="w-32 border-t-2 border-dashed border-blue-400 relative">
                          <div className="absolute left-1/2 -translate-x-1/2 -top-2 bg-blue-500 rounded-full p-1">
                            <Ship className="h-3 w-3 text-white" />
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="w-4 h-4 bg-red-500 rounded-full mx-auto mb-1"></div>
                          <p className="text-xs font-medium">{order.shipment.destination}</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Map integration available with Google Maps or Mapbox API
                      </p>
                    </div>
                  </div>

                  {/* Shipment Details */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-lg border p-3">
                      <p className="text-sm text-muted-foreground">Tracking Number</p>
                      <p className="font-mono font-medium">{order.shipment.trackingNumber}</p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-sm text-muted-foreground">Carrier</p>
                      <p className="font-medium">{order.shipment.carrier.name}</p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-sm text-muted-foreground">Vessel</p>
                      <p className="font-medium">{order.shipment.vessel}</p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-sm text-muted-foreground">Container</p>
                      <p className="font-mono font-medium">{order.shipment.containerNumber}</p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-sm text-muted-foreground">Shipped Date</p>
                      <p className="font-medium">{new Date(order.shipment.shippedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-sm text-muted-foreground">Est. Delivery</p>
                      <p className="font-medium">{new Date(order.shipment.estimatedDelivery).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <Link href={`/shipments/${order.shipment.id}`}>
                    <Button variant="gradient" className="w-full">
                      <Truck className="mr-2 h-4 w-4" />
                      Open Full Tracking Page
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <>
              {/* Buyer Documents */}
              <Card>
                <CardHeader>
                  <CardTitle>Buyer Uploaded Documents</CardTitle>
                  <CardDescription>Documents you provided for this order</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {order.documents.buyer.map((doc: BuyerDocument) => (
                      <div key={doc.id} className="flex items-center justify-between rounded-lg border p-4">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {doc.type} • {doc.size} • {new Date(doc.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Supplier Documents */}
              <Card>
                <CardHeader>
                  <CardTitle>Supplier Documents</CardTitle>
                  <CardDescription>Documents provided by the supplier</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {order.documents.supplier.map((doc: SupplierDocument) => (
                      <div key={doc.id} className="flex items-center justify-between rounded-lg border p-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            {doc.verified && (
                              <CheckCircle2 className="h-3 w-3 text-green-500 absolute -top-1 -right-1" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{doc.name}</p>
                              {doc.verified && (
                                <Badge variant="success" className="text-xs">
                                  <LinkIcon className="mr-1 h-3 w-3" />
                                  On-Chain Verified
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {doc.type} • {doc.size} • {new Date(doc.uploadedAt).toLocaleDateString()}
                            </p>
                            {doc.hash && (
                              <p className="text-xs font-mono text-muted-foreground mt-1">
                                Hash: {doc.hash}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* On-Chain Verification Summary */}
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <FileCheck className="h-6 w-6 text-green-600" />
                    <div>
                      <h4 className="font-semibold text-green-800">Blockchain Verification</h4>
                      <p className="text-sm text-green-700 mt-1">
                        {order.documents.supplier.filter((d: SupplierDocument) => d.verified).length} of {order.documents.supplier.length} documents 
                        have been verified on the blockchain for authenticity and integrity.
                      </p>
                      <Link href="/blockchain">
                        <Button variant="link" className="text-green-700 p-0 h-auto mt-2">
                          View Blockchain Records →
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href={`/shipments/${order.shipment.id}`} className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Truck className="mr-2 h-4 w-4" />
                  Track Shipment
                </Button>
              </Link>
              <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('payment')}>
                <CreditCard className="mr-2 h-4 w-4" />
                View Payment Status
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Download className="mr-2 h-4 w-4" />
                Download Invoice
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="mr-2 h-4 w-4" />
                Message Supplier
              </Button>
              <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Report Issue
              </Button>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order ID</span>
                <span className="font-mono">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                {getStatusBadge(order.status)}
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="text-muted-foreground">Total Amount</span>
                <span className="font-bold">${order.payment.breakdown.total.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Supplier Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Supplier</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{order.supplier.companyName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{order.supplier.rating} ({order.supplier.reviewCount} reviews)</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{order.supplier.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">{order.supplier.email}</span>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Delivery</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Est. Delivery</span>
                <span className="font-medium">{new Date(order.shipment.estimatedDelivery).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Destination</span>
                <span>{order.shipment.destination}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Location</span>
                <span className="text-right">{order.shipment.currentLocation.address}</span>
              </div>
              <Progress value={order.progress} className="h-2 mt-2" />
              <p className="text-xs text-muted-foreground text-center">{order.progress}% complete</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
