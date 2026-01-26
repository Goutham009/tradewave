'use client';

import { useState, useEffect } from 'react';
import { Ban, Search, Plus, Eye, Trash2, Clock, AlertTriangle } from 'lucide-react';

export default function AdminBlacklistPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: 'ACTIVE', search: '', reason: '' });
  const [stats, setStats] = useState<Record<string, number>>({});
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchBlacklist();
  }, [filters.status, filters.reason]);

  const fetchBlacklist = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('status', filters.status);
      if (filters.reason) params.set('reason', filters.reason);
      if (filters.search) params.set('search', filters.search);

      const res = await fetch(`/api/buyer-trust/blacklist?${params}`);
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries || []);
        setStats(data.stats || {});
      }
    } catch (err) {
      console.error('Failed to fetch blacklist:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnblacklist = async (buyerId: string) => {
    if (!confirm('Are you sure you want to remove this buyer from the blacklist?')) return;

    try {
      const res = await fetch(`/api/buyer-trust/${buyerId}/blacklist`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Removed by admin' })
      });

      if (res.ok) {
        fetchBlacklist();
      }
    } catch (err) {
      console.error('Failed to unblacklist:', err);
    }
  };

  const filteredEntries = entries.filter(e => {
    if (!filters.search) return true;
    const search = filters.search.toLowerCase();
    return (
      e.buyer?.name?.toLowerCase().includes(search) ||
      e.buyer?.email?.toLowerCase().includes(search) ||
      e.buyer?.companyName?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Ban className="w-8 h-8" />
            Blacklist Management
          </h1>
          <p className="text-slate-400 mt-1">Manage blacklisted buyers</p>
        </div>
        <button onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add to Blacklist
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {['ACTIVE', 'UNDER_REVIEW', 'APPEALED', 'REMOVED'].map(status => (
          <div key={status} className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <p className="text-slate-400 text-sm">{status.replace('_', ' ')}</p>
            <p className="text-2xl font-bold text-white">{stats[status] || 0}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input type="text" placeholder="Search buyers..."
                value={filters.search} onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white" />
            </div>
          </div>
          <select value={filters.status} onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white">
            <option value="ACTIVE">Active</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="APPEALED">Appealed</option>
            <option value="REMOVED">Removed</option>
            <option value="all">All Status</option>
          </select>
          <select value={filters.reason} onChange={(e) => setFilters(prev => ({ ...prev, reason: e.target.value }))}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white">
            <option value="">All Reasons</option>
            <option value="REPEATED_CHARGEBACKS">Repeated Chargebacks</option>
            <option value="FRAUD_SUSPICION">Fraud Suspicion</option>
            <option value="PAYMENT_FRAUD">Payment Fraud</option>
            <option value="ABUSIVE_BEHAVIOR">Abusive Behavior</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading...</div>
        ) : filteredEntries.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No blacklist entries found</div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Buyer</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Reason</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Severity</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Expires</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-700/50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-white font-medium">{entry.buyer?.companyName || entry.buyer?.name}</p>
                      <p className="text-slate-400 text-sm">{entry.buyer?.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-slate-300">{entry.reason.replace(/_/g, ' ')}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      entry.severity === 'PERMANENT' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {entry.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      entry.status === 'ACTIVE' ? 'bg-red-500/20 text-red-400' :
                      entry.status === 'APPEALED' ? 'bg-purple-500/20 text-purple-400' :
                      entry.status === 'REMOVED' ? 'bg-green-500/20 text-green-400' :
                      'bg-slate-600 text-slate-300'
                    }`}>
                      {entry.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-sm">
                    {new Date(entry.blacklistedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-sm">
                    {entry.expiresAt ? (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(entry.expiresAt).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-red-400">Never</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button className="p-1 hover:bg-slate-600 rounded">
                        <Eye className="w-4 h-4 text-slate-400" />
                      </button>
                      {entry.status === 'ACTIVE' && (
                        <button onClick={() => handleUnblacklist(entry.buyerId)}
                          className="p-1 hover:bg-slate-600 rounded">
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
