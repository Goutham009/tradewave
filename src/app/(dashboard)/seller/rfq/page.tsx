'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Filter, MapPin, Calendar, Package, Eye, Send, Clock } from 'lucide-react';

export default function DiscoverRFQPage() {
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    country: ''
  });
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetchRFQs();
  }, [filters, pagination.page]);

  const fetchRFQs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.category) params.set('category', filters.category);
      if (filters.country) params.set('country', filters.country);
      params.set('page', pagination.page.toString());
      params.set('limit', pagination.limit.toString());

      const res = await fetch(`/api/rfq/discover?${params}`);
      const data = await res.json();
      
      setRfqs(data.rfqs || []);
      setCategories(data.filters?.categories || []);
      setPagination(prev => ({ ...prev, total: data.pagination?.total || 0, pages: data.pagination?.pages || 0 }));
    } catch (err) {
      console.error('Failed to fetch RFQs:', err);
    } finally {
      setLoading(false);
    }
  };

  const daysUntilExpiry = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Discover RFQs</h1>
        <p className="text-gray-600 mt-1">Find opportunities and submit competitive quotes</p>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-lg p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[250px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="text" placeholder="Search RFQs by keyword..."
                value={filters.search} onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border rounded-lg" />
            </div>
          </div>
          <select value={filters.category} onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            className="px-4 py-2 border rounded-lg">
            <option value="">All Categories</option>
            {categories.map((cat: any) => (
              <option key={cat.name} value={cat.name}>{cat.name} ({cat.count})</option>
            ))}
          </select>
          <input type="text" placeholder="Country (e.g., US)"
            value={filters.country} onChange={(e) => setFilters(prev => ({ ...prev, country: e.target.value }))}
            className="px-4 py-2 border rounded-lg w-32" />
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : rfqs.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No RFQs found matching your criteria</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {rfqs.map((rfq: any) => {
            const daysLeft = daysUntilExpiry(rfq.expiresAt);
            const isUrgent = daysLeft <= 3;

            return (
              <div key={rfq.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{rfq.title}</h3>
                      {isUrgent && (
                        <span className="px-2 py-1 bg-red-100 text-red-600 rounded text-xs font-medium">
                          Urgent - {daysLeft} days left
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2">{rfq.description}</p>
                    
                    <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        {rfq.requestedQuantity.toLocaleString()} {rfq.quantityUnit}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {rfq.deliveryCity}, {rfq.deliveryCountry}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Delivery by {new Date(rfq.deliveryDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {rfq.viewCount} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Send className="w-4 h-4" />
                        {rfq._count?.quotes || 0} quotes
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">{rfq.industryCategory}</span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">{rfq.productCategory}</span>
                      {rfq.incoterms && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">{rfq.incoterms}</span>
                      )}
                      {rfq.qualityStandards?.slice(0, 2).map((std: string) => (
                        <span key={std} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">{std}</span>
                      ))}
                    </div>
                  </div>

                  <div className="ml-6 text-right">
                    <p className="text-sm text-gray-500">By {rfq.buyer?.companyName || 'Buyer'}</p>
                    <div className="mt-4 space-y-2">
                      <Link href={`/seller/rfq/${rfq.id}`}
                        className="block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center">
                        View & Quote
                      </Link>
                      <p className="text-xs text-gray-500">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {daysLeft} days left
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
            disabled={pagination.page === 1} className="px-4 py-2 border rounded-lg disabled:opacity-50">
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
            disabled={pagination.page >= pagination.pages} className="px-4 py-2 border rounded-lg disabled:opacity-50">
            Next
          </button>
        </div>
      )}
    </div>
  );
}
