'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  RefreshCw,
  Loader2,
  Package,
  Eye,
  Send,
  Building2,
  Users,
  Clock,
  CheckCircle,
  FileText,
  Filter,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  MapPin,
  DollarSign,
} from 'lucide-react';

interface Requirement {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'PENDING_AM_VERIFICATION' | 'PENDING_ADMIN_REVIEW' | 'VERIFIED' | 'QUOTES_PENDING' | 'QUOTATIONS_READY' | 'ACCEPTED' | 'COMPLETED';
  quantity: number;
  unit: string;
  budgetMin: number | null;
  budgetMax: number | null;
  currency: string;
  deliveryLocation: string;
  deliveryDeadline: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  amVerified: boolean;
  adminReviewed: boolean;
  buyer: {
    id: string;
    name: string;
    email: string;
    companyName: string;
  };
  accountManager?: { id: string; name: string };
  suppliersContacted: number;
  quotesReceived: number;
  createdAt: string;
}

interface Supplier {
  id: string;
  name: string;
  companyName: string;
  email: string;
  category: string[];
  rating: number;
  location: string;
  matchScore?: number;
  previousOrders: number;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  PENDING_AM_VERIFICATION: { label: 'Pending AM', color: 'bg-slate-500/20 text-slate-400', icon: Clock },
  PENDING_ADMIN_REVIEW: { label: 'Pending Review', color: 'bg-blue-500/20 text-blue-400', icon: Package },
  VERIFIED: { label: 'Verified', color: 'bg-purple-500/20 text-purple-400', icon: CheckCircle },
  QUOTES_PENDING: { label: 'Quotes Pending', color: 'bg-yellow-500/20 text-yellow-400', icon: Send },
  QUOTATIONS_READY: { label: 'Quotes Ready', color: 'bg-cyan-500/20 text-cyan-400', icon: FileText },
  ACCEPTED: { label: 'Accepted', color: 'bg-green-500/20 text-green-400', icon: CheckCircle },
  COMPLETED: { label: 'Completed', color: 'bg-green-500/20 text-green-400', icon: CheckCircle },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  LOW: { label: 'Low', color: 'bg-slate-500/20 text-slate-400' },
  MEDIUM: { label: 'Medium', color: 'bg-blue-500/20 text-blue-400' },
  HIGH: { label: 'High', color: 'bg-orange-500/20 text-orange-400' },
  URGENT: { label: 'Urgent', color: 'bg-red-500/20 text-red-400' },
};

