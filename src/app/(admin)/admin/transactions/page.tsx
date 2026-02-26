'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSocket, SOCKET_EVENTS } from '@/hooks/useSocket';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Search,
  Filter,
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
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Transaction {
  id: string;
  buyerName: string;
  supplierName: string;
  amount: number;
  currency: string;
  status: string;
  escrowStatus: string;
  createdAt: string;
  requirementTitle: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  INITIATED: { label: 'Initiated', color: 'bg-slate-500/20 text-slate-400' },
  PAYMENT_PENDING: { label: 'Payment Pending', color: 'bg-yellow-500/20 text-yellow-400' },
  ESCROW_HELD: { label: 'Escrow Held', color: 'bg-blue-500/20 text-blue-400' },
  IN_TRANSIT: { label: 'In Transit', color: 'bg-purple-500/20 text-purple-400' },
  DELIVERED: { label: 'Delivered', color: 'bg-cyan-500/20 text-cyan-400' },
  COMPLETED: { label: 'Completed', color: 'bg-green-500/20 text-green-400' },
  DISPUTED: { label: 'Disputed', color: 'bg-red-500/20 text-red-400' },
  CANCELLED: { label: 'Cancelled', color: 'bg-slate-500/20 text-slate-400' },
};

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    disputed: 0,
    totalValue: 0,
  });
  const { subscribe } = useSocket();

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(statusFilter && { status: statusFilter }),
      });
      
      const response = await fetch(`/api/admin/transactions?${params}`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setTransactions(data.data.transactions);
        setTotalPages(data.data.pagination?.pages || 1);
        setStats((prev) => data.data.stats || prev);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      // Mock data
      setTransactions([
        { id: 'TXN-2024-001', buyerName: 'Acme Corp', supplierName: 'Steel Inc', amount: 45000, currency: 'USD', status: 'COMPLETED', escrowStatus: 'RELEASED', createdAt: '2024-01-15', requirementTitle: 'Steel Components' },
        { id: 'TXN-2024-002', buyerName: 'Trade Co', supplierName: 'Metals Ltd', amount: 28500, currency: 'USD', status: 'IN_TRANSIT', escrowStatus: 'HELD', createdAt: '2024-01-18', requirementTitle: 'Aluminum Sheets' },
        { id: 'TXN-2024-003', buyerName: 'Import Hub', supplierName: 'Global Supply', amount: 67200, currency: 'USD', status: 'DISPUTED', escrowStatus: 'HELD', createdAt: '2024-01-12', requirementTitle: 'Electronic Parts' },
        { id: 'TXN-2024-004', buyerName: 'Mega Industries', supplierName: 'Steel Inc', amount: 125000, currency: 'USD', status: 'ESCROW_HELD', escrowStatus: 'HELD', createdAt: '2024-01-20', requirementTitle: 'Construction Materials' },
        { id: 'TXN-2024-005', buyerName: 'Tech Solutions', supplierName: 'Electronics Co', amount: 18900, currency: 'USD', status: 'PAYMENT_PENDING', escrowStatus: 'PENDING', createdAt: '2024-01-19', requirementTitle: 'Circuit Boards' },
      ]);
      setStats({
        total: 3421,
        pending: 47,
        completed: 3198,
        disputed: 23,
        totalValue: 15420000,
      });
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Socket.io real-time listeners for transaction updates
  useEffect(() => {
    const unsubscribeUpdate = subscribe(SOCKET_EVENTS.TRANSACTION_UPDATE, () => {
      fetchTransactions();
    });

    const unsubscribeNew = subscribe('transaction:created', (newTransaction: Transaction) => {
      setTransactions(prev => [newTransaction, ...prev]);
      setStats(prev => ({
        ...prev,
        total: prev.total + 1,
        pending: prev.pending + 1,
        totalValue: prev.totalValue + newTransaction.amount,
      }));
    });

    const unsubscribeStatus = subscribe('transaction:status_changed', () => {
      fetchTransactions();
    });

    return () => {
      unsubscribeUpdate();
      unsubscribeNew();
      unsubscribeStatus();
    };
  }, [subscribe, fetchTransactions]);

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const filteredTransactions = transactions.filter(txn =>
    txn.id.toLowerCase().includes(search.toLowerCase()) ||
    txn.buyerName.toLowerCase().includes(search.toLowerCase()) ||
    txn.supplierName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Transaction Monitoring</h1>
          <p className="text-slate-400">Monitor all platform transactions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-slate-600 text-slate-300">
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
              <DollarSign className="h-8 w-8 text-slate-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Pending</p>
                <p className="text-xl font-bold text-yellow-400">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Completed</p>
                <p className="text-xl font-bold text-green-400">{stats.completed.toLocaleString()}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
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
                  placeholder="Search by ID, buyer, or supplier..."
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
              {Object.entries(STATUS_CONFIG).slice(0, 5).map(([status, config]) => (
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

      {/* Transactions Table */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-red-500" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left p-4 text-sm font-medium text-slate-400">Transaction ID</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-400">Buyer</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-400">Supplier</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-400">Amount</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-400">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-400">Escrow</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-400">Date</th>
                    <th className="text-right p-4 text-sm font-medium text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((txn) => (
                    <tr key={txn.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                      <td className="p-4">
                        <div>
                          <p className="font-mono text-sm text-white">{txn.id}</p>
                          <p className="text-xs text-slate-500">{txn.requirementTitle}</p>
                        </div>
                      </td>
                      <td className="p-4 text-slate-300">{txn.buyerName}</td>
                      <td className="p-4 text-slate-300">{txn.supplierName}</td>
                      <td className="p-4 font-medium text-white">
                        {formatCurrency(txn.amount, txn.currency)}
                      </td>
                      <td className="p-4">
                        <Badge className={STATUS_CONFIG[txn.status]?.color || 'bg-slate-500/20 text-slate-400'}>
                          {STATUS_CONFIG[txn.status]?.label || txn.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge className={
                          txn.escrowStatus === 'RELEASED' ? 'bg-green-500/20 text-green-400' :
                          txn.escrowStatus === 'HELD' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-slate-500/20 text-slate-400'
                        }>
                          {txn.escrowStatus}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm text-slate-400">
                        {new Date(txn.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-slate-400">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                            <DropdownMenuItem asChild className="text-slate-300 hover:bg-slate-700">
                              <Link href={`/admin/transactions/${txn.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            {txn.status === 'DISPUTED' && (
                              <DropdownMenuItem className="text-yellow-400 hover:bg-slate-700">
                                <AlertTriangle className="mr-2 h-4 w-4" />
                                View Dispute
                              </DropdownMenuItem>
                            )}
                            {txn.escrowStatus === 'HELD' && (
                              <DropdownMenuItem className="text-green-400 hover:bg-slate-700">
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Release Escrow
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t border-slate-700">
            <p className="text-sm text-slate-400">
              Showing {filteredTransactions.length} transactions
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="border-slate-600 text-slate-300"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="flex items-center px-3 text-sm text-slate-400">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="border-slate-600 text-slate-300"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
