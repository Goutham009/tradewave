'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Star, Check, X, Eye, Filter, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Review {
  id: string;
  transactionId: string;
  reviewType: string;
  overallRating: number;
  communicationRating: number;
  reliabilityRating: number;
  title: string | null;
  description: string;
  tags: string[];
  status: string;
  createdAt: string;
  reviewerUser: {
    id: string;
    companyName: string | null;
    name: string;
    email: string;
  };
  reviewedUser: {
    id: string;
    companyName: string | null;
    name: string;
    email: string;
  };
}

export default function AdminReviewsPage() {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchReviews();
  }, [pagination.page, statusFilter]);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        status: statusFilter
      });

      const res = await fetch(`/api/reviews?${params}`);
      if (!res.ok) throw new Error('Failed to fetch reviews');
      
      const data = await res.json();
      setReviews(data.reviews || []);
      setPagination(prev => ({
        ...prev,
        ...data.pagination
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching reviews');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (reviewId: string) => {
    setActionLoading(reviewId);
    try {
      const res = await fetch(`/api/reviews/${reviewId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!res.ok) throw new Error('Failed to approve review');
      
      // Refresh list
      fetchReviews();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error approving review');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!selectedReview || !rejectReason.trim()) return;
    
    setActionLoading(selectedReview.id);
    try {
      const res = await fetch(`/api/reviews/${selectedReview.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moderationReason: rejectReason })
      });

      if (!res.ok) throw new Error('Failed to reject review');
      
      setRejectModalOpen(false);
      setSelectedReview(null);
      setRejectReason('');
      fetchReviews();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error rejecting review');
    } finally {
      setActionLoading(null);
    }
  };

  const openRejectModal = (review: Review) => {
    setSelectedReview(review);
    setRejectModalOpen(true);
  };

  const StarDisplay = ({ rating }: { rating: number }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'
          }`}
        />
      ))}
    </div>
  );

  const StatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, string> = {
      APPROVED: 'bg-green-500/20 text-green-400 border-green-500/30',
      PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      REJECTED: 'bg-red-500/20 text-red-400 border-red-500/30',
      APPEAL: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    };
    return (
      <span className={`px-2 py-0.5 rounded border text-xs font-medium ${styles[status] || 'bg-slate-700 text-slate-400'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Review Moderation</h1>
        <p className="text-slate-400">Approve or reject user-submitted reviews</p>
      </div>

      {/* Filters */}
      <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-300">Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="">All</option>
          </select>
          <div className="ml-auto text-sm text-slate-400">
            {pagination.total} reviews found
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-6 text-red-400">
          {error}
        </div>
      )}

      {/* Reviews Table */}
      <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center">
            <Star className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No reviews found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Review
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Reviewer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  For
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {reviews.map((review) => (
                <tr key={review.id} className="hover:bg-slate-700/30">
                  <td className="px-4 py-4">
                    <div className="max-w-xs">
                      <p className="text-sm font-medium text-white truncate">
                        {review.title || 'Untitled Review'}
                      </p>
                      <p className="text-xs text-slate-400 line-clamp-2">
                        {review.description}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <StarDisplay rating={review.overallRating} />
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-white">
                      {review.reviewerUser.companyName || review.reviewerUser.name}
                    </p>
                    <p className="text-xs text-slate-400">{review.reviewerUser.email}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-white">
                      {review.reviewedUser.companyName || review.reviewedUser.name}
                    </p>
                    <p className="text-xs text-slate-400">{review.reviewedUser.email}</p>
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={review.status} />
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-400">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/reviews/${review.id}`}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-600 rounded-lg transition"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      {review.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleApprove(review.id)}
                            disabled={actionLoading === review.id}
                            className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/20 rounded-lg transition disabled:opacity-50"
                            title="Approve"
                          >
                            {actionLoading === review.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => openRejectModal(review)}
                            disabled={actionLoading === review.id}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition disabled:opacity-50"
                            title="Reject"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center items-center gap-4 p-4 border-t border-slate-700">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="p-2 rounded-lg border border-slate-600 text-slate-400 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-slate-400">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.pages}
              className="p-2 rounded-lg border border-slate-600 text-slate-400 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModalOpen && selectedReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-white mb-4">Reject Review</h3>
            <p className="text-sm text-slate-400 mb-4">
              Provide a reason for rejecting the review by{' '}
              <span className="text-white">
                {selectedReview.reviewerUser.companyName || selectedReview.reviewerUser.name}
              </span>
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter moderation reason..."
              rows={4}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setRejectModalOpen(false);
                  setSelectedReview(null);
                  setRejectReason('');
                }}
                className="flex-1 px-4 py-2 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || actionLoading === selectedReview.id}
                className="flex-1 px-4 py-2 bg-red-600 rounded-lg text-white hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading === selectedReview.id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  'Reject Review'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