const mockRequirements: Requirement[] = [
  { id: 'REQ-2024-001', title: 'Steel Coils - Grade A', description: 'Hot rolled steel coils for automotive manufacturing', category: 'Steel', status: 'PENDING_ADMIN_REVIEW', quantity: 500, unit: 'tons', budgetMin: 400, budgetMax: 450, currency: 'USD', deliveryLocation: 'Detroit, USA', deliveryDeadline: '2024-03-15', priority: 'HIGH', amVerified: true, adminReviewed: false, buyer: { id: 'b1', name: 'John Smith', email: 'john@acmecorp.com', companyName: 'Acme Corporation' }, accountManager: { id: 'am1', name: 'Sarah Johnson' }, suppliersContacted: 0, quotesReceived: 0, createdAt: '2024-02-15T10:30:00Z' },
  { id: 'REQ-2024-002', title: 'Cotton Fabric - Premium Quality', description: '100% cotton fabric for garment production', category: 'Textiles', status: 'VERIFIED', quantity: 10000, unit: 'meters', budgetMin: 2, budgetMax: 3, currency: 'USD', deliveryLocation: 'Los Angeles, USA', deliveryDeadline: '2024-03-20', priority: 'MEDIUM', amVerified: true, adminReviewed: true, buyer: { id: 'b2', name: 'Lisa Wang', email: 'lisa@globalimports.com', companyName: 'Global Imports LLC' }, accountManager: { id: 'am1', name: 'Sarah Johnson' }, suppliersContacted: 0, quotesReceived: 0, createdAt: '2024-02-14T14:20:00Z' },
  { id: 'REQ-2024-003', title: 'Electronic Components - Capacitors', description: 'Ceramic capacitors 100uF, 50V', category: 'Electronics', status: 'QUOTES_PENDING', quantity: 50000, unit: 'pcs', budgetMin: 0.05, budgetMax: 0.08, currency: 'USD', deliveryLocation: 'Singapore', deliveryDeadline: '2024-03-10', priority: 'HIGH', amVerified: true, adminReviewed: true, buyer: { id: 'b3', name: 'Wei Lin', email: 'wei@asiamart.sg', companyName: 'Asia Mart Pte Ltd' }, accountManager: { id: 'am2', name: 'Michael Chen' }, suppliersContacted: 3, quotesReceived: 2, createdAt: '2024-02-10T09:15:00Z' },
  { id: 'REQ-2024-004', title: 'Industrial Chemicals - Sulfuric Acid', description: 'Technical grade sulfuric acid 98%', category: 'Chemicals', status: 'PENDING_AM_VERIFICATION', quantity: 100, unit: 'tons', budgetMin: 200, budgetMax: 250, currency: 'USD', deliveryLocation: 'Houston, USA', deliveryDeadline: '2024-04-15', priority: 'LOW', amVerified: false, adminReviewed: false, buyer: { id: 'b1', name: 'John Smith', email: 'john@acmecorp.com', companyName: 'Acme Corporation' }, accountManager: { id: 'am1', name: 'Sarah Johnson' }, suppliersContacted: 0, quotesReceived: 0, createdAt: '2024-02-12T16:45:00Z' },
  { id: 'REQ-2024-005', title: 'Aluminum Sheets - Aircraft Grade', description: '2024-T3 aluminum alloy sheets', category: 'Metals', status: 'QUOTATIONS_READY', quantity: 200, unit: 'sheets', budgetMin: 150, budgetMax: 200, currency: 'USD', deliveryLocation: 'Seattle, USA', deliveryDeadline: '2024-03-25', priority: 'URGENT', amVerified: true, adminReviewed: true, buyer: { id: 'b4', name: 'Robert Brown', email: 'robert@aerospace.com', companyName: 'Aerospace Parts Inc' }, accountManager: { id: 'am2', name: 'Michael Chen' }, suppliersContacted: 4, quotesReceived: 4, createdAt: '2024-02-08T11:00:00Z' },
];

const mockSuppliers: Supplier[] = [
  { id: 's1', name: 'Steel Industries Ltd', companyName: 'Steel Industries Ltd', email: 'sales@steelindustries.com', category: ['Raw Materials', 'Metals'], rating: 4.8, location: 'Pennsylvania, USA', matchScore: 95, previousOrders: 45 },
  { id: 's2', name: 'Global Metals Corp', companyName: 'Global Metals Corp', email: 'orders@globalmetals.com', category: ['Raw Materials', 'Metals'], rating: 4.6, location: 'Ohio, USA', matchScore: 88, previousOrders: 32 },
  { id: 's3', name: 'Premier Steel Supply', companyName: 'Premier Steel Supply', email: 'info@premiersteel.com', category: ['Raw Materials'], rating: 4.5, location: 'Indiana, USA', matchScore: 82, previousOrders: 28 },
  { id: 's4', name: 'MetalWorks Inc', companyName: 'MetalWorks Inc', email: 'sales@metalworks.com', category: ['Raw Materials', 'Machinery'], rating: 4.3, location: 'Michigan, USA', matchScore: 75, previousOrders: 15 },
  { id: 's5', name: 'Industrial Supplies Co', companyName: 'Industrial Supplies Co', email: 'contact@industrialsupplies.com', category: ['Raw Materials', 'Chemicals'], rating: 4.2, location: 'Texas, USA', matchScore: 70, previousOrders: 22 },
];

