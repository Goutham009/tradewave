'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, Flag, MessageSquare, Clock, DollarSign, FileWarning } from 'lucide-react';
import { RiskIndicator } from './RiskIndicator';

interface BuyerTrustCardProps {
  buyerId: string;
  showNotes?: boolean;
  onAddNote?: () => void;
}

interface TrustScoreData {
  overallScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  riskCategory: string | null;
  paymentReliabilityScore: number;
  disputeHistoryScore: number;
  behavioralScore: number;
  complianceScore: number;
  totalTransactions: number;
  paymentOnTimePercentage: number;
  totalDisputes: number;
  flags: any[];
  isBlacklisted?: boolean;
  buyer?: {
    name: string;
    companyName: string;
  };
}

export function BuyerTrustCard({ buyerId, showNotes = true, onAddNote }: BuyerTrustCardProps) {
  const [data, setData] = useState<TrustScoreData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrustScore();
  }, [buyerId]);

  const fetchTrustScore = async () => {
    try {
      const res = await fetch(`/api/buyer-trust/${buyerId}`);
      if (res.ok) {
        const trustData = await res.json();
        setData(trustData);
      }
    } catch (err) {
      console.error('Failed to fetch trust score:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border rounded-lg p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white border rounded-lg p-4 text-center text-gray-500">
        No trust data available
      </div>
    );
  }

  const scoreChange = data.overallScore >= 50 ? 'positive' : 'negative';

  return (
    <div className="bg-white border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">{data.buyer?.companyName || 'Buyer'}</h3>
            <p className="text-sm text-gray-500">{data.buyer?.name}</p>
          </div>
          <RiskIndicator
            riskLevel={data.riskLevel}
            score={data.overallScore}
            flagCount={data.flags?.length || 0}
            isBlacklisted={data.isBlacklisted}
          />
        </div>
      </div>

      {/* Score Display */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-500">Trust Score</p>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold">{data.overallScore}</span>
              <span className="text-gray-400">/100</span>
              {scoreChange === 'positive' ? (
                <TrendingUp className="w-5 h-5 text-green-500" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-500" />
              )}
            </div>
          </div>
          {data.riskCategory && (
            <div className="text-right">
              <p className="text-sm text-gray-500">Risk Category</p>
              <p className="text-sm font-medium text-orange-600">
                {data.riskCategory.replace(/_/g, ' ')}
              </p>
            </div>
          )}
        </div>

        {/* Component Scores */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <ScoreBar label="Payment" score={data.paymentReliabilityScore} icon={DollarSign} />
          <ScoreBar label="Disputes" score={data.disputeHistoryScore} icon={FileWarning} />
          <ScoreBar label="Behavior" score={data.behavioralScore} icon={Flag} />
          <ScoreBar label="Compliance" score={data.complianceScore} icon={Clock} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-center border-t pt-4">
          <div>
            <p className="text-lg font-semibold">{data.totalTransactions}</p>
            <p className="text-xs text-gray-500">Transactions</p>
          </div>
          <div>
            <p className="text-lg font-semibold">{Number(data.paymentOnTimePercentage).toFixed(0)}%</p>
            <p className="text-xs text-gray-500">On-Time</p>
          </div>
          <div>
            <p className="text-lg font-semibold">{data.totalDisputes}</p>
            <p className="text-xs text-gray-500">Disputes</p>
          </div>
        </div>

        {/* Active Flags */}
        {data.flags && data.flags.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm font-medium text-red-600 flex items-center gap-1 mb-2">
              <AlertTriangle className="w-4 h-4" />
              Active Flags ({data.flags.length})
            </p>
            <div className="space-y-1">
              {data.flags.slice(0, 3).map((flag: any) => (
                <div key={flag.id} className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded">
                  {flag.flagType.replace(/_/g, ' ')} - {flag.severity}
                </div>
              ))}
              {data.flags.length > 3 && (
                <p className="text-xs text-gray-500">+{data.flags.length - 3} more</p>
              )}
            </div>
          </div>
        )}

        {/* Add Note Button */}
        {showNotes && onAddNote && (
          <button onClick={onAddNote}
            className="mt-4 w-full py-2 border rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-gray-50">
            <MessageSquare className="w-4 h-4" />
            Add Note
          </button>
        )}
      </div>
    </div>
  );
}

function ScoreBar({ label, score, icon: Icon }: { label: string; score: number; icon: any }) {
  const getColor = (s: number) => {
    if (s >= 70) return 'bg-green-500';
    if (s >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-gray-50 p-2 rounded">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-600 flex items-center gap-1">
          <Icon className="w-3 h-3" />
          {label}
        </span>
        <span className="text-xs font-medium">{score}</span>
      </div>
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full ${getColor(score)} rounded-full`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

export default BuyerTrustCard;
