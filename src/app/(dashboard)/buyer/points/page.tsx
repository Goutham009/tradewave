'use client';

import { useState, useEffect } from 'react';
import { Award, Gift, TrendingUp, Clock, Star, ArrowRight } from 'lucide-react';

interface PointsHistory {
  id: string;
  type: string;
  points: number;
  description: string;
  createdAt: string;
}

export default function PointsBalancePage() {
  const [points, setPoints] = useState(2500);
  const [history, setHistory] = useState<PointsHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for demo
    setHistory([
      { id: '1', type: 'EARNED', points: 250, description: 'Order #ORD-2024-001 completed', createdAt: new Date().toISOString() },
      { id: '2', type: 'EARNED', points: 150, description: 'Order #ORD-2024-002 completed', createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
      { id: '3', type: 'REDEEMED', points: -100, description: 'Redeemed for discount', createdAt: new Date(Date.now() - 86400000 * 7).toISOString() },
      { id: '4', type: 'BONUS', points: 500, description: 'Welcome bonus', createdAt: new Date(Date.now() - 86400000 * 30).toISOString() },
    ]);
    setLoading(false);
  }, []);

  const rewards = [
    { id: '1', name: '$10 Discount', points: 1000, icon: '🎫' },
    { id: '2', name: '$25 Discount', points: 2000, icon: '🎟️' },
    { id: '3', name: 'Free Shipping', points: 500, icon: '🚚' },
    { id: '4', name: 'Priority Support', points: 1500, icon: '⭐' },
  ];

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-gray-500">Loading points...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Points Balance</h1>
          <p className="text-gray-500 mt-1">Earn and redeem points for rewards</p>
        </div>
      </div>

      {/* Points Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white col-span-1 md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <Award className="w-8 h-8" />
            <span className="text-lg font-medium">Available Points</span>
          </div>
          <p className="text-5xl font-bold mb-2">{points.toLocaleString()}</p>
          <p className="text-blue-100">≈ ${(points / 100).toFixed(2)} in rewards</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 text-gray-600 mb-4">
            <TrendingUp className="w-5 h-5" />
            <span className="font-medium">This Month</span>
          </div>
          <p className="text-3xl font-bold text-green-600">+400</p>
          <p className="text-gray-500 text-sm">Points earned</p>
        </div>
      </div>

      {/* Available Rewards */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Gift className="w-5 h-5 text-purple-600" />
          Available Rewards
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {rewards.map((reward) => (
            <div key={reward.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors">
              <div className="text-3xl mb-2">{reward.icon}</div>
              <h3 className="font-medium text-gray-900">{reward.name}</h3>
              <p className="text-sm text-gray-500 mb-3">{reward.points} points</p>
              <button
                disabled={points < reward.points}
                className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                  points >= reward.points
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                Redeem
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Points History */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-600" />
          Points History
        </h2>
        <div className="space-y-3">
          {history.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  item.points > 0 ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <Star className={`w-5 h-5 ${item.points > 0 ? 'text-green-600' : 'text-red-600'}`} />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{item.description}</p>
                  <p className="text-sm text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <span className={`font-semibold ${item.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {item.points > 0 ? '+' : ''}{item.points}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
