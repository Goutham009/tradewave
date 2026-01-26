'use client';

import { useState, useEffect } from 'react';
import { 
  Users, TrendingUp, RefreshCw, AlertTriangle,
  Search, ChevronLeft, ChevronRight, DollarSign, Award
} from 'lucide-react';

interface RepeatBuyer {
  id: string;
  name: string;
  email: string;
  companyName: string;
  totalOrders: number;
  totalSpent: number;
  repeatRate: number;
  churnRisk: string;
  lastOrderAt: string;
  currentTier: string;
}

export default function RepeatBuyersPage() {
  const [buyers, setBuyers] = useState<RepeatBuyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [churnFilter, setChurnFilter] = useState('');

  useEffect(() => {
    // Simulated data - would fetch from API in production
    setBuyers([
      {
        id: '1',
        name: 'John Smith',
        email: 'john@acmecorp.com',
        companyName: 'Acme Corp',
        totalOrders: 47,
        totalSpent: 125000,
        repeatRate: 85,
        churnRisk: 'LOW',
        lastOrderAt: '2026-01-20',
        currentTier: 'GOLD'
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        email: 'sarah@techstart.io',
        companyName: 'TechStart Inc',
        totalOrders: 23,
        totalSpent: 45000,
        repeatRate: 72,
        churnRisk: 'MEDIUM',
        lastOrderAt: '2025-12-15',
        currentTier: 'SILVER'
      },
      {
        id: '3',
        name: 'Michael Chen',
        email: 'mchen@globalind.com',
        companyName: 'Global Industries',
        totalOrders: 89,
        totalSpent: 350000,
        repeatRate: 92,
        churnRisk: 'LOW',
        lastOrderAt: '2026-01-24',
        currentTier: 'PLATINUM'
      },
      {
        id: '4',
        name: 'Emily Davis',
        email: 'emily@retailplus.com',
        companyName: 'Retail Plus',
        totalOrders: 12,
        totalSpent: 18000,
        repeatRate: 45,
        churnRisk: 'HIGH',
        lastOrderAt: '2025-10-05',
        currentTier: 'BRONZE'
      }
    ]);
    setTotalPages(3);
    setLoading(false);
  }, [page, search, churnFilter]);

  const getChurnRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'bg-green-500/20 text-green-400';
      case 'MEDIUM': return 'bg-yellow-500/20 text-yellow-400';
      case 'HIGH': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'BRONZE': return 'text-amber-400';
      case 'SILVER': return 'text-gray-300';
      case 'GOLD': return 'text-yellow-400';
      case 'PLATINUM': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Repeat Buyers</h1>
        <p className="text-gray-400 mt-1">Monitor customer retention and loyalty</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-400" />
            <div>
              <p className="text-2xl font-bold text-white">1,250</p>
              <p className="text-sm text-gray-400">Total Buyers</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-8 h-8 text-green-400" />
            <div>
              <p className="text-2xl font-bold text-white">68%</p>
              <p className="text-sm text-gray-400">Repeat Rate</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-purple-400" />
            <div>
              <p className="text-2xl font-bold text-white">$4.2M</p>
              <p className="text-sm text-gray-400">Repeat Revenue</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-400" />
            <div>
              <p className="text-2xl font-bold text-white">23</p>
              <p className="text-sm text-gray-400">High Churn Risk</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search buyers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <select
          value={churnFilter}
          onChange={(e) => setChurnFilter(e.target.value)}
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Churn Risk</option>
          <option value="LOW">Low Risk</option>
          <option value="MEDIUM">Medium Risk</option>
          <option value="HIGH">High Risk</option>
        </select>
      </div>

      {/* Buyers Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-900 border-b border-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Buyer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Orders</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Total Spent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Repeat Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Tier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Churn Risk</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Last Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {buyers.map((buyer) => (
                <tr key={buyer.id} className="hover:bg-slate-700/50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-white">{buyer.name}</p>
                      <p className="text-sm text-gray-400">{buyer.companyName}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-white">{buyer.totalOrders}</td>
                  <td className="px-6 py-4 text-white">{formatCurrency(buyer.totalSpent)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-slate-600 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${buyer.repeatRate}%` }}
                        />
                      </div>
                      <span className="text-white text-sm">{buyer.repeatRate}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1 ${getTierColor(buyer.currentTier)}`}>
                      <Award className="w-4 h-4" />
                      {buyer.currentTier}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getChurnRiskColor(buyer.churnRisk)}`}>
                      {buyer.churnRisk}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{formatDate(buyer.lastOrderAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1 px-3 py-2 text-gray-400 hover:bg-slate-700 rounded-lg disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          <span className="text-gray-400">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-1 px-3 py-2 text-gray-400 hover:bg-slate-700 rounded-lg disabled:opacity-50"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
