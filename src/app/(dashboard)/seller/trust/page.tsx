'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, Shield, Users, Flag, Ban, TrendingDown, Search, Filter } from 'lucide-react';
import { RiskIndicator } from '@/components/trust-score/RiskIndicator';

interface RiskyBuyer {
  id: string;
  buyerId: string;
  buyer: {
    id: string;
    name: string;
    email: string;
    companyName: string;
  };
  overallScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  riskCategory: string | null;
  totalTransactions: number;
  totalDisputes: number;
  _count?: { flags: number };
}

export default function SellerRiskyBuyersDashboard() {
  const [buyers, setBuyers] = useState<RiskyBuyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ riskLevel: 'HIGH', search: '' });
  const [stats, setStats] = useState({ highRisk: 0, mediumRisk: 0, totalFlags: 0, blacklisted: 0 });

  useEffect(() => {
    fetchRiskyBuyers();
  }, [filters.riskLevel]);

  const fetchRiskyBuyers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/buyer-trust/risky-buyers?riskLevel=${filters.riskLevel}`);
      if (res.ok) {
        const data = await res.json();
        setBuyers(data.buyers || []);
        setStats(data.stats || { highRisk: 0, mediumRisk: 0, totalFlags: 0, blacklisted: 0 });
      }
    } catch (err) {
      console.error('Failed to fetch risky buyers:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredBuyers = buyers.filter(b => {
    if (!filters.search) return true;
    const search = filters.search.toLowerCase();
    return (
      b.buyer.name.toLowerCase().includes(search) ||
      b.buyer.email.toLowerCase().includes(search) ||
      b.buyer.companyName?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="w-8 h-8" />
          Buyer Risk Dashboard
        </h1>
        <p className="text-gray-600 mt-1">Monitor and manage risky buyers you&rsquo;ve transacted with</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-sm font-medium">High Risk</span>
          </div>
          <p className="text-2xl font-bold mt-1">{stats.highRisk}</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-600">
            <TrendingDown className="w-5 h-5" />
            <span className="text-sm font-medium">Medium Risk</span>
          </div>
          <p className="text-2xl font-bold mt-1">{stats.mediumRisk}</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-orange-600">
            <Flag className="w-5 h-5" />
            <span className="text-sm font-medium">Active Flags</span>
          </div>
          <p className="text-2xl font-bold mt-1">{stats.totalFlags}</p>
        </div>
        <div className="bg-gray-900 text-white rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Ban className="w-5 h-5" />
            <span className="text-sm font-medium">Blacklisted</span>
          </div>
          <p className="text-2xl font-bold mt-1">{stats.blacklisted}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-lg p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="text" placeholder="Search buyers..."
                value={filters.search} onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border rounded-lg" />
            </div>
          </div>
          <select value={filters.riskLevel} onChange={(e) => setFilters(prev => ({ ...prev, riskLevel: e.target.value }))}
            className="px-4 py-2 border rounded-lg">
            <option value="HIGH">High Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="all">All Risk Levels</option>
          </select>
        </div>
      </div>

      {/* Buyers Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : filteredBuyers.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No risky buyers found</p>
            <p className="text-sm text-gray-400 mt-1">Good news! Your buyer portfolio looks healthy.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Buyer</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Risk Level</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Score</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Transactions</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Disputes</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Flags</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredBuyers.map((buyer) => (
                <tr key={buyer.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{buyer.buyer.companyName || buyer.buyer.name}</p>
                      <p className="text-sm text-gray-500">{buyer.buyer.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <RiskIndicator riskLevel={buyer.riskLevel} size="sm" showTooltip={false} />
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-medium ${
                      buyer.overallScore >= 70 ? 'text-green-600' :
                      buyer.overallScore >= 40 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {buyer.overallScore}/100
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{buyer.totalTransactions}</td>
                  <td className="px-4 py-3">
                    <span className={`text-sm ${buyer.totalDisputes > 0 ? 'text-red-600 font-medium' : ''}`}>
                      {buyer.totalDisputes}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {buyer._count?.flags ? (
                      <span className="px-2 py-1 bg-red-100 text-red-600 rounded text-xs font-medium">
                        {buyer._count.flags}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/seller/trust/${buyer.buyerId}`}
                      className="text-blue-600 hover:underline text-sm">
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
