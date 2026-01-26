'use client';

import { useState, useEffect } from 'react';
import { FileText, Clock, CheckCircle, XCircle, Eye, AlertTriangle } from 'lucide-react';

interface Appeal {
  id: string;
  appealReason: string;
  explanation?: string;
  status: string;
  submittedAt: string;
  reviewedAt?: string;
  adminDecision?: string;
  kyb: {
    id: string;
    businessName: string;
    status: string;
    user: {
      id: string;
      name: string;
      email: string;
      companyName?: string;
    };
  };
  documents: {
    id: string;
    documentName: string;
    fileName: string;
    fileUrl: string;
  }[];
}

export default function AdminKYBAppealsPage() {
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING');
  const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null);
  const [processing, setProcessing] = useState(false);
  const [decision, setDecision] = useState({ decision: '', adminDecision: '' });

  useEffect(() => {
    fetchAppeals();
  }, [filter]);

  const fetchAppeals = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter) params.append('status', filter);
      const res = await fetch(`/api/admin/kyb/appeals?${params}`);
      const data = await res.json();
      setAppeals(data.appeals || []);
    } catch (error) {
      console.error('Failed to fetch appeals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async () => {
    if (!selectedAppeal || !decision.decision) return;
    setProcessing(true);

    try {
      const res = await fetch(`/api/admin/kyb/appeals/${selectedAppeal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(decision)
      });

      if (res.ok) {
        setSelectedAppeal(null);
        setDecision({ decision: '', adminDecision: '' });
        fetchAppeals();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to process appeal');
      }
    } catch (error) {
      console.error('Review error:', error);
      alert('Failed to process appeal');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'REJECTED':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">KYB Appeals</h1>
          <p className="text-slate-400">Review and process KYB verification appeals</p>
        </div>
        <div className="flex gap-2">
          {['PENDING', 'APPROVED', 'REJECTED', ''].map((status) => (
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
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : appeals.length === 0 ? (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Appeals Found</h3>
          <p className="text-slate-400">
            {filter ? `No ${filter.toLowerCase()} appeals` : 'No appeals to display'}
          </p>
        </div>
      ) : (
        <div className="bg-slate-900 rounded-xl border border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left p-4 text-slate-400 font-medium">Business</th>
                  <th className="text-left p-4 text-slate-400 font-medium">User</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Submitted</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Status</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Documents</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appeals.map((appeal) => (
                  <tr key={appeal.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                    <td className="p-4">
                      <p className="text-white font-medium">{appeal.kyb.businessName}</p>
                      <p className="text-slate-400 text-sm">{appeal.kyb.status}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-white">{appeal.kyb.user.name}</p>
                      <p className="text-slate-400 text-sm">{appeal.kyb.user.email}</p>
                    </td>
                    <td className="p-4 text-slate-300">
                      {new Date(appeal.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(appeal.status)}
                        <span className="text-slate-300">{appeal.status}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-300">
                      {appeal.documents.length} files
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => setSelectedAppeal(appeal)}
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

      {/* Appeal Detail Modal */}
      {selectedAppeal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl border border-slate-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-800">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Appeal Details</h2>
                <button
                  onClick={() => setSelectedAppeal(null)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-400">Business</label>
                  <p className="text-white">{selectedAppeal.kyb.businessName}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-400">User</label>
                  <p className="text-white">{selectedAppeal.kyb.user.name}</p>
                  <p className="text-slate-400 text-sm">{selectedAppeal.kyb.user.email}</p>
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-400">Appeal Reason</label>
                <p className="text-white bg-slate-800 rounded-lg p-3 mt-1">
                  {selectedAppeal.appealReason}
                </p>
              </div>

              {selectedAppeal.explanation && (
                <div>
                  <label className="text-sm text-slate-400">Additional Explanation</label>
                  <p className="text-slate-300 bg-slate-800 rounded-lg p-3 mt-1">
                    {selectedAppeal.explanation}
                  </p>
                </div>
              )}

              {selectedAppeal.documents.length > 0 && (
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Supporting Documents</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedAppeal.documents.map((doc) => (
                      <a
                        key={doc.id}
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-lg text-slate-300 hover:bg-slate-700"
                      >
                        <FileText className="w-4 h-4" />
                        <span className="text-sm">{doc.documentName}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {selectedAppeal.status === 'PENDING' && (
                <div className="border-t border-slate-800 pt-4 space-y-4">
                  <div>
                    <label className="text-sm text-slate-400 mb-2 block">Decision</label>
                    <div className="flex gap-4">
                      <button
                        onClick={() => setDecision({ ...decision, decision: 'APPROVED' })}
                        className={`flex-1 py-3 rounded-lg border ${
                          decision.decision === 'APPROVED'
                            ? 'bg-green-500/20 border-green-500 text-green-400'
                            : 'bg-slate-800 border-slate-700 text-slate-300'
                        }`}
                      >
                        <CheckCircle className="w-5 h-5 mx-auto mb-1" />
                        Approve
                      </button>
                      <button
                        onClick={() => setDecision({ ...decision, decision: 'REJECTED' })}
                        className={`flex-1 py-3 rounded-lg border ${
                          decision.decision === 'REJECTED'
                            ? 'bg-red-500/20 border-red-500 text-red-400'
                            : 'bg-slate-800 border-slate-700 text-slate-300'
                        }`}
                      >
                        <XCircle className="w-5 h-5 mx-auto mb-1" />
                        Reject
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-slate-400 mb-2 block">Decision Notes</label>
                    <textarea
                      value={decision.adminDecision}
                      onChange={(e) => setDecision({ ...decision, adminDecision: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white"
                      rows={3}
                      placeholder="Explain your decision..."
                    />
                  </div>

                  <button
                    onClick={handleReview}
                    disabled={!decision.decision || processing}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 disabled:text-slate-500 rounded-lg text-white font-medium"
                  >
                    {processing ? 'Processing...' : 'Submit Decision'}
                  </button>
                </div>
              )}

              {selectedAppeal.adminDecision && (
                <div className={`p-4 rounded-lg ${
                  selectedAppeal.status === 'APPROVED' 
                    ? 'bg-green-500/10 border border-green-500/30' 
                    : 'bg-red-500/10 border border-red-500/30'
                }`}>
                  <label className="text-sm text-slate-400">Admin Decision</label>
                  <p className={selectedAppeal.status === 'APPROVED' ? 'text-green-400' : 'text-red-400'}>
                    {selectedAppeal.adminDecision}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
