'use client';

import { useState } from 'react';
import { Star, Shield, CheckCircle, Package, Clock, CreditCard, Award, MessageSquare } from 'lucide-react';

interface Quotation {
  id: string;
  supplier: {
    id: string;
    name: string;
    companyName: string;
    rating: number;
    totalTransactions: number;
    complianceTier: 'TRUSTED' | 'VERIFIED' | 'STANDARD';
    certifications: string[];
    responseTime: string;
  };
  unitPrice: number;
  totalPrice: number;
  currency: string;
  deliveryDays: number;
  paymentTerms: string;
  moq: number;
  notes: string;
  validUntil: string;
  isRecommended?: boolean;
}

interface QuotationComparisonProps {
  quotations: Quotation[];
  requirementTitle: string;
  onSelectQuotation: (quotationId: string) => void;
  onRequestModification: (quotationId: string) => void;
}

const tierColors = {
  TRUSTED: 'bg-green-100 text-green-700 border-green-200',
  VERIFIED: 'bg-blue-100 text-blue-700 border-blue-200',
  STANDARD: 'bg-gray-100 text-gray-700 border-gray-200',
};

const tierLabels = {
  TRUSTED: 'Trusted Partner',
  VERIFIED: 'Verified Supplier',
  STANDARD: 'Standard',
};

export function QuotationComparison({
  quotations,
  requirementTitle,
  onSelectQuotation,
  onRequestModification,
}: QuotationComparisonProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Only show top 3 curated quotations
  const topThree = quotations.slice(0, 3);

  if (topThree.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-brand-primary" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Quotations Coming Soon</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Our procurement team is curating the <strong>top 3 best suppliers</strong> for your requirement. 
          You&apos;ll receive quotations within 24-48 hours.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Compare Quotations</h2>
          <p className="text-gray-600 mt-1">
            Top {topThree.length} curated suppliers for: <strong>{requirementTitle}</strong>
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-brand-primary/10 rounded-xl">
          <Shield className="w-5 h-5 text-brand-primary" />
          <span className="text-sm font-medium text-brand-primary">Expert Curated</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {topThree.map((quote, index) => (
          <div
            key={quote.id}
            className={`bg-white rounded-2xl border-2 p-6 transition-all ${
              selectedId === quote.id
                ? 'border-brand-primary shadow-lg'
                : 'border-gray-200 hover:border-gray-300'
            } ${quote.isRecommended ? 'ring-2 ring-brand-primary/20' : ''}`}
          >
            {/* Recommended Badge */}
            {quote.isRecommended && (
              <div className="flex items-center gap-2 mb-4 -mt-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-brand-primary text-white text-sm font-semibold rounded-full">
                  <Award className="w-4 h-4" />
                  Recommended
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Supplier Info */}
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-brand-primary to-brand-accent rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-xl">
                      {quote.supplier.companyName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{quote.supplier.companyName}</h3>
                    <p className="text-sm text-gray-600">Contact: {quote.supplier.name}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full border ${tierColors[quote.supplier.complianceTier]}`}>
                      {tierLabels[quote.supplier.complianceTier]}
                    </span>
                  </div>
                </div>

                {/* Trust Indicators */}
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold">{quote.supplier.rating.toFixed(1)}</span>
                    <span className="text-sm text-gray-500">Rating</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-gray-400" />
                    <span className="font-semibold">{quote.supplier.totalTransactions}</span>
                    <span className="text-sm text-gray-500">Orders</span>
                  </div>
                </div>

                {/* Certifications */}
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-2">Certifications</p>
                  <div className="flex flex-wrap gap-2">
                    {quote.supplier.certifications.map((cert) => (
                      <span
                        key={cert}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg"
                      >
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pricing & Terms */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Unit Price</p>
                    <p className="text-2xl font-bold text-brand-primary">
                      {quote.currency} {quote.unitPrice.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Total Price</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {quote.currency} {quote.totalPrice.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Delivery</p>
                      <p className="font-semibold">{quote.deliveryDays} days</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Payment</p>
                      <p className="font-semibold">{quote.paymentTerms}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">MOQ: {quote.moq} units</p>
                  <p className="text-xs text-gray-500">Valid until: {new Date(quote.validUntil).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col justify-between">
                {quote.notes && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Supplier Notes</p>
                    <p className="text-sm text-gray-700">{quote.notes}</p>
                  </div>
                )}

                <div className="space-y-3 mt-auto">
                  <button
                    onClick={() => {
                      setSelectedId(quote.id);
                      onSelectQuotation(quote.id);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-brand-primary text-white font-semibold rounded-xl hover:bg-brand-primaryHover transition-colors"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Select This Supplier
                  </button>
                  <button
                    onClick={() => onRequestModification(quote.id)}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-brand-primary hover:text-brand-primary transition-colors"
                  >
                    <MessageSquare className="w-5 h-5" />
                    Request Modification
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-brand-primary/5 rounded-xl p-4 text-center">
        <p className="text-sm text-gray-700">
          <strong>Need different options?</strong> Contact your account manager to request additional quotations.
        </p>
      </div>
    </div>
  );
}
