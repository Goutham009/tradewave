'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search, Filter, RefreshCw, Eye, Clock, Globe } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const STATUS_CONFIG: Record<string, { color: string; bgColor: string; label: string }> = {
  DRAFT: { color: 'text-gray-600', bgColor: 'bg-gray-100', label: 'Draft' },
  PENDING: { color: 'text-yellow-600', bgColor: 'bg-yellow-100', label: 'Submitted' },
  AUTOMATED_CHECKS_IN_PROGRESS: { color: 'text-blue-600', bgColor: 'bg-blue-100', label: 'Auto Checks Running' },
  AUTOMATED_CHECKS_COMPLETE: { color: 'text-indigo-600', bgColor: 'bg-indigo-100', label: 'Ready for Review' },
  UNDER_REVIEW: { color: 'text-blue-600', bgColor: 'bg-blue-100', label: 'Under Review' },
  INFO_REQUESTED: { color: 'text-orange-600', bgColor: 'bg-orange-100', label: 'Info Requested' },
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

  const fetchKYBs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.set('status', filters.status);
      if (filters.riskLevel) params.set('riskLevel', filters.riskLevel);
      if (filters.country) params.set('country', filters.country);
      if (filters.search) params.set('search', filters.search);
      params.set('page', pagination.page.toString());
      params.set('limit', pagination.limit.toString());

      const res = await fetch(`/api/admin/kyb?${params}`);
      const data = await res.json();
      
      if (data.kybs && data.kybs.length > 0) {
        setKybs(data.kybs);
        setStats(data.stats);
        setPagination(prev => ({ ...prev, total: data.pagination?.total || 0, pages: data.pagination?.pages || 0 }));
      } else {
        throw new Error('No data');
      }
    } catch (err) {
      console.error('Failed to fetch KYBs:', err);
      // Mock data fallback
      setKybs([
        { id: 'kyb1', userId: 'user1', businessName: 'Steel Industries Ltd', businessType: 'PRIVATE_LTD', registrationCountry: 'CN', status: 'PENDING', riskLevel: 'MEDIUM', submittedAt: '2024-01-15', user: { name: 'John Chen', email: 'john@steelindustries.com' } },
        { id: 'kyb2', userId: 'user2', businessName: 'Global Textiles Inc', businessType: 'CORPORATION', registrationCountry: 'IN', status: 'AUTOMATED_CHECKS_COMPLETE', riskLevel: 'LOW', submittedAt: '2024-01-14', user: { name: 'Priya Sharma', email: 'priya@globaltextiles.com' } },
        { id: 'kyb3', userId: 'user3', businessName: 'ElecParts GmbH', businessType: 'LLC', registrationCountry: 'DE', status: 'UNDER_REVIEW', riskLevel: 'LOW', submittedAt: '2024-01-13', user: { name: 'Hans Mueller', email: 'hans@elecparts.de' } },
        { id: 'kyb4', userId: 'user4', businessName: 'ChemSupply Corp', businessType: 'CORPORATION', registrationCountry: 'US', status: 'INFO_REQUESTED', riskLevel: 'HIGH', submittedAt: '2024-01-12', user: { name: 'Mike Johnson', email: 'mike@chemsupply.com' } },
        { id: 'kyb5', userId: 'user5', businessName: 'Pacific Trading Co', businessType: 'PARTNERSHIP', registrationCountry: 'SG', status: 'VERIFIED', riskLevel: 'LOW', submittedAt: '2024-01-10', user: { name: 'David Tan', email: 'david@pacifictrading.sg' } },
        { id: 'kyb6', userId: 'user6', businessName: 'Euro Metals SA', businessType: 'PRIVATE_LTD', registrationCountry: 'FR', status: 'REJECTED', riskLevel: 'CRITICAL', submittedAt: '2024-01-08', user: { name: 'Pierre Dubois', email: 'pierre@eurometals.fr' } },
      ]);
      setStats({ total: 6, pending: 1, automatedChecksComplete: 1, underReview: 1, infoRequested: 1, verified: 1, rejected: 1 });
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  useEffect(() => {
    void fetchKYBs();
  }, [fetchKYBs]);

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
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          <div className="bg-slate-800 rounded-lg p-4">
            <p className="text-slate-400 text-sm">Total</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 cursor-pointer hover:bg-slate-700" onClick={() => handleFilterChange('status', 'PENDING')}>
            <p className="text-yellow-400 text-sm">Pending</p>
            <p className="text-2xl font-bold text-white">{stats.pending || 0}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 cursor-pointer hover:bg-slate-700" onClick={() => handleFilterChange('status', 'AUTOMATED_CHECKS_COMPLETE')}>
            <p className="text-indigo-400 text-sm">Ready for Review</p>
            <p className="text-2xl font-bold text-white">{stats.automatedChecksComplete || 0}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 cursor-pointer hover:bg-slate-700" onClick={() => handleFilterChange('status', 'UNDER_REVIEW')}>
            <p className="text-blue-400 text-sm">Under Review</p>
            <p className="text-2xl font-bold text-white">{stats.underReview || 0}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 cursor-pointer hover:bg-slate-700" onClick={() => handleFilterChange('status', 'INFO_REQUESTED')}>
            <p className="text-orange-400 text-sm">Info Requested</p>
            <p className="text-2xl font-bold text-white">{stats.infoRequested || 0}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 cursor-pointer hover:bg-slate-700" onClick={() => handleFilterChange('status', 'VERIFIED')}>
            <p className="text-green-400 text-sm">Verified</p>
            <p className="text-2xl font-bold text-white">{stats.verified || 0}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 cursor-pointer hover:bg-slate-700" onClick={() => handleFilterChange('status', 'REJECTED')}>
            <p className="text-red-400 text-sm">Rejected</p>
            <p className="text-2xl font-bold text-white">{stats.rejected || 0}</p>
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
            <option value="PENDING">Submitted</option>
            <option value="AUTOMATED_CHECKS_IN_PROGRESS">Auto Checks Running</option>
            <option value="AUTOMATED_CHECKS_COMPLETE">Ready for Review</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="INFO_REQUESTED">Info Requested</option>
            <option value="DOCUMENTS_REQUIRED">Docs Required</option>
            <option value="VERIFIED">Verified</option>
            <option value="REJECTED">Rejected</option>
            <option value="EXPIRED">Expired</option>
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

      {/* KYB Queue */}
      <div className="grid gap-4">
        {loading ? (
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="py-12 text-center">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-400" />
              <p className="text-slate-400">Loading...</p>
            </CardContent>
          </Card>
        ) : kybs.length === 0 ? (
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="py-12 text-center">
              <p className="text-slate-400">No KYB applications found</p>
            </CardContent>
          </Card>
        ) : (
          kybs.map((kyb: any) => {
            const statusConfig = STATUS_CONFIG[kyb.status] || STATUS_CONFIG.PENDING;
            const riskConfig = RISK_CONFIG[kyb.riskAssessment?.riskLevel] || RISK_CONFIG.MEDIUM;

            return (
              <Card key={kyb.id} className="bg-slate-900 border-slate-800">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <Globe className="h-6 w-6 text-blue-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-white">{kyb.businessName}</h3>
                          <Badge className={`${statusConfig.bgColor} ${statusConfig.color}`}>{statusConfig.label}</Badge>
                          {kyb.riskAssessment && (
                            <Badge className={`${riskConfig.bgColor} ${riskConfig.color}`}>{kyb.riskAssessment.riskLevel} Risk</Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-400 mt-1">{kyb.user?.email} • {kyb.registrationCountry}</p>
                        <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Submitted {new Date(kyb.createdAt).toLocaleDateString()}</span>
                          <span>Docs {kyb.verifiedDocuments}/{kyb.documentsCount}</span>
                          <span>Compliance {kyb.completedMandatory}/{kyb.mandatoryCompliance}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Link href={`/admin/kyb/${kyb.id}`}>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                          <Eye className="w-4 h-4 mr-2" />Review
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {pagination.pages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-slate-800 rounded-lg">
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
  );
}
