'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  DollarSign,
  Edit,
  MessageSquare,
  Clock,
  CheckCircle2,
  Star,
  Building2,
  Shield,
  Send,
  Package,
} from 'lucide-react';

type QuotationSummary = {
  id: string;
  supplier: string;
  rating: number;
  unitPrice: number;
  total: number;
  leadTime: string;
  status: string;
};

type RequirementDetail = {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  status: string;
  priority: string;
  quantity: number;
  unit: string;
  targetPrice: number;
  currency: string;
  deliveryLocation: string;
  deliveryDeadline: string;
  paymentTerms: string;
  createdAt: string;
  specifications: Record<string, string>;
  quotations: QuotationSummary[];
};

type SupplierRequirementCardDetail = {
  cardId: string;
  requirementId: string;
  title: string;
  category: string;
  description: string;
  status: string;
  quantity: number;
  unit: string;
  targetPrice: number;
  currency: string;
  deliveryLocation: string;
  deliveryDeadline: string;
  paymentTerms: string;
  incoterms: string;
  certifications: string[];
  matchScore: number;
  daysLeft: number;
  isDirect: boolean;
  quotationId?: string;
};

const BUYER_REQUIREMENTS: Record<string, RequirementDetail> = {
  'REQ-2024-001': {
    id: 'REQ-2024-001',
    title: 'Steel Components for Manufacturing',
    description:
      'High-quality stainless steel components required for our manufacturing line. Must meet ISO 9001 standards and come with material certificates.',
    category: 'Raw Materials',
    subcategory: 'Stainless Steel',
    status: 'SOURCING',
    priority: 'HIGH',
    quantity: 5000,
    unit: 'kg',
    targetPrice: 4.8,
    currency: 'USD',
    deliveryLocation: 'Mumbai, India',
    deliveryDeadline: '2026-03-15',
    paymentTerms: '30% Advance, 70% on Delivery',
    createdAt: '2026-02-01',
    specifications: {
      grade: '304 Stainless Steel',
      thickness: '2-5 mm',
      finish: 'Mill Finish',
      certification: 'ISO 9001, Material Test Certificate',
    },
    quotations: [
      {
        id: 'QUO-2024-001',
        supplier: 'Shanghai Steel Co.',
        rating: 4.8,
        unitPrice: 4.5,
        total: 22500,
        leadTime: '14 days',
        status: 'SHORTLISTED',
      },
      {
        id: 'QUO-2024-002',
        supplier: 'Mumbai Metals Ltd',
        rating: 4.5,
        unitPrice: 4.8,
        total: 24000,
        leadTime: '10 days',
        status: 'PENDING',
      },
    ],
  },
  'REQ-2024-002': {
    id: 'REQ-2024-002',
    title: 'Electronic Circuit Boards',
    description:
      'Need multi-layer industrial PCBs for high-temperature environments with RoHS compliance.',
    category: 'Electronics',
    subcategory: 'Industrial PCB',
    status: 'QUOTATIONS_READY',
    priority: 'MEDIUM',
    quantity: 1000,
    unit: 'pcs',
    targetPrice: 13,
    currency: 'USD',
    deliveryLocation: 'Bangalore, India',
    deliveryDeadline: '2026-04-02',
    paymentTerms: '50% Advance, 50% on Delivery',
    createdAt: '2026-01-28',
    specifications: {
      layers: '6 Layers',
      material: 'FR4',
      finish: 'ENIG',
      testing: '100% AOI + Flying Probe',
    },
    quotations: [
      {
        id: 'QUO-2024-003',
        supplier: 'Shenzhen Electronics',
        rating: 4.9,
        unitPrice: 12.5,
        total: 12500,
        leadTime: '21 days',
        status: 'PENDING',
      },
      {
        id: 'QUO-2024-004',
        supplier: 'Taiwan Tech Corp',
        rating: 4.6,
        unitPrice: 14,
        total: 14000,
        leadTime: '18 days',
        status: 'PENDING',
      },
    ],
  },
  'REQ-2024-003': {
    id: 'REQ-2024-003',
    title: 'Industrial Packaging Materials',
    description: 'Corrugated export-safe packaging with moisture protection and custom branding.',
    category: 'Packaging',
    subcategory: 'Corrugated Boxes',
    status: 'DRAFT',
    priority: 'LOW',
    quantity: 10000,
    unit: 'units',
    targetPrice: 0.8,
    currency: 'USD',
    deliveryLocation: 'Delhi, India',
    deliveryDeadline: '2026-05-10',
    paymentTerms: 'Net 30',
    createdAt: '2026-02-04',
    specifications: {
      boxType: '5-ply corrugated',
      gsm: '180 GSM',
      print: '2-color branding',
      moistureResistance: 'Required',
    },
    quotations: [],
  },
  'REQ-2024-004': {
    id: 'REQ-2024-004',
    title: 'Textile Fabric Rolls',
    description: 'Cotton blend textile rolls for garment production with colorfast quality guarantee.',
    category: 'Textiles',
    subcategory: 'Cotton Blend',
    status: 'UNDER_REVIEW',
    priority: 'URGENT',
    quantity: 2000,
    unit: 'meters',
    targetPrice: 6,
    currency: 'USD',
    deliveryLocation: 'Chennai, India',
    deliveryDeadline: '2026-03-02',
    paymentTerms: 'LC at Sight',
    createdAt: '2026-02-07',
    specifications: {
      composition: '65% Cotton / 35% Polyester',
      width: '58 inches',
      gsm: '210',
      colorfastness: 'Grade 4+',
    },
    quotations: [],
  },
};

