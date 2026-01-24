'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Star, Filter, Search, ChevronLeft, ChevronRight, Award, MessageSquare } from 'lucide-react';
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
  helpfulCount: number;
  createdAt: string;
  reviewerUser: {
    id: string;
    companyName: string | null;
    name: string;
  };
  reviewedUser: {
    id: string;
    companyName: string | null;
    name: string;
  };
}

export default function ReviewsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || 'APPROVED',
    reviewType: searchParams.get('reviewType') || '',
    search: ''
  });

  const isAdmin = session?.user?.role === 'ADMIN';

  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page: pagination.page.toString(),
          limit: pagination.limit.toString(),
          status: filters.status
        });
        
        if (filters.reviewType) {
          params.append('reviewType', filters.reviewType);
        }

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

    fetchReviews();
  }, [pagination.page, filters.status, filters.reviewType]);

  const StarDisplay = ({ rating }: { rating: number }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );

  const StatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, string> = {
      APPROVED: 'bg-green-100 text-green-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      REJECTED: 'bg-red-100 text-red-800',
      APPEAL: 'bg-purple-100 text-purple-800'
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
          <p className="text-gray-600">
            {isAdmin ? 'Manage and moderate platform reviews' : 'View reviews on the platform'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          
          {isAdmin && (
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="APPROVED">Approved</option>
              <option value="PENDING">Pending</option>
              <option value="REJECTED">Rejected</option>
              <option value="">All Status</option>
            </select>
          )}

          <select
            value={filters.reviewType}
            onChange={(e) => setFilters(prev => ({ ...prev, reviewType: e.target.value }))}
            className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="BUYER_REVIEW_SELLER">Buyer Reviews</option>
            <option value="SELLER_REVIEW_BUYER">Seller Reviews</option>
          </select>

          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-800">
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg border p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Found</h3>
          <p className="text-gray-600">There are no reviews matching your criteria.</p>
        </div>
      ) : (
        <>
          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.map((review) => (
              <Link
                key={review.id}
                href={`/reviews/${review.id}`}
                className="block bg-white rounded-lg border p-6 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">
                        {review.title || 'Review'}
                      </h3>
                      {isAdmin && <StatusBadge status={review.status} />}
                    </div>
                    <p className="text-sm text-gray-600">
                      By {review.reviewerUser.companyName || review.reviewerUser.name}
                      {' → '}
                      {review.reviewedUser.companyName || review.reviewedUser.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StarDisplay rating={review.overallRating} />
                    <span className="font-bold text-gray-900">{review.overallRating}</span>
                  </div>
                </div>

                <p className="text-gray-700 text-sm line-clamp-2 mb-3">
                  {review.description}
                </p>

                <div className="flex justify-between items-center">
                  <div className="flex flex-wrap gap-1">
                    {review.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs"
                      >
                        {tag.replace(/_/g, ' ')}
                      </span>
                    ))}
                    {review.tags.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{review.tags.length - 3} more
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>👍 {review.helpfulCount}</span>
                    <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.pages}
                className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
