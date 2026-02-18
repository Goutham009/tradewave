'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowUpDown, Eye, Send, TrendingUp } from 'lucide-react';

interface Quotation {
  id: string;
  supplier: {
    id: string;
    companyName: string;
    name: string;
    tier: 'TRUSTED' | 'STANDARD' | 'REVIEW';
    rating: number;
    completedTransactions: number;
  };
  unitPrice: number;
  totalPrice: number;
  deliveryTime: number;
  validUntil: string;
  notes: string;
}

interface QuotationComparisonMatrixProps {
  requirementId: string;
  onSendToBuyer?: (quotationIds: string[]) => void;
  onSendToAdmin?: (quotationIds: string[]) => void;
}

const mockQuotations: Quotation[] = [
  {
    id: 'quote-001',
    supplier: {
      id: 'sup-001',
      companyName: 'Industrial Solutions Ltd',
      name: 'Robert Chen',
      tier: 'TRUSTED',
      rating: 4.8,
      completedTransactions: 156,
    },
    unitPrice: 45.00,
    totalPrice: 225000,
    deliveryTime: 14,
    validUntil: '2024-03-15',
    notes: 'Includes free shipping for orders over $200k',
  },
  {
    id: 'quote-002',
    supplier: {
      id: 'sup-002',
      companyName: 'TechParts Manufacturing',
      name: 'Sarah Kim',
      tier: 'TRUSTED',
      rating: 4.7,
      completedTransactions: 89,
    },
    unitPrice: 42.50,
    totalPrice: 212500,
    deliveryTime: 21,
    validUntil: '2024-03-20',
    notes: 'Can expedite for additional 10%',
  },
  {
    id: 'quote-003',
    supplier: {
      id: 'sup-003',
      companyName: 'Global Precision Co.',
      name: 'Michael Wang',
      tier: 'STANDARD',
      rating: 4.5,
      completedTransactions: 45,
    },
    unitPrice: 40.00,
    totalPrice: 200000,
    deliveryTime: 28,
    validUntil: '2024-03-10',
    notes: 'Bulk discount available for repeat orders',
  },
  {
    id: 'quote-004',
    supplier: {
      id: 'sup-004',
      companyName: 'MetalWorks Industries',
      name: 'James Miller',
      tier: 'STANDARD',
      rating: 4.3,
      completedTransactions: 67,
    },
    unitPrice: 38.00,
    totalPrice: 190000,
    deliveryTime: 35,
    validUntil: '2024-03-25',
    notes: 'First-time customer discount applied',
  },
  {
    id: 'quote-005',
    supplier: {
      id: 'sup-005',
      companyName: 'NewTech Suppliers',
      name: 'Emily Zhang',
      tier: 'REVIEW',
      rating: 4.0,
      completedTransactions: 12,
    },
    unitPrice: 35.00,
    totalPrice: 175000,
    deliveryTime: 42,
    validUntil: '2024-03-30',
    notes: 'New supplier, eager to establish relationship',
  },
];

