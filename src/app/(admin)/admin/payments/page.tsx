'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  Search,
  RefreshCw,
  ArrowUpRight,
  Eye,
  AlertTriangle,
  Building2,
  User,
} from 'lucide-react';
import Link from 'next/link';

interface Transaction {
  id: string;
  orderId: string;
  requirementTitle: string;
  buyer: { name: string; company: string; email: string };
  supplier: { name: string; company: string; email: string };
  amount: number;
  adminMargin: number;
  supplierAmount: number;
  currency: string;
  status: 'PAYMENT_PENDING' | 'BUYER_PAID' | 'IN_ESCROW' | 'SUPPLIER_PAID' | 'COMPLETED' | 'REFUNDED' | 'DISPUTED';
  paymentMethod: string;
  buyerPaidAt?: string;
  supplierPaidAt?: string;
  createdAt: string;
  type: 'BUYER_PAYMENT' | 'SUPPLIER_PAYOUT';
}

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'TXN-2024-001',
    orderId: 'ORD-2024-001',
    requirementTitle: 'Steel Coils - Grade A',
    buyer: { name: 'John Smith', company: 'Acme Corporation', email: 'john@acmecorp.com' },
    supplier: { name: 'Zhang Wei', company: 'Shanghai Steel Works', email: 'supplier1@steelworks.cn' },
    amount: 25000,
    adminMargin: 2500,
    supplierAmount: 22500,
    currency: 'USD',
    status: 'PAYMENT_PENDING',
    paymentMethod: 'Bank Transfer',
    createdAt: '2024-02-15T10:00:00Z',
    type: 'BUYER_PAYMENT',
  },
  {
    id: 'TXN-2024-002',
    orderId: 'ORD-2024-002',
    requirementTitle: 'Cotton Fabric - Premium',
    buyer: { name: 'Lisa Wang', company: 'Global Imports LLC', email: 'lisa@globalimports.com' },
    supplier: { name: 'Rajesh Kumar', company: 'Premium Textiles India', email: 'supplier2@textiles.in' },
    amount: 15000,
    adminMargin: 1500,
    supplierAmount: 13500,
    currency: 'USD',
    status: 'BUYER_PAID',
    paymentMethod: 'Wire Transfer',
    buyerPaidAt: '2024-02-14T14:30:00Z',
    createdAt: '2024-02-12T09:00:00Z',
    type: 'BUYER_PAYMENT',
  },
  {
    id: 'TXN-2024-003',
    orderId: 'ORD-2024-003',
    requirementTitle: 'Electronic Components',
    buyer: { name: 'Wei Lin', company: 'Asia Mart Pte Ltd', email: 'wei@asiamart.sg' },
    supplier: { name: 'Chen Ming', company: 'Taiwan Electronics Co', email: 'supplier3@electronics.tw' },
    amount: 8000,
    adminMargin: 800,
    supplierAmount: 7200,
    currency: 'USD',
    status: 'IN_ESCROW',
    paymentMethod: 'Escrow',
    buyerPaidAt: '2024-02-10T11:00:00Z',
    createdAt: '2024-02-08T15:00:00Z',
    type: 'BUYER_PAYMENT',
  },
  {
    id: 'TXN-2024-004',
    orderId: 'ORD-2024-003',
    requirementTitle: 'Electronic Components',
    buyer: { name: 'Wei Lin', company: 'Asia Mart Pte Ltd', email: 'wei@asiamart.sg' },
    supplier: { name: 'Chen Ming', company: 'Taiwan Electronics Co', email: 'supplier3@electronics.tw' },
    amount: 7200,
    adminMargin: 0,
    supplierAmount: 7200,
    currency: 'USD',
    status: 'SUPPLIER_PAID',
    paymentMethod: 'Bank Transfer',
    supplierPaidAt: '2024-02-12T16:00:00Z',
    createdAt: '2024-02-08T15:00:00Z',
    type: 'SUPPLIER_PAYOUT',
  },
  {
    id: 'TXN-2024-005',
    orderId: 'ORD-2024-004',
    requirementTitle: 'Industrial Chemicals',
    buyer: { name: 'Hans Mueller', company: 'Euro Traders GmbH', email: 'hans@eurotraders.eu' },
    supplier: { name: 'Klaus Schmidt', company: 'Deutsche Chemicals AG', email: 'supplier4@chemicals.de' },
    amount: 12000,
    adminMargin: 1200,
    supplierAmount: 10800,
    currency: 'USD',
    status: 'DISPUTED',
    paymentMethod: 'Escrow',
    buyerPaidAt: '2024-02-05T09:00:00Z',
    createdAt: '2024-02-01T10:00:00Z',
    type: 'BUYER_PAYMENT',
  },
];

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PAYMENT_PENDING: { label: 'Awaiting Payment', color: 'bg-yellow-500/20 text-yellow-400' },
  BUYER_PAID: { label: 'Buyer Paid', color: 'bg-blue-500/20 text-blue-400' },
  IN_ESCROW: { label: 'In Escrow', color: 'bg-purple-500/20 text-purple-400' },
  SUPPLIER_PAID: { label: 'Supplier Paid', color: 'bg-green-500/20 text-green-400' },
  COMPLETED: { label: 'Completed', color: 'bg-emerald-500/20 text-emerald-400' },
  REFUNDED: { label: 'Refunded', color: 'bg-orange-500/20 text-orange-400' },
  DISPUTED: { label: 'Disputed', color: 'bg-red-500/20 text-red-400' },
};

