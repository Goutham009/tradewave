'use client';

import { useState, useEffect } from 'react';
import { 
  Crown, Star, Gift, Trophy, ChevronRight, 
  Zap, Truck, Headphones, Clock, Award 
} from 'lucide-react';

interface LoyaltyTier {
  id: string;
  tierName: string;
  tierLevel: number;
  discountPercentage: string;
  bulkOrderDiscountBonus: string | null;
  freeShippingThreshold: string | null;
  prioritySupport: boolean;
  dedicatedAccountManager: boolean;
  earlyAccessToDeals: boolean;
  pointsPerDollar: string;
  bonusPointsMultiplier: string | null;
  badgeColor: string | null;
  description: string | null;
}

interface LoyaltyStatus {
  id: string;
  totalOrderCount: number;
  totalAmountSpent: string;
  totalRepeats: number;
  repeatPurchaseRate: string;
  totalPointsEarned: string;
  totalPointsUsed: string;
  availablePoints: string;
  joinedAt: string;
  lastOrderAt: string | null;
  tierUpgradedAt: string | null;
  currentTier: LoyaltyTier | null;
}

export default function LoyaltyPage() {
  const [loyaltyStatus, setLoyaltyStatus] = useState<LoyaltyStatus | null>(null);
  const [allTiers, setAllTiers] = useState<LoyaltyTier[]>([]);
  const [nextTier, setNextTier] = useState<LoyaltyTier | null>(null);
  const [progressToNextTier, setProgressToNextTier] = useState(0);
  const [amountToNextTier, setAmountToNextTier] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLoyaltyStatus();
  }, []);

  const fetchLoyaltyStatus = async () => {
    try {
      const res = await fetch('/api/buyer/loyalty');
      const data = await res.json();
      setLoyaltyStatus(data.loyaltyStatus);
      setAllTiers(data.allTiers || []);
      setNextTier(data.nextTier);
      setProgressToNextTier(data.progressToNextTier || 0);
      setAmountToNextTier(data.amountToNextTier || 0);
    } catch (error) {
      console.error('Error fetching loyalty status:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
  };

  const getTierColor = (tierName: string) => {
    switch (tierName) {
      case 'BRONZE': return { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300' };
      case 'SILVER': return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' };
      case 'GOLD': return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-400' };
      case 'PLATINUM': return { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-400' };
      default: return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' };
    }
  };

  const getTierIcon = (tierName: string) => {
    switch (tierName) {
      case 'BRONZE': return <Award className="w-8 h-8" />;
      case 'SILVER': return <Star className="w-8 h-8" />;
      case 'GOLD': return <Crown className="w-8 h-8" />;
      case 'PLATINUM': return <Trophy className="w-8 h-8" />;
      default: return <Award className="w-8 h-8" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-gray-500">Loading loyalty status...</div>
      </div>
    );
  }

  const currentTierColors = getTierColor(loyaltyStatus?.currentTier?.tierName || 'BRONZE');

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Loyalty Program</h1>
        <p className="text-gray-500 mt-1">Earn rewards and unlock exclusive benefits</p>
      </div>

      {/* Current Status Card */}
      <div className={`rounded-xl border-2 ${currentTierColors.border} p-6 ${currentTierColors.bg}`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-full ${currentTierColors.bg} flex items-center justify-center ${currentTierColors.text}`}>
              {getTierIcon(loyaltyStatus?.currentTier?.tierName || 'BRONZE')}
            </div>
            <div>
              <p className="text-sm text-gray-600">Current Tier</p>
              <h2 className={`text-2xl font-bold ${currentTierColors.text}`}>
                {loyaltyStatus?.currentTier?.tierName || 'BRONZE'}
              </h2>
              <p className="text-sm text-gray-600">
                {parseFloat(loyaltyStatus?.currentTier?.discountPercentage || '5')}% discount on all purchases
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {parseInt(loyaltyStatus?.availablePoints || '0').toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Available Points</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {loyaltyStatus?.totalOrderCount || 0}
              </p>
              <p className="text-sm text-gray-600">Total Orders</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(loyaltyStatus?.totalAmountSpent || '0')}
              </p>
              <p className="text-sm text-gray-600">Total Spent</p>
            </div>
          </div>
        </div>

        {/* Progress to Next Tier */}
        {nextTier && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Progress to {nextTier.tierName}</span>
              <span className="font-medium">{progressToNextTier.toFixed(1)}%</span>
            </div>
            <div className="w-full h-3 bg-white rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all"
                style={{ width: `${progressToNextTier}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Spend {formatCurrency(amountToNextTier)} more to reach {nextTier.tierName}
            </p>
          </div>
        )}
      </div>

      {/* Current Benefits */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Your Benefits</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <Gift className="w-5 h-5 text-green-600" />
            <span className="text-gray-700">
              {parseFloat(loyaltyStatus?.currentTier?.discountPercentage || '5')}% Loyalty Discount
            </span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <Zap className="w-5 h-5 text-blue-600" />
            <span className="text-gray-700">
              {parseFloat(loyaltyStatus?.currentTier?.pointsPerDollar || '1')} points per $1 spent
            </span>
          </div>
          {loyaltyStatus?.currentTier?.freeShippingThreshold && (
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <Truck className="w-5 h-5 text-purple-600" />
              <span className="text-gray-700">
                Free shipping over {formatCurrency(loyaltyStatus.currentTier.freeShippingThreshold)}
              </span>
            </div>
          )}
          {loyaltyStatus?.currentTier?.prioritySupport && (
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
              <Headphones className="w-5 h-5 text-orange-600" />
              <span className="text-gray-700">Priority Support</span>
            </div>
          )}
          {loyaltyStatus?.currentTier?.dedicatedAccountManager && (
            <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg">
              <Crown className="w-5 h-5 text-indigo-600" />
              <span className="text-gray-700">Dedicated Account Manager</span>
            </div>
          )}
          {loyaltyStatus?.currentTier?.earlyAccessToDeals && (
            <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-lg">
              <Clock className="w-5 h-5 text-pink-600" />
              <span className="text-gray-700">Early Access to Deals</span>
            </div>
          )}
        </div>
      </div>

      {/* All Tiers */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-6">All Loyalty Tiers</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {allTiers.map((tier) => {
            const colors = getTierColor(tier.tierName);
            const isCurrentTier = tier.id === loyaltyStatus?.currentTier?.id;
            
            return (
              <div 
                key={tier.id} 
                className={`rounded-xl border-2 p-4 ${isCurrentTier ? colors.border : 'border-gray-200'} ${isCurrentTier ? colors.bg : 'bg-white'}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-full ${colors.bg} flex items-center justify-center ${colors.text}`}>
                    {getTierIcon(tier.tierName)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{tier.tierName}</h4>
                    {isCurrentTier && (
                      <span className="text-xs text-green-600 font-medium">Current</span>
                    )}
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4" />
                    {parseFloat(tier.discountPercentage)}% discount
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4" />
                    {parseFloat(tier.pointsPerDollar)} pts/$1
                  </li>
                  {tier.freeShippingThreshold && (
                    <li className="flex items-center gap-2">
                      <ChevronRight className="w-4 h-4" />
                      Free shipping
                    </li>
                  )}
                  {tier.prioritySupport && (
                    <li className="flex items-center gap-2">
                      <ChevronRight className="w-4 h-4" />
                      Priority support
                    </li>
                  )}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
