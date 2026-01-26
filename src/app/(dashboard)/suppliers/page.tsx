'use client';

import { useState, useEffect } from 'react';
import { Search, Building2, Star, MapPin, Package, Filter, Heart } from 'lucide-react';
import Link from 'next/link';

interface Supplier {
  id: string;
  name: string;
  companyName: string | null;
  avatar: string | null;
  trustScore: number | null;
  location: string | null;
  categories: string[];
  totalTransactions: number;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    fetchSuppliers();
  }, [search, category]);

  const fetchSuppliers = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      
      const res = await fetch(`/api/suppliers?${params}`);
      const data = await res.json();
      setSuppliers(data.suppliers || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      // Mock data for demo
      setSuppliers([
        {
          id: '1',
          name: 'John Smith',
          companyName: 'TechParts Global',
          avatar: null,
          trustScore: 4.8,
          location: 'Shanghai, China',
          categories: ['Electronics', 'Components'],
          totalTransactions: 245
        },
        {
          id: '2',
          name: 'Sarah Chen',
          companyName: 'Premium Textiles Co.',
          avatar: null,
          trustScore: 4.6,
          location: 'Mumbai, India',
          categories: ['Textiles', 'Fabrics'],
          totalTransactions: 189
        },
        {
          id: '3',
          name: 'Mike Johnson',
          companyName: 'Industrial Solutions Ltd',
          avatar: null,
          trustScore: 4.9,
          location: 'Seoul, South Korea',
          categories: ['Machinery', 'Equipment'],
          totalTransactions: 312
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = async (supplierId: string) => {
    try {
      await fetch('/api/buyer/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'SUPPLIER', supplierId })
      });
    } catch (error) {
      console.error('Error adding to favorites:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Discover Suppliers</h1>
          <p className="text-gray-500 mt-1">Find verified suppliers for your business</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search suppliers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Textiles">Textiles</option>
            <option value="Machinery">Machinery</option>
            <option value="Chemicals">Chemicals</option>
            <option value="Raw Materials">Raw Materials</option>
          </select>
        </div>
      </div>

      {/* Suppliers Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading suppliers...</div>
        </div>
      ) : suppliers.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No suppliers found</h3>
          <p className="text-gray-500">Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suppliers.map((supplier) => (
            <div key={supplier.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    {supplier.avatar ? (
                      <img src={supplier.avatar} alt="" className="w-14 h-14 rounded-xl object-cover" />
                    ) : (
                      <span className="text-white font-bold text-xl">
                        {(supplier.companyName || supplier.name).charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {supplier.companyName || supplier.name}
                    </h3>
                    {supplier.location && (
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <MapPin className="w-3 h-3" />
                        {supplier.location}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => addToFavorites(supplier.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <Heart className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-4 mb-4 text-sm">
                {supplier.trustScore && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-medium">{supplier.trustScore}</span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-gray-500">
                  <Package className="w-4 h-4" />
                  {supplier.totalTransactions} orders
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {supplier.categories?.slice(0, 3).map((cat) => (
                  <span key={cat} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    {cat}
                  </span>
                ))}
              </div>

              <Link
                href={`/suppliers/${supplier.id}`}
                className="block w-full text-center py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium"
              >
                View Profile
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
