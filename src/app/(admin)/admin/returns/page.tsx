'use client';

import { useState, useEffect } from 'react';
import { 
  Package, Clock, CheckCircle, XCircle, Truck, 
  Search, Eye, RefreshCw
} from 'lucide-react';

interface Return {
  id: string;
  transactionId: string;
  reason: string;
  description: string;
  condition: string;
  status: string;
  refundAmount: number;
  netRefundAmount: number;
  requestedAt: string;
  approvedAt?: string;
  transaction: {
    id: string;
    amount: number;
    buyer: {
      id: string;
      name: string;
      email: string;
    };
    supplier: {
      companyName: string;
    };
  };
}

export default function AdminReturnsPage() {
  const [returns, setReturns] = useState<Return[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('REQUESTED');
  const [selectedReturn, setSelectedReturn] = useState<Return | null>(null);

  useEffect(() => {
    fetchReturns();
  }, [filter]);

  const fetchReturns = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/returns?status=${filter}`);
      const data = await res.json();
      setReturns(data.returns || []);
    } catch (error) {
      console.error('Failed to fetch returns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (returnId: string, approve: boolean, rejectionReason?: string) => {
    try {
      const res = await fetch(`/api/returns/${returnId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approve, rejectionReason })
      });

      if (res.ok) {
        fetchReturns();
        setSelectedReturn(null);
      }
    } catch (error) {
      console.error('Failed to process return:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'REFUNDED': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'REJECTED': return <XCircle className="w-5 h-5 text-red-400" />;
      case 'SHIPPED_BACK': 
      case 'RECEIVED': return <Truck className="w-5 h-5 text-blue-400" />;
      default: return <Clock className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'REFUNDED': return 'bg-green-500/20 text-green-400';
      case 'REJECTED': 
      case 'CANCELLED': return 'bg-red-500/20 text-red-400';
      case 'APPROVED':
      case 'SHIPPED_BACK':
      case 'RECEIVED': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-yellow-500/20 text-yellow-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Return Management</h1>
          <p className="text-slate-400">Review and process return requests</p>
        </div>
        <button
          onClick={fetchReturns}
          className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 flex-wrap">
        {['REQUESTED', 'APPROVED', 'SHIPPED_BACK', 'RECEIVED', 'REFUNDED', 'REJECTED', ''].map((status) => (
          <button
            key={status || 'all'}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {status || 'All'}
          </button>
        ))}
      </div>

      {/* Returns Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : returns.length === 0 ? (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-8 text-center">
          <Package className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Returns Found</h3>
          <p className="text-slate-400">
            {filter ? `No ${filter.toLowerCase()} returns` : 'No returns to display'}
          </p>
        </div>
      ) : (
        <div className="bg-slate-900 rounded-xl border border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left p-4 text-slate-400 font-medium">Transaction</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Buyer</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Seller</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Reason</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Amount</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Status</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Requested</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {returns.map((ret) => (
                  <tr key={ret.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                    <td className="p-4">
                      <p className="text-white font-mono text-sm">{ret.transactionId.slice(0, 8)}...</p>
                    </td>
                    <td className="p-4">
                      <p className="text-white">{ret.transaction.buyer.name}</p>
                      <p className="text-slate-400 text-sm">{ret.transaction.buyer.email}</p>
                    </td>
                    <td className="p-4 text-slate-300">
                      {ret.transaction.supplier.companyName}
                    </td>
                    <td className="p-4">
                      <span className="text-white">{ret.reason.replace(/_/g, ' ')}</span>
                    </td>
                    <td className="p-4">
                      <p className="text-white font-semibold">${Number(ret.netRefundAmount).toLocaleString()}</p>
                      <p className="text-slate-400 text-sm">of ${Number(ret.refundAmount).toLocaleString()}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(ret.status)}
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(ret.status)}`}>
                          {ret.status}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-300">
                      {new Date(ret.requestedAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => setSelectedReturn(ret)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Return Detail Modal */}
      {selectedReturn && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl border border-slate-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-800">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Return Details</h2>
                <button
                  onClick={() => setSelectedReturn(null)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-400">Buyer</label>
                  <p className="text-white">{selectedReturn.transaction.buyer.name}</p>
                  <p className="text-slate-400 text-sm">{selectedReturn.transaction.buyer.email}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Seller</label>
                  <p className="text-white">{selectedReturn.transaction.supplier.companyName}</p>
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-400">Reason</label>
                <p className="text-white">{selectedReturn.reason.replace(/_/g, ' ')}</p>
              </div>

              <div>
                <label className="text-sm text-slate-400">Description</label>
                <p className="text-slate-300 bg-slate-800 rounded-lg p-3">
                  {selectedReturn.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-400">Item Condition</label>
                  <p className="text-white">{selectedReturn.condition}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Status</label>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedReturn.status)}`}>
                    {selectedReturn.status}
                  </span>
                </div>
              </div>

              <div className="bg-slate-800 rounded-lg p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-slate-400">Original Amount</span>
                  <span className="text-white">${Number(selectedReturn.refundAmount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-slate-400">Restocking Fee</span>
                  <span className="text-red-400">
                    -${(Number(selectedReturn.refundAmount) - Number(selectedReturn.netRefundAmount)).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-700">
                  <span className="text-white font-semibold">Net Refund</span>
                  <span className="text-green-400 font-semibold">
                    ${Number(selectedReturn.netRefundAmount).toLocaleString()}
                  </span>
                </div>
              </div>

              {selectedReturn.status === 'REQUESTED' && (
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => handleApprove(selectedReturn.id, true)}
                    className="flex-1 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium"
                  >
                    Approve Return
                  </button>
                  <button
                    onClick={() => handleApprove(selectedReturn.id, false, 'Return rejected by admin')}
                    className="flex-1 py-3 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium"
                  >
                    Reject Return
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
