'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Search,
  FileText,
  Building2,
  Star,
  Clock,
  CheckCircle,
  Send,
  DollarSign,
} from 'lucide-react';
import Link from 'next/link';

interface Quotation {
  id: string;
  requirementId: string;
  requirementTitle: string;
  buyerName: string;
  supplierName: string;
  amount: number;
  unitPrice: number;
  quantity: number;
  deliveryDays: number;
  rating: number;
  status: 'pending' | 'reviewed' | 'sent_to_admin';
  submittedAt: string;
}

const MOCK_QUOTATIONS: Quotation[] = [
  { id: 'QUO-001', requirementId: 'REQ-001', requirementTitle: 'Steel Components', buyerName: 'Acme Corporation', supplierName: 'Steel Industries Ltd', amount: 24000, unitPrice: 4.8, quantity: 5000, deliveryDays: 14, rating: 4.8, status: 'pending', submittedAt: '2024-01-20' },
  { id: 'QUO-002', requirementId: 'REQ-001', requirementTitle: 'Steel Components', buyerName: 'Acme Corporation', supplierName: 'Premium Metals Co', amount: 26500, unitPrice: 5.3, quantity: 5000, deliveryDays: 10, rating: 4.6, status: 'pending', submittedAt: '2024-01-19' },
  { id: 'QUO-003', requirementId: 'REQ-001', requirementTitle: 'Steel Components', buyerName: 'Acme Corporation', supplierName: 'MetalWorks India', amount: 23000, unitPrice: 4.6, quantity: 5000, deliveryDays: 21, rating: 4.5, status: 'pending', submittedAt: '2024-01-18' },
  { id: 'QUO-004', requirementId: 'REQ-002', requirementTitle: 'Cotton Fabric', buyerName: 'Fashion Hub Ltd', supplierName: 'Textile Masters', amount: 42000, unitPrice: 4.2, quantity: 10000, deliveryDays: 12, rating: 4.7, status: 'reviewed', submittedAt: '2024-01-17' },
  { id: 'QUO-005', requirementId: 'REQ-002', requirementTitle: 'Cotton Fabric', buyerName: 'Fashion Hub Ltd', supplierName: 'Cotton World', amount: 38000, unitPrice: 3.8, quantity: 10000, deliveryDays: 18, rating: 4.4, status: 'reviewed', submittedAt: '2024-01-16' },
];

const STATUS_CONFIG = {
  pending: { label: 'Pending Review', className: 'bg-yellow-500/20 text-yellow-400' },
  reviewed: { label: 'Reviewed', className: 'bg-blue-500/20 text-blue-400' },
  sent_to_admin: { label: 'Sent to Admin', className: 'bg-green-500/20 text-green-400' },
};

export default function QuotationsReviewPage() {
  const [quotations, setQuotations] = useState<Quotation[]>(MOCK_QUOTATIONS);
  const [search, setSearch] = useState('');
  const [selectedQuotes, setSelectedQuotes] = useState<string[]>([]);
  const [sending, setSending] = useState(false);

  // Group quotations by requirement
  const groupedQuotations = quotations.reduce((acc, quote) => {
    if (!acc[quote.requirementId]) {
      acc[quote.requirementId] = {
        requirementTitle: quote.requirementTitle,
        buyerName: quote.buyerName,
        quotes: [],
      };
    }
    acc[quote.requirementId].quotes.push(quote);
    return acc;
  }, {} as Record<string, { requirementTitle: string; buyerName: string; quotes: Quotation[] }>);

  const handleSelectQuote = (quoteId: string) => {
    setSelectedQuotes((prev) =>
      prev.includes(quoteId)
        ? prev.filter((id) => id !== quoteId)
        : [...prev, quoteId]
    );
  };

  const handleSendToAdmin = async () => {
    if (selectedQuotes.length === 0) return;
    
    setSending(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setQuotations((prev) =>
      prev.map((quote) =>
        selectedQuotes.includes(quote.id)
          ? { ...quote, status: 'sent_to_admin' as const }
          : quote
      )
    );
    
    setSelectedQuotes([]);
    setSending(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Quotation Review</h1>
          <p className="text-slate-400">Review and compare supplier quotations, then send to admin for approval</p>
        </div>
        {selectedQuotes.length > 0 && (
          <Button
            onClick={handleSendToAdmin}
            disabled={sending}
            className="bg-green-600 hover:bg-green-700"
          >
            <Send className="h-4 w-4 mr-2" />
            {sending ? 'Sending...' : `Send ${selectedQuotes.length} to Admin`}
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search quotations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-slate-900 border-slate-700"
        />
      </div>

      {/* Grouped Quotations */}
      <div className="space-y-6">
        {Object.entries(groupedQuotations).map(([reqId, group]) => (
          <Card key={reqId} className="bg-slate-900 border-slate-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <Link href={`/internal/quotations/${reqId}`} className="hover:underline">
                    <CardTitle className="text-white cursor-pointer">{group.requirementTitle}</CardTitle>
                  </Link>
                  <p className="text-sm text-slate-400">Buyer: {group.buyerName} • {group.quotes.length} quotations</p>
                </div>
                <Link href={`/internal/quotations/${reqId}`}>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                    View Details →
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {group.quotes.map((quote) => (
                  <div
                    key={quote.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                      selectedQuotes.includes(quote.id)
                        ? 'border-green-500 bg-green-500/10'
                        : 'border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <Checkbox
                      checked={selectedQuotes.includes(quote.id)}
                      onCheckedChange={() => handleSelectQuote(quote.id)}
                      disabled={quote.status === 'sent_to_admin'}
                    />
                    <div className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-slate-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-white">{quote.supplierName}</h4>
                        <Badge className={STATUS_CONFIG[quote.status].className}>
                          {STATUS_CONFIG[quote.status].label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          ${quote.amount.toLocaleString()} (${quote.unitPrice}/unit)
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {quote.deliveryDays} days delivery
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm font-medium">{quote.rating}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-white">${quote.amount.toLocaleString()}</p>
                      <p className="text-xs text-slate-500">Total Amount</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
