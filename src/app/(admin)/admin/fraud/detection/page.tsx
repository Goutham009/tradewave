'use client';

import { useState, useEffect } from 'react';
import { 
  Shield, AlertTriangle, Users, TrendingUp, Eye, 
  CheckCircle, XCircle, Clock, Search
} from 'lucide-react';

interface FraudScore {
  id: string;
  userId: string;
  overallFraudScore: number;
  paymentFraudScore: number;
  identityFraudScore: number;
  transactionFraudScore: number;
  behavioralFraudScore: number;
  riskLevel: string;
  fraudIndicators: string[];
  isFlaggedForReview: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    companyName?: string;
    createdAt: string;
  };
}

interface TransactionRisk {
  id: string;
  transactionId: string;
  riskScore: number;
  riskLevel: string;
  recommendedAction: string;
  transaction: {
    id: string;
    amount: number;
    status: string;
    createdAt: string;
    buyer: {
      id: string;
      name: string;
      email: string;
    };
  };
}

export default function FraudDetectionPage() {
  const [dashboard, setDashboard] = useState<{
    summary: {
      totalUsers: number;
      criticalRisk: number;
      highRisk: number;
      flaggedForReview: number;
    };
    highRiskUsers: FraudScore[];
    highRiskTransactions: TransactionRisk[];
    riskDistribution: Record<string, number>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/admin/fraud/dashboard');
      const data = await res.json();
      setDashboard(data);
    } catch (error) {
      console.error('Failed to fetch fraud dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'bg-red-500/20 text-red-400';
      case 'HIGH': return 'bg-orange-500/20 text-orange-400';
      case 'MEDIUM': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-green-500/20 text-green-400';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'DECLINE': return 'text-red-400';
      case 'REQUIRE_VERIFICATION': return 'text-orange-400';
      case 'REVIEW': return 'text-yellow-400';
      default: return 'text-green-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Fraud Detection</h1>
          <p className="text-slate-400">AI-powered fraud monitoring and prevention</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white w-64"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 rounded-xl border border-red-500/30 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Critical Risk</p>
              <p className="text-white text-2xl font-bold">{dashboard?.summary.criticalRisk || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-xl border border-orange-500/30 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Shield className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">High Risk</p>
              <p className="text-white text-2xl font-bold">{dashboard?.summary.highRisk || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-xl border border-yellow-500/30 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <Eye className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Flagged for Review</p>
              <p className="text-white text-2xl font-bold">{dashboard?.summary.flaggedForReview || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-800 rounded-lg">
              <Users className="w-6 h-6 text-slate-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Total Monitored</p>
              <p className="text-white text-2xl font-bold">{dashboard?.summary.totalUsers || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Distribution */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Risk Distribution</h3>
        <div className="flex gap-4 h-8">
          {dashboard?.riskDistribution && Object.entries(dashboard.riskDistribution).map(([level, count]) => {
            const total = Object.values(dashboard.riskDistribution).reduce((a, b) => a + b, 0);
            const width = total > 0 ? (count / total * 100) : 0;
            return (
              <div
                key={level}
                className={`rounded flex items-center justify-center text-sm font-medium ${getRiskColor(level)}`}
                style={{ width: `${width}%`, minWidth: count > 0 ? '60px' : '0' }}
              >
                {count > 0 && `${level}: ${count}`}
              </div>
            );
          })}
        </div>
      </div>

      {/* High Risk Users */}
      <div className="bg-slate-900 rounded-xl border border-slate-800">
        <div className="p-4 border-b border-slate-800">
          <h3 className="text-lg font-semibold text-white">High Risk Users</h3>
        </div>
        {!dashboard?.highRiskUsers?.length ? (
          <div className="p-8 text-center text-slate-400">
            No high-risk users detected
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left p-4 text-slate-400 font-medium">User</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Risk Level</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Score</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Indicators</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Status</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.highRiskUsers.map((score) => (
                  <tr key={score.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                    <td className="p-4">
                      <p className="text-white font-medium">{score.user.name}</p>
                      <p className="text-slate-400 text-sm">{score.user.email}</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${getRiskColor(score.riskLevel)}`}>
                        {score.riskLevel}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              Number(score.overallFraudScore) >= 0.7 ? 'bg-red-500' :
                              Number(score.overallFraudScore) >= 0.5 ? 'bg-orange-500' : 'bg-yellow-500'
                            }`}
                            style={{ width: `${Number(score.overallFraudScore) * 100}%` }}
                          />
                        </div>
                        <span className="text-white">{(Number(score.overallFraudScore) * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {score.fraudIndicators.slice(0, 2).map((indicator, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-slate-800 rounded text-xs text-slate-300">
                            {indicator.replace(/_/g, ' ')}
                          </span>
                        ))}
                        {score.fraudIndicators.length > 2 && (
                          <span className="px-2 py-0.5 bg-slate-800 rounded text-xs text-slate-400">
                            +{score.fraudIndicators.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      {score.isFlaggedForReview ? (
                        <span className="flex items-center gap-1 text-yellow-400 text-sm">
                          <Clock className="w-4 h-4" /> Pending Review
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-slate-400 text-sm">
                          <CheckCircle className="w-4 h-4" /> Reviewed
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <a
                        href={`/admin/users/${score.user.id}`}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 text-sm"
                      >
                        View Profile
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* High Risk Transactions */}
      <div className="bg-slate-900 rounded-xl border border-slate-800">
        <div className="p-4 border-b border-slate-800">
          <h3 className="text-lg font-semibold text-white">High Risk Transactions</h3>
        </div>
        {!dashboard?.highRiskTransactions?.length ? (
          <div className="p-8 text-center text-slate-400">
            No high-risk transactions detected
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left p-4 text-slate-400 font-medium">Transaction</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Buyer</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Amount</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Risk</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Recommendation</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.highRiskTransactions.map((risk) => (
                  <tr key={risk.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                    <td className="p-4">
                      <p className="text-white font-mono text-sm">{risk.transactionId.slice(0, 8)}...</p>
                      <p className="text-slate-400 text-sm">
                        {new Date(risk.transaction.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="p-4">
                      <p className="text-white">{risk.transaction.buyer.name}</p>
                      <p className="text-slate-400 text-sm">{risk.transaction.buyer.email}</p>
                    </td>
                    <td className="p-4 text-white font-semibold">
                      ${Number(risk.transaction.amount).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${getRiskColor(risk.riskLevel)}`}>
                        {risk.riskLevel} ({(Number(risk.riskScore) * 100).toFixed(0)}%)
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`font-medium ${getActionColor(risk.recommendedAction)}`}>
                        {risk.recommendedAction.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-4">
                      <a
                        href={`/admin/transactions/${risk.transactionId}`}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 text-sm"
                      >
                        View
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
