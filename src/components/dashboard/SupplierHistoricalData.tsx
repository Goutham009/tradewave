'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Target, Calendar, BarChart3 } from 'lucide-react';

interface HistoricalQuotation {
  id: string;
  createdAt: string;
  productType: string;
  totalPrice: number;
  status: 'ACCEPTED' | 'REJECTED' | 'PENDING' | 'EXPIRED';
}

interface HistoricalData {
  totalQuotations: number;
  winRate: number;
  avgQuoteValue: number;
  totalValue: number;
  recentQuotations: HistoricalQuotation[];
  trends: {
    quotationsChange: number;
    winRateChange: number;
    avgValueChange: number;
  };
}

const mockHistoricalData: HistoricalData = {
  totalQuotations: 47,
  winRate: 34.5,
  avgQuoteValue: 28500,
  totalValue: 1339500,
  recentQuotations: [
    {
      id: 'q-001',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      productType: 'Industrial Sensors',
      totalPrice: 45000,
      status: 'ACCEPTED',
    },
    {
      id: 'q-002',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      productType: 'LED Display Panels',
      totalPrice: 32000,
      status: 'PENDING',
    },
    {
      id: 'q-003',
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      productType: 'Steel Components',
      totalPrice: 18500,
      status: 'REJECTED',
    },
    {
      id: 'q-004',
      createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      productType: 'Electronic Parts',
      totalPrice: 56000,
      status: 'ACCEPTED',
    },
    {
      id: 'q-005',
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      productType: 'Packaging Materials',
      totalPrice: 12000,
      status: 'EXPIRED',
    },
    {
      id: 'q-006',
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      productType: 'Industrial Valves',
      totalPrice: 28000,
      status: 'ACCEPTED',
    },
  ],
  trends: {
    quotationsChange: 12.5,
    winRateChange: 5.2,
    avgValueChange: -3.1,
  },
};

export function SupplierHistoricalData() {
  const [historicalData, setHistoricalData] = useState<HistoricalData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistoricalData();
  }, [selectedPeriod]);

  const fetchHistoricalData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/quotations/historical?period=${selectedPeriod}`);
      if (response.ok) {
        const data = await response.json();
        setHistoricalData(data);
      } else {
        setHistoricalData(mockHistoricalData);
      }
    } catch {
      setHistoricalData(mockHistoricalData);
    }
    setLoading(false);
  };

  if (loading || !historicalData) {
    return (
      <Card className="p-8 text-center">
        <p className="text-neutral-500">Loading historical data...</p>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return <Badge variant="success">Won</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive">Lost</Badge>;
      case 'PENDING':
        return <Badge variant="warning">Pending</Badge>;
      case 'EXPIRED':
        return <Badge variant="default">Expired</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return '🎉';
      case 'REJECTED': return '❌';
      case 'PENDING': return '⏳';
      case 'EXPIRED': return '⌛';
      default: return '📋';
    }
  };

  const TrendIndicator = ({ value, label }: { value: number; label: string }) => (
    <div className="flex items-center gap-1 text-xs">
      {value >= 0 ? (
        <TrendingUp className="w-3 h-3 text-green-500" />
      ) : (
        <TrendingDown className="w-3 h-3 text-red-500" />
      )}
      <span className={value >= 0 ? 'text-green-600' : 'text-red-600'}>
        {value >= 0 ? '+' : ''}{value.toFixed(1)}%
      </span>
      <span className="text-neutral-500">{label}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-teal-600" />
          <h3 className="text-lg font-bold">Historical Quotation Data</h3>
        </div>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="px-3 py-2 border border-neutral-300 rounded-lg text-sm"
        >
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
          <option value="365">Last Year</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-600">Quotations Sent</p>
              <p className="text-2xl font-bold">{historicalData.totalQuotations}</p>
            </div>
          </div>
          <TrendIndicator value={historicalData.trends.quotationsChange} label="vs prev" />
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-600">Win Rate</p>
              <p className="text-2xl font-bold text-green-600">
                {historicalData.winRate.toFixed(1)}%
              </p>
            </div>
          </div>
          <TrendIndicator value={historicalData.trends.winRateChange} label="vs prev" />
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-600">Avg Quote Value</p>
              <p className="text-2xl font-bold">
                ${historicalData.avgQuoteValue.toLocaleString()}
              </p>
            </div>
          </div>
          <TrendIndicator value={historicalData.trends.avgValueChange} label="vs prev" />
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-600">Total Value</p>
              <p className="text-2xl font-bold">
                ${(historicalData.totalValue / 1000).toFixed(0)}K
              </p>
            </div>
          </div>
          <p className="text-xs text-neutral-500">All time quotes</p>
        </Card>
      </div>

      {/* Recent Quotations Table */}
      <Card className="p-6">
        <h4 className="font-semibold mb-4">Recent Quotations</h4>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Product</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-600">Value</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-neutral-600">Status</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-neutral-600">Result</th>
              </tr>
            </thead>
            <tbody>
              {historicalData.recentQuotations.map((quote) => (
                <tr key={quote.id} className="border-t border-neutral-200 hover:bg-neutral-50">
                  <td className="px-4 py-3 text-sm">
                    {new Date(quote.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">{quote.productType}</td>
                  <td className="px-4 py-3 text-right font-semibold">
                    ${quote.totalPrice.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {getStatusBadge(quote.status)}
                  </td>
                  <td className="px-4 py-3 text-center text-lg">
                    {getStatusEmoji(quote.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {historicalData.recentQuotations.length === 0 && (
          <div className="text-center py-8 text-neutral-500">
            No quotations found for this period
          </div>
        )}
      </Card>

      {/* Tips Card */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-2">💡 Tips to Improve Win Rate</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Respond to quotation requests within 24 hours for better visibility</li>
          <li>• Offer competitive pricing while maintaining quality standards</li>
          <li>• Include detailed specifications and certifications in your quotes</li>
          <li>• Maintain high ratings by delivering on time and as promised</li>
        </ul>
      </Card>
    </div>
  );
}
