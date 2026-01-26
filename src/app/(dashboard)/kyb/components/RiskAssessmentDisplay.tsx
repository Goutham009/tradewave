'use client';

import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface RiskAssessment {
  totalRiskScore: number;
  riskLevel: string;
  recommendation: string;
  businessAgeRisk?: number;
  documentRisk?: number;
  verificationRisk?: number;
  locationRisk?: number;
  regulatoryRisk?: number;
  transactionRisk?: number;
  financialRisk?: number;
  reputationRisk?: number;
  redFlags?: string[];
  countryRiskRating?: string;
  policyRelated?: boolean;
}

interface RiskAssessmentDisplayProps {
  riskAssessment: RiskAssessment;
}

const RISK_LEVEL_CONFIG: Record<string, { color: string; bgColor: string; icon: any }> = {
  LOW: { color: 'text-green-600', bgColor: 'bg-green-100', icon: CheckCircle },
  MEDIUM: { color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: AlertTriangle },
  HIGH: { color: 'text-orange-600', bgColor: 'bg-orange-100', icon: AlertTriangle },
  CRITICAL: { color: 'text-red-600', bgColor: 'bg-red-100', icon: XCircle }
};

const RECOMMENDATION_LABELS: Record<string, string> = {
  AUTO_APPROVE: 'Auto-Approved',
  MANUAL_REVIEW: 'Manual Review Required',
  MONITOR: 'Under Monitoring',
  REJECT: 'Rejection Recommended',
  SUSPEND: 'Suspension Recommended'
};

export function RiskAssessmentDisplay({ riskAssessment }: RiskAssessmentDisplayProps) {
  const riskConfig = RISK_LEVEL_CONFIG[riskAssessment.riskLevel] || RISK_LEVEL_CONFIG.MEDIUM;
  const RiskIcon = riskConfig.icon;

  const trustScore = 100 - riskAssessment.totalRiskScore;

  const riskFactors = [
    { label: 'Business Age', value: riskAssessment.businessAgeRisk || 0, max: 20 },
    { label: 'Documentation', value: riskAssessment.documentRisk || 0, max: 20 },
    { label: 'Verification', value: riskAssessment.verificationRisk || 0, max: 20 },
    { label: 'Location', value: riskAssessment.locationRisk || 0, max: 20 },
    { label: 'Regulatory', value: riskAssessment.regulatoryRisk || 0, max: 20 },
    { label: 'Transaction', value: riskAssessment.transactionRisk || 0, max: 20 },
    { label: 'Financial', value: riskAssessment.financialRisk || 0, max: 20 },
    { label: 'Reputation', value: riskAssessment.reputationRisk || 0, max: 20 }
  ].filter(f => f.value > 0);

  return (
    <div className="bg-white border rounded-lg p-6">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <Shield className="w-5 h-5 text-blue-600" />
        Risk Assessment
      </h3>

      {/* Risk Score Circle */}
      <div className="flex items-center gap-6 mb-6">
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle cx="48" cy="48" r="40" stroke="#e5e7eb" strokeWidth="8" fill="none" />
            <circle cx="48" cy="48" r="40" 
              stroke={trustScore >= 70 ? '#22c55e' : trustScore >= 50 ? '#eab308' : '#ef4444'}
              strokeWidth="8" fill="none" strokeLinecap="round"
              strokeDasharray={`${(trustScore / 100) * 251.2} 251.2`} />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold">{trustScore}</span>
          </div>
        </div>
        <div>
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${riskConfig.bgColor}`}>
            <RiskIcon className={`w-4 h-4 ${riskConfig.color}`} />
            <span className={`font-medium ${riskConfig.color}`}>{riskAssessment.riskLevel} Risk</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Trust Score: {trustScore}/100
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {RECOMMENDATION_LABELS[riskAssessment.recommendation] || riskAssessment.recommendation}
          </p>
        </div>
      </div>

      {/* Risk Factors */}
      {riskFactors.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Risk Factors</h4>
          {riskFactors.map(factor => (
            <div key={factor.label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">{factor.label}</span>
                <span className={factor.value > 10 ? 'text-red-600' : 'text-gray-600'}>
                  {factor.value}/{factor.max}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div className={`h-1.5 rounded-full ${
                  factor.value > 15 ? 'bg-red-500' : factor.value > 10 ? 'bg-orange-500' : 'bg-green-500'
                }`} style={{ width: `${(factor.value / factor.max) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Red Flags */}
      {riskAssessment.redFlags && riskAssessment.redFlags.length > 0 && (
        <div className="mt-4 p-3 bg-red-50 rounded-lg">
          <h4 className="text-sm font-medium text-red-800 mb-2">Red Flags</h4>
          <ul className="space-y-1">
            {riskAssessment.redFlags.map((flag, index) => (
              <li key={index} className="text-sm text-red-700 flex items-start gap-2">
                <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                {flag}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Policy Warning */}
      {riskAssessment.policyRelated && (
        <div className="mt-4 p-3 bg-orange-50 rounded-lg">
          <p className="text-sm text-orange-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Policy-related restrictions may apply
          </p>
        </div>
      )}
    </div>
  );
}

export default RiskAssessmentDisplay;
