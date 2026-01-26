'use client';

import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, TrendingUp, TrendingDown, Ban, Eye, Clock, CheckCircle } from 'lucide-react';

interface RiskProfile {
  id: string;
  overallRiskLevel: string;
  overallRiskScore: number;
  kybRiskScore: number;
  complianceRiskScore: number;
  transactionRiskScore: number;
  paymentRiskScore: number;
  behavioralRiskScore: number;
  isMonitored: boolean;
  hasRestrictions: boolean;
  riskFactors: string[];
  restrictions: {
    id: string;
    restrictionType: string;
    description: string;
    dailyLimit?: number;
    monthlyLimit?: number;
  }[];
  alerts: {
    id: string;
    alertType: string;
    severity: string;
    message: string;
    createdAt: string;
  }[];
}

interface RiskAssessment {
  riskProfile: RiskProfile;
  kyb: {
    status: string;
    riskScore: number;
  } | null;
  trustScore: {
    overallScore: number;
    riskLevel: string;
    activeFlags: number;
  } | null;
  recommendations: string[];
}

export default function RiskProfilePage() {
  const [assessment, setAssessment] = useState<RiskAssessment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssessment();
  }, []);

  const fetchAssessment = async () => {
    try {
      const res = await fetch('/api/risk/assessment');
      const data = await res.json();
      setAssessment(data.assessment);
    } catch (error) {
      console.error('Failed to fetch risk assessment:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'LOW':
        return 'text-green-400 bg-green-500/20';
      case 'MEDIUM':
        return 'text-yellow-400 bg-yellow-500/20';
      case 'HIGH':
        return 'text-orange-400 bg-orange-500/20';
      case 'CRITICAL':
        return 'text-red-400 bg-red-500/20';
      default:
        return 'text-slate-400 bg-slate-500/20';
    }
  };

  const getScoreColor = (score: number) => {
    if (score <= 30) return 'bg-green-500';
    if (score <= 50) return 'bg-yellow-500';
    if (score <= 70) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-8 text-center">
          <Shield className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Risk Profile</h3>
          <p className="text-slate-400">Your risk profile will be created automatically.</p>
        </div>
      </div>
    );
  }

  const { riskProfile, kyb, trustScore, recommendations } = assessment;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Risk Profile</h1>
          <p className="text-slate-400">Your risk assessment and compliance status</p>
        </div>
        <div className={`px-4 py-2 rounded-lg ${getRiskColor(riskProfile.overallRiskLevel)}`}>
          <span className="font-semibold">{riskProfile.overallRiskLevel} RISK</span>
        </div>
      </div>

      {/* Status Indicators */}
      {(riskProfile.isMonitored || riskProfile.hasRestrictions) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {riskProfile.isMonitored && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex items-center gap-3">
              <Eye className="w-6 h-6 text-yellow-400" />
              <div>
                <p className="text-yellow-400 font-medium">Under Monitoring</p>
                <p className="text-yellow-400/70 text-sm">Your account is currently being monitored</p>
              </div>
            </div>
          )}
          {riskProfile.hasRestrictions && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center gap-3">
              <Ban className="w-6 h-6 text-red-400" />
              <div>
                <p className="text-red-400 font-medium">Active Restrictions</p>
                <p className="text-red-400/70 text-sm">You have {riskProfile.restrictions.length} active restrictions</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Overall Score */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Overall Risk Score</h2>
        <div className="flex items-center gap-6">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                className="text-slate-800"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                strokeDasharray={352}
                strokeDashoffset={352 - (352 * riskProfile.overallRiskScore) / 100}
                className={getScoreColor(riskProfile.overallRiskScore).replace('bg-', 'text-')}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold text-white">{riskProfile.overallRiskScore}</span>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-slate-400 mb-2">
              Score from 0-100. Lower is better.
            </p>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-green-400">
                <span className="w-3 h-3 rounded-full bg-green-500"></span> 0-30 Low
              </span>
              <span className="flex items-center gap-1 text-yellow-400">
                <span className="w-3 h-3 rounded-full bg-yellow-500"></span> 31-50 Medium
              </span>
              <span className="flex items-center gap-1 text-orange-400">
                <span className="w-3 h-3 rounded-full bg-orange-500"></span> 51-70 High
              </span>
              <span className="flex items-center gap-1 text-red-400">
                <span className="w-3 h-3 rounded-full bg-red-500"></span> 71-100 Critical
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Component Scores */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Risk Components</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: 'KYB Verification', score: riskProfile.kybRiskScore },
            { label: 'Compliance', score: riskProfile.complianceRiskScore },
            { label: 'Transaction History', score: riskProfile.transactionRiskScore },
            { label: 'Payment Behavior', score: riskProfile.paymentRiskScore },
            { label: 'Behavioral', score: riskProfile.behavioralRiskScore }
          ].map((item) => (
            <div key={item.label} className="bg-slate-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm">{item.label}</span>
                <span className="text-white font-semibold">{item.score}</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getScoreColor(item.score)}`}
                  style={{ width: `${item.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* KYB & Trust Score */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {kyb && (
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
            <h3 className="text-white font-semibold mb-3">KYB Status</h3>
            <div className="flex items-center gap-3">
              {kyb.status === 'VERIFIED' ? (
                <CheckCircle className="w-8 h-8 text-green-400" />
              ) : (
                <Clock className="w-8 h-8 text-yellow-400" />
              )}
              <div>
                <p className={`font-medium ${kyb.status === 'VERIFIED' ? 'text-green-400' : 'text-yellow-400'}`}>
                  {kyb.status}
                </p>
                <p className="text-slate-400 text-sm">Risk Score: {kyb.riskScore}</p>
              </div>
            </div>
          </div>
        )}
        {trustScore && (
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
            <h3 className="text-white font-semibold mb-3">Trust Score</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <span className="text-blue-400 font-bold">{trustScore.overallScore}</span>
              </div>
              <div>
                <p className={`font-medium ${getRiskColor(trustScore.riskLevel).split(' ')[0]}`}>
                  {trustScore.riskLevel} Risk
                </p>
                <p className="text-slate-400 text-sm">{trustScore.activeFlags} active flags</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Recommendations</h2>
          <ul className="space-y-2">
            {recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-blue-400 mt-0.5" />
                <span className="text-slate-300">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Active Restrictions */}
      {riskProfile.restrictions.length > 0 && (
        <div className="bg-slate-900 rounded-xl border border-red-500/30 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Ban className="w-5 h-5 text-red-400" />
            Active Restrictions
          </h2>
          <div className="space-y-3">
            {riskProfile.restrictions.map((restriction) => (
              <div key={restriction.id} className="bg-red-500/10 rounded-lg p-4">
                <p className="text-white font-medium">{restriction.restrictionType.replace(/_/g, ' ')}</p>
                <p className="text-slate-400 text-sm">{restriction.description}</p>
                {(restriction.dailyLimit || restriction.monthlyLimit) && (
                  <div className="flex gap-4 mt-2 text-sm">
                    {restriction.dailyLimit && (
                      <span className="text-red-400">Daily: ${restriction.dailyLimit.toLocaleString()}</span>
                    )}
                    {restriction.monthlyLimit && (
                      <span className="text-red-400">Monthly: ${restriction.monthlyLimit.toLocaleString()}</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Alerts */}
      {riskProfile.alerts.length > 0 && (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            Active Alerts
          </h2>
          <div className="space-y-3">
            {riskProfile.alerts.map((alert) => (
              <div
                key={alert.id}
                className={`rounded-lg p-4 ${
                  alert.severity === 'CRITICAL'
                    ? 'bg-red-500/10 border border-red-500/30'
                    : alert.severity === 'HIGH'
                    ? 'bg-orange-500/10 border border-orange-500/30'
                    : 'bg-yellow-500/10 border border-yellow-500/30'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white font-medium">{alert.alertType.replace(/_/g, ' ')}</p>
                    <p className="text-slate-400 text-sm">{alert.message}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      alert.severity === 'CRITICAL'
                        ? 'bg-red-500/20 text-red-400'
                        : alert.severity === 'HIGH'
                        ? 'bg-orange-500/20 text-orange-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    {alert.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
