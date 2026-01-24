'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, Search, Trash2, Download, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

interface EmailBounce {
  id: string;
  email: string;
  bounceType: 'PERMANENT' | 'TEMPORARY';
  reason: string | null;
  bouncedAt: string;
  createdAt: string;
}

export default function EmailBouncesPage() {
  const [bounces, setBounces] = useState<EmailBounce[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const fetchBounces = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '20' });
      if (search) params.set('email', search);
      if (typeFilter) params.set('type', typeFilter);
      const res = await fetch(`/api/emails/bounces?${params}`);
      if (res.ok) {
        const data = await res.json();
        setBounces(data.bounces);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotal(data.pagination?.total || data.bounces.length);
      }
    } catch (err) {
      console.error('Failed to fetch bounces:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, typeFilter]);

  useEffect(() => {
    fetchBounces();
  }, [fetchBounces]);

  const removeBounce = async (id: string) => {
    if (!confirm('Remove this email from bounce list? They will be able to receive emails again.')) return;
    try {
      const res = await fetch(`/api/emails/bounces/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchBounces();
      }
    } catch {
      alert('Failed to remove bounce');
    }
  };

  const exportCSV = () => {
    const csv = [
      ['Email', 'Type', 'Reason', 'Bounced At'].join(','),
      ...bounces.map(b => [b.email, b.bounceType, `"${b.reason || ''}"`, b.bouncedAt].join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `email-bounces-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Email Bounces</h1>
          <p className="text-slate-400">Manage bounced email addresses</p>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{bounces.filter(b => b.bounceType === 'PERMANENT').length}</p>
              <p className="text-sm text-slate-400">Permanent Bounces</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/10">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{bounces.filter(b => b.bounceType === 'TEMPORARY').length}</p>
              <p className="text-sm text-slate-400">Temporary Bounces</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 mb-6">
        <div className="p-4 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-sky-500"
          >
            <option value="">All Types</option>
            <option value="PERMANENT">Permanent</option>
            <option value="TEMPORARY">Temporary</option>
          </select>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
          </div>
        ) : bounces.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No bounced emails found</div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-900">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-slate-400">Email</th>
                <th className="text-left p-4 text-sm font-medium text-slate-400">Type</th>
                <th className="text-left p-4 text-sm font-medium text-slate-400">Reason</th>
                <th className="text-left p-4 text-sm font-medium text-slate-400">Bounced At</th>
                <th className="text-left p-4 text-sm font-medium text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {bounces.map(bounce => (
                <tr key={bounce.id} className="hover:bg-slate-700/50">
                  <td className="p-4 text-white">{bounce.email}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      bounce.bounceType === 'PERMANENT' ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400'
                    }`}>
                      {bounce.bounceType}
                    </span>
                  </td>
                  <td className="p-4 text-slate-300 max-w-[300px] truncate">{bounce.reason || '-'}</td>
                  <td className="p-4 text-slate-400 text-sm">{new Date(bounce.bouncedAt).toLocaleString()}</td>
                  <td className="p-4">
                    <button onClick={() => removeBounce(bounce.id)} className="p-2 hover:bg-red-500/10 rounded-lg text-red-400" title="Remove from bounce list">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="p-4 border-t border-slate-700 flex items-center justify-between">
          <p className="text-sm text-slate-400">Showing {bounces.length} of {total} bounces</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 bg-slate-700 rounded-lg disabled:opacity-50">
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>
            <span className="text-white px-3">Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 bg-slate-700 rounded-lg disabled:opacity-50">
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