export default function AdminRequirementsPage() {
  const [requirements, setRequirements] = useState<Requirement[]>(mockRequirements);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [selectedRequirement, setSelectedRequirement] = useState<Requirement | null>(null);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers);
  const [sendingToSuppliers, setSendingToSuppliers] = useState(false);

  const stats = {
    total: requirements.length,
    pendingReview: requirements.filter(r => r.status === 'PENDING_ADMIN_REVIEW').length,
    verified: requirements.filter(r => r.status === 'VERIFIED').length,
    quotesPending: requirements.filter(r => r.status === 'QUOTES_PENDING').length,
    quotationsReady: requirements.filter(r => r.status === 'QUOTATIONS_READY').length,
  };

  const handleApproveAndSendToProcurement = async (reqId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/requirements/${reqId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', sendTo: 'procurement' }),
      });
      if (response.ok) {
        setRequirements(prev => prev.map(req => 
          req.id === reqId ? { ...req, status: 'VERIFIED' as const, adminReviewed: true } : req
        ));
      }
    } catch (error) {
      console.error('Failed to approve requirement:', error);
    }
    setLoading(false);
  };

  const filteredRequirements = requirements.filter(req => {
    const matchesSearch = req.title.toLowerCase().includes(search.toLowerCase()) ||
      req.id.toLowerCase().includes(search.toLowerCase()) ||
      req.buyer.companyName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenSupplierModal = (requirement: Requirement) => {
    setSelectedRequirement(requirement);
    setSelectedSuppliers([]);
    setShowSupplierModal(true);
  };

  const handleAutoMatch = () => {
    // Auto-select top 3 suppliers based on match score
    const topSuppliers = [...suppliers]
      .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
      .slice(0, 3)
      .map(s => s.id);
    setSelectedSuppliers(topSuppliers);
  };

  const handleSendToSuppliers = async () => {
    if (!selectedRequirement || selectedSuppliers.length === 0) return;
    
    setSendingToSuppliers(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setRequirements(prev => prev.map(req => 
      req.id === selectedRequirement.id 
        ? { ...req, status: 'SENT_TO_SUPPLIERS' as const, suppliersContacted: selectedSuppliers.length }
        : req
    ));
    
    setSendingToSuppliers(false);
    setShowSupplierModal(false);
    setSelectedRequirement(null);
    setSelectedSuppliers([]);
  };

  const toggleSupplier = (supplierId: string) => {
    setSelectedSuppliers(prev => 
      prev.includes(supplierId) 
        ? prev.filter(id => id !== supplierId)
        : [...prev, supplierId]
    );
  };

  const formatCurrency = (amount: number | null, currency: string = 'USD') => {
    if (amount === null) return '-';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Requirement Management</h1>
          <p className="text-slate-400">Review and send buyer requirements to suppliers</p>
        </div>
        <Button variant="outline" className="border-slate-600 text-slate-300" onClick={() => setLoading(true)}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="bg-slate-800 border-slate-700 cursor-pointer hover:border-slate-500/50" onClick={() => setStatusFilter('all')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Total</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <Package className="h-8 w-8 text-slate-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700 cursor-pointer hover:border-blue-500/50" onClick={() => setStatusFilter('PENDING_ADMIN_REVIEW')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Pending Review</p>
                <p className="text-2xl font-bold text-blue-400">{stats.pendingReview}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700 cursor-pointer hover:border-purple-500/50" onClick={() => setStatusFilter('VERIFIED')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Verified (Ready)</p>
                <p className="text-2xl font-bold text-purple-400">{stats.verified}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700 cursor-pointer hover:border-yellow-500/50" onClick={() => setStatusFilter('QUOTES_PENDING')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Quotes Pending</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.quotesPending}</p>
              </div>
              <Send className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700 cursor-pointer hover:border-cyan-500/50" onClick={() => setStatusFilter('QUOTATIONS_READY')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Quotes Ready</p>
                <p className="text-2xl font-bold text-cyan-400">{stats.quotationsReady}</p>
              </div>
              <FileText className="h-8 w-8 text-cyan-600" />
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
                  placeholder="Search by ID, title, or company..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="PENDING_AM_VERIFICATION">Pending AM</SelectItem>
                <SelectItem value="PENDING_ADMIN_REVIEW">Pending Review</SelectItem>
                <SelectItem value="VERIFIED">Verified</SelectItem>
                <SelectItem value="QUOTES_PENDING">Quotes Pending</SelectItem>
                <SelectItem value="QUOTATIONS_READY">Quotes Ready</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Requirements List */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left p-4 text-sm font-medium text-slate-400">Requirement</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-400">Buyer</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-400">Details</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-400">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-400">Suppliers</th>
                  <th className="text-right p-4 text-sm font-medium text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequirements.map((req) => (
                  <tr key={req.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                    <td className="p-4">
                      <div>
                        <p className="font-mono text-xs text-slate-500">{req.id}</p>
                        <p className="font-medium text-white truncate max-w-[250px]">{req.title}</p>
                        <p className="text-xs text-slate-400">{req.category}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-slate-300">{req.buyer.companyName}</p>
                        <p className="text-xs text-slate-500">{req.buyer.email}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Package className="h-3 w-3 text-slate-500" />
                          <span className="text-slate-300">{req.quantity} {req.unit}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="h-3 w-3 text-slate-500" />
                          <span className="text-slate-300">
                            {req.budgetMin && req.budgetMax 
                              ? `${formatCurrency(req.budgetMin, req.currency)} - ${formatCurrency(req.budgetMax, req.currency)}`
                              : formatCurrency(req.budgetMin || req.budgetMax, req.currency)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-3 w-3 text-slate-500" />
                          <span className="text-slate-400 text-xs">{req.deliveryLocation}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-2">
                        <Badge className={STATUS_CONFIG[req.status]?.color}>
                          {STATUS_CONFIG[req.status]?.label}
                        </Badge>
                        <Badge className={PRIORITY_CONFIG[req.priority]?.color}>
                          {req.priority}
                        </Badge>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <p className="text-slate-300">{req.suppliersContacted} contacted</p>
                        <p className="text-slate-400">{req.quotesReceived} quotes</p>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" className="text-slate-400" onClick={() => window.location.href = `/admin/requirements/${req.id}`}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {req.status === 'PENDING_ADMIN_REVIEW' && (
                          <Button 
                            size="sm" 
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => handleApproveAndSendToProcurement(req.id)}
                            disabled={loading}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve & Send to Procurement
                          </Button>
                        )}
                        {req.status === 'VERIFIED' && (
                          <Button 
                            size="sm" 
                            className="bg-purple-600 hover:bg-purple-700"
                            onClick={() => handleOpenSupplierModal(req)}
                          >
                            <Send className="h-4 w-4 mr-1" />
                            Send to Suppliers
                          </Button>
                        )}
                        {req.status === 'QUOTATIONS_READY' && (
                          <Button 
                            size="sm" 
                            className="bg-cyan-600 hover:bg-cyan-700"
                            onClick={() => window.location.href = `/admin/quotations?requirementId=${req.id}`}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            Review Quotes
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredRequirements.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No requirements found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Supplier Selection Modal */}
      <Dialog open={showSupplierModal} onOpenChange={setShowSupplierModal}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Select Suppliers</DialogTitle>
            <DialogDescription className="text-slate-400">
              Choose suppliers to send this requirement to. You can auto-match or manually select.
            </DialogDescription>
          </DialogHeader>

          {selectedRequirement && (
            <div className="bg-slate-900 rounded-lg p-4 mb-4">
              <p className="font-medium text-white">{selectedRequirement.title}</p>
              <p className="text-sm text-slate-400">{selectedRequirement.category} • {selectedRequirement.quantity} {selectedRequirement.unit}</p>
            </div>
          )}

          <div className="flex gap-2 mb-4">
            <Button onClick={handleAutoMatch} variant="outline" className="border-slate-600 text-slate-300">
              <Sparkles className="h-4 w-4 mr-2 text-yellow-400" />
              Auto-Match Top 3
            </Button>
            <Button onClick={() => setSelectedSuppliers([])} variant="outline" className="border-slate-600 text-slate-300">
              Clear Selection
            </Button>
          </div>

          <div className="space-y-2">
            {suppliers.map((supplier) => (
              <div
                key={supplier.id}
                className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedSuppliers.includes(supplier.id)
                    ? 'bg-red-500/10 border-red-500/50'
                    : 'bg-slate-900 border-slate-700 hover:border-slate-600'
                }`}
                onClick={() => toggleSupplier(supplier.id)}
              >
                <div className="flex items-center gap-4">
                  <Checkbox
                    checked={selectedSuppliers.includes(supplier.id)}
                    onCheckedChange={() => toggleSupplier(supplier.id)}
                    className="border-slate-500"
                  />
                  <div>
                    <p className="font-medium text-white">{supplier.companyName}</p>
                    <p className="text-sm text-slate-400">{supplier.location} • {supplier.previousOrders} orders</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {supplier.matchScore && (
                    <Badge className="bg-green-500/20 text-green-400">
                      {supplier.matchScore}% match
                    </Badge>
                  )}
                  <div className="text-right">
                    <p className="text-sm text-yellow-400">★ {supplier.rating}</p>
                    <p className="text-xs text-slate-500">{supplier.category.join(', ')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowSupplierModal(false)} className="border-slate-600 text-slate-300">
              Cancel
            </Button>
            <Button 
              onClick={handleSendToSuppliers} 
              disabled={selectedSuppliers.length === 0 || sendingToSuppliers}
              className="bg-red-600 hover:bg-red-700"
            >
              {sendingToSuppliers ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send to {selectedSuppliers.length} Supplier{selectedSuppliers.length !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