export function QuotationComparisonMatrix({ requirementId, onSendToBuyer, onSendToAdmin }: QuotationComparisonMatrixProps) {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [selectedTop3, setSelectedTop3] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'delivery' | 'score'>('score');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuotations();
  }, [requirementId]);

  const fetchQuotations = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setQuotations(mockQuotations);
    setLoading(false);
  };

  const maxPrice = Math.max(...quotations.map(q => q.totalPrice), 1);
  const maxDelivery = Math.max(...quotations.map(q => q.deliveryTime), 1);

  const getTierScore = (tier: string) => {
    switch(tier) {
      case 'TRUSTED': return 1.0;
      case 'STANDARD': return 0.7;
      case 'REVIEW': return 0.4;
      default: return 0;
    }
  };

  const calculateScore = (quote: Quotation) => {
    const priceScore = (1 - (quote.totalPrice / maxPrice)) * 40;
    const ratingScore = (quote.supplier.rating / 5) * 30;
    const tierScore = getTierScore(quote.supplier.tier) * 20;
    const deliveryScore = (1 - (quote.deliveryTime / maxDelivery)) * 10;
    
    return priceScore + ratingScore + tierScore + deliveryScore;
  };

  const sortedQuotations = [...quotations].sort((a, b) => {
    switch(sortBy) {
      case 'price':
        return a.totalPrice - b.totalPrice;
      case 'rating':
        return b.supplier.rating - a.supplier.rating;
      case 'delivery':
        return a.deliveryTime - b.deliveryTime;
      case 'score':
        return calculateScore(b) - calculateScore(a);
      default:
        return 0;
    }
  });

  const toggleSelection = (quotationId: string) => {
    if (selectedTop3.includes(quotationId)) {
      setSelectedTop3(prev => prev.filter(id => id !== quotationId));
    } else {
      if (selectedTop3.length < 3) {
        setSelectedTop3(prev => [...prev, quotationId]);
      } else {
        alert('You can only select 3 quotations');
      }
    }
  };

  const handleSendToBuyer = async () => {
    if (selectedTop3.length !== 3) {
      alert('Please select exactly 3 quotations');
      return;
    }

    try {
      const response = await fetch('/api/admin/quotations/send-to-buyer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requirementId,
          quotationIds: selectedTop3,
        }),
      });

      if (response.ok) {
        alert('Quotations sent to buyer successfully!');
        onSendToBuyer?.(selectedTop3);
      } else {
        alert('Failed to send quotations');
      }
    } catch {
      alert('Error sending quotations');
    }
  };

  const handleSendToAdmin = async () => {
    if (selectedTop3.length === 0) {
      alert('Please select at least 1 quotation');
      return;
    }

    try {
      const response = await fetch('/api/procurement/quotations/send-to-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requirementId,
          quotationIds: selectedTop3,
        }),
      });

      if (response.ok) {
        alert('Quotations sent to admin for approval!');
        onSendToAdmin?.(selectedTop3);
      } else {
        alert('Failed to send quotations to admin');
      }
    } catch {
      alert('Error sending quotations to admin');
    }
  };

  const getTierBadgeVariant = (tier: string) => {
    switch (tier) {
      case 'TRUSTED': return 'success';
      case 'STANDARD': return 'info';
      case 'REVIEW': return 'warning';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Card className="p-8 text-center">
        <p className="text-neutral-500">Loading quotations...</p>
      </Card>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="w-6 h-6" />
          Quotation Comparison Matrix
        </h2>
        
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary/20"
          >
            <option value="score">Overall Score</option>
            <option value="price">Price (Low to High)</option>
            <option value="rating">Rating (High to Low)</option>
            <option value="delivery">Delivery Time (Fast to Slow)</option>
          </select>
        </div>
      </div>

      {/* Matrix Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Select</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  <div className="flex items-center gap-1">
                    Rank
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Supplier</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Tier</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">Unit Price</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">Total Price</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Delivery</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Rating</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Orders</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Score</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedQuotations.map((quote, index) => {
                const score = calculateScore(quote);
                const isSelected = selectedTop3.includes(quote.id);
                
                return (
                  <tr 
                    key={quote.id} 
                    className={`border-t border-neutral-200 hover:bg-neutral-50 transition-colors ${
                      isSelected ? 'bg-teal-50' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSelection(quote.id)}
                        disabled={!isSelected && selectedTop3.length >= 3}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                        index === 0 ? 'bg-yellow-100 text-yellow-700' :
                        index === 1 ? 'bg-neutral-200 text-neutral-700' :
                        index === 2 ? 'bg-amber-100 text-amber-700' :
                        'bg-neutral-100 text-neutral-600'
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold">{quote.supplier.companyName}</p>
                        <p className="text-xs text-neutral-600">{quote.supplier.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={getTierBadgeVariant(quote.supplier.tier)}>
                        {quote.supplier.tier}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      ${quote.unitPrice.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-lg">
                      ${quote.totalPrice.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {quote.deliveryTime} days
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span>⭐</span>
                        <span className="font-semibold">{quote.supplier.rating.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {quote.supplier.completedTransactions}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-lg font-bold text-teal-600">
                          {score.toFixed(1)}
                        </span>
                        <div className="w-full bg-neutral-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-teal-500 h-2 rounded-full transition-all" 
                            style={{ width: `${score}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => alert(`View details for ${quote.supplier.companyName}`)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Selected Quotations Summary */}
      {selectedTop3.length > 0 && (
        <Card className="mt-6 p-4 bg-teal-50 border-teal-300">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold text-lg">Selected Quotations ({selectedTop3.length})</p>
              <p className="text-sm text-neutral-600">
                {onSendToAdmin 
                  ? 'These quotations will be sent to admin for approval' 
                  : 'These quotations will be sent to the buyer for review'}
              </p>
            </div>
            {onSendToAdmin ? (
              <Button 
                size="lg"
                onClick={handleSendToAdmin}
                disabled={selectedTop3.length === 0}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Send className="w-4 h-4 mr-2" />
                Send to Admin for Approval
              </Button>
            ) : (
              <Button 
                size="lg"
                onClick={handleSendToBuyer}
                disabled={selectedTop3.length !== 3}
              >
                <Send className="w-4 h-4 mr-2" />
                Send to Buyer ({selectedTop3.length}/3)
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