const SUPPLIER_REQUIREMENT_CARDS: Record<string, SupplierRequirementCardDetail> = {
  'src-001': {
    cardId: 'src-001',
    requirementId: 'req-abc-001',
    title: 'Industrial Steel Pipes - Grade 304',
    category: 'Industrial Materials',
    description: 'Need seamless Grade 304 pipes for industrial transfer systems.',
    status: 'SENT',
    quantity: 500,
    unit: 'MT',
    targetPrice: 1200,
    currency: 'USD',
    deliveryLocation: 'Mumbai Port (JNPT), India',
    deliveryDeadline: '2026-05-15',
    paymentTerms: '30% Advance, 70% on Delivery',
    incoterms: 'CIF',
    certifications: ['ISO 9001', 'CE Marking', 'MTC'],
    matchScore: 95,
    daysLeft: 3,
    isDirect: false,
  },
  'src-002': {
    cardId: 'src-002',
    requirementId: 'req-abc-002',
    title: 'Copper Wire - Industrial Grade',
    category: 'Metals & Alloys',
    description: 'Electrolytic tough pitch copper wire for electrical harness assemblies.',
    status: 'VIEWED',
    quantity: 200,
    unit: 'MT',
    targetPrice: 9000,
    currency: 'USD',
    deliveryLocation: 'Shanghai, China',
    deliveryDeadline: '2026-06-01',
    paymentTerms: 'LC at Sight',
    incoterms: 'FOB',
    certifications: ['ISO 9001'],
    matchScore: 88,
    daysLeft: 5,
    isDirect: true,
  },
  'src-003': {
    cardId: 'src-003',
    requirementId: 'req-abc-003',
    title: 'Aluminum Sheets - 5mm',
    category: 'Metals & Alloys',
    description: '5mm sheets with tight flatness tolerance for fabrication use.',
    status: 'QUOTE_SUBMITTED',
    quantity: 150,
    unit: 'MT',
    targetPrice: 2400,
    currency: 'USD',
    deliveryLocation: 'Rotterdam, Netherlands',
    deliveryDeadline: '2026-04-20',
    paymentTerms: '50% Advance, 50% on Delivery',
    incoterms: 'CFR',
    certifications: ['ISO 9001', 'CE Marking'],
    matchScore: 82,
    daysLeft: 0,
    isDirect: false,
    quotationId: 'QUO-S-003',
  },
};

