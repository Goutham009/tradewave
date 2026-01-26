'use client';

import { useState, useEffect } from 'react';
import { Building2, TrendingUp, TrendingDown, DollarSign, Package, Star, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface SupplierAnalytics {
  id: string;
  name: string;
  companyName: string | null;
  totalSpent: number;
  orderCount: number;
  avgOrderValue: number;
  trustScore: number | null;
  trend: number;
  lastOrderDate: string;
}

export default function SupplierAnalysisPage() {
  const [suppliers, setSuppliers] = useState<SupplierAnalytics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for demo
    setSuppliers([
      {
        id: '1',
        name: 'John Smith',
        companyName: 'TechParts Global',
        totalSpent: 45000,
        orderCount: 12,
        avgOrderValue: 3750,
        trustScore: 4.8,
        trend: 15,
        lastOrderDate: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Sarah Chen',
        companyName: 'Premium Textiles',
        totalSpent: 32000,
        orderCount: 8,
        avgOrderValue: 4000,
        trustScore: 4.6,
        trend: -5,
        lastOrderDate: new Date(Date.now() - 86400000 * 15).toISOString()
      },
      {
        id: '3',
        name: 'Mike Johnson',
        companyName: 'Industrial Solutions',
        totalSpent: 28500,
        orderCount: 6,
        avgOrderValue: 4750,
        trustScore: 4.9,
        trend: 25,
        lastOrderDate: new Date(Date.now() - 86400000 * 7).toISOString()
      }
    ]);
    setLoading(false);
  }, []);

  const totalSpent = suppliers.reduce((sum, s) => sum + s.totalSpent, 0);
  const totalOrders = suppliers.reduce((sum, s) => sum + s.orderCount, 0);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-gray-500">Loading supplier analytics...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/buyer/analytics" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Supplier Analysis</h1>
          <p className="text-gray-500 mt-1">Detailed breakdown of your supplier spending</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Suppliers</p>
              <p className="text-2xl font-bold text-gray-900">{suppliers.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">${totalSpent.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Supplier Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Supplier Breakdown</h2>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Supplier</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Total Spent</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Orders</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Avg Order</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Trust Score</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Trend</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Last Order</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {suppliers.map((supplier) => (
              <tr key={supplier.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium">
                        {(supplier.companyName || supplier.name).charAt(0)}
                      </span>
                    </div>
                    <span className="font-medium text-gray-900">
                      {supplier.companyName || supplier.name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 font-medium">${supplier.totalSpent.toLocaleString()}</td>
                <td className="px-6 py-4 text-gray-600">{supplier.orderCount}</td>
                <td className="px-6 py-4 text-gray-600">${supplier.avgOrderValue.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span>{supplier.trustScore?.toFixed(1) || 'N/A'}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className={`flex items-center gap-1 ${supplier.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {supplier.trend >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {Math.abs(supplier.trend)}%
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {new Date(supplier.lastOrderDate).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
