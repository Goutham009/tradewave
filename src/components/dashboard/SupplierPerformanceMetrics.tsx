'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, TrendingUp, Star, Clock, Target, Award, Zap } from 'lucide-react';

interface PerformanceMetrics {
  tier: 'REVIEW' | 'STANDARD' | 'VERIFIED' | 'TRUSTED';
  responseRate: number;
  winRate: number;
  averageRating: number;
  activeInvitations: number;
  completedOrders: number;
  nextTier: string;
  progressToNextTier: number;
  ordersNeeded: number;
  ratingNeeded: number;
}

const mockMetrics: PerformanceMetrics = {
  tier: 'VERIFIED',
  responseRate: 92,
  winRate: 34,
  averageRating: 4.6,
  activeInvitations: 5,
  completedOrders: 78,
  nextTier: 'TRUSTED',
  progressToNextTier: 72,
  ordersNeeded: 22,
  ratingNeeded: 4.8,
};

export function SupplierPerformanceMetrics() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
    
    // Refresh metrics every 5 minutes
    const interval = setInterval(fetchMetrics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/suppliers/performance-metrics');
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      } else {
        setMetrics(mockMetrics);
      }
    } catch {
      setMetrics(mockMetrics);
    }
    setLoading(false);
  };

  if (loading || !metrics) {
    return (
      <Card className="p-8 text-center">
        <p className="text-neutral-500">Loading performance metrics...</p>
      </Card>
    );
  }

  const getTierEmoji = (tier: string) => {
    switch (tier) {
      case 'TRUSTED': return '🌟';
      case 'VERIFIED': return '✅';
      case 'STANDARD': return '⭐';
      default: return '📝';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'TRUSTED': return 'from-yellow-400 to-amber-500';
      case 'VERIFIED': return 'from-blue-400 to-blue-500';
      case 'STANDARD': return 'from-green-400 to-green-500';
      default: return 'from-neutral-400 to-neutral-500';
    }
  };

  const getMetricColor = (value: number, thresholds: { good: number; medium: number }) => {
    if (value >= thresholds.good) return 'text-green-600';
    if (value >= thresholds.medium) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-slate-50 to-teal-50">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="w-5 h-5 text-teal-600" />
        <h3 className="text-lg font-bold">Your Performance Metrics</h3>
      </div>
      
      <div className="grid grid-cols-5 gap-4 mb-6">
        {/* Current Tier */}
        <div className="text-center">
          <div className={`w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-to-br ${getTierColor(metrics.tier)} flex items-center justify-center text-3xl shadow-lg`}>
            {getTierEmoji(metrics.tier)}
          </div>
          <p className="text-sm font-semibold">{metrics.tier}</p>
          <p className="text-xs text-neutral-600">Current Tier</p>
        </div>

        {/* Response Rate */}
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-white shadow-md flex items-center justify-center">
            <span className={`text-xl font-bold ${getMetricColor(metrics.responseRate, { good: 90, medium: 70 })}`}>
              {metrics.responseRate}%
            </span>
          </div>
          <p className="text-sm font-semibold flex items-center justify-center gap-1">
            <Clock className="w-3 h-3" />
            Response
          </p>
          <p className="text-xs text-neutral-600">Last 30 days</p>
        </div>

        {/* Win Rate */}
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-white shadow-md flex items-center justify-center">
            <span className={`text-xl font-bold ${getMetricColor(metrics.winRate, { good: 40, medium: 25 })}`}>
              {metrics.winRate}%
            </span>
          </div>
          <p className="text-sm font-semibold flex items-center justify-center gap-1">
            <Target className="w-3 h-3" />
            Win Rate
          </p>
          <p className="text-xs text-neutral-600">Accepted quotes</p>
        </div>

        {/* Avg Rating */}
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-white shadow-md flex items-center justify-center">
            <span className={`text-xl font-bold ${getMetricColor(metrics.averageRating, { good: 4.5, medium: 4.0 })}`}>
              {metrics.averageRating.toFixed(1)}
            </span>
          </div>
          <p className="text-sm font-semibold flex items-center justify-center gap-1">
            <Star className="w-3 h-3" />
            Avg Rating
          </p>
          <p className="text-xs text-neutral-600">Out of 5.0</p>
        </div>

        {/* Active Invitations */}
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-white shadow-md flex items-center justify-center">
            <span className="text-xl font-bold text-blue-600">
              {metrics.activeInvitations}
            </span>
          </div>
          <p className="text-sm font-semibold flex items-center justify-center gap-1">
            <Zap className="w-3 h-3" />
            Active
          </p>
          <p className="text-xs text-neutral-600">Pending invitations</p>
        </div>
      </div>

      {/* Progress to Next Tier */}
      {metrics.tier !== 'TRUSTED' && (
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span className="font-semibold">Progress to {metrics.nextTier}</span>
            </div>
            <Badge variant="info">{metrics.progressToNextTier}%</Badge>
          </div>
          
          <div className="w-full bg-neutral-200 rounded-full h-3 mb-3">
            <div
              className="bg-gradient-to-r from-teal-400 to-teal-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${metrics.progressToNextTier}%` }}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">{metrics.ordersNeeded} more orders</p>
                <p className="text-xs text-neutral-500">Complete {100 - metrics.completedOrders} to reach 100</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <Star className="w-4 h-4 text-yellow-600" />
              </div>
              <div>
                <p className="font-medium">Maintain {metrics.ratingNeeded}+ rating</p>
                <p className="text-xs text-neutral-500">Current: {metrics.averageRating.toFixed(1)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {metrics.tier === 'TRUSTED' && (
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-4 border border-amber-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-400 rounded-full flex items-center justify-center text-2xl">
              🏆
            </div>
            <div>
              <p className="font-semibold text-amber-900">Congratulations! You&apos;ve reached TRUSTED status!</p>
              <p className="text-sm text-amber-700">
                You&apos;re among our top-tier suppliers with priority visibility and exclusive opportunities.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="mt-4 pt-4 border-t border-neutral-200 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold text-teal-600">{metrics.completedOrders}</p>
          <p className="text-xs text-neutral-600">Completed Orders</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-blue-600">{metrics.activeInvitations}</p>
          <p className="text-xs text-neutral-600">Active Opportunities</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-green-600">{Math.round(metrics.completedOrders * metrics.winRate / 100)}</p>
          <p className="text-xs text-neutral-600">Quotes Won</p>
        </div>
      </div>
    </Card>
  );
}
