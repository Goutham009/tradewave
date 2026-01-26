'use client';

import { useState } from 'react';
import { Clock, Eye, CheckCircle, XCircle, Package } from 'lucide-react';

const MOCK_ORDERS = [
  { id: 'ORD001', buyer: 'Acme Corp', seller: 'Tech Supplies', amount: 15000, items: 5, status: 'PENDING_REVIEW', createdAt: '2024-01-15' },
  { id: 'ORD002', buyer: 'Global Inc', seller: 'Office Pro', amount: 8500, items: 3, status: 'PENDING_APPROVAL', createdAt: '2024-01-14' },
  { id: 'ORD003', buyer: 'StartupXYZ', seller: 'Industrial Co', amount: 25000, items: 12, status: 'FLAGGED', createdAt: '2024-01-13' },
];

export default function PendingOrdersPage() {
  const [orders] = useState(MOCK_ORDERS);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Pending Orders</h1>
          <p className="text-slate-400">Orders requiring admin review</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/20 rounded-full">
          <Clock className="w-4 h-4 text-yellow-400" />
          <span className="text-yellow-400 text-sm font-medium">{orders.length} pending</span>
        </div>
      </div>

      <div className="grid gap-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-slate-900 rounded-xl border border-slate-800 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-800 rounded-lg">
                  <Package className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold">{order.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      order.status === 'FLAGGED' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm">{order.buyer} → {order.seller}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-semibold">${order.amount.toLocaleString()}</div>
                <div className="text-slate-400 text-sm">{order.items} items</div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800">
              <span className="text-slate-500 text-sm">Submitted {order.createdAt}</span>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 text-sm flex items-center gap-1">
                  <Eye className="w-4 h-4" /> Review
                </button>
                <button className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 rounded-lg text-green-400 text-sm flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> Approve
                </button>
                <button className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 text-sm flex items-center gap-1">
                  <XCircle className="w-4 h-4" /> Reject
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
