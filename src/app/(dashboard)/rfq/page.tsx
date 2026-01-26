'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, FileText, Clock, CheckCircle, XCircle, Archive, Eye } from 'lucide-react';

const STATUS_CONFIG: Record<string, { color: string; bgColor: string; icon: any }> = {
  DRAFT: { color: 'text-gray-600', bgColor: 'bg-gray-100', icon: FileText },
  PUBLISHED: { color: 'text-blue-600', bgColor: 'bg-blue-100', icon: Clock },
  IN_REVIEW: { color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: Eye },
  CLOSED: { color: 'text-green-600', bgColor: 'bg-green-100', icon: CheckCircle },
  ARCHIVED: { color: 'text-gray-500', bgColor: 'bg-gray-50', icon: Archive }
};

export default function RFQListPage() {
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({});
  const [filters, setFilters] = useState({ status: 'all', search: '' });
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });

  useEffect(() => {
    fetchRFQs();
  }, [filters, pagination.page]);

  const fetchRFQs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status !== 'all') params.set('status', filters.status);
      if (filters.search) params.set('search', filters.search);
      params.set('page', pagination.page.toString());
      params.set('limit', pagination.limit.toString());

      const res = await fetch(`/api/rfq?${params}`);
      const data = await res.json();
      
      setRfqs(data.rfqs || []);
      setStats(data.stats || {});
      setPagination(prev => ({ ...prev, total: data.pagination?.total || 0, pages: data.pagination?.pages || 0 }));
    } catch (err) {
      console.error('Failed to fetch RFQs:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalRFQs = Object.values(stats).reduce((a: number, b: any) => a + (b || 0), 0) as number;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Request for Quotes</h1>
          <p className="text-gray-600 mt-1">Manage your RFQs and view submitted quotes</p>
        </div>
        <Link href="/rfq/create" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-5 h-5" />
          Create RFQ
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-gray-500 text-sm">Total</p>
          <p className="text-2xl font-bold">{totalRFQs}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-gray-500 text-sm">Draft</p>
          <p className="text-2xl font-bold">{stats.DRAFT || 0}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-blue-500 text-sm">Published</p>
          <p className="text-2xl font-bold">{stats.PUBLISHED || 0}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-green-500 text-sm">Closed</p>
          <p className="text-2xl font-bold">{stats.CLOSED || 0}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-gray-400 text-sm">Archived</p>
          <p className="text-2xl font-bold">{stats.ARCHIVED || 0}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-lg p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="text" placeholder="Search RFQs..."
                value={filters.search} onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border rounded-lg" />
            </div>
          </div>
          <select value={filters.status} onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-4 py-2 border rounded-lg">
            <option value="all">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="CLOSED">Closed</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      {/* RFQ List */}
      <div className="bg-white border rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : rfqs.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No RFQs found</p>
            <Link href="/rfq/create" className="text-blue-600 hover:underline mt-2 inline-block">Create your first RFQ</Link>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">RFQ</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Category</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Quantity</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Delivery</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Quotes</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Expires</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rfqs.map((rfq: any) => {
                const statusConfig = STATUS_CONFIG[rfq.status] || STATUS_CONFIG.DRAFT;
                const StatusIcon = statusConfig.icon;
                const isExpired = new Date(rfq.expiresAt) < new Date();

                return (
                  <tr key={rfq.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{rfq.title}</p>
                        <p className="text-sm text-gray-500">{rfq.rfqNumber}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{rfq.productCategory}</td>
                    <td className="px-4 py-3 text-sm">{rfq.requestedQuantity.toLocaleString()} {rfq.quantityUnit}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{rfq.deliveryCity}, {rfq.deliveryCountry}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {rfq.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium">{rfq._count?.quotes || 0}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm ${isExpired ? 'text-red-500' : 'text-gray-600'}`}>
                        {new Date(rfq.expiresAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/rfq/${rfq.id}`} className="text-blue-600 hover:underline text-sm">View</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t">
            <p className="text-sm text-gray-600">
              Showing {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                disabled={pagination.page === 1} className="px-3 py-1 border rounded disabled:opacity-50">Previous</button>
              <button onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                disabled={pagination.page >= pagination.pages} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