const getStatusBadge = (status: string) => {
  const variants: Record<string, { variant: any; label: string }> = {
    DRAFT: { variant: 'secondary', label: 'Draft' },
    SUBMITTED: { variant: 'info', label: 'Submitted' },
    UNDER_REVIEW: { variant: 'warning', label: 'Under Review' },
    SOURCING: { variant: 'info', label: 'Sourcing' },
    QUOTATIONS_READY: { variant: 'success', label: 'Quotations Ready' },
    ACCEPTED: { variant: 'success', label: 'Accepted' },
    COMPLETED: { variant: 'success', label: 'Completed' },
    SENT: { variant: 'info', label: 'New' },
    VIEWED: { variant: 'outline', label: 'Viewed' },
    QUOTE_SUBMITTED: { variant: 'success', label: 'Quote Submitted' },
  };
  const config = variants[status] || { variant: 'secondary', label: status };
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

const getPriorityBadge = (priority: string) => {
  const variants: Record<string, { variant: any; label: string }> = {
    LOW: { variant: 'secondary', label: 'Low' },
    MEDIUM: { variant: 'outline', label: 'Medium' },
    HIGH: { variant: 'warning', label: 'High' },
    URGENT: { variant: 'destructive', label: 'Urgent' },
  };
  const config = variants[priority] || { variant: 'secondary', label: priority };
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export default function RequirementDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const requirementId = decodeURIComponent(params.id as string);
  const cardId = searchParams.get('card');

  const supplierCard = cardId ? SUPPLIER_REQUIREMENT_CARDS[cardId] : null;
  const requirement = BUYER_REQUIREMENTS[requirementId];

  if (supplierCard && supplierCard.requirementId !== requirementId) {
    return (
      <Card>
        <CardContent className="py-10 text-center space-y-3">
          <h2 className="text-lg font-semibold">Requirement not found</h2>
          <Link href="/requirements">
            <Button variant="outline">Back to Requirements</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (supplierCard) {
    const totalAmount = supplierCard.quantity * supplierCard.targetPrice;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/requirements">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold">{supplierCard.title}</h1>
                {getStatusBadge(supplierCard.status)}
                {supplierCard.isDirect && <Badge className="bg-amber-500 text-white">Direct Reorder</Badge>}
                <Badge variant="outline">
                  <Star className="mr-1 h-3 w-3" />
                  {supplierCard.matchScore}% Match
                </Badge>
              </div>
              <p className="text-muted-foreground">Card ID: {supplierCard.cardId}</p>
            </div>
          </div>
          {supplierCard.status !== 'QUOTE_SUBMITTED' ? (
            <Link href={`/quotations/new?card=${supplierCard.cardId}&req=${supplierCard.requirementId}`}>
              <Button variant="gradient">
                <Send className="mr-2 h-4 w-4" />
                Submit Quotation
              </Button>
            </Link>
          ) : (
            <Link href={`/quotations/${supplierCard.quotationId || 'QUO-S-003'}?context=submitted`}>
              <Button variant="outline">
                <MessageSquare className="mr-2 h-4 w-4" />
                View Submitted Quote
              </Button>
            </Link>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Requirement Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>{supplierCard.description}</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border p-3">
                    <p className="text-sm text-muted-foreground">Quantity</p>
                    <p className="font-semibold">
                      {supplierCard.quantity.toLocaleString()} {supplierCard.unit}
                    </p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-sm text-muted-foreground">Category</p>
                    <p className="font-semibold">{supplierCard.category}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-sm text-muted-foreground">Target Price (per {supplierCard.unit})</p>
                    <p className="font-semibold">
                      {supplierCard.currency} {supplierCard.targetPrice.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-sm text-muted-foreground">Estimated Total Amount</p>
                    <p className="font-semibold">
                      {supplierCard.currency} {totalAmount.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-sm text-muted-foreground">Payment Terms</p>
                    <p className="font-semibold">{supplierCard.paymentTerms}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-sm text-muted-foreground">Incoterms</p>
                    <p className="font-semibold">{supplierCard.incoterms}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Delivery</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  {supplierCard.deliveryLocation}
                </p>
                <p className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Due: {new Date(supplierCard.deliveryDeadline).toLocaleDateString()}
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  {supplierCard.daysLeft > 0 ? `${supplierCard.daysLeft} days left` : 'Deadline passed'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Required Certifications
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {supplierCard.certifications.map((cert) => (
                  <Badge key={cert} variant="outline">
                    {cert}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!requirement) {
    return (
      <Card>
        <CardContent className="py-10 text-center space-y-3">
          <h2 className="text-lg font-semibold">Requirement not found</h2>
          <Link href="/requirements">
            <Button variant="outline">Back to Requirements</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const targetTotalAmount = requirement.quantity * requirement.targetPrice;
  const lowestQuote = requirement.quotations.length
    ? Math.min(...requirement.quotations.map((quote) => quote.total))
    : null;

  const savingsAmount = useMemo(() => {
    if (lowestQuote === null) {
      return 0;
    }
    return targetTotalAmount - lowestQuote;
  }, [lowestQuote, targetTotalAmount]);

  const savingsPercent = targetTotalAmount > 0 ? Math.round((savingsAmount / targetTotalAmount) * 100) : 0;
  const comparisonProgress = Math.max(0, Math.min(100, 100 + savingsPercent));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/requirements">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold">{requirement.id}</h1>
              {getStatusBadge(requirement.status)}
              {getPriorityBadge(requirement.priority)}
            </div>
            <p className="text-muted-foreground">{requirement.title}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Link href={`/quotations?requirement=${requirement.id}`}>
            <Button variant="gradient">
              <MessageSquare className="mr-2 h-4 w-4" />
              View Quotations ({requirement.quotations.length})
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Requirement Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
                <p className="mt-1">{requirement.description}</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Category</h4>
                  <p className="mt-1">
                    {requirement.category} / {requirement.subcategory}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Quantity</h4>
                  <p className="mt-1">
                    {requirement.quantity.toLocaleString()} {requirement.unit}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-2">
                  <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Target Price (per {requirement.unit})</h4>
                    <p className="mt-1 font-semibold">
                      {requirement.currency} {requirement.targetPrice.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Estimated Total Amount</h4>
                    <p className="mt-1 font-semibold">
                      {requirement.currency} {targetTotalAmount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Delivery Location</h4>
                    <p className="mt-1">{requirement.deliveryLocation}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Delivery Deadline</h4>
                    <p className="mt-1">{new Date(requirement.deliveryDeadline).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Payment Terms</h4>
                <p className="mt-1">{requirement.paymentTerms}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {Object.entries(requirement.specifications).map(([key, value]) => (
                  <div key={key} className="rounded-lg border p-3">
                    <h4 className="text-sm font-medium text-muted-foreground capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </h4>
                    <p className="mt-1">{value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Quotations Received</span>
                <Badge variant="success">{requirement.quotations.length} quotes</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {requirement.quotations.map((quote) => (
                  <div key={quote.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                        <Building2 className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{quote.supplier}</p>
                          {getStatusBadge(quote.status)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{quote.rating}</span>
                          <span>•</span>
                          <Clock className="h-3 w-3" />
                          <span>{quote.leadTime}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">${quote.total.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">
                        ${quote.unitPrice}/{requirement.unit}
                      </p>
                      <Link href={`/quotations/${quote.id}`} className="text-xs text-primary hover:underline">
                        View quotation
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href={`/quotations?requirement=${requirement.id}`} className="block">
                <Button variant="gradient" className="w-full">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Review Quotations
                </Button>
              </Link>
              <Button variant="outline" className="w-full">
                <Edit className="mr-2 h-4 w-4" />
                Edit Requirement
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Price Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Target Total Amount</span>
                  <span className="font-medium">
                    {requirement.currency} {targetTotalAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Lowest Quote</span>
                  <span className="font-medium text-green-600">
                    {lowestQuote === null ? 'N/A' : `${requirement.currency} ${lowestQuote.toLocaleString()}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Savings</span>
                  <span className={`font-medium ${savingsAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {requirement.currency} {Math.abs(savingsAmount).toLocaleString()} ({Math.abs(savingsPercent)}%)
                  </span>
                </div>
                <Progress value={comparisonProgress} className="h-2 mt-2" />
                <p className="text-xs text-muted-foreground text-center">
                  {savingsAmount >= 0
                    ? 'Best quote is below target total amount'
                    : 'Best quote is above target total amount'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
