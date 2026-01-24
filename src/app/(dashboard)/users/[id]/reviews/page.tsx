'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Star, Award, TrendingUp, Users, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Review {
  id: string;
  overallRating: number;
  communicationRating: number;
  reliabilityRating: number;
  title: string | null;
  description: string;
  tags: string[];
  helpfulCount: number;
  createdAt: string;
  reviewerUser: {
    id: string;
    companyName: string | null;
    name: string;
  };
}

interface UserStats {
  userId: string;
  averageRating: number;
  totalReviews: number;
  approvedReviews: number;
  trustBadge: string | null;
  trustScore: number;
  fiveStarCount: number;
  fourStarCount: number;
  threeStarCount: number;
  twoStarCount: number;
  oneStarCount: number;
  avgCommunicationRating: number;
  avgReliabilityRating: number;
}

export default function UserReviewsPage() {
  const params = useParams();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch reviews
        const reviewsRes = await fetch(`/api/reviews?userId=${params.id}`);
        if (reviewsRes.ok) {
          const data = await reviewsRes.json();
          setReviews(data.reviews || []);
          if (data.reviews?.length > 0) {
            setUserName(data.reviews[0].reviewedUser?.companyName || data.reviews[0].reviewedUser?.name || 'User');
          }
        }

        // Fetch stats
        const statsRes = await fetch(`/api/reviews/stats/${params.id}`);
        if (statsRes.ok) {
          setStats(await statsRes.json());
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  const StarDisplay = ({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' }) => {
    const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Back Button */}
      <Link 
        href={`/users/${params.id}`}
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Profile
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Reviews for {userName || 'User'}
      </h1>

      {/* Stats Summary */}
      {stats && (
        <div className="bg-white rounded-xl border shadow-sm p-6 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {/* Average Rating */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-4xl font-bold text-yellow-500">
                  {stats.averageRating.toFixed(1)}
                </span>
                <Star className="w-8 h-8 fill-yellow-400 text-yellow-400" />
              </div>
              <p className="text-sm text-gray-600">Average Rating</p>
              <StarDisplay rating={stats.averageRating} size="sm" />
            </div>

            {/* Total Reviews */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="w-6 h-6 text-blue-600" />
                <span className="text-4xl font-bold text-gray-900">{stats.approvedReviews}</span>
              </div>
              <p className="text-sm text-gray-600">Total Reviews</p>
            </div>

            {/* Communication */}
            <div className="text-center">
              <span className="text-3xl font-bold text-blue-600">
                {stats.avgCommunicationRating.toFixed(1)}
              </span>
              <p className="text-sm text-gray-600 mt-1">Communication</p>
            </div>

            {/* Reliability */}
            <div className="text-center">
              <span className="text-3xl font-bold text-green-600">
                {stats.avgReliabilityRating.toFixed(1)}
              </span>
              <p className="text-sm text-gray-600 mt-1">Reliability</p>
            </div>

            {/* Trust Badge */}
            <div className="text-center">
              {stats.trustBadge ? (
                <>
                  <Award className={`w-10 h-10 mx-auto ${
                    stats.trustBadge === 'GOLD' 
                      ? 'text-yellow-500' 
                      : stats.trustBadge === 'SILVER' 
                        ? 'text-gray-400' 
                        : 'text-amber-600'
                  }`} />
                  <p className="font-bold text-lg mt-1">{stats.trustBadge}</p>
                </>
              ) : (
                <>
                  <TrendingUp className="w-8 h-8 mx-auto text-gray-400" />
                  <p className="text-sm text-gray-600 mt-1">Building Trust</p>
                </>
              )}
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Rating Distribution</h3>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((stars) => {
                const countKey = `${['one', 'two', 'three', 'four', 'five'][stars - 1]}StarCount` as keyof UserStats;
                const count = stats[countKey] as number;
                const percentage = stats.approvedReviews > 0 
                  ? (count / stats.approvedReviews) * 100 
                  : 0;
                return (
                  <div key={stars} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-16">
                      <span className="text-sm text-gray-700">{stars}</span>
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">All Reviews</h2>
        
        {reviews.length === 0 ? (
          <div className="bg-white rounded-lg border p-12 text-center">
            <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No reviews yet</p>
          </div>
        ) : (
          reviews.map((review) => (
            <Link
              key={review.id}
              href={`/reviews/${review.id}`}
              className="block bg-white rounded-lg border p-5 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-gray-900">{review.title || 'Review'}</p>
                  <p className="text-sm text-gray-600">
                    By {review.reviewerUser.companyName || review.reviewerUser.name}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StarDisplay rating={review.overallRating} size="sm" />
                  <span className="font-bold text-gray-900">{review.overallRating}</span>
                </div>
              </div>
              
              <p className="text-gray-700 text-sm line-clamp-3 mb-3">
                {review.description}
              </p>

              {review.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {review.tags.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs"
                    >
                      {tag.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                <span>👍 {review.helpfulCount} found helpful</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
