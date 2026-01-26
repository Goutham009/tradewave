'use client';

import { useState } from 'react';
import { Gift, Users, DollarSign, Copy, Check, Share2, Mail, MessageCircle } from 'lucide-react';

export default function ReferralsPage() {
  const [copied, setCopied] = useState(false);
  const referralCode = 'TRADE2024ABC';
  const referralLink = `https://tradewave.io/signup?ref=${referralCode}`;

  const stats = {
    totalReferrals: 8,
    pendingReferrals: 2,
    earnedRewards: 400,
    pendingRewards: 100
  };

  const referrals = [
    { id: '1', name: 'John Smith', email: 'john@example.com', status: 'COMPLETED', reward: 50, date: new Date().toISOString() },
    { id: '2', name: 'Sarah Chen', email: 'sarah@example.com', status: 'PENDING', reward: 50, date: new Date(Date.now() - 86400000 * 2).toISOString() },
    { id: '3', name: 'Mike Johnson', email: 'mike@example.com', status: 'COMPLETED', reward: 50, date: new Date(Date.now() - 86400000 * 7).toISOString() },
  ];

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusColor = (status: string) => {
    return status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Referral Program</h1>
          <p className="text-gray-500 mt-1">Invite friends and earn rewards</p>
        </div>
      </div>

      {/* Referral Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Referrals</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalReferrals}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingReferrals}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Earned</p>
              <p className="text-2xl font-bold text-green-600">${stats.earnedRewards}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Rewards</p>
              <p className="text-2xl font-bold text-gray-900">${stats.pendingRewards}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Gift className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Share Section */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Share2 className="w-6 h-6" />
          <h2 className="text-lg font-semibold">Share Your Referral Link</h2>
        </div>
        <p className="text-blue-100 mb-4">Earn $50 for each friend who signs up and completes their first order</p>
        
        <div className="flex gap-3 mb-4">
          <div className="flex-1 bg-white/10 rounded-lg px-4 py-3 font-mono text-sm truncate">
            {referralLink}
          </div>
          <button
            onClick={copyToClipboard}
            className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 flex items-center gap-2"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
            <Mail className="w-4 h-4" />
            Email
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </button>
        </div>
      </div>

      {/* Referral History */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Referral History</h2>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Reward</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {referrals.map((ref) => (
              <tr key={ref.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{ref.name}</td>
                <td className="px-6 py-4 text-gray-600">{ref.email}</td>
                <td className="px-6 py-4 text-gray-600">{new Date(ref.date).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ref.status)}`}>
                    {ref.status}
                  </span>
                </td>
                <td className="px-6 py-4 font-medium text-green-600">${ref.reward}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
