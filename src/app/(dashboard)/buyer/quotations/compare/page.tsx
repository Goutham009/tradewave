'use client';

import React, { useState, useEffect } from 'react';
import { useCallback } from 'react';
import Link from 'next/link';
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
  ArrowLeft,
  Loader2,
  Award,
  TrendingDown,
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
  const [error, setError] = useState<string | null>(null);

  const fetchQuotations = useCallback(async () => {
    if (!requirementId) {
      setError('Missing requirementId. Open comparison from a requirement quotation group.');
      setQuotations([]);
      setRequirement(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/buyer/quotations/compare?requirementId=${encodeURIComponent(requirementId)}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || 'Failed to load quotations for comparison.');
        setQuotations([]);
        setRequirement(null);
        return;
      }

      setQuotations(Array.isArray(data?.quotations) ? data.quotations : []);
      setRequirement(data?.requirement || null);
    } catch {
      setError('Network error while loading comparison data.');
      setQuotations([]);
      setRequirement(null);
    } finally {
      setLoading(false);
    }
  }, [requirementId]);

  useEffect(() => {
    void fetchQuotations();
  }, [fetchQuotations]);

  const hasQuotations = quotations.length > 0;
  const lowestPrice = hasQuotations ? Math.min(...quotations.map((q) => q.total)) : null;
  const fastestDelivery = hasQuotations
    ? Math.min(...quotations.map((q) => q.deliveryTimeline || q.leadTime))
    : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-2 text-gray-600">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Unable to load comparison</h3>
            <p className="text-gray-600 mt-2">{error}</p>
            <Button className="mt-4" variant="outline" onClick={() => void fetchQuotations()}>
              Retry
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
            <p className="text-2xl font-bold text-green-600">
              {lowestPrice === null ? 'N/A' : `$${lowestPrice.toLocaleString()}`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-500">Fastest Delivery</p>
            <p className="text-2xl font-bold text-blue-600">
              {fastestDelivery === null ? 'N/A' : `${fastestDelivery} days`}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardContent className="py-4 text-sm text-gray-600">
          Compare pricing and terms here, then open any quote for full details, negotiation with AM and supplier, and final accept/reject action.
        </CardContent>
      </Card>

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
            {lowestPrice !== null && q.total === lowestPrice && !q.isRecommended && (
              <div className="absolute -top-3 left-4">
                <Badge className="bg-blue-500 text-white px-3 py-1">
                  <TrendingDown className="h-3 w-3 mr-1" /> Lowest Price
                </Badge>
              </div>
            )}
            {fastestDelivery !== null &&
              (q.deliveryTimeline || q.leadTime) === fastestDelivery &&
              !q.isRecommended &&
              q.total !== lowestPrice && (
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
                  <Link href={`/quotations/${q.id}?context=received&requirementId=${requirementId || requirement?.id || ''}`}>
                    <Button className="w-full" variant="outline">
                      Open Full Quote
                    </Button>
                  </Link>
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
