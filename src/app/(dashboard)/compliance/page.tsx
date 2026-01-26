'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Shield, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  Package,
  FileText,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';

interface ComplianceData {
  user?: {
    id: string;
    name: string;
    email: string;
    tierLabel: string;
  };
  supplier?: {
    id: string;
    name: string;
    companyName: string;
    tierLabel: string;
  };
  compliance: {
    score: number;
    riskLevel: string;
    isComplianceRisk: boolean;
    violations: string[];
    recommendations: string[];
    lastAssessment: string | null;
  };
  tier: {
    current: string;
    displayName: string;
    badgeColor: string;
    visibilityMultiplier?: number;
    discountPercentage?: number;
  };
  metrics: Record<string, string | number | boolean>;
  pendingTierChange?: {
    id: string;
    proposedTier: string;
    reason: string;
    status: string;
  } | null;
  activeViolations?: Array<{
    id: string;
    type: string;
    severity: string;
    description: string;
    status: string;
  }>;
}

const RISK_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  LOW: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
  MEDIUM: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
  HIGH: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
  CRITICAL: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
};

export default function ComplianceDashboard() {
  const { data: session } = useSession();
  const [buyerData, setBuyerData] = useState<ComplianceData | null>(null);
  const [supplierData, setSupplierData] = useState<ComplianceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'buyer' | 'supplier'>('buyer');

  useEffect(() => {
    if (session?.user?.id) {
      fetchComplianceData();
    }
  }, [session?.user?.id]);

  const fetchComplianceData = async () => {
    if (!session?.user?.id) return;
    
    setLoading(true);
    try {
      // Fetch buyer compliance (for current user)
      const buyerRes = await fetch(`/api/compliance/buyer/${session.user.id}`);
      if (buyerRes.ok) {
        const data = await buyerRes.json();
        setBuyerData(data);
      }

      // If user is also a supplier, fetch supplier data
      // This would need the supplier ID - for now we skip if not available
    } catch (error) {
      console.error('Error fetching compliance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const runAssessment = async (type: 'buyer' | 'supplier') => {
    if (!session?.user?.id) return;
    
    setRefreshing(true);
    try {
      const endpoint = type === 'buyer' 
        ? `/api/compliance/buyer/${session.user.id}`
        : `/api/compliance/supplier/${session.user.id}`;
      
      const res = await fetch(endpoint, { method: 'POST' });
      if (res.ok) {
        await fetchComplianceData();
      }
    } catch (error) {
      console.error('Error running assessment:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const renderScoreGauge = (score: number, riskLevel: string) => {
    const colors = RISK_COLORS[riskLevel] || RISK_COLORS.MEDIUM;
    const rotation = (score / 100) * 180 - 90;
    
    return (
      <div className="relative w-48 h-24 mx-auto">
        <div className="absolute inset-0 rounded-t-full bg-gradient-to-r from-red-200 via-yellow-200 to-green-200 overflow-hidden">
          <div 
            className="absolute bottom-0 left-1/2 w-1 h-20 bg-gray-800 origin-bottom transform -translate-x-1/2"
            style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
          />
        </div>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-center">
          <span className={`text-3xl font-bold ${colors.text}`}>{score}</span>
          <span className="text-sm text-gray-500 block">/ 100</span>
        </div>
      </div>
    );
  };

  const renderTierCard = (data: ComplianceData, type: 'buyer' | 'supplier') => {
    const tierLabel = type === 'buyer' ? '(Buyer Tier)' : '(Seller Tier)';
    const colors = RISK_COLORS[data.compliance.riskLevel] || RISK_COLORS.MEDIUM;
    
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {tierLabel} {data.tier.displayName}
            </h3>
            <p className="text-sm text-gray-500">
              {type === 'buyer' ? 'Your buyer standing' : 'Your seller standing'}
            </p>
          </div>
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: data.tier.badgeColor }}
          >
            {data.tier.current.charAt(0)}
          </div>
        </div>

        {/* Compliance Score */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Compliance Score</span>
            <span className={`text-xs px-2 py-1 rounded-full ${colors.bg} ${colors.text}`}>
              {data.compliance.riskLevel} Risk
            </span>
          </div>
          {renderScoreGauge(data.compliance.score, data.compliance.riskLevel)}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {Object.entries(data.metrics).slice(0, 4).map(([key, value]) => (
            <div key={key} className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </p>
              <p className="text-lg font-semibold text-gray-900">{String(value)}</p>
            </div>
          ))}
        </div>

        {/* Tier Benefits */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Tier Benefits</h4>
          {type === 'supplier' && data.tier.visibilityMultiplier && (
            <div className="flex items-center text-sm text-gray-600">
              <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
              <span>{data.tier.visibilityMultiplier}x visibility in search</span>
            </div>
          )}
          {type === 'buyer' && data.tier.discountPercentage !== undefined && (
            <div className="flex items-center text-sm text-gray-600">
              <Star className="w-4 h-4 mr-2 text-yellow-500" />
              <span>{data.tier.discountPercentage}% discount on orders</span>
            </div>
          )}
        </div>

        {/* Refresh Button */}
        <button
          onClick={() => runAssessment(type)}
          disabled={refreshing}
          className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Run Assessment
        </button>
      </div>
    );
  };

  const renderViolations = (violations: string[], recommendations: string[]) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-orange-500" />
        Compliance Issues & Recommendations
      </h3>

      {violations.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-red-700 mb-2">Active Violations</h4>
          <ul className="space-y-2">
            {violations.map((v, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                {v}
              </li>
            ))}
          </ul>
        </div>
      )}

      {recommendations.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-blue-700 mb-2">Recommendations</h4>
          <ul className="space-y-2">
            {recommendations.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <ChevronRight className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {violations.length === 0 && recommendations.length === 0 && (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="w-5 h-5" />
          <span>No compliance issues found. Great job!</span>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="w-8 h-8 text-teal-600" />
            Compliance Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Monitor your buyer and seller compliance scores, tier status, and recommendations.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('buyer')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'buyer'
                ? 'bg-teal-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Package className="w-4 h-4 inline mr-2" />
            Buyer Tier
          </button>
          <button
            onClick={() => setActiveTab('supplier')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'supplier'
                ? 'bg-teal-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Seller Tier
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {activeTab === 'buyer' && buyerData && (
            <>
              {renderTierCard(buyerData, 'buyer')}
              {renderViolations(
                buyerData.compliance.violations,
                buyerData.compliance.recommendations
              )}
            </>
          )}

          {activeTab === 'supplier' && supplierData && (
            <>
              {renderTierCard(supplierData, 'supplier')}
              {renderViolations(
                supplierData.compliance.violations,
                supplierData.compliance.recommendations
              )}
            </>
          )}

          {activeTab === 'buyer' && !buyerData && (
            <div className="col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Buyer Data Available</h3>
              <p className="text-gray-500">Complete some purchases to see your buyer compliance score.</p>
            </div>
          )}

          {activeTab === 'supplier' && !supplierData && (
            <div className="col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Seller Data Available</h3>
              <p className="text-gray-500">Register as a supplier to see your seller compliance score.</p>
            </div>
          )}
        </div>

        {/* Pending Tier Change Notice */}
        {supplierData?.pendingTierChange && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Tier Change Pending Review</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  A tier change to <strong>(Seller Tier) {supplierData.pendingTierChange.proposedTier}</strong> is 
                  pending admin approval. Reason: {supplierData.pendingTierChange.reason}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-medium text-blue-800 mb-2">About Compliance Tiers</h3>
          <div className="text-sm text-blue-700 space-y-2">
            <p>
              <strong>(Buyer Tier)</strong> levels are based on your order history, payment reliability, 
              and dispute behavior. Higher tiers unlock better discounts and priority support.
            </p>
            <p>
              <strong>(Seller Tier)</strong> levels affect your visibility in search results. 
              Trusted sellers get 1.5x visibility boost, while sellers under review have reduced visibility.
            </p>
            <p>
              Tier changes are reviewed by our admin team to ensure fair treatment. 
              You will be notified of any tier changes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
