'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSocket, SOCKET_EVENTS } from '@/hooks/useSocket';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Search,
  MoreVertical,
  Eye,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Download,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  FileText,
  Send,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  Star,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Quotation {
  id: string;
  requirementId: string;
  supplierName: string;
  supplierEmail: string;
  buyerName: string;
  buyerEmail: string;
  requirementTitle: string;
  category: string;
  amount: number;
  unitPrice: number;
  quantity: number;
  currency: string;
  status: string;
  validUntil: string;
  createdAt: string;
  updatedAt: string;
  deliveryDays: number;
  rating: number;
  selected?: boolean;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  SUBMITTED: { label: 'Pending Review', color: 'bg-blue-500/20 text-blue-400' },
  VERIFIED: { label: 'Verified', color: 'bg-green-500/20 text-green-400' },
  SHORTLISTED: { label: 'Shortlisted', color: 'bg-purple-500/20 text-purple-400' },
  SENT_TO_BUYER: { label: 'Sent to Buyer', color: 'bg-cyan-500/20 text-cyan-400' },
  ACCEPTED: { label: 'Accepted', color: 'bg-emerald-500/20 text-emerald-400' },
  REJECTED: { label: 'Rejected', color: 'bg-red-500/20 text-red-400' },
  WITHDRAWN: { label: 'Withdrawn', color: 'bg-slate-500/20 text-slate-400' },
  EXPIRED: { label: 'Expired', color: 'bg-yellow-500/20 text-yellow-400' },
};

