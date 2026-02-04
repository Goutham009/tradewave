'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Star, TrendingUp, Shield, CheckCircle2 } from 'lucide-react';

interface SellerStatusCardProps {
  tier: 'TRUSTED' | 'STANDARD' | 'REVIEW';
  rating: number;
  completionRate: number;
  complianceScore: number;
  totalTransactions: number;
  progress?: number;
}

export function SellerStatusCard({
  tier,
  rating,
  completionRate,
  complianceScore,
  totalTransactions,
  progress = 75,
}: SellerStatusCardProps) {
  const tierConfig = {
    TRUSTED: {
      variant: 'success' as const,
      boost: '5.0x',
      label: 'TRUSTED SELLER',
      gradient: 'from-brand-success to-emerald-600',
    },
    STANDARD: {
      variant: 'info' as const,
      boost: '1.0x',
      label: 'STANDARD SELLER',
      gradient: 'from-brand-primary to-blue-600',
    },
    REVIEW: {
      variant: 'warning' as const,
      boost: '0.2x',
      label: 'UNDER REVIEW',
      gradient: 'from-brand-warning to-orange-600',
    },
  };

  const config = tierConfig[tier];
  const nextTier = tier === 'REVIEW' ? 'STANDARD' : tier === 'STANDARD' ? 'TRUSTED' : null;

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${config.gradient} p-8 text-white shadow-xl`}>
      {/* Background decoration */}
      <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

      <div className="relative">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">Your Seller Status</h2>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-semibold backdrop-blur-sm">
              <Shield className="h-4 w-4" />
              {config.label}
            </div>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-sm opacity-90">Visibility Boost</p>
            <p className="text-3xl font-bold">{config.boost}</p>
          </div>
        </div>

        {/* Progress to Next Tier */}
        {nextTier && (
          <div className="mt-8">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm opacity-90">Progress to {nextTier}</span>
              <span className="text-sm font-semibold">{progress}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-white transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
          <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 opacity-80" />
              <span className="text-sm opacity-90">Rating</span>
            </div>
            <p className="mt-1 text-2xl font-bold">{rating.toFixed(1)}</p>
          </div>
          <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 opacity-80" />
              <span className="text-sm opacity-90">Completion</span>
            </div>
            <p className="mt-1 text-2xl font-bold">{completionRate}%</p>
          </div>
          <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 opacity-80" />
              <span className="text-sm opacity-90">Compliance</span>
            </div>
            <p className="mt-1 text-2xl font-bold">{complianceScore}/100</p>
          </div>
          <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 opacity-80" />
              <span className="text-sm opacity-90">Transactions</span>
            </div>
            <p className="mt-1 text-2xl font-bold">{totalTransactions}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
