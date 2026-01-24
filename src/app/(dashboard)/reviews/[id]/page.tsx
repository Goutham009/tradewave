'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Star, ThumbsUp, ThumbsDown, ArrowLeft, Award, Shield, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface Review {
  id: string;
  transactionId: string;
  reviewerUserId: string;
  reviewedUserId: string;
  reviewType: string;
  overallRating: number;
  communicationRating: number;
  reliabilityRating: number;
  categoryRating: number | null;
  title: string | null;
  description: string;
  tags: string[];
  status: string;
  helpfulCount: number;
  notHelpfulCount: number;
  createdAt: string;
  approvedAt: string | null;
  reviewerUser: {
    id: string;
    email: string;
    companyName: string | null;
    name: string;
  };
  reviewedUser: {
    id: string;
    email: string;
    companyName: string | null;
    name: string;
  };
  votes: Array<{ id: string; userId: string; voteType: string }>;
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
}

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [review, setReview] = useState<Review | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [votingInProgress, setVotingInProgress] = useState(false);

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const res = await fetch(`/api/reviews/${params.id}`);
        if (!res.ok) throw new Error('Failed to fetch review');
        const data = await res.json();
        setReview(data);

        // Fetch user stats
        const statsRes = await fetch(`/api/reviews/stats/${data.reviewedUserId}`);
        if (statsRes.ok) {
          setUserStats(await statsRes.json());
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching review');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchReview();
    }
  }, [params.id]);

  const handleVote = async (voteType: 'HELPFUL' | 'NOT_HELPFUL') => {
    if (!session?.user?.id || votingInProgress) return;
    
    setVotingInProgress(true);
    try {
      const res = await fetch(`/api/reviews/${params.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType })
      });

      if (res.ok) {
        // Refresh review
        const reviewRes = await fetch(`/api/reviews/${params.id}`);
        if (reviewRes.ok) {
          setReview(await reviewRes.json());
        }
      }
    } catch (err) {
      console.error('Failed to vote:', err);
    } finally {
      setVotingInProgress(false);
    }
  };

  const getUserVote = () => {
    if (!session?.user?.id || !review?.votes) return null;
    const vote = review.votes.find((v) => v.userId === session.user.id);
    return vote?.voteType || null;
  };

  const StarDisplay = ({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) => {
    const sizeClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 font-medium">{error}</p>
          <button 
            onClick={() => router.back()}
            className="mt-4 text-blue-600 hover:underline"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="text-center py-12">
          <p className="text-gray-600">Review not found</p>
        </div>
      </div>
    );
  }

  const userVote = getUserVote();

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Back Button */}
      <Link 
        href="/reviews" 
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Reviews
      </Link>

      {/* Review Card */}
      <div className="bg-white rounded-xl border shadow-sm p-6 mb-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {review.title || 'Review'}
            </h1>
            <p className="text-gray-600 mt-1 flex items-center gap-2">
              <span>By {review.reviewerUser.companyName || review.reviewerUser.name}</span>
              <span className="text-gray-300">|</span>
              <Clock className="w-4 h-4" />
              <span>{new Date(review.createdAt).toLocaleDateString()}</span>
            </p>
          </div>
          {review.status === 'APPROVED' && (
            <span className="bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              Verified
            </span>
          )}
          {review.status === 'PENDING' && (
            <span className="bg-yellow-100 text-yellow-800 px-3 py-1.5 rounded-full text-sm font-medium">
              Pending Review
            </span>
          )}
        </div>

        {/* Overall Rating */}
        <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <StarDisplay rating={review.overallRating} size="lg" />
          <span className="text-3xl font-bold text-gray-900">{review.overallRating}/5</span>
        </div>

        {/* Category Ratings */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <div>
              <span className="text-sm text-gray-600 block">Communication</span>
              <StarDisplay rating={review.communicationRating} size="sm" />
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <div>
              <span className="text-sm text-gray-600 block">Reliability</span>
              <StarDisplay rating={review.reliabilityRating} size="sm" />
            </div>
          </div>
        </div>

        {/* Review Content */}
        <div className="mb-6">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {review.description}
          </p>
        </div>

        {/* Tags */}
        {review.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {review.tags.map((tag: string) => (
              <span
                key={tag}
                className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
              >
                {tag.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        )}

        {/* Helpfulness */}
        <div className="flex gap-4 pt-4 border-t">
          <span className="text-sm text-gray-600">Was this review helpful?</span>
          <button
            onClick={() => handleVote('HELPFUL')}
            disabled={votingInProgress}
            className={`flex items-center gap-2 text-sm font-medium transition ${
              userVote === 'HELPFUL' 
                ? 'text-blue-600' 
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <ThumbsUp className={`w-4 h-4 ${userVote === 'HELPFUL' ? 'fill-current' : ''}`} />
            Yes ({review.helpfulCount})
          </button>
          <button
            onClick={() => handleVote('NOT_HELPFUL')}
            disabled={votingInProgress}
            className={`flex items-center gap-2 text-sm font-medium transition ${
              userVote === 'NOT_HELPFUL' 
                ? 'text-red-600' 
                : 'text-gray-600 hover:text-red-600'
            }`}
          >
            <ThumbsDown className={`w-4 h-4 ${userVote === 'NOT_HELPFUL' ? 'fill-current' : ''}`} />
            No ({review.notHelpfulCount})
          </button>
        </div>
      </div>

      {/* User Stats Card */}
      {userStats && (
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            About {review.reviewedUser.companyName || review.reviewedUser.name}
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-gray-600 text-sm mb-1">Average Rating</p>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-yellow-500">
                  {userStats.averageRating.toFixed(1)}
                </span>
                <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              </div>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Reviews</p>
              <p className="text-3xl font-bold text-gray-900">{userStats.approvedReviews}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Trust Score</p>
              <p className="text-3xl font-bold text-blue-600">{userStats.trustScore.toFixed(0)}%</p>
            </div>
            {userStats.trustBadge && (
              <div>
                <p className="text-gray-600 text-sm mb-1">Trust Badge</p>
                <div className="flex items-center gap-2">
                  <Award className={`w-8 h-8 ${
                    userStats.trustBadge === 'GOLD' 
                      ? 'text-yellow-500' 
                      : userStats.trustBadge === 'SILVER' 
                        ? 'text-gray-400' 
                        : 'text-amber-600'
                  }`} />
                  <span className="font-bold text-lg">{userStats.trustBadge}</span>
                </div>
              </div>
            )}
          </div>

          {/* Rating Distribution */}
          <div className="mt-6 pt-4 border-t">
            <p className="text-sm font-medium text-gray-700 mb-3">Rating Distribution</p>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = userStats[`${['one', 'two', 'three', 'four', 'five'][stars - 1]}StarCount` as keyof UserStats] as number;
                const percentage = userStats.approvedReviews > 0 
                  ? (count / userStats.approvedReviews) * 100 
                  : 0;
                return (
                  <div key={stars} className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 w-12">{stars} star</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-400 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-8">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