export default function PaymentsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('all');

  const stats = {
    totalProcessed: transactions.filter(t => t.status === 'COMPLETED' || t.status === 'SUPPLIER_PAID').reduce((sum, t) => sum + t.amount, 0),
    pendingPayments: transactions.filter(t => t.status === 'PAYMENT_PENDING').reduce((sum, t) => sum + t.amount, 0),
    inEscrow: transactions.filter(t => t.status === 'IN_ESCROW' || t.status === 'BUYER_PAID').reduce((sum, t) => sum + t.amount, 0),
    totalMargin: transactions.reduce((sum, t) => sum + t.adminMargin, 0),
    disputed: transactions.filter(t => t.status === 'DISPUTED').length,
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = 
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.orderId.toLowerCase().includes(search.toLowerCase()) ||
      t.buyer.company.toLowerCase().includes(search.toLowerCase()) ||
      t.supplier.company.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'buyer' && t.type === 'BUYER_PAYMENT') ||
      (activeTab === 'supplier' && t.type === 'SUPPLIER_PAYOUT');
    return matchesSearch && matchesStatus && matchesTab;
  });

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Payment Management</h1>
          <p className="text-slate-400">Manage buyer payments, escrow, and supplier payouts</p>
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
                <p className="text-xs text-slate-400">Total Processed</p>
                <p className="text-xl font-bold text-green-400">{formatCurrency(stats.totalProcessed)}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Pending Payments</p>
                <p className="text-xl font-bold text-yellow-400">{formatCurrency(stats.pendingPayments)}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">In Escrow</p>
                <p className="text-xl font-bold text-purple-400">{formatCurrency(stats.inEscrow)}</p>
              </div>
              <ArrowUpRight className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Total Margin</p>
                <p className="text-xl font-bold text-white">{formatCurrency(stats.totalMargin)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Disputed</p>
                <p className="text-xl font-bold text-red-400">{stats.disputed}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="all" className="data-[state=active]:bg-red-600">All Transactions</TabsTrigger>
          <TabsTrigger value="buyer" className="data-[state=active]:bg-red-600">Buyer Payments</TabsTrigger>
          <TabsTrigger value="supplier" className="data-[state=active]:bg-red-600">Supplier Payouts</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input
                  placeholder="Search by ID, order, buyer, or supplier..."
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
                {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left p-4 text-sm font-medium text-slate-400">Transaction</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-400">Parties</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-400">Amount</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-400">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-400">Date</th>
                  <th className="text-right p-4 text-sm font-medium text-slate-400">Open</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((t) => {
                  return (
                    <tr key={t.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                      <td className="p-4">
                        <div>
                          <p className="font-mono text-xs text-slate-500">{t.id}</p>
                          <p className="font-medium text-white">{t.requirementTitle}</p>
                          <p className="text-xs text-slate-400">{t.orderId}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3 text-blue-400" />
                            <span className="text-sm text-slate-300">{t.buyer.company}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-3 w-3 text-purple-400" />
                            <span className="text-sm text-slate-300">{t.supplier.company}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="text-lg font-bold text-white">{formatCurrency(t.amount, t.currency)}</p>
                          {t.adminMargin > 0 && (
                            <p className="text-xs text-green-400">+{formatCurrency(t.adminMargin)} margin</p>
                          )}
                          <p className="text-xs text-slate-500">{t.paymentMethod}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={STATUS_CONFIG[t.status]?.color}>
                          {STATUS_CONFIG[t.status]?.label}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-slate-300">{new Date(t.createdAt).toLocaleDateString()}</p>
                        {t.buyerPaidAt && (
                          <p className="text-xs text-slate-500">Paid: {new Date(t.buyerPaidAt).toLocaleDateString()}</p>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <Link href={`/admin/payments/${t.id}`}>
                          <Button variant="outline" size="sm" className="border-slate-600 text-slate-200">
                            Open Details
                            <ArrowUpRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No transactions found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
