'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, DollarSign, ShoppingCart, RefreshCw, 
  AlertTriangle, Users, BarChart3, PieChart 
} from 'lucide-react';

interface Analytics {
  totalOrders: number;
  totalSpent: string;
  averageOrderValue: string;
  repeatBuyerRate: string;
  topRepeatSuppliers: string[];
  topCategories: string[];
  churnRisk: string;
  daysSinceLastOrder: number | null;
  lastMonthSpending: string;
  lastQuarterSpending: string;
  yearOverYearGrowth: string;
  topRepeatSuppliersDetails: {
    id: string;
    name: string;
    companyName: string;
    avatar: string | null;
  }[];
}

export default function PurchaseAnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/buyer/purchase-history/analytics');
      const data = await res.json();
      setAnalytics(data.analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(parseFloat(amount || '0'));
  };

  const getChurnRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'bg-green-100 text-green-700';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-700';
      case 'HIGH': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-gray-500">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Purchase Analytics</h1>
          <p className="text-gray-500 mt-1">Insights into your buying patterns</p>
        </div>
        <a
          href="/buyer/history"
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          View History
        </a>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {analytics?.totalOrders || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(analytics?.totalSpent || '0')}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg Order Value</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(analytics?.averageOrderValue || '0')}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Repeat Rate</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {parseFloat(analytics?.repeatBuyerRate || '0').toFixed(1)}%
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spending Trend */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Spending Trend
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Last Month</span>
              <span className="font-medium">{formatCurrency(analytics?.lastMonthSpending || '0')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Last Quarter</span>
              <span className="font-medium">{formatCurrency(analytics?.lastQuarterSpending || '0')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">YoY Growth</span>
              <span className={`font-medium ${parseFloat(analytics?.yearOverYearGrowth || '0') >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {parseFloat(analytics?.yearOverYearGrowth || '0') >= 0 ? '+' : ''}
                {parseFloat(analytics?.yearOverYearGrowth || '0').toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Churn Risk */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            Activity Status
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Churn Risk</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getChurnRiskColor(analytics?.churnRisk || 'LOW')}`}>
                {analytics?.churnRisk || 'LOW'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Days Since Last Order</span>
              <span className="font-medium">{analytics?.daysSinceLastOrder || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-purple-600" />
            Top Categories
          </h3>
          <div className="space-y-2">
            {analytics?.topCategories?.slice(0, 5).map((category, index) => (
              <div key={category} className="flex items-center gap-2">
                <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs text-gray-600">
                  {index + 1}
                </span>
                <span className="text-gray-700">{category}</span>
              </div>
            )) || <p className="text-gray-500">No data yet</p>}
          </div>
        </div>
      </div>

      {/* Top Suppliers */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          Top Suppliers
        </h3>
        {analytics?.topRepeatSuppliersDetails?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {analytics.topRepeatSuppliersDetails.map((supplier) => (
              <div key={supplier.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  {supplier.avatar ? (
                    <img src={supplier.avatar} alt={supplier.name} className="w-10 h-10 rounded-full" />
                  ) : (
                    <span className="text-blue-600 font-medium">
                      {(supplier.companyName || supplier.name).charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    {supplier.companyName || supplier.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No supplier data yet</p>
        )}
      </div>
    </div>
  );
}
