'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { RotateCcw, Package, Clock, CheckCircle, XCircle, AlertTriangle, Plus, Eye } from 'lucide-react';

interface ReturnRequest {
  id: string;
  transactionId: string;
  orderNumber: string;
  reason: string;
  status: string;
  createdAt: string;
  amount: number;
  items: number;
}

export default function ReturnsPage() {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for demo
    setReturns([
      {
        id: 'RET-2024-001',
        transactionId: 'TXN-2024-001',
        orderNumber: 'PO-2024-001',
        reason: 'Defective product',
        status: 'PROCESSING',
        createdAt: new Date().toISOString(),
        amount: 1250,
        items: 5,
      },
      {
        id: 'RET-2024-002',
        transactionId: 'TXN-2024-002',
        orderNumber: 'PO-2024-002',
        reason: 'Wrong item delivered',
        status: 'APPROVED',
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        amount: 890,
        items: 2,
      },
      {
        id: 'RET-2026-001',
        transactionId: 'TXN-S-003',
        orderNumber: 'SO-2026-003',
        reason: 'Transit packaging damage',
        status: 'REVIEW_REQUIRED',
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        amount: 2100,
        items: 3,
      },
    ]);
    setLoading(false);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'REJECTED': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'PROCESSING': return <Clock className="w-5 h-5 text-yellow-500" />;
      default: return <AlertTriangle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-700';
      case 'REJECTED': return 'bg-red-100 text-red-700';
      case 'PROCESSING': return 'bg-yellow-100 text-yellow-700';
      case 'REVIEW_REQUIRED': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-gray-500">Loading returns...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Returns & Claims</h1>
          <p className="text-gray-500 mt-1">Manage your return requests and claims</p>
        </div>
        <Link href="/returns/new" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          New Return Request
        </Link>
      </div>

      {returns.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <RotateCcw className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No returns or claims</h3>
          <p className="text-gray-500">You haven&rsquo;t submitted any return requests yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Return ID</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Order</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Reason</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Items</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {returns.map((ret) => (
                <tr key={ret.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm">{ret.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-gray-400" />
                      <Link href={`/orders/${ret.transactionId}`} className="font-medium text-blue-600 hover:underline">
                        {ret.orderNumber}
                      </Link>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{ret.reason}</td>
                  <td className="px-6 py-4 text-gray-600">{ret.items} items</td>
                  <td className="px-6 py-4 font-medium">${ret.amount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ret.status)}`}>
                      {getStatusIcon(ret.status)}
                      {ret.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(ret.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/returns/${ret.id}`} className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700">
                      <Eye className="w-4 h-4" />
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
