'use client';

import { useState } from 'react';
import { 
  FileText, Star, Shield, CheckCircle, Send, Clock, 
  Building2, Award, Filter, Eye, ThumbsUp, ThumbsDown,
  ChevronRight, AlertTriangle, Loader2, Package
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface Quotation {
  id: string;
  supplierId: string;
  supplierName: string;
  supplierEmail: string;
  supplierTier: 'TRUSTED' | 'VERIFIED' | 'STANDARD';
  supplierRating: number;
  supplierTransactions: number;
  certifications: string[];
  unitPrice: number;
  totalPrice: number;
  deliveryDays: number;
  paymentTerms: string;
  notes: string;
  submittedAt: string;
}

interface Requirement {
  id: string;
  buyerCompany: string;
  buyerEmail: string;
  productType: string;
  quantity: number;
  unit: string;
  status: 'AWAITING_CURATION' | 'CURATED' | 'SENT_TO_BUYER';
  quotationsCount: number;
  quotations: Quotation[];
}

const mockRequirements: Requirement[] = [
  {
    id: 'REQ-2024-001',
    buyerCompany: 'TechCorp Industries',
    buyerEmail: 'john@techcorp.com',
    productType: 'Industrial Sensors',
    quantity: 5000,
    unit: 'pieces',
    status: 'AWAITING_CURATION',
    quotationsCount: 6,
    quotations: [
      {
        id: 'QUO-001',
        supplierId: 's1',
        supplierName: 'SensorTech Solutions',
        supplierEmail: 'sales@sensortech.com',
        supplierTier: 'TRUSTED',
        supplierRating: 4.9,
        supplierTransactions: 342,
        certifications: ['ISO 9001', 'ISO 14001', 'CE'],
        unitPrice: 12.50,
        totalPrice: 62500,
        deliveryDays: 14,
        paymentTerms: 'Net 30',
        notes: 'Can provide express delivery for additional 5%',
        submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'QUO-002',
        supplierId: 's2',
        supplierName: 'Precision Components Ltd',
        supplierEmail: 'sales@precision.com',
        supplierTier: 'VERIFIED',
        supplierRating: 4.7,
        supplierTransactions: 189,
        certifications: ['ISO 9001', 'RoHS'],
        unitPrice: 11.80,
        totalPrice: 59000,
        deliveryDays: 21,
        paymentTerms: 'Net 45',
        notes: 'Bulk discount available for orders over 10,000 units',
        submittedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'QUO-003',
        supplierId: 's3',
        supplierName: 'Global Sensor Manufacturing',
        supplierEmail: 'sales@globalsensor.com',
        supplierTier: 'TRUSTED',
        supplierRating: 4.6,
        supplierTransactions: 256,
        certifications: ['ISO 9001', 'ISO 14001', 'JIS'],
        unitPrice: 13.20,
        totalPrice: 66000,
        deliveryDays: 10,
        paymentTerms: 'Net 30',
        notes: 'Premium grade sensors with 2-year warranty',
        submittedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'QUO-004',
        supplierId: 's4',
        supplierName: 'SmartSense Technologies',
        supplierEmail: 'sales@smartsense.com',
        supplierTier: 'VERIFIED',
        supplierRating: 4.5,
        supplierTransactions: 124,
        certifications: ['ISO 9001', 'BIS'],
        unitPrice: 10.90,
        totalPrice: 54500,
        deliveryDays: 28,
        paymentTerms: 'Net 60',
        notes: 'Competitive pricing, reliable delivery track record',
        submittedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'QUO-005',
        supplierId: 's5',
        supplierName: 'EuroSensor GmbH',
        supplierEmail: 'sales@eurosensor.de',
        supplierTier: 'TRUSTED',
        supplierRating: 4.8,
        supplierTransactions: 198,
        certifications: ['ISO 9001', 'ISO 14001', 'CE', 'TUV'],
        unitPrice: 14.50,
        totalPrice: 72500,
        deliveryDays: 18,
        paymentTerms: 'Net 30',
        notes: 'German engineering quality, full technical support included',
        submittedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'QUO-006',
        supplierId: 's6',
        supplierName: 'AsianTech Components',
        supplierEmail: 'sales@asiantech.cn',
        supplierTier: 'STANDARD',
        supplierRating: 4.2,
        supplierTransactions: 87,
        certifications: ['ISO 9001'],
        unitPrice: 9.50,
        totalPrice: 47500,
        deliveryDays: 35,
        paymentTerms: 'Net 30',
        notes: 'Most competitive pricing in market',
        submittedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 'REQ-2024-003',
    buyerCompany: 'Premier Retail Ltd',
    buyerEmail: 'lisa@premierretail.com',
    productType: 'LED Display Panels',
    quantity: 200,
    unit: 'units',
    status: 'AWAITING_CURATION',
    quotationsCount: 4,
    quotations: [
      {
        id: 'QUO-007',
        supplierId: 's7',
        supplierName: 'DisplayTech Pro',
        supplierEmail: 'sales@displaytech.com',
        supplierTier: 'TRUSTED',
        supplierRating: 4.8,
        supplierTransactions: 215,
        certifications: ['ISO 9001', 'CE', 'FCC'],
        unitPrice: 450,
        totalPrice: 90000,
        deliveryDays: 21,
        paymentTerms: 'Net 30',
        notes: '55-inch commercial grade with 3-year warranty',
        submittedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'QUO-008',
        supplierId: 's8',
        supplierName: 'Visual Solutions Ltd',
        supplierEmail: 'sales@visualsol.com',
        supplierTier: 'VERIFIED',
        supplierRating: 4.6,
        supplierTransactions: 142,
        certifications: ['ISO 9001', 'CE'],
        unitPrice: 420,
        totalPrice: 84000,
        deliveryDays: 28,
        paymentTerms: 'Net 45',
        notes: 'Includes installation support',
        submittedAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'QUO-009',
        supplierId: 's9',
        supplierName: 'ProDisplay Asia',
        supplierEmail: 'sales@prodisplay.cn',
        supplierTier: 'TRUSTED',
        supplierRating: 4.7,
        supplierTransactions: 278,
        certifications: ['ISO 9001', 'ISO 14001', 'CE'],
        unitPrice: 380,
        totalPrice: 76000,
        deliveryDays: 35,
        paymentTerms: 'Net 30',
        notes: 'Best value, high-brightness panels',
        submittedAt: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'QUO-010',
        supplierId: 's10',
        supplierName: 'ScreenMaster Corp',
        supplierEmail: 'sales@screenmaster.com',
        supplierTier: 'VERIFIED',
        supplierRating: 4.4,
        supplierTransactions: 98,
        certifications: ['ISO 9001'],
        unitPrice: 395,
        totalPrice: 79000,
        deliveryDays: 25,
        paymentTerms: 'Net 30',
        notes: 'Quick turnaround, local support available',
        submittedAt: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
];

const tierColors: Record<string, string> = {
  TRUSTED: 'bg-green-500/20 text-green-400',
  VERIFIED: 'bg-blue-500/20 text-blue-400',
  STANDARD: 'bg-slate-500/20 text-slate-400',
};

export default function QuotationCurationPage() {
  const [requirements] = useState<Requirement[]>(mockRequirements);
  const [selectedReq, setSelectedReq] = useState<Requirement | null>(mockRequirements[0]);
  const [selectedQuotes, setSelectedQuotes] = useState<string[]>([]);
  const [showSendModal, setShowSendModal] = useState(false);
  const [sending, setSending] = useState(false);

  const toggleQuoteSelection = (quoteId: string) => {
    if (selectedQuotes.includes(quoteId)) {
      setSelectedQuotes(prev => prev.filter(id => id !== quoteId));
    } else if (selectedQuotes.length < 3) {
      setSelectedQuotes(prev => [...prev, quoteId]);
    }
  };

  const handleSendToBuyer = async () => {
    if (selectedQuotes.length !== 3) {
      alert('Please select exactly 3 quotations');
      return;
    }
    
    setSending(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSending(false);
    setShowSendModal(false);
    setSelectedQuotes([]);
    alert('Top 3 quotations sent to buyer successfully!');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getSelectedQuotations = () => {
    if (!selectedReq) return [];
    return selectedReq.quotations.filter(q => selectedQuotes.includes(q.id));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Quotation Curation</h1>
          <p className="text-slate-400 mt-1">
            Review all quotations and manually select the TOP 3 BEST for each requirement
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Awaiting Curation</p>
                <p className="text-xl font-bold text-yellow-400">
                  {requirements.filter(r => r.status === 'AWAITING_CURATION').length}
                </p>
              </div>
              <FileText className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Total Quotations</p>
                <p className="text-xl font-bold text-blue-400">
                  {requirements.reduce((sum, r) => sum + r.quotationsCount, 0)}
                </p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Sent to Buyers</p>
                <p className="text-xl font-bold text-green-400">
                  {requirements.filter(r => r.status === 'SENT_TO_BUYER').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Selected</p>
                <p className="text-xl font-bold text-white">{selectedQuotes.length}/3</p>
              </div>
              <ThumbsUp className="h-8 w-8 text-slate-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Requirements Queue */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="border-b border-slate-700 pb-3">
            <CardTitle className="text-lg text-white">Requirements Queue</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-700">
              {requirements.map((req) => (
                <div
                  key={req.id}
                  onClick={() => {
                    setSelectedReq(req);
                    setSelectedQuotes([]);
                  }}
                  className={`p-4 cursor-pointer hover:bg-slate-700/50 transition-colors ${
                    selectedReq?.id === req.id ? 'bg-slate-700/50 border-l-2 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-mono text-slate-500">{req.id}</p>
                    <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">
                      {req.quotationsCount} quotes
                    </Badge>
                  </div>
                  <h3 className="font-medium text-white mb-1">{req.productType}</h3>
                  <p className="text-sm text-slate-400">{req.buyerCompany}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {req.quantity.toLocaleString()} {req.unit}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quotation Review */}
        <div className="lg:col-span-3 space-y-4">
          {/* Selection Status Bar */}
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-slate-400">
                    Selected: <strong className="text-white">{selectedQuotes.length}/3</strong> quotations
                  </span>
                  {selectedQuotes.length === 3 ? (
                    <span className="text-green-400 text-sm flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Ready to send to buyer
                    </span>
                  ) : (
                    <span className="text-yellow-400 text-sm">
                      Select exactly 3 quotations to proceed
                    </span>
                  )}
                </div>
                <Button
                  onClick={() => setShowSendModal(true)}
                  disabled={selectedQuotes.length !== 3}
                  className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Top 3 to Buyer
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Requirement Info */}
          {selectedReq && (
            <Card className="bg-gradient-to-r from-blue-900/30 to-slate-900/30 border-blue-500/30">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-mono text-slate-500 mb-1">{selectedReq.id}</p>
                    <h2 className="text-lg font-semibold text-white">{selectedReq.productType}</h2>
                    <p className="text-slate-400">
                      {selectedReq.buyerCompany} • {selectedReq.quantity.toLocaleString()} {selectedReq.unit}
                    </p>
                  </div>
                  <Badge className="bg-blue-500/20 text-blue-400">
                    {selectedReq.quotationsCount} Quotations Received
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quotations List */}
          {selectedReq && (
            <div className="space-y-3">
              <p className="text-sm text-slate-400">
                Review all quotations below and select the TOP 3 BEST based on pricing, quality, delivery time, and supplier reliability.
              </p>
              
              {selectedReq.quotations.map((quote, index) => {
                const isSelected = selectedQuotes.includes(quote.id);
                
                return (
                  <Card 
                    key={quote.id}
                    className={`bg-slate-800 border-slate-700 transition-all cursor-pointer ${
                      isSelected ? 'ring-2 ring-green-500 bg-green-500/5' : 'hover:border-slate-600'
                    }`}
                    onClick={() => toggleQuoteSelection(quote.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Selection Checkbox */}
                        <div className="pt-1">
                          <Checkbox
                            checked={isSelected}
                            disabled={!isSelected && selectedQuotes.length >= 3}
                            className="border-slate-500"
                          />
                        </div>

                        {/* Rank */}
                        <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>

                        {/* Supplier Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-white">{quote.supplierName}</h3>
                            <Badge className={tierColors[quote.supplierTier]}>
                              {quote.supplierTier}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-400 mb-2">{quote.supplierEmail}</p>
                          
                          <div className="flex items-center gap-4 text-sm mb-2">
                            <span className="flex items-center gap-1 text-yellow-400">
                              <Star className="w-4 h-4 fill-current" />
                              {quote.supplierRating}
                            </span>
                            <span className="text-slate-400">
                              {quote.supplierTransactions} orders completed
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {quote.certifications.map((cert) => (
                              <span key={cert} className="px-2 py-0.5 bg-slate-700 text-slate-300 text-xs rounded">
                                {cert}
                              </span>
                            ))}
                          </div>

                          {quote.notes && (
                            <div className="mt-2 p-2 bg-slate-700/50 rounded text-sm text-slate-300">
                              <strong>Notes:</strong> {quote.notes}
                            </div>
                          )}
                        </div>

                        {/* Pricing & Delivery */}
                        <div className="text-right space-y-2">
                          <div>
                            <p className="text-xs text-slate-500">Unit Price</p>
                            <p className="text-lg font-bold text-white">{formatCurrency(quote.unitPrice)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Total Price</p>
                            <p className="text-xl font-bold text-green-400">{formatCurrency(quote.totalPrice)}</p>
                          </div>
                          <div className="flex items-center gap-2 justify-end text-sm">
                            <Clock className="w-4 h-4 text-slate-500" />
                            <span className="text-slate-300">{quote.deliveryDays} days</span>
                          </div>
                          <p className="text-xs text-slate-500">{quote.paymentTerms}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Send to Buyer Modal */}
      <Dialog open={showSendModal} onOpenChange={setShowSendModal}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Send Top 3 Quotations to Buyer</DialogTitle>
            <DialogDescription className="text-slate-400">
              You are about to send the selected 3 quotations to the buyer for their review.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Buyer Info */}
            {selectedReq && (
              <div className="bg-slate-900 rounded-lg p-4">
                <p className="font-medium text-white">{selectedReq.productType}</p>
                <p className="text-sm text-slate-400">
                  Buyer: {selectedReq.buyerCompany} ({selectedReq.buyerEmail})
                </p>
                <p className="text-sm text-slate-500">
                  Quantity: {selectedReq.quantity.toLocaleString()} {selectedReq.unit}
                </p>
              </div>
            )}

            {/* Selected Quotes Summary */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-300">Selected Quotations:</p>
              {getSelectedQuotations().map((quote, index) => (
                <div key={quote.id} className="flex items-center justify-between bg-slate-900 rounded p-3">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-white">{quote.supplierName}</p>
                      <p className="text-xs text-slate-400">
                        {quote.deliveryDays} days • {quote.paymentTerms}
                      </p>
                    </div>
                  </div>
                  <p className="font-bold text-green-400">{formatCurrency(quote.totalPrice)}</p>
                </div>
              ))}
            </div>

            {/* Warning */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
                <div className="text-sm text-yellow-200">
                  <p className="font-medium">Important:</p>
                  <p>The buyer will be notified immediately and can view these 3 quotations in their dashboard. They will select one supplier to proceed with the order.</p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowSendModal(false)} className="border-slate-600 text-slate-300">
              Cancel
            </Button>
            <Button 
              onClick={handleSendToBuyer} 
              disabled={sending}
              className="bg-green-600 hover:bg-green-700"
            >
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Confirm & Send to Buyer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
