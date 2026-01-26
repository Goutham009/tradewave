'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { 
  Shield, 
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  User,
  FileText,
  History,
} from 'lucide-react';

interface RequestDetail {
  request: {
    id: string;
    status: string;
    proposedTier: string;
    proposedTierLabel: string;
    previousTier: string;
    previousTierLabel: string;
    changeReason: string;
    metricsSnapshot: Record<string, unknown> | null;
    approvalDeadline: string;
    createdAt: string;
    reviewedAt: string | null;
    adminNotes: string | null;
  };
  supplier: {
    id: string;
    name: string;
    companyName: string;
    email: string;
    overallRating: number;
    totalReviews: number;
    verified: boolean;
    tierLabel: string;
  };
  notification: {
    severity: string;
    actionDeadline: string;
    isEscalated: boolean;
  } | null;
  compliance: {
    score: number;
    riskLevel: string;
    isComplianceRisk: boolean;
    activeViolations: number;
    totalViolations: number;
  } | null;
  violations: Array<{
    id: string;
    type: string;
    severity: string;
    status: string;
    detectedAt: string;
  }>;
  auditHistory: Array<{
    previousTier: string;
    newTier: string;
    changeReason: string;
    changedAt: string;
  }>;
}

export default function TierChangeDetailPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const requestId = params.requestId as string;
  
  const [detail, setDetail] = useState<RequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (requestId) {
      fetchDetail();
    }
  }, [requestId]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/tier-changes/${requestId}`);
      if (res.ok) {
        const data = await res.json();
        setDetail(data);
      } else {
        router.push('/admin/tier-changes');
      }
    } catch (error) {
      console.error('Error fetching detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: string) => {
    setProcessing(true);
    try {
      const res = await fetch(`/api/admin/tier-changes/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, notes }),
      });

      if (res.ok) {
        await fetchDetail();
        if (action === 'APPROVE' || action === 'REJECT') {
          router.push('/admin/tier-changes');
        }
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to process request');
      }
    } catch (error) {
      console.error('Error processing action:', error);
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400" />
      </div>
    );
  }

  if (!detail) {
    return null;
  }

  const isUpgrade = () => {
    const tierOrder = ['REVIEW', 'STANDARD', 'TRUSTED'];
    return tierOrder.indexOf(detail.request.proposedTier) > tierOrder.indexOf(detail.request.previousTier);
  };

  return (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/admin/tier-changes')}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tier Changes
        </button>

        {/* Header */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Tier Change Request
              </h1>
              <p className="text-slate-400">
                {detail.supplier.companyName || detail.supplier.name}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              detail.request.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
              detail.request.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
              detail.request.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {detail.request.status}
            </span>
          </div>

          {/* Tier Change Visualization */}
          <div className="flex items-center justify-center gap-6 mt-8 py-6 bg-slate-700/50 rounded-lg">
            <div className="text-center">
              <p className="text-slate-400 text-sm mb-2">Current</p>
              <div className="px-4 py-2 bg-slate-600 rounded-lg">
                <p className="text-white font-semibold">{detail.request.previousTierLabel}</p>
              </div>
            </div>
            
            {isUpgrade() ? (
              <TrendingUp className="w-8 h-8 text-green-400" />
            ) : (
              <TrendingDown className="w-8 h-8 text-red-400" />
            )}
            
            <div className="text-center">
              <p className="text-slate-400 text-sm mb-2">Proposed</p>
              <div className={`px-4 py-2 rounded-lg ${isUpgrade() ? 'bg-green-600' : 'bg-red-600'}`}>
                <p className="text-white font-semibold">{detail.request.proposedTierLabel}</p>
              </div>
            </div>
          </div>

          <p className="text-slate-300 mt-6">{detail.request.changeReason}</p>
          
          <div className="flex items-center gap-6 mt-4 text-sm text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Created: {formatDate(detail.request.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              Deadline: {formatDate(detail.request.approvalDeadline)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Supplier Info */}
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-teal-400" />
              Supplier Details
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Company</span>
                <span className="text-white">{detail.supplier.companyName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Email</span>
                <span className="text-white">{detail.supplier.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Rating</span>
                <span className="text-white">{detail.supplier.overallRating?.toFixed(1) || 'N/A'} ({detail.supplier.totalReviews} reviews)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Verified</span>
                <span className={detail.supplier.verified ? 'text-green-400' : 'text-red-400'}>
                  {detail.supplier.verified ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Current Tier</span>
                <span className="text-white">{detail.supplier.tierLabel}</span>
              </div>
            </div>
          </div>

          {/* Compliance Info */}
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-teal-400" />
              Compliance Status
            </h2>
            {detail.compliance ? (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Score</span>
                  <span className="text-white font-bold text-lg">{detail.compliance.score}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Risk Level</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    detail.compliance.riskLevel === 'LOW' ? 'bg-green-100 text-green-700' :
                    detail.compliance.riskLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {detail.compliance.riskLevel}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Active Violations</span>
                  <span className="text-white">{detail.compliance.activeViolations}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Violations</span>
                  <span className="text-white">{detail.compliance.totalViolations}</span>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 text-sm">No compliance data available</p>
            )}
          </div>

          {/* Metrics Snapshot */}
          {detail.request.metricsSnapshot && (
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-400" />
                Metrics at Request Time
              </h2>
              <div className="space-y-3 text-sm">
                {Object.entries(detail.request.metricsSnapshot).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-slate-400 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="text-white">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Audit History */}
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-teal-400" />
              Tier History
            </h2>
            {detail.auditHistory.length > 0 ? (
              <div className="space-y-3">
                {detail.auditHistory.map((entry, i) => (
                  <div key={i} className="border-l-2 border-slate-600 pl-4 py-2">
                    <p className="text-white text-sm">
                      {entry.previousTier} → {entry.newTier}
                    </p>
                    <p className="text-slate-400 text-xs">{entry.changeReason}</p>
                    <p className="text-slate-500 text-xs mt-1">
                      {formatDate(entry.changedAt)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-sm">No tier change history</p>
            )}
          </div>
        </div>

        {/* Admin Actions */}
        {detail.request.status === 'PENDING' && (
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 mt-6">
            <h2 className="text-lg font-semibold text-white mb-4">Admin Decision</h2>
            
            <div className="mb-4">
              <label className="block text-slate-400 text-sm mb-2">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about your decision..."
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                rows={3}
              />
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => handleAction('APPROVE')}
                disabled={processing}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                <CheckCircle className="w-5 h-5" />
                Approve Tier Change
              </button>
              <button
                onClick={() => handleAction('REJECT')}
                disabled={processing}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                <XCircle className="w-5 h-5" />
                Reject
              </button>
              <button
                onClick={() => handleAction('HOLD')}
                disabled={processing}
                className="flex items-center gap-2 px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-500 disabled:opacity-50 transition-colors"
              >
                <Clock className="w-5 h-5" />
                Put on Hold
              </button>
            </div>
          </div>
        )}

        {/* Processed Status */}
        {detail.request.status !== 'PENDING' && (
          <div className={`rounded-lg p-6 mt-6 ${
            detail.request.status === 'APPROVED' ? 'bg-green-900/30 border border-green-700' :
            detail.request.status === 'REJECTED' ? 'bg-red-900/30 border border-red-700' :
            'bg-slate-800 border border-slate-700'
          }`}>
            <div className="flex items-center gap-3">
              {detail.request.status === 'APPROVED' && <CheckCircle className="w-6 h-6 text-green-400" />}
              {detail.request.status === 'REJECTED' && <XCircle className="w-6 h-6 text-red-400" />}
              <div>
                <p className="text-white font-medium">
                  Request {detail.request.status.toLowerCase()}
                </p>
                {detail.request.reviewedAt && (
                  <p className="text-slate-400 text-sm">
                    Reviewed on {formatDate(detail.request.reviewedAt)}
                  </p>
                )}
                {detail.request.adminNotes && (
                  <p className="text-slate-300 text-sm mt-2">
                    Notes: {detail.request.adminNotes}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