export default function AdminQuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
    totalValue: 0,
  });
  const { subscribe } = useSocket();

  const fetchQuotations = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(statusFilter && { status: statusFilter }),
      });
      
      const response = await fetch(`/api/admin/quotations?${params}`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setQuotations(data.data.quotations);
        setTotalPages(data.data.pagination?.pages || 1);
        setStats(data.data.stats || stats);
      }
    } catch (error) {
      console.error('Failed to fetch quotations:', error);
      // Mock data - quotations grouped by requirement for admin to verify and send to buyer
      setQuotations([
        { id: 'QUO-2024-001', requirementId: 'REQ-2024-004', supplierName: 'Steel Inc', supplierEmail: 'sales@steelinc.com', buyerName: 'Fashion Hub Ltd', buyerEmail: 'mike@fashion.com', requirementTitle: 'Textile Raw Materials - Cotton', category: 'Textiles', amount: 7200, unitPrice: 3.6, quantity: 2000, currency: 'USD', status: 'SUBMITTED', validUntil: '2024-02-15', createdAt: '2024-01-15', updatedAt: '2024-01-15', deliveryDays: 14, rating: 4.8 },
        { id: 'QUO-2024-002', requirementId: 'REQ-2024-004', supplierName: 'Textile Masters', supplierEmail: 'sales@textilemasters.com', buyerName: 'Fashion Hub Ltd', buyerEmail: 'mike@fashion.com', requirementTitle: 'Textile Raw Materials - Cotton', category: 'Textiles', amount: 7800, unitPrice: 3.9, quantity: 2000, currency: 'USD', status: 'SUBMITTED', validUntil: '2024-02-20', createdAt: '2024-01-18', updatedAt: '2024-01-19', deliveryDays: 10, rating: 4.6 },
        { id: 'QUO-2024-003', requirementId: 'REQ-2024-004', supplierName: 'Cotton World', supplierEmail: 'sales@cottonworld.com', buyerName: 'Fashion Hub Ltd', buyerEmail: 'mike@fashion.com', requirementTitle: 'Textile Raw Materials - Cotton', category: 'Textiles', amount: 6900, unitPrice: 3.45, quantity: 2000, currency: 'USD', status: 'SUBMITTED', validUntil: '2024-02-10', createdAt: '2024-01-12', updatedAt: '2024-01-14', deliveryDays: 21, rating: 4.3 },
        { id: 'QUO-2024-004', requirementId: 'REQ-2024-005', supplierName: 'ChemPro Industries', supplierEmail: 'sales@chempro.com', buyerName: 'Tech Solutions Inc', buyerEmail: 'sarah@tech.com', requirementTitle: 'Chemical Compounds - Industrial', category: 'Chemicals', amount: 2800, unitPrice: 28, quantity: 100, currency: 'USD', status: 'VERIFIED', validUntil: '2024-02-05', createdAt: '2024-01-10', updatedAt: '2024-01-11', deliveryDays: 7, rating: 4.9 },
        { id: 'QUO-2024-005', requirementId: 'REQ-2024-005', supplierName: 'Industrial Chemicals Co', supplierEmail: 'sales@indchem.com', buyerName: 'Tech Solutions Inc', buyerEmail: 'sarah@tech.com', requirementTitle: 'Chemical Compounds - Industrial', category: 'Chemicals', amount: 3100, unitPrice: 31, quantity: 100, currency: 'USD', status: 'VERIFIED', validUntil: '2024-02-25', createdAt: '2024-01-20', updatedAt: '2024-01-20', deliveryDays: 5, rating: 4.7 },
        { id: 'QUO-2024-006', requirementId: 'REQ-2024-005', supplierName: 'SafeChem Ltd', supplierEmail: 'sales@safechem.com', buyerName: 'Tech Solutions Inc', buyerEmail: 'sarah@tech.com', requirementTitle: 'Chemical Compounds - Industrial', category: 'Chemicals', amount: 2950, unitPrice: 29.5, quantity: 100, currency: 'USD', status: 'VERIFIED', validUntil: '2024-02-28', createdAt: '2024-01-21', updatedAt: '2024-01-21', deliveryDays: 10, rating: 4.5 },
        { id: 'QUO-2024-007', requirementId: 'REQ-2024-001', supplierName: 'Steel Industries Ltd', supplierEmail: 'sales@steelindustries.com', buyerName: 'Acme Corporation', buyerEmail: 'john@acme.com', requirementTitle: 'Steel Components for Manufacturing', category: 'Raw Materials', amount: 4800, unitPrice: 4.8, quantity: 1000, currency: 'USD', status: 'SENT_TO_BUYER', validUntil: '2024-02-15', createdAt: '2024-01-22', updatedAt: '2024-01-23', deliveryDays: 12, rating: 4.8 },
      ]);
      setStats({
        total: 1247,
        pending: 234,
        accepted: 892,
        rejected: 121,
        totalValue: 8540000,
      });
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchQuotations();
  }, [fetchQuotations]);

  // Socket.io real-time listeners for quotation updates
  useEffect(() => {
    const unsubscribeUpdate = subscribe(SOCKET_EVENTS.QUOTATION_UPDATE, () => {
      fetchQuotations();
    });

    const unsubscribeNew = subscribe('quotation:submitted', (newQuotation: Quotation) => {
      setQuotations(prev => [newQuotation, ...prev]);
      setStats(prev => ({
        ...prev,
        total: prev.total + 1,
        pending: prev.pending + 1,
        totalValue: prev.totalValue + newQuotation.amount,
      }));
    });

    return () => {
      unsubscribeUpdate();
      unsubscribeNew();
    };
  }, [subscribe, fetchQuotations]);

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const [selectedQuotes, setSelectedQuotes] = useState<string[]>([]);
  const [showSendModal, setShowSendModal] = useState(false);
  const [currentRequirementId, setCurrentRequirementId] = useState<string | null>(null);
  const [sendingToBuyer, setSendingToBuyer] = useState(false);

  const filteredQuotations = quotations.filter(q =>
    q.id.toLowerCase().includes(search.toLowerCase()) ||
    q.supplierName.toLowerCase().includes(search.toLowerCase()) ||
    q.buyerName.toLowerCase().includes(search.toLowerCase()) ||
    q.requirementTitle.toLowerCase().includes(search.toLowerCase())
  );

  // Group quotations by requirement
  const groupedByRequirement = filteredQuotations.reduce((acc, q) => {
    if (!acc[q.requirementId]) {
      acc[q.requirementId] = {
        requirementId: q.requirementId,
        requirementTitle: q.requirementTitle,
        buyerName: q.buyerName,
        buyerEmail: q.buyerEmail,
        category: q.category,
        quotations: []
      };
    }
    acc[q.requirementId].quotations.push(q);
    return acc;
  }, {} as Record<string, { requirementId: string; requirementTitle: string; buyerName: string; buyerEmail: string; category: string; quotations: Quotation[] }>);

  const handleVerifyQuote = (quoteId: string) => {
    setQuotations(prev => prev.map(q => 
      q.id === quoteId ? { ...q, status: 'VERIFIED' } : q
    ));
  };

  const handleRejectQuote = (quoteId: string) => {
    setQuotations(prev => prev.map(q => 
      q.id === quoteId ? { ...q, status: 'REJECTED' } : q
    ));
  };

  const toggleQuoteSelection = (quoteId: string, requirementId: string) => {
    const quotesForReq = selectedQuotes.filter(id => 
      quotations.find(q => q.id === id)?.requirementId === requirementId
    );
    
    if (selectedQuotes.includes(quoteId)) {
      setSelectedQuotes(prev => prev.filter(id => id !== quoteId));
    } else if (quotesForReq.length < 3) {
      setSelectedQuotes(prev => [...prev, quoteId]);
    }
  };

  const openSendModal = (requirementId: string) => {
    setCurrentRequirementId(requirementId);
    setShowSendModal(true);
  };

  const handleSendToBuyer = async () => {
    if (!currentRequirementId) return;
    
    setSendingToBuyer(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const quotesToSend = selectedQuotes.filter(id => 
      quotations.find(q => q.id === id)?.requirementId === currentRequirementId
    );
    
    setQuotations(prev => prev.map(q => 
      quotesToSend.includes(q.id) ? { ...q, status: 'SENT_TO_BUYER' } : q
    ));
    
    setSelectedQuotes(prev => prev.filter(id => !quotesToSend.includes(id)));
    setSendingToBuyer(false);
    setShowSendModal(false);
    setCurrentRequirementId(null);
  };

  const getSelectedCountForRequirement = (requirementId: string) => {
    return selectedQuotes.filter(id => 
      quotations.find(q => q.id === id)?.requirementId === requirementId
    ).length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Quotation Management</h1>
          <p className="text-slate-400">Verify supplier quotations and send best 3 quotes to buyers</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="border-slate-600 text-slate-300"
            onClick={() => fetchQuotations()}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button className="bg-red-600 hover:bg-red-700">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Total</p>
                <p className="text-xl font-bold text-white">{stats.total.toLocaleString()}</p>
              </div>
              <FileText className="h-8 w-8 text-slate-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Pending</p>
                <p className="text-xl font-bold text-blue-400">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Accepted</p>
                <p className="text-xl font-bold text-green-400">{stats.accepted.toLocaleString()}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Rejected</p>
                <p className="text-xl font-bold text-red-400">{stats.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Total Value</p>
                <p className="text-xl font-bold text-white">{formatCurrency(stats.totalValue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input
                  placeholder="Search by ID, supplier, buyer, or requirement..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={statusFilter === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(null)}
                className={statusFilter === null ? 'bg-red-600' : 'border-slate-600 text-slate-300'}
              >
                All
              </Button>
              {Object.entries(STATUS_CONFIG).slice(0, 4).map(([status, config]) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                  className={statusFilter === status ? 'bg-red-600' : 'border-slate-600 text-slate-300'}
                >
                  {config.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quotations Grouped by Requirement */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-red-500" />
        </div>
      ) : Object.keys(groupedByRequirement).length === 0 ? (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-slate-600" />
            <p className="text-slate-400">No quotations found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.values(groupedByRequirement).map((group) => {
            const selectedCount = getSelectedCountForRequirement(group.requirementId);
            const verifiedQuotes = group.quotations.filter(q => q.status === 'VERIFIED' || q.status === 'SHORTLISTED');
            const canSendToBuyer = selectedCount > 0 && selectedCount <= 3;
            const allSent = group.quotations.every(q => q.status === 'SENT_TO_BUYER' || q.status === 'ACCEPTED');

            return (
              <Card key={group.requirementId} className="bg-slate-800 border-slate-700">
                <CardHeader className="border-b border-slate-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-mono text-slate-500">{group.requirementId}</p>
                      <CardTitle className="text-lg text-white">{group.requirementTitle}</CardTitle>
                      <p className="text-sm text-slate-400">{group.buyerName} • {group.category}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {allSent ? (
                        <Badge className="bg-cyan-500/20 text-cyan-400">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Quotes Sent to Buyer
                        </Badge>
                      ) : (
                        <>
                          <span className="text-sm text-slate-400">
                            {selectedCount}/3 selected
                          </span>
                          <Button
                            size="sm"
                            disabled={!canSendToBuyer}
                            onClick={() => openSendModal(group.requirementId)}
                            className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
                          >
                            <Send className="h-4 w-4 mr-1" />
                            Send to Buyer
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-700">
                    {group.quotations.map((q) => {
                      const isSelected = selectedQuotes.includes(q.id);
                      const isVerified = q.status === 'VERIFIED' || q.status === 'SHORTLISTED';
                      const isSent = q.status === 'SENT_TO_BUYER' || q.status === 'ACCEPTED';
                      const isRejected = q.status === 'REJECTED';

                      return (
                        <div 
                          key={q.id} 
                          className={`p-4 flex items-center gap-4 transition-colors ${
                            isSelected ? 'bg-green-500/10' : 'hover:bg-slate-700/30'
                          } ${isRejected ? 'opacity-50' : ''}`}
                        >
                          {!isSent && !isRejected && isVerified && (
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleQuoteSelection(q.id, q.requirementId)}
                              disabled={!isVerified || selectedCount >= 3 && !isSelected}
                              className="border-slate-500"
                            />
                          )}
                          {(isSent || isRejected || !isVerified) && <div className="w-4" />}
                          
                          <div className="flex-1 grid grid-cols-6 gap-4 items-center">
                            <div>
                              <p className="font-medium text-white">{q.supplierName}</p>
                              <p className="text-xs text-slate-500">{q.supplierEmail}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-bold text-white">{formatCurrency(q.amount, q.currency)}</p>
                              <p className="text-xs text-slate-400">{formatCurrency(q.unitPrice, q.currency)}/unit</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-slate-300">{q.deliveryDays} days</p>
                              <p className="text-xs text-slate-500">Delivery</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-yellow-400 flex items-center justify-center gap-1">
                                <Star className="h-3 w-3 fill-yellow-400" />
                                {q.rating}
                              </p>
                              <p className="text-xs text-slate-500">Rating</p>
                            </div>
                            <div className="text-center">
                              <Badge className={STATUS_CONFIG[q.status]?.color || 'bg-slate-500/20 text-slate-400'}>
                                {STATUS_CONFIG[q.status]?.label || q.status}
                              </Badge>
                            </div>
                            <div className="flex justify-end gap-2">
                              {q.status === 'SUBMITTED' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleVerifyQuote(q.id)}
                                    className="border-green-600 text-green-400 hover:bg-green-600/20"
                                  >
                                    <ThumbsUp className="h-4 w-4 mr-1" />
                                    Verify
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleRejectQuote(q.id)}
                                    className="border-red-600 text-red-400 hover:bg-red-600/20"
                                  >
                                    <ThumbsDown className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                              <Button variant="ghost" size="sm" className="text-slate-400">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Send to Buyer Confirmation Modal */}
      <Dialog open={showSendModal} onOpenChange={setShowSendModal}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl">Send Quotes to Buyer</DialogTitle>
            <DialogDescription className="text-slate-400">
              You are about to send {getSelectedCountForRequirement(currentRequirementId || '')} selected quotes to the buyer for their review.
            </DialogDescription>
          </DialogHeader>

          {currentRequirementId && groupedByRequirement[currentRequirementId] && (
            <div className="space-y-4">
              <div className="bg-slate-900 rounded-lg p-4">
                <p className="font-medium text-white">{groupedByRequirement[currentRequirementId].requirementTitle}</p>
                <p className="text-sm text-slate-400">Buyer: {groupedByRequirement[currentRequirementId].buyerName}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-300">Selected Quotes:</p>
                {selectedQuotes
                  .filter(id => quotations.find(q => q.id === id)?.requirementId === currentRequirementId)
                  .map(id => {
                    const quote = quotations.find(q => q.id === id);
                    if (!quote) return null;
                    return (
                      <div key={id} className="flex items-center justify-between bg-slate-900 rounded p-3">
                        <div>
                          <p className="text-white">{quote.supplierName}</p>
                          <p className="text-xs text-slate-400">{quote.deliveryDays} days delivery</p>
                        </div>
                        <p className="font-bold text-white">{formatCurrency(quote.amount, quote.currency)}</p>
                      </div>
                    );
                  })}
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
                  <p className="text-sm text-yellow-200">
                    The buyer will be notified and can review these quotes to make their selection.
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowSendModal(false)} className="border-slate-600 text-slate-300">
              Cancel
            </Button>
            <Button 
              onClick={handleSendToBuyer} 
              disabled={sendingToBuyer}
              className="bg-green-600 hover:bg-green-700"
            >
              {sendingToBuyer ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send to Buyer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
