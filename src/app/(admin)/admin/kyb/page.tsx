'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, Eye, CheckCircle, XCircle, Clock, AlertTriangle, Globe } from 'lucide-react';
import Link from 'next/link';

const STATUS_CONFIG: Record<string, { color: string; bgColor: string; label: string }> = {
  PENDING: { color: 'text-yellow-600', bgColor: 'bg-yellow-100', label: 'Pending' },
  UNDER_REVIEW: { color: 'text-blue-600', bgColor: 'bg-blue-100', label: 'Under Review' },
  DOCUMENTS_REQUIRED: { color: 'text-orange-600', bgColor: 'bg-orange-100', label: 'Docs Required' },
  VERIFIED: { color: 'text-green-600', bgColor: 'bg-green-100', label: 'Verified' },
  REJECTED: { color: 'text-red-600', bgColor: 'bg-red-100', label: 'Rejected' },
  SUSPENDED: { color: 'text-gray-600', bgColor: 'bg-gray-100', label: 'Suspended' },
  EXPIRED: { color: 'text-gray-600', bgColor: 'bg-gray-100', label: 'Expired' }
};

const RISK_CONFIG: Record<string, { color: string; bgColor: string }> = {
  LOW: { color: 'text-green-600', bgColor: 'bg-green-100' },
  MEDIUM: { color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  HIGH: { color: 'text-orange-600', bgColor: 'bg-orange-100' },
  CRITICAL: { color: 'text-red-600', bgColor: 'bg-red-100' }
};

export default function AdminKYBDashboard() {
  const [kybs, setKybs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    riskLevel: '',
    country: '',
    search: ''
  });
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });

  useEffect(() => {
    fetchKYBs();
  }, [filters, pagination.page]);

  const fetchKYBs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.set('status', filters.status);
      if (filters.riskLevel) params.set('riskLevel', filters.riskLevel);
      if (filters.country) params.set('country', filters.country);
      if (filters.search) params.set('search', filters.search);
      params.set('page', pagination.page.toString());
      params.set('limit', pagination.limit.toString());

      const res = await fetch(`/api/kyb/admin/dashboard?${params}`);
      const data = await res.json();
      
      setKybs(data.kybs || []);
      setStats(data.stats);
      setPagination(prev => ({ ...prev, total: data.pagination?.total || 0, pages: data.pagination?.pages || 0 }));
    } catch (err) {
      console.error('Failed to fetch KYBs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">KYB Verification Dashboard</h1>
        <p className="text-slate-400">Manage business verification applications</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-slate-800 rounded-lg p-4">
            <p className="text-slate-400 text-sm">Total</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4">
            <p className="text-yellow-400 text-sm">Pending</p>
            <p className="text-2xl font-bold text-white">{stats.pending}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4">
            <p className="text-blue-400 text-sm">Under Review</p>
            <p className="text-2xl font-bold text-white">{stats.underReview}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4">
            <p className="text-green-400 text-sm">Verified</p>
            <p className="text-2xl font-bold text-white">{stats.verified}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4">
            <p className="text-red-400 text-sm">Rejected</p>
            <p className="text-2xl font-bold text-white">{stats.rejected}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input type="text" placeholder="Search business name, tax ID..."
                value={filters.search} onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400" />
            </div>
          </div>
          <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white">
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="DOCUMENTS_REQUIRED">Docs Required</option>
            <option value="VERIFIED">Verified</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <select value={filters.riskLevel} onChange={(e) => handleFilterChange('riskLevel', e.target.value)}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white">
            <option value="">All Risk Levels</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
          <button onClick={fetchKYBs} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* KYB List */}
      <div className="bg-slate-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Business</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Country</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Risk</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Docs</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Compliance</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Submitted</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                  Loading...
                </td>
              </tr>
            ) : kybs.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                  No KYB applications found
                </td>
              </tr>
            ) : (
              kybs.map((kyb: any) => {
                const statusConfig = STATUS_CONFIG[kyb.status] || STATUS_CONFIG.PENDING;
                const riskConfig = RISK_CONFIG[kyb.riskAssessment?.riskLevel] || RISK_CONFIG.MEDIUM;

                return (
                  <tr key={kyb.id} className="hover:bg-slate-700/50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-white">{kyb.businessName}</p>
                        <p className="text-sm text-slate-400">{kyb.user?.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Globe className="w-4 h-4" />
                        {kyb.registrationCountry}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {kyb.riskAssessment ? (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${riskConfig.bgColor} ${riskConfig.color}`}>
                          {kyb.riskAssessment.riskLevel}
                        </span>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {kyb.verifiedDocuments}/{kyb.documentsCount}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {kyb.completedMandatory}/{kyb.mandatoryCompliance}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-sm">
                      {new Date(kyb.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/kyb/${kyb.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                        <Eye className="w-4 h-4" />
                        Review
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 bg-slate-700">
            <p className="text-sm text-slate-400">
              Showing {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                disabled={pagination.page === 1}
                className="px-3 py-1 bg-slate-600 text-white rounded disabled:opacity-50">
                Previous
              </button>
              <button onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                disabled={pagination.page >= pagination.pages}
                className="px-3 py-1 bg-slate-600 text-white rounded disabled:opacity-50">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
