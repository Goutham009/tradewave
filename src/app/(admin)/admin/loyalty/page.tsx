'use client';

import { useState, useEffect } from 'react';
import { 
  Crown, Users, TrendingUp, Award, Settings,
  ChevronRight, DollarSign, BarChart3
} from 'lucide-react';

interface TierStats {
  tierName: string;
  memberCount: number;
  totalSpent: number;
  avgOrderValue: number;
}

interface LoyaltyAnalytics {
  totalMembers: number;
  totalPointsIssued: number;
  totalPointsRedeemed: number;
  redemptionRate: number;
  tierDistribution: TierStats[];
  upgradesThisMonth: number;
  downgradesThisMonth: number;
}

export default function AdminLoyaltyPage() {
  const [analytics, setAnalytics] = useState<LoyaltyAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated data - would fetch from API in production
    setAnalytics({
      totalMembers: 1250,
      totalPointsIssued: 2500000,
      totalPointsRedeemed: 875000,
      redemptionRate: 35,
      tierDistribution: [
        { tierName: 'BRONZE', memberCount: 750, totalSpent: 150000, avgOrderValue: 200 },
        { tierName: 'SILVER', memberCount: 320, totalSpent: 480000, avgOrderValue: 1500 },
        { tierName: 'GOLD', memberCount: 150, totalSpent: 750000, avgOrderValue: 5000 },
        { tierName: 'PLATINUM', memberCount: 30, totalSpent: 900000, avgOrderValue: 30000 }
      ],
      upgradesThisMonth: 45,
      downgradesThisMonth: 12
    });
    setLoading(false);
  }, []);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'BRONZE': return 'bg-amber-500';
      case 'SILVER': return 'bg-gray-400';
      case 'GOLD': return 'bg-yellow-500';
      case 'PLATINUM': return 'bg-purple-600';
      default: return 'bg-blue-500';
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-gray-400">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Loyalty Program</h1>
          <p className="text-gray-400 mt-1">Manage loyalty tiers and rewards</p>
        </div>
        <a
          href="/admin/loyalty/settings"
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
        >
          <Settings className="w-4 h-4" />
          Settings
        </a>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Members</p>
              <p className="text-2xl font-bold text-white mt-1">
                {analytics?.totalMembers.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Points Issued</p>
              <p className="text-2xl font-bold text-white mt-1">
                {(analytics?.totalPointsIssued || 0).toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Redemption Rate</p>
              <p className="text-2xl font-bold text-white mt-1">
                {analytics?.redemptionRate}%
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Tier Upgrades (Month)</p>
              <p className="text-2xl font-bold text-white mt-1">
                +{analytics?.upgradesThisMonth}
              </p>
              <p className="text-xs text-red-400 mt-1">
                -{analytics?.downgradesThisMonth} downgrades
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <Crown className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Tier Distribution */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="font-semibold text-white mb-6 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          Tier Distribution
        </h3>
        <div className="space-y-4">
          {analytics?.tierDistribution.map((tier) => {
            const percentage = (tier.memberCount / (analytics?.totalMembers || 1)) * 100;
            return (
              <div key={tier.tierName}>
                <div className="flex justify-between text-sm mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getTierColor(tier.tierName)}`} />
                    <span className="text-white font-medium">{tier.tierName}</span>
                  </div>
                  <div className="flex items-center gap-4 text-gray-400">
                    <span>{tier.memberCount} members</span>
                    <span>${tier.totalSpent.toLocaleString()} spent</span>
                    <span>Avg: ${tier.avgOrderValue}</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getTierColor(tier.tierName)} rounded-full`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <a
          href="/admin/loyalty/tiers"
          className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-blue-500 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-white">Manage Tiers</h4>
              <p className="text-sm text-gray-400 mt-1">Edit tier benefits and thresholds</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-blue-400" />
          </div>
        </a>

        <a
          href="/admin/loyalty/members"
          className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-blue-500 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-white">View Members</h4>
              <p className="text-sm text-gray-400 mt-1">Browse and manage member status</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-blue-400" />
          </div>
        </a>

        <a
          href="/admin/loyalty/rewards"
          className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-blue-500 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-white">Rewards Catalog</h4>
              <p className="text-sm text-gray-400 mt-1">Manage point redemption options</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-blue-400" />
          </div>
        </a>
      </div>
    </div>
  );
}
