'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Search,
  MoreVertical,
  Eye,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Clock,
  MessageSquare,
  X,
  DollarSign,
  User,
  Building2,
  FileText,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Dispute {
  id: string;
  transactionId: string;
  buyerName: string;
  supplierName: string;
  amount: number;
  currency: string;
  reason: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  requirementTitle: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  OPEN: { label: 'Open', color: 'bg-red-500/20 text-red-400' },
  UNDER_REVIEW: { label: 'Under Review', color: 'bg-yellow-500/20 text-yellow-400' },
  AWAITING_RESPONSE: { label: 'Awaiting Response', color: 'bg-blue-500/20 text-blue-400' },
  RESOLVED: { label: 'Resolved', color: 'bg-green-500/20 text-green-400' },
  ESCALATED: { label: 'Escalated', color: 'bg-purple-500/20 text-purple-400' },
  CLOSED: { label: 'Closed', color: 'bg-slate-500/20 text-slate-400' },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  LOW: { label: 'Low', color: 'bg-slate-500/20 text-slate-400' },
  MEDIUM: { label: 'Medium', color: 'bg-yellow-500/20 text-yellow-400' },
  HIGH: { label: 'High', color: 'bg-orange-500/20 text-orange-400' },
  URGENT: { label: 'Urgent', color: 'bg-red-500/20 text-red-400' },
};

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [resolution, setResolution] = useState('');
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    fetchDisputes();
  }, [statusFilter]);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        ...(statusFilter && { status: statusFilter }),
      });
      
      const response = await fetch(`/api/admin/disputes?${params}`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setDisputes(data.data.disputes);
      }
    } catch (error) {
      console.error('Failed to fetch disputes:', error);
      // Mock data
      setDisputes([
        { id: 'DSP-001', transactionId: 'TXN-2024-003', buyerName: 'Import Hub', supplierName: 'Global Supply', amount: 67200, currency: 'USD', reason: 'Product quality does not match specifications. Received defective units.', status: 'OPEN', priority: 'HIGH', createdAt: '2024-01-18', updatedAt: '2024-01-18', requirementTitle: 'Electronic Parts' },
        { id: 'DSP-002', transactionId: 'TXN-2024-015', buyerName: 'Tech Corp', supplierName: 'Metals Ltd', amount: 34500, currency: 'USD', reason: 'Delivery delayed by 3 weeks without prior notice.', status: 'UNDER_REVIEW', priority: 'MEDIUM', createdAt: '2024-01-15', updatedAt: '2024-01-17', requirementTitle: 'Steel Components' },
        { id: 'DSP-003', transactionId: 'TXN-2024-008', buyerName: 'Mega Industries', supplierName: 'Steel Inc', amount: 89000, currency: 'USD', reason: 'Quantity mismatch - received 800 units instead of 1000.', status: 'AWAITING_RESPONSE', priority: 'HIGH', createdAt: '2024-01-12', updatedAt: '2024-01-16', requirementTitle: 'Industrial Materials' },
        { id: 'DSP-004', transactionId: 'TXN-2024-002', buyerName: 'Trade Co', supplierName: 'Electronics Co', amount: 12300, currency: 'USD', reason: 'Wrong product shipped.', status: 'RESOLVED', priority: 'LOW', createdAt: '2024-01-10', updatedAt: '2024-01-14', requirementTitle: 'Circuit Boards' },
        { id: 'DSP-005', transactionId: 'TXN-2024-022', buyerName: 'Global Imports', supplierName: 'Plastics Ltd', amount: 156000, currency: 'USD', reason: 'Supplier not responding to communication. Need urgent intervention.', status: 'ESCALATED', priority: 'URGENT', createdAt: '2024-01-19', updatedAt: '2024-01-20', requirementTitle: 'Plastic Materials' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveDispute = async () => {
    if (!selectedDispute || !resolution.trim()) return;
    
    setResolving(true);
    try {
      await fetch(`/api/admin/disputes/${selectedDispute.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'RESOLVED', resolution }),
      });
      setSelectedDispute(null);
      setResolution('');
      fetchDisputes();
    } catch (error) {
      console.error('Failed to resolve dispute:', error);
    } finally {
      setResolving(false);
    }
  };

  const handleUpdateStatus = async (disputeId: string, status: string) => {
    try {
      await fetch(`/api/admin/disputes/${disputeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      fetchDisputes();
    } catch (error) {
      console.error('Failed to update dispute:', error);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const filteredDisputes = disputes.filter(d =>
    d.id.toLowerCase().includes(search.toLowerCase()) ||
    d.transactionId.toLowerCase().includes(search.toLowerCase()) ||
    d.buyerName.toLowerCase().includes(search.toLowerCase()) ||
    d.supplierName.toLowerCase().includes(search.toLowerCase())
  );

  const openDisputes = disputes.filter(d => ['OPEN', 'UNDER_REVIEW', 'AWAITING_RESPONSE', 'ESCALATED'].includes(d.status)).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dispute Management</h1>
          <p className="text-slate-400">Manage and resolve transaction disputes</p>
        </div>
        {openDisputes > 0 && (
          <Badge className="bg-red-500/20 text-red-400 text-sm px-3 py-1">
            <AlertTriangle className="mr-2 h-4 w-4" />
            {openDisputes} open dispute{openDisputes > 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Total Disputes</p>
                <p className="text-xl font-bold text-white">{disputes.length}</p>
              </div>
              <FileText className="h-8 w-8 text-slate-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Open</p>
                <p className="text-xl font-bold text-red-400">
                  {disputes.filter(d => d.status === 'OPEN').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Under Review</p>
                <p className="text-xl font-bold text-yellow-400">
                  {disputes.filter(d => d.status === 'UNDER_REVIEW').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Resolved</p>
                <p className="text-xl font-bold text-green-400">
                  {disputes.filter(d => d.status === 'RESOLVED').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
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
                  placeholder="Search disputes..."
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
              <Button
                variant={statusFilter === 'OPEN' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('OPEN')}
                className={statusFilter === 'OPEN' ? 'bg-red-600' : 'border-slate-600 text-slate-300'}
              >
                Open
              </Button>
              <Button
                variant={statusFilter === 'UNDER_REVIEW' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('UNDER_REVIEW')}
                className={statusFilter === 'UNDER_REVIEW' ? 'bg-red-600' : 'border-slate-600 text-slate-300'}
              >
                Under Review
              </Button>
              <Button
                variant={statusFilter === 'ESCALATED' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('ESCALATED')}
                className={statusFilter === 'ESCALATED' ? 'bg-red-600' : 'border-slate-600 text-slate-300'}
              >
                Escalated
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disputes List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-red-500" />
          </div>
        ) : filteredDisputes.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <p className="mt-4 text-slate-400">No disputes found</p>
            </CardContent>
          </Card>
        ) : (
          filteredDisputes.map((dispute) => (
            <Card key={dispute.id} className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm text-white">{dispute.id}</span>
                      <Badge className={STATUS_CONFIG[dispute.status]?.color}>
                        {STATUS_CONFIG[dispute.status]?.label}
                      </Badge>
                      <Badge className={PRIORITY_CONFIG[dispute.priority]?.color}>
                        {PRIORITY_CONFIG[dispute.priority]?.label}
                      </Badge>
                    </div>
                    
                    <p className="text-slate-300">{dispute.reason}</p>
                    
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2 text-slate-400">
                        <User className="h-4 w-4" />
                        <span>Buyer: {dispute.buyerName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <Building2 className="h-4 w-4" />
                        <span>Supplier: {dispute.supplierName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <DollarSign className="h-4 w-4" />
                        <span>{formatCurrency(dispute.amount, dispute.currency)}</span>
                      </div>
                    </div>
                    
                    <p className="text-xs text-slate-500">
                      Transaction: {dispute.transactionId} • {dispute.requirementTitle} • 
                      Created: {new Date(dispute.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedDispute(dispute)}
                      className="border-slate-600 text-slate-300"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Review
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-slate-400">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                        {dispute.status === 'OPEN' && (
                          <DropdownMenuItem 
                            className="text-slate-300 hover:bg-slate-700"
                            onClick={() => handleUpdateStatus(dispute.id, 'UNDER_REVIEW')}
                          >
                            <Clock className="mr-2 h-4 w-4" />
                            Start Review
                          </DropdownMenuItem>
                        )}
                        {['OPEN', 'UNDER_REVIEW', 'AWAITING_RESPONSE'].includes(dispute.status) && (
                          <DropdownMenuItem 
                            className="text-purple-400 hover:bg-slate-700"
                            onClick={() => handleUpdateStatus(dispute.id, 'ESCALATED')}
                          >
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            Escalate
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-slate-300 hover:bg-slate-700">
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Contact Parties
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Resolution Modal */}
      {selectedDispute && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl bg-slate-800 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">Resolve Dispute {selectedDispute.id}</CardTitle>
                  <CardDescription className="text-slate-400">
                    Transaction: {selectedDispute.transactionId}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedDispute(null)}
                  className="text-slate-400"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-slate-900">
                <p className="text-sm font-medium text-slate-400 mb-2">Dispute Reason</p>
                <p className="text-white">{selectedDispute.reason}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-slate-900">
                  <p className="text-sm font-medium text-slate-400 mb-1">Buyer</p>
                  <p className="text-white">{selectedDispute.buyerName}</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-900">
                  <p className="text-sm font-medium text-slate-400 mb-1">Supplier</p>
                  <p className="text-white">{selectedDispute.supplierName}</p>
                </div>
              </div>
              
              <div className="p-4 rounded-lg bg-slate-900">
                <p className="text-sm font-medium text-slate-400 mb-1">Amount at Stake</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(selectedDispute.amount, selectedDispute.currency)}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-400">Resolution Details</label>
                <Textarea
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="Describe the resolution and any actions taken..."
                  rows={4}
                  className="mt-2 bg-slate-900 border-slate-700 text-white"
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedDispute(null)}
                  className="border-slate-600 text-slate-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleResolveDispute}
                  disabled={resolving || !resolution.trim()}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {resolving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resolving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Mark as Resolved
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
