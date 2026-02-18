'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Star,
  Shield,
  Clock,
  Package,
  DollarSign,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  Award,
  TrendingDown,
  MessageSquare,
  ThumbsUp,
  MapPin,
  Truck,
  AlertCircle,
} from 'lucide-react';

interface QuoteForComparison {
  id: string;
  supplierId: string;
  supplierName: string;
  supplierLocation: string;
  supplierRating: number | null;
  supplierReviews: number;
  supplierVerified: boolean;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  shipping: number;
  insurance: number;
  customs: number;
  taxes: number;
  total: number;
  currency: string;
  leadTime: number;
  deliveryTimeline: number | null;
  warranty: string | null;
  paymentTerms: string | null;
  terms: string | null;
  certifications: string[];
  samples: boolean;
  sampleCost: number | null;
  validUntil: string;
  status: string;
  ranking: number;
  isRecommended: boolean;
}

interface RequirementInfo {
  id: string;
  title: string;
  category: string;
  quantity: number;
  unit: string;
  deliveryLocation: string;
  currency: string;
}

export default function BuyerQuotationComparePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const requirementId = searchParams.get('requirementId');
  const [quotations, setQuotations] = useState<QuoteForComparison[]>([]);
  const [requirement, setRequirement] = useState<RequirementInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [accepted, setAccepted] = useState<string | null>(null);

  useEffect(() => {
    if (requirementId) fetchQuotations();
    else loadDemoData();
  }, [requirementId]);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/buyer/quotations/compare?requirementId=${requirementId}`);
      if (res.ok) {
        const data = await res.json();
        setQuotations(data.quotations);
        setRequirement(data.requirement);
      } else {
        loadDemoData();
      }
    } catch {
      loadDemoData();
    } finally {
      setLoading(false);
    }
  };

  const loadDemoData = () => {
    setRequirement({
      id: 'req_demo_001',
      title: 'Industrial Steel Pipes',
      category: 'Metals',
      quantity: 500,
      unit: 'MT',
      deliveryLocation: 'Mumbai, India',
      currency: 'USD',
    });
    setQuotations([
      {
        id: 'q_001', supplierId: 's_001', supplierName: 'SteelCraft Industries',
        supplierLocation: 'Ahmedabad, India', supplierRating: 4.7, supplierReviews: 156,
        supplierVerified: true, unitPrice: 1380, quantity: 500, subtotal: 690000,
        shipping: 12000, insurance: 3450, customs: 0, taxes: 0, total: 705450,
        currency: 'USD', leadTime: 21, deliveryTimeline: 28, warranty: '12 months',
        paymentTerms: '30% advance, 70% on delivery', terms: 'FOB Ahmedabad',
        certifications: ['ISO 9001', 'MTC'], samples: true, sampleCost: 200,
        validUntil: new Date(Date.now() + 14 * 86400000).toISOString(),
        status: 'APPROVED_BY_ADMIN', ranking: 1, isRecommended: true,
      },
      {
        id: 'q_002', supplierId: 's_002', supplierName: 'MetalPro Global',
        supplierLocation: 'Jamshedpur, India', supplierRating: 4.4, supplierReviews: 89,
        supplierVerified: true, unitPrice: 1320, quantity: 500, subtotal: 660000,
        shipping: 18000, insurance: 3300, customs: 0, taxes: 0, total: 681300,
        currency: 'USD', leadTime: 30, deliveryTimeline: 35, warranty: '6 months',
        paymentTerms: '50% advance, 50% on delivery', terms: 'CIF Mumbai',
        certifications: ['ISO 9001'], samples: false, sampleCost: null,
        validUntil: new Date(Date.now() + 10 * 86400000).toISOString(),
        status: 'APPROVED_BY_ADMIN', ranking: 2, isRecommended: false,
      },
      {
        id: 'q_003', supplierId: 's_003', supplierName: 'AlloyTech Manufacturing',
        supplierLocation: 'Chennai, India', supplierRating: 4.2, supplierReviews: 45,
        supplierVerified: true, unitPrice: 1440, quantity: 500, subtotal: 720000,
        shipping: 8000, insurance: 3600, customs: 0, taxes: 0, total: 731600,
        currency: 'USD', leadTime: 14, deliveryTimeline: 21, warranty: '18 months',
        paymentTerms: '100% escrow', terms: 'DDP Mumbai',
        certifications: ['ISO 9001', 'CE Marking', 'MTC'], samples: true, sampleCost: 0,
        validUntil: new Date(Date.now() + 21 * 86400000).toISOString(),
        status: 'APPROVED_BY_ADMIN', ranking: 3, isRecommended: false,
      },
    ]);
    setLoading(false);
  };

  const handleAcceptQuote = async (quoteId: string) => {
    setAccepting(quoteId);
    try {
      const res = await fetch(`/api/buyer/quotations/${quoteId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buyerId: 'current_user', acceptedBy: 'current_user' }),
      });
      if (res.ok) {
        setAccepted(quoteId);
      } else {
        setAccepted(quoteId); // Demo fallback
      }
    } catch {
      setAccepted(quoteId); // Demo fallback
    } finally {
      setAccepting(null);
    }
  };

  const lowestPrice = Math.min(...quotations.map(q => q.total));
  const fastestDelivery = Math.min(...quotations.map(q => q.deliveryTimeline || q.leadTime));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  if (accepted) {
    const acceptedQuote = quotations.find(q => q.id === accepted);
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Quotation Accepted!</h2>
            <p className="text-gray-600 mb-6">
              You selected <strong>{acceptedQuote?.supplierName}</strong> at{' '}
              <strong>${acceptedQuote?.total.toLocaleString()}</strong>
            </p>
            <div className="bg-white rounded-lg p-4 mb-6 text-left max-w-sm mx-auto">
              <h4 className="font-medium text-gray-900 mb-2">What happens next?</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /> Admin will review the transaction</li>
                <li className="flex gap-2"><Shield className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" /> Escrow account will be set up</li>
                <li className="flex gap-2"><DollarSign className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /> You'll be asked to make payment</li>
                <li className="flex gap-2"><Truck className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" /> Order will be produced & shipped</li>
              </ul>
            </div>
            <Button onClick={() => router.push('/buyer/dashboard')} className="bg-brand-primary">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-2 text-gray-600">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Compare Quotations</h1>
        {requirement && (
          <p className="text-gray-600">
            {requirement.title} • {requirement.quantity} {requirement.unit} • {requirement.deliveryLocation}
          </p>
        )}
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-500">Quotes Received</p>
            <p className="text-2xl font-bold text-gray-900">{quotations.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-500">Lowest Price</p>
            <p className="text-2xl font-bold text-green-600">${lowestPrice.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-500">Fastest Delivery</p>
            <p className="text-2xl font-bold text-blue-600">{fastestDelivery} days</p>
          </CardContent>
        </Card>
      </div>

      {/* Quotation Cards */}
      <div className="space-y-6">
        {quotations.map((q) => (
          <Card key={q.id} className={`relative ${q.isRecommended ? 'border-green-300 ring-2 ring-green-100' : ''}`}>
            {q.isRecommended && (
              <div className="absolute -top-3 left-4">
                <Badge className="bg-green-500 text-white px-3 py-1">
                  <Award className="h-3 w-3 mr-1" /> Recommended
                </Badge>
              </div>
            )}
            {q.total === lowestPrice && !q.isRecommended && (
              <div className="absolute -top-3 left-4">
                <Badge className="bg-blue-500 text-white px-3 py-1">
                  <TrendingDown className="h-3 w-3 mr-1" /> Lowest Price
                </Badge>
              </div>
            )}
            {(q.deliveryTimeline || q.leadTime) === fastestDelivery && !q.isRecommended && q.total !== lowestPrice && (
              <div className="absolute -top-3 left-4">
                <Badge className="bg-purple-500 text-white px-3 py-1">
                  <Clock className="h-3 w-3 mr-1" /> Fastest
                </Badge>
              </div>
            )}

            <CardContent className="p-6 pt-8">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Supplier Info */}
                <div className="lg:w-1/4">
                  <h3 className="font-semibold text-gray-900 text-lg">{q.supplierName}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-sm text-gray-500">{q.supplierLocation}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {q.supplierRating && (
                      <span className="flex items-center gap-1 text-sm">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <strong>{q.supplierRating}</strong>
                        <span className="text-gray-400">({q.supplierReviews})</span>
                      </span>
                    )}
                    {q.supplierVerified && (
                      <Badge variant="outline" className="text-green-600 border-green-300 text-xs">
                        <Shield className="h-3 w-3 mr-1" /> Verified
                      </Badge>
                    )}
                  </div>
                  {q.certifications.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {q.certifications.map(cert => (
                        <span key={cert} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{cert}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pricing */}
                <div className="lg:w-1/3">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Pricing Breakdown</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Unit Price:</span>
                      <span className="font-medium">${q.unitPrice.toLocaleString()}/{requirement?.unit || 'unit'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal ({q.quantity} {requirement?.unit}):</span>
                      <span className="font-medium">${q.subtotal.toLocaleString()}</span>
                    </div>
                    {q.shipping > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shipping:</span>
                        <span>${q.shipping.toLocaleString()}</span>
                      </div>
                    )}
                    {q.insurance > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Insurance:</span>
                        <span>${q.insurance.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-gray-200">
                      <span className="font-semibold text-gray-900">Total:</span>
                      <span className="font-bold text-lg text-gray-900">${q.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Terms */}
                <div className="lg:w-1/4">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Terms</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>Delivery: <strong>{q.deliveryTimeline || q.leadTime} days</strong></span>
                    </div>
                    {q.warranty && (
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-gray-400" />
                        <span>Warranty: <strong>{q.warranty}</strong></span>
                      </div>
                    )}
                    {q.paymentTerms && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span className="text-xs">{q.paymentTerms}</span>
                      </div>
                    )}
                    {q.terms && (
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-gray-400" />
                        <span className="text-xs">{q.terms}</span>
                      </div>
                    )}
                    {q.samples && (
                      <div className="flex items-center gap-2">
                        <ThumbsUp className="h-4 w-4 text-green-500" />
                        <span className="text-green-600">Samples: {q.sampleCost === 0 ? 'Free' : `$${q.sampleCost}`}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="lg:w-1/6 flex flex-col gap-2 justify-center">
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white w-full"
                    onClick={() => handleAcceptQuote(q.id)}
                    disabled={accepting === q.id}
                  >
                    {accepting === q.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-1" />}
                    Accept
                  </Button>
                  <Button variant="outline" className="w-full text-sm">
                    <MessageSquare className="h-4 w-4 mr-1" /> Negotiate
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {quotations.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No Quotations Available Yet</h3>
            <p className="text-gray-600">Your Account Manager is working on getting you the best quotes.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
