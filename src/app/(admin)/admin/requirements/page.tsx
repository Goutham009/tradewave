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
  status: 'NEW' | 'SENT_TO_SUPPLIERS' | 'QUOTES_RECEIVED' | 'QUOTES_SENT_TO_BUYER' | 'COMPLETED';
  quantity: number;
  unit: string;
  targetPrice: number | null;
  currency: string;
  deliveryLocation: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  buyer: {
    id: string;
    name: string;
    email: string;
    companyName: string;
  };
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
  NEW: { label: 'New', color: 'bg-blue-500/20 text-blue-400', icon: Package },
  SENT_TO_SUPPLIERS: { label: 'Sent to Suppliers', color: 'bg-purple-500/20 text-purple-400', icon: Send },
  QUOTES_RECEIVED: { label: 'Quotes Received', color: 'bg-yellow-500/20 text-yellow-400', icon: FileText },
  QUOTES_SENT_TO_BUYER: { label: 'Quotes Sent', color: 'bg-cyan-500/20 text-cyan-400', icon: CheckCircle },
  COMPLETED: { label: 'Completed', color: 'bg-green-500/20 text-green-400', icon: CheckCircle },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  LOW: { label: 'Low', color: 'bg-slate-500/20 text-slate-400' },
  MEDIUM: { label: 'Medium', color: 'bg-blue-500/20 text-blue-400' },
  HIGH: { label: 'High', color: 'bg-orange-500/20 text-orange-400' },
  URGENT: { label: 'Urgent', color: 'bg-red-500/20 text-red-400' },
};

const mockRequirements: Requirement[] = [
  { id: 'REQ-2024-001', title: 'Steel Components for Manufacturing', description: 'High-quality steel sheets 2mm thickness', category: 'Raw Materials', status: 'NEW', quantity: 1000, unit: 'kg', targetPrice: 5000, currency: 'USD', deliveryLocation: 'New York, USA', priority: 'HIGH', buyer: { id: 'b1', name: 'John Smith', email: 'john@acme.com', companyName: 'Acme Corporation' }, suppliersContacted: 0, quotesReceived: 0, createdAt: '2024-01-20T10:30:00Z' },
  { id: 'REQ-2024-002', title: 'Electronic Circuit Boards - PCB', description: 'Double-layer PCB boards for IoT devices', category: 'Electronics', status: 'NEW', quantity: 500, unit: 'pieces', targetPrice: 2500, currency: 'USD', deliveryLocation: 'Los Angeles, USA', priority: 'MEDIUM', buyer: { id: 'b2', name: 'Sarah Johnson', email: 'sarah@tech.com', companyName: 'Tech Solutions Inc' }, suppliersContacted: 0, quotesReceived: 0, createdAt: '2024-01-19T14:20:00Z' },
  { id: 'REQ-2024-003', title: 'Industrial Machinery Parts', description: 'Replacement gears and bearings', category: 'Machinery', status: 'SENT_TO_SUPPLIERS', quantity: 50, unit: 'pieces', targetPrice: 15000, currency: 'USD', deliveryLocation: 'Chicago, USA', priority: 'URGENT', buyer: { id: 'b1', name: 'John Smith', email: 'john@acme.com', companyName: 'Acme Corporation' }, suppliersContacted: 5, quotesReceived: 0, createdAt: '2024-01-18T09:15:00Z' },
  { id: 'REQ-2024-004', title: 'Textile Raw Materials - Cotton', description: 'Premium quality cotton fabric', category: 'Textiles', status: 'QUOTES_RECEIVED', quantity: 2000, unit: 'meters', targetPrice: 8000, currency: 'USD', deliveryLocation: 'Miami, USA', priority: 'LOW', buyer: { id: 'b3', name: 'Mike Davis', email: 'mike@fashion.com', companyName: 'Fashion Hub Ltd' }, suppliersContacted: 4, quotesReceived: 3, createdAt: '2024-01-17T16:45:00Z' },
  { id: 'REQ-2024-005', title: 'Chemical Compounds - Industrial', description: 'Sodium hydroxide solution 50%', category: 'Chemicals', status: 'QUOTES_SENT_TO_BUYER', quantity: 100, unit: 'liters', targetPrice: 3000, currency: 'USD', deliveryLocation: 'Houston, USA', priority: 'MEDIUM', buyer: { id: 'b2', name: 'Sarah Johnson', email: 'sarah@tech.com', companyName: 'Tech Solutions Inc' }, suppliersContacted: 3, quotesReceived: 3, createdAt: '2024-01-15T11:00:00Z' },
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
    new: requirements.filter(r => r.status === 'NEW').length,
    sentToSuppliers: requirements.filter(r => r.status === 'SENT_TO_SUPPLIERS').length,
    quotesReceived: requirements.filter(r => r.status === 'QUOTES_RECEIVED').length,
    completed: requirements.filter(r => r.status === 'COMPLETED' || r.status === 'QUOTES_SENT_TO_BUYER').length,
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
        <Card className="bg-slate-800 border-slate-700">
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
        <Card className="bg-slate-800 border-slate-700 cursor-pointer hover:border-blue-500/50" onClick={() => setStatusFilter('NEW')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">New Requirements</p>
                <p className="text-2xl font-bold text-blue-400">{stats.new}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700 cursor-pointer hover:border-purple-500/50" onClick={() => setStatusFilter('SENT_TO_SUPPLIERS')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Sent to Suppliers</p>
                <p className="text-2xl font-bold text-purple-400">{stats.sentToSuppliers}</p>
              </div>
              <Send className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700 cursor-pointer hover:border-yellow-500/50" onClick={() => setStatusFilter('QUOTES_RECEIVED')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Quotes Received</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.quotesReceived}</p>
              </div>
              <FileText className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700 cursor-pointer hover:border-green-500/50" onClick={() => setStatusFilter('QUOTES_SENT_TO_BUYER')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Completed</p>
                <p className="text-2xl font-bold text-green-400">{stats.completed}</p>
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
                <SelectItem value="NEW">New</SelectItem>
                <SelectItem value="SENT_TO_SUPPLIERS">Sent to Suppliers</SelectItem>
                <SelectItem value="QUOTES_RECEIVED">Quotes Received</SelectItem>
                <SelectItem value="QUOTES_SENT_TO_BUYER">Quotes Sent</SelectItem>
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
                          <span className="text-slate-300">{formatCurrency(req.targetPrice, req.currency)}</span>
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
                        <Button variant="ghost" size="sm" className="text-slate-400">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {req.status === 'NEW' && (
                          <Button 
                            size="sm" 
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => handleOpenSupplierModal(req)}
                          >
                            <Send className="h-4 w-4 mr-1" />
                            Send to Suppliers
                          </Button>
                        )}
                        {req.status === 'QUOTES_RECEIVED' && (
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => window.location.href = '/admin/quotations'}
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
