'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star, Upload, X, Loader2 } from 'lucide-react';

interface ReviewFormProps {
  transactionId: string;
  reviewedUserId: string;
  reviewedUserName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ReviewForm({
  transactionId,
  reviewedUserId,
  reviewedUserName,
  onSuccess,
  onCancel
}: ReviewFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    overallRating: 5,
    communicationRating: 5,
    reliabilityRating: 5,
    categoryRating: 5,
    title: '',
    description: '',
    tags: [] as string[]
  });

  const ratingLabels: Record<number, string> = {
    5: 'Excellent',
    4: 'Good',
    3: 'Average',
    2: 'Poor',
    1: 'Terrible'
  };

  const commonTags = [
    'GREAT_COMMUNICATION',
    'FAST_DELIVERY',
    'HIGH_QUALITY',
    'PROFESSIONAL',
    'RELIABLE',
    'HONEST',
    'RESPONSIVE',
    'FAIR_PRICING',
    'ON_TIME_PAYMENT'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId,
          reviewedUserId,
          overallRating: formData.overallRating,
          communicationRating: formData.communicationRating,
          reliabilityRating: formData.reliabilityRating,
          categoryRating: formData.categoryRating,
          title: formData.title,
          description: formData.description,
          tags: formData.tags
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to submit review');
      }

      const review = await res.json();
      if (onSuccess) onSuccess();
      router.push(`/reviews/${review.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const StarRating = ({ 
    value, 
    onChange, 
    color = 'yellow' 
  }: { 
    value: number; 
    onChange: (val: number) => void; 
    color?: string;
  }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className={`w-7 h-7 ${
              star <= value 
                ? color === 'yellow' 
                  ? 'fill-yellow-400 text-yellow-400' 
                  : color === 'blue'
                    ? 'fill-blue-400 text-blue-400'
                    : 'fill-green-400 text-green-400'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-900">Review {reviewedUserName}</h2>
        <p className="text-gray-600 mt-1">Share your experience with this transaction</p>
      </div>

      {/* Overall Rating */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Overall Rating *
        </label>
        <div className="flex gap-4 items-center">
          <StarRating 
            value={formData.overallRating} 
            onChange={(val) => setFormData({ ...formData, overallRating: val })}
          />
          <span className="text-lg font-semibold text-gray-700">
            {ratingLabels[formData.overallRating]}
          </span>
        </div>
      </div>

      {/* Category Ratings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Communication & Responsiveness
          </label>
          <StarRating 
            value={formData.communicationRating} 
            onChange={(val) => setFormData({ ...formData, communicationRating: val })}
            color="blue"
          />
        </div>
        <div className="p-4 border rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reliability & Quality
          </label>
          <StarRating 
            value={formData.reliabilityRating} 
            onChange={(val) => setFormData({ ...formData, reliabilityRating: val })}
            color="green"
          />
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Review Title
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Summarize your experience in a few words..."
          maxLength={100}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Detailed Review *
        </label>
        <textarea
          required
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Share details about your experience. What went well? What could be improved?"
          rows={5}
          minLength={20}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
        <p className="text-sm text-gray-500 mt-1">
          {formData.description.length}/500 characters (minimum 20)
        </p>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Add Tags (optional)
        </label>
        <div className="flex flex-wrap gap-2">
          {commonTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                formData.tags.includes(tag)
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tag.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading || formData.description.length < 20}
          className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Review'
          )}
        </button>
      </div>

      <p className="text-xs text-gray-500 text-center">
        Your review will be visible after moderation approval.
      </p>
    </form>
  );
}
