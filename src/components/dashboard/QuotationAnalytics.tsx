'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, DollarSign, Clock, Star, Award } from 'lucide-react';

interface Quotation {
  id: string;
  totalPrice: number;
  unitPrice: number;
  deliveryTime: number;
  paymentTerms: string;
  supplier: {
    id: string;
    companyName: string;
    rating: number;
    complianceTier: string;
    totalTransactions: number;
  };
}

interface Requirement {
  id: string;
  productType: string;
  quantity: number;
  unit: string;
  quotations: Quotation[];
}

interface QuotationAnalyticsProps {
  requirement: Requirement;
}

export function QuotationAnalytics({ requirement }: QuotationAnalyticsProps) {
  const quotations = requirement.quotations || [];

  if (quotations.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-neutral-500">No quotations available for analysis</p>
      </Card>
    );
  }

  // Calculate analytics
  const prices = quotations.map(q => q.totalPrice);
  const deliveryTimes = quotations.map(q => q.deliveryTime);
  const ratings = quotations.map(q => q.supplier.rating);

  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const avgDelivery = deliveryTimes.reduce((a, b) => a + b, 0) / deliveryTimes.length;
  const minDelivery = Math.min(...deliveryTimes);
  const maxDelivery = Math.max(...deliveryTimes);

  const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;

  // Calculate value score (price vs quality)
  const quotationsWithScores = quotations.map(q => {
    const priceRange = maxPrice - minPrice || 1;
    const deliveryRange = maxDelivery - minDelivery || 1;
    
    const priceScore = ((maxPrice - q.totalPrice) / priceRange) * 50;
    const ratingScore = (q.supplier.rating / 5) * 30;
    const deliveryScore = ((maxDelivery - q.deliveryTime) / deliveryRange) * 20;
    const valueScore = priceScore + ratingScore + deliveryScore;

    return {
      ...q,
      valueScore: valueScore.toFixed(1),
      priceCompetitiveness: ((1 - (q.totalPrice - minPrice) / priceRange) * 100).toFixed(0),
      ratingPercentage: ((q.supplier.rating / 5) * 100).toFixed(0),
      deliverySpeed: ((1 - (q.deliveryTime - minDelivery) / deliveryRange) * 100).toFixed(0),
    };
  }).sort((a, b) => parseFloat(b.valueScore) - parseFloat(a.valueScore));

  const bestValue = quotationsWithScores[0];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-600">Average Price</p>
              <p className="text-2xl font-bold">${avgPrice.toLocaleString()}</p>
            </div>
          </div>
          <p className="text-xs text-neutral-500">
            Range: ${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()}
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-600">Average Delivery</p>
              <p className="text-2xl font-bold">{avgDelivery.toFixed(0)} days</p>
            </div>
          </div>
          <p className="text-xs text-neutral-500">
            Range: {minDelivery} - {maxDelivery} days
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-600">Average Rating</p>
              <p className="text-2xl font-bold">⭐ {avgRating.toFixed(1)}/5.0</p>
            </div>
          </div>
          <p className="text-xs text-neutral-500">
            All {quotations.length} suppliers rated
          </p>
        </Card>
      </div>

      {/* Value Score Comparison */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-teal-600" />
          <h3 className="text-lg font-bold">Value Score Analysis</h3>
        </div>
        <p className="text-sm text-neutral-600 mb-4">
          Calculated based on price (50%), supplier rating (30%), and delivery time (20%)
        </p>

        <div className="space-y-4">
          {quotationsWithScores.map((quote, index) => (
            <div 
              key={quote.id} 
              className={`border rounded-lg p-4 ${
                index === 0 ? 'border-teal-300 bg-teal-50/50' : 'border-neutral-200'
              }`}
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                  {index === 0 && (
                    <Award className="w-5 h-5 text-teal-600" />
                  )}
                  <div>
                    <p className="font-semibold">{quote.supplier.companyName}</p>
                    <Badge variant={
                      quote.supplier.complianceTier === 'TRUSTED' ? 'success' :
                      quote.supplier.complianceTier === 'VERIFIED' ? 'info' : 'default'
                    }>
                      {quote.supplier.complianceTier}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-teal-600">{quote.valueScore}</p>
                  <p className="text-xs text-neutral-600">Value Score</p>
                </div>
              </div>

              {/* Progress Bars */}
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-600">Price Competitiveness</span>
                    <span className="font-medium">{quote.priceCompetitiveness}%</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${quote.priceCompetitiveness}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-600">Supplier Rating</span>
                    <span className="font-medium">{quote.ratingPercentage}%</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${quote.ratingPercentage}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-600">Delivery Speed</span>
                    <span className="font-medium">{quote.deliverySpeed}%</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full transition-all"
                      style={{ width: `${quote.deliverySpeed}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-neutral-200">
                <div className="text-center">
                  <p className="text-lg font-bold">${quote.totalPrice.toLocaleString()}</p>
                  <p className="text-xs text-neutral-600">Total Price</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold">{quote.deliveryTime} days</p>
                  <p className="text-xs text-neutral-600">Delivery</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold">⭐ {quote.supplier.rating.toFixed(1)}</p>
                  <p className="text-xs text-neutral-600">Rating</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recommendation */}
      <Card className="p-6 bg-gradient-to-r from-teal-50 to-blue-50 border-teal-200">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center text-white text-2xl">
            💡
          </div>
          <div>
            <h3 className="text-lg font-bold text-teal-900 mb-2">Recommendation</h3>
            <p className="text-sm text-teal-800">
              Based on the value score analysis, <strong>{bestValue.supplier.companyName}</strong> offers 
              the best overall value with a score of <strong>{bestValue.valueScore}</strong>. 
              They balance competitive pricing at <strong>${bestValue.totalPrice.toLocaleString()}</strong>, 
              reliable delivery in <strong>{bestValue.deliveryTime} days</strong>, and an excellent 
              rating of <strong>{bestValue.supplier.rating.toFixed(1)}/5.0</strong>.
            </p>
            <p className="text-xs text-teal-600 mt-2">
              {bestValue.supplier.totalTransactions}+ successful transactions completed
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
