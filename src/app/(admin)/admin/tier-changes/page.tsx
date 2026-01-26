'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Shield, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Eye,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Filter,
} from 'lucide-react';

interface TierChangeRequest {
  id: string;
  supplier: {
    id: string;
    name: string;
    companyName: string;
    email: string;
    rating: number;
  };
  previousTier: string;
  proposedTier: string;
  changeReason: string;
  status: string;
  severity: string;
  approvalDeadline: string;
  createdAt: string;
  metricsSnapshot: Record<string, unknown> | null;
  tierLabel: string;
}

interface Stats {
  pending: number;
  approved: number;
  rejected: number;
  onHold: number;
  investigating: number;
  urgentCount: number;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  APPROVED: { bg: 'bg-green-100', text: 'text-green-700' },
  REJECTED: { bg: 'bg-red-100', text: 'text-red-700' },
  ON_HOLD: { bg: 'bg-gray-100', text: 'text-gray-700' },
  INVESTIGATING: { bg: 'bg-blue-100', text: 'text-blue-700' },
};

const SEVERITY_COLORS: Record<string, { bg: string; text: string }> = {
  LOW: { bg: 'bg-gray-100', text: 'text-gray-600' },
  MEDIUM: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  HIGH: { bg: 'bg-orange-100', text: 'text-orange-700' },
  CRITICAL: { bg: 'bg-red-100', text: 'text-red-700' },
};

export default function AdminTierChangesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [requests, setRequests] = useState<TierChangeRequest[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('PENDING');
  const [selectedSeverity, setSelectedSeverity] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, [selectedStatus, selectedSeverity]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        status: selectedStatus,
        ...(selectedSeverity && { severity: selectedSeverity }),
      });
      
      const res = await fetch(`/api/admin/tier-changes?${params}`);
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching tier changes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (requestId: string, action: string, notes?: string) => {
    setProcessingId(requestId);
    try {
      const res = await fetch(`/api/admin/tier-changes/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, notes }),
      });

      if (res.ok) {
        await fetchRequests();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to process request');
      }
    } catch (error) {
      console.error('Error processing action:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isUpgrade = (prev: string, proposed: string) => {
    const tierOrder = ['REVIEW', 'STANDARD', 'TRUSTED'];
    return tierOrder.indexOf(proposed) > tierOrder.indexOf(prev);
  };

  const renderTierBadge = (tier: string, label: string) => {
    const colors: Record<string, string> = {
      TRUSTED: 'bg-green-500',
      STANDARD: 'bg-blue-500',
      REVIEW: 'bg-red-500',
    };
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white ${colors[tier] || 'bg-gray-500'}`}>
        {label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Shield className="w-8 h-8 text-teal-400" />
              Seller Tier Change Requests
            </h1>
            <p className="text-slate-400 mt-1">
              Review and approve tier changes for suppliers (Seller Tier system)
            </p>
          </div>
          <button
            onClick={fetchRequests}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <p className="text-slate-400 text-sm">Pending</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <p className="text-slate-400 text-sm">Approved</p>
              <p className="text-2xl font-bold text-green-400">{stats.approved}</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <p className="text-slate-400 text-sm">Rejected</p>
              <p className="text-2xl font-bold text-red-400">{stats.rejected}</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <p className="text-slate-400 text-sm">On Hold</p>
              <p className="text-2xl font-bold text-gray-400">{stats.onHold}</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <p className="text-slate-400 text-sm">Investigating</p>
              <p className="text-2xl font-bold text-blue-400">{stats.investigating}</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 border border-red-500/30">
              <p className="text-slate-400 text-sm">Urgent</p>
              <p className="text-2xl font-bold text-red-400">{stats.urgentCount}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-800 text-white border border-slate-600 rounded-lg px-3 py-2 text-sm"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="INVESTIGATING">Investigating</option>
            </select>
          </div>
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="bg-slate-800 text-white border border-slate-600 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        {/* Request List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400" />
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-slate-800 rounded-lg p-12 text-center border border-slate-700">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No Pending Requests</h3>
            <p className="text-slate-400">All tier change requests have been processed.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div
                key={req.id}
                className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    {/* Supplier Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">
                          {req.supplier.companyName || req.supplier.name}
                        </h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[req.status]?.bg} ${STATUS_COLORS[req.status]?.text}`}>
                          {req.status}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${SEVERITY_COLORS[req.severity]?.bg} ${SEVERITY_COLORS[req.severity]?.text}`}>
                          {req.severity}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm mb-3">{req.supplier.email}</p>
                      
                      {/* Tier Change */}
                      <div className="flex items-center gap-3 mb-3">
                        {renderTierBadge(req.previousTier, `(Seller Tier) ${req.previousTier}`)}
                        {isUpgrade(req.previousTier, req.proposedTier) ? (
                          <TrendingUp className="w-5 h-5 text-green-400" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-red-400" />
                        )}
                        {renderTierBadge(req.proposedTier, `(Seller Tier) ${req.proposedTier}`)}
                      </div>

                      <p className="text-slate-300 text-sm">{req.changeReason}</p>
                    </div>

                    {/* Timeline */}
                    <div className="text-right text-sm text-slate-400">
                      <p>Created: {formatDate(req.createdAt)}</p>
                      <p className="flex items-center justify-end gap-1 mt-1">
                        <Clock className="w-4 h-4" />
                        Deadline: {formatDate(req.approvalDeadline)}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  {req.status === 'PENDING' && (
                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-700">
                      <button
                        onClick={() => handleAction(req.id, 'APPROVE')}
                        disabled={processingId === req.id}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(req.id, 'REJECT', 'Does not meet tier criteria')}
                        disabled={processingId === req.id}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                      <button
                        onClick={() => handleAction(req.id, 'HOLD')}
                        disabled={processingId === req.id}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 disabled:opacity-50 transition-colors"
                      >
                        <Clock className="w-4 h-4" />
                        Hold
                      </button>
                      <button
                        onClick={() => handleAction(req.id, 'INVESTIGATE')}
                        disabled={processingId === req.id}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                      >
                        <Search className="w-4 h-4" />
                        Investigate
                      </button>
                      <button
                        onClick={() => router.push(`/admin/tier-changes/${req.id}`)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors ml-auto"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
