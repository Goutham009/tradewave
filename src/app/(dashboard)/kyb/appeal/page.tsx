'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, FileText, Upload, Clock, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';

interface Appeal {
  id: string;
  appealReason: string;
  explanation?: string;
  status: string;
  submittedAt: string;
  reviewedAt?: string;
  adminDecision?: string;
  documents: {
    id: string;
    documentName: string;
    fileName: string;
    fileUrl: string;
  }[];
}

export default function KYBAppealPage() {
  const router = useRouter();
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    appealReason: '',
    explanation: ''
  });

  useEffect(() => {
    fetchAppeals();
  }, []);

  const fetchAppeals = async () => {
    try {
      const res = await fetch('/api/kyb/appeal');
      const data = await res.json();
      setAppeals(data.appeals || []);
    } catch (error) {
      console.error('Failed to fetch appeals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/kyb/appeal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setShowForm(false);
        setFormData({ appealReason: '', explanation: '' });
        fetchAppeals();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to submit appeal');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Failed to submit appeal');
    } finally {
      setSubmitting(false);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-500/20 text-green-400';
      case 'REJECTED':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-yellow-500/20 text-yellow-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const hasPendingAppeal = appeals.some(a => a.status === 'PENDING');

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/kyb/status')}
            className="p-2 hover:bg-slate-800 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">KYB Appeal</h1>
            <p className="text-slate-400">Appeal your KYB verification rejection</p>
          </div>
        </div>
        {!hasPendingAppeal && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
          >
            Submit New Appeal
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Submit Appeal</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Reason for Appeal *
              </label>
              <textarea
                value={formData.appealReason}
                onChange={(e) => setFormData({ ...formData, appealReason: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="Explain why you believe the rejection was incorrect..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Additional Explanation
              </label>
              <textarea
                value={formData.explanation}
                onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Any additional context or information..."
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 rounded-lg text-white"
              >
                {submitting ? 'Submitting...' : 'Submit Appeal'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {appeals.length === 0 && !showForm ? (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Appeals Yet</h3>
          <p className="text-slate-400 mb-4">
            If your KYB verification was rejected, you can submit an appeal here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {appeals.map((appeal) => (
            <div
              key={appeal.id}
              className="bg-slate-900 rounded-xl border border-slate-800 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getStatusIcon(appeal.status)}
                  <div>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(appeal.status)}`}>
                      {appeal.status}
                    </span>
                    <p className="text-slate-400 text-sm mt-1">
                      Submitted: {new Date(appeal.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {appeal.reviewedAt && (
                  <p className="text-slate-500 text-sm">
                    Reviewed: {new Date(appeal.reviewedAt).toLocaleDateString()}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-slate-400">Appeal Reason</h4>
                  <p className="text-white">{appeal.appealReason}</p>
                </div>
                {appeal.explanation && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-400">Additional Details</h4>
                    <p className="text-slate-300">{appeal.explanation}</p>
                  </div>
                )}
                {appeal.adminDecision && (
                  <div className={`p-4 rounded-lg ${
                    appeal.status === 'APPROVED' ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'
                  }`}>
                    <h4 className="text-sm font-medium text-slate-400 mb-1">Admin Decision</h4>
                    <p className={appeal.status === 'APPROVED' ? 'text-green-400' : 'text-red-400'}>
                      {appeal.adminDecision}
                    </p>
                  </div>
                )}
                {appeal.documents.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-400 mb-2">Attached Documents</h4>
                    <div className="flex flex-wrap gap-2">
                      {appeal.documents.map((doc) => (
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
