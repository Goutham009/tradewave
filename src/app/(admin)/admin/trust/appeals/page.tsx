'use client';

import { useState, useEffect } from 'react';
import { Gavel, Search, CheckCircle, XCircle, Clock, Flag, Ban, FileText } from 'lucide-react';

export default function AdminAppealsPage() {
  const [appeals, setAppeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: 'all', status: 'PENDING' });
  const [stats, setStats] = useState({ pendingFlags: 0, pendingBlacklist: 0, totalPending: 0 });
  const [selectedAppeal, setSelectedAppeal] = useState<any>(null);

  useEffect(() => {
    fetchAppeals();
  }, [filters]);

  const fetchAppeals = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('type', filters.type);
      params.set('status', filters.status);

      const res = await fetch(`/api/buyer-trust/appeals?${params}`);
      if (res.ok) {
        const data = await res.json();
        setAppeals(data.appeals || []);
        setStats(data.stats || { pendingFlags: 0, pendingBlacklist: 0, totalPending: 0 });
      }
    } catch (err) {
      console.error('Failed to fetch appeals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (appealId: string, appealType: string, status: string, adminDecision: string) => {
    try {
      const res = await fetch(`/api/buyer-trust/appeals/${appealId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appealType, status, adminDecision })
      });

      if (res.ok) {
        setSelectedAppeal(null);
        fetchAppeals();
      }
    } catch (err) {
      console.error('Failed to review appeal:', err);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <Gavel className="w-8 h-8" />
          Appeal Review
        </h1>
        <p className="text-slate-400 mt-1">Review and process flag and blacklist appeals</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-2 text-orange-400 mb-2">
            <Flag className="w-5 h-5" />
            <span className="text-sm font-medium">Flag Appeals</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.pendingFlags}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-400 mb-2">
            <Ban className="w-5 h-5" />
            <span className="text-sm font-medium">Blacklist Appeals</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.pendingBlacklist}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-2 text-purple-400 mb-2">
            <Clock className="w-5 h-5" />
            <span className="text-sm font-medium">Total Pending</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.totalPending}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 mb-6">
        <div className="flex gap-4">
          <select value={filters.type} onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white">
            <option value="all">All Types</option>
            <option value="flag">Flag Appeals</option>
            <option value="blacklist">Blacklist Appeals</option>
          </select>
          <select value={filters.status} onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white">
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="PARTIAL">Partial</option>
          </select>
        </div>
      </div>

      {/* Appeals List */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading...</div>
        ) : appeals.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <Gavel className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No appeals found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700">
            {appeals.map((appeal) => (
              <div key={appeal.id} className="p-4 hover:bg-slate-700/50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {appeal.appealType === 'FLAG' ? (
                        <Flag className="w-5 h-5 text-orange-400" />
                      ) : (
                        <Ban className="w-5 h-5 text-red-400" />
                      )}
                      <span className="text-white font-medium">
                        {appeal.buyer?.companyName || appeal.buyer?.name}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        appeal.appealType === 'FLAG' ? 'bg-orange-500/20 text-orange-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {appeal.appealType}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm mb-2">{appeal.buyer?.email}</p>
                    
                    <div className="bg-slate-900 rounded p-3 mb-3">
                      <p className="text-sm text-slate-300">{appeal.appealReason}</p>
                    </div>

                    {appeal.flag && (
                      <p className="text-xs text-slate-500">
                        Flag: {appeal.flag.flagType.replace(/_/g, ' ')} ({appeal.flag.severity})
                      </p>
                    )}
                    {appeal.blacklist && (
                      <p className="text-xs text-slate-500">
                        Blacklist Reason: {appeal.blacklist.reason.replace(/_/g, ' ')}
                      </p>
                    )}

                    <p className="text-xs text-slate-500 mt-2">
                      Submitted: {new Date(appeal.submittedAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {appeal.status === 'PENDING' ? (
                      <>
                        <button onClick={() => setSelectedAppeal(appeal)}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                          Review
                        </button>
                      </>
                    ) : (
                      <span className={`px-2 py-1 rounded text-xs ${
                        appeal.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' :
                        appeal.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {appeal.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedAppeal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg w-full max-w-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Review Appeal</h3>
            
            <div className="mb-4">
              <p className="text-slate-400 text-sm">Buyer</p>
              <p className="text-white">{selectedAppeal.buyer?.companyName || selectedAppeal.buyer?.name}</p>
            </div>

            <div className="mb-4">
              <p className="text-slate-400 text-sm">Appeal Reason</p>
              <p className="text-white bg-slate-900 p-3 rounded mt-1">{selectedAppeal.appealReason}</p>
            </div>

            <div className="mb-4">
              <label className="text-slate-400 text-sm block mb-1">Your Decision</label>
              <textarea id="adminDecision" rows={3}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                placeholder="Enter your decision notes..." />
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setSelectedAppeal(null)}
                className="px-4 py-2 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-700">
                Cancel
              </button>
              <button onClick={() => {
                const decision = (document.getElementById('adminDecision') as HTMLTextAreaElement).value;
                handleReview(selectedAppeal.id, selectedAppeal.appealType, 'REJECTED', decision);
              }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                Reject
              </button>
              <button onClick={() => {
                const decision = (document.getElementById('adminDecision') as HTMLTextAreaElement).value;
                handleReview(selectedAppeal.id, selectedAppeal.appealType, 'APPROVED', decision);
              }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
