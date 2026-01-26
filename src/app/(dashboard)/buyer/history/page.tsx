'use client';

import { useState, useEffect } from 'react';
import { 
  Package, Calendar, DollarSign, Star, Download, 
  RefreshCw, Filter, Search, ChevronLeft, ChevronRight 
} from 'lucide-react';

interface Purchase {
  id: string;
  productName: string;
  productCategory: string;
  quantityOrdered: number;
  quantityUnit: string;
  unitPrice: string;
  totalAmount: string;
  currency: string;
  orderedAt: string;
  deliveryDate: string;
  rating: number | null;
  isRepeatProduct: boolean;
  repeatCount: number;
  supplier: {
    id: string;
    name: string;
    companyName: string;
    avatar: string | null;
  };
  transaction: {
    id: string;
    orderNumber: string;
    status: string;
  };
}

export default function PurchaseHistoryPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    supplierId: '',
    category: '',
    startDate: '',
    endDate: ''
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [suppliers, setSuppliers] = useState<{ id: string; name: string; companyName: string }[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchPurchases();
  }, [page, filters]);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(filters.supplierId && { supplierId: filters.supplierId }),
        ...(filters.category && { category: filters.category }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate })
      });

      const res = await fetch(`/api/buyer/purchase-history?${params}`);
      const data = await res.json();

      setPurchases(data.purchases || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setCategories(data.filters?.categories || []);
      setSuppliers(data.filters?.suppliers || []);
    } catch (error) {
      console.error('Error fetching purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    window.open(`/api/buyer/purchase-history/export?format=csv`, '_blank');
  };

  const handleReorder = (purchase: Purchase) => {
    window.location.href = `/buyer/saved-quotes/new?from=${purchase.id}`;
  };

  const formatCurrency = (amount: string, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(parseFloat(amount));
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Purchase History</h1>
          <p className="text-gray-500 mt-1">View and manage your past orders</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <a
            href="/buyer/analytics"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            View Analytics
          </a>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={filters.supplierId}
            onChange={(e) => setFilters({ ...filters, supplierId: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Suppliers</option>
            {suppliers.map((sup) => (
              <option key={sup.id} value={sup.id}>{sup.companyName || sup.name}</option>
            ))}
          </select>

          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={() => setFilters({ supplierId: '', category: '', startDate: '', endDate: '' })}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Purchase List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : purchases.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No purchases found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {purchases.map((purchase) => (
                <tr key={purchase.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{purchase.productName}</p>
                      <p className="text-sm text-gray-500">{purchase.productCategory}</p>
                      {purchase.isRepeatProduct && (
                        <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                          <RefreshCw className="w-3 h-3" />
                          Repeat ({purchase.repeatCount}x)
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-900">{purchase.supplier.companyName || purchase.supplier.name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-900">{purchase.quantityOrdered} {purchase.quantityUnit}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">
                      {formatCurrency(purchase.totalAmount, purchase.currency)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatCurrency(purchase.unitPrice, purchase.currency)}/{purchase.quantityUnit}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-900">{formatDate(purchase.orderedAt)}</p>
                    <p className="text-sm text-gray-500">
                      Delivered: {formatDate(purchase.deliveryDate)}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    {purchase.rating ? (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-gray-900">{purchase.rating}</span>
                      </div>
                    ) : (
                      <button className="text-blue-600 text-sm hover:underline">
                        Rate
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleReorder(purchase)}
                      className="flex items-center gap-1 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg text-sm"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Reorder
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <span className="text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
