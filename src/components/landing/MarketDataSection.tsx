'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  Activity,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { LeadCaptureForm } from './LeadCaptureForm';

type LiveCommodity = {
  commodity: string;
  symbol: string;
  price: number;
  changePercent: number;
  unit: string;
};

type MarketDataResponse = {
  prices: LiveCommodity[];
  updatedAt: string;
  sourceLabel: string;
  fallback: boolean;
};

const FALLBACK_MARKET_DATA: LiveCommodity[] = [
  { commodity: 'Copper', price: 8542.50, changePercent: 2.3, unit: 'USD/MT', symbol: 'HG=F' },
  { commodity: 'Aluminum', price: 2285.00, changePercent: -0.8, unit: 'USD/MT', symbol: 'ALI=F' },
  { commodity: 'Nickel', price: 16250.00, changePercent: 1.2, unit: 'USD/MT', symbol: 'NI=F' },
  { commodity: 'Iron Ore', price: 112.40, changePercent: -0.2, unit: 'USD/MT', symbol: 'TIO=F' },
  { commodity: 'Platinum', price: 968.20, changePercent: 0.9, unit: 'USD/oz', symbol: 'PL=F' },
  { commodity: 'Palladium', price: 1025.30, changePercent: -1.1, unit: 'USD/oz', symbol: 'PA=F' },
];

export function MarketDataSection() {
  const [marketData, setMarketData] = useState<LiveCommodity[]>(FALLBACK_MARKET_DATA);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [sourceLabel, setSourceLabel] = useState('Fallback snapshot');
  const [isFallback, setIsFallback] = useState(true);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const getTrendIcon = (changePercent: number) => {
    if (changePercent > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (changePercent < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getTrendColor = (changePercent: number) => {
    if (changePercent > 0) return 'text-green-600';
    if (changePercent < 0) return 'text-red-600';
    return 'text-gray-500';
  };

  const loadMarketData = useCallback(async () => {
    try {
      const response = await fetch('/api/market/live', { cache: 'no-store' });
      if (!response.ok) throw new Error('Failed to load market feed');

      const data = (await response.json()) as MarketDataResponse;
      if (!data.prices?.length) throw new Error('No market data available');

      setMarketData(data.prices);
      setUpdatedAt(data.updatedAt);
      setSourceLabel(data.sourceLabel);
      setIsFallback(data.fallback);
      setFetchError(null);
    } catch (error) {
      setFetchError(error instanceof Error ? error.message : 'Failed to refresh market data');
      setMarketData(FALLBACK_MARKET_DATA);
      setSourceLabel('Fallback snapshot');
      setIsFallback(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMarketData();
    const interval = setInterval(() => void loadMarketData(), 120000);
    return () => clearInterval(interval);
  }, [loadMarketData]);

  const marketSignal = useMemo(() => {
    const positives = marketData.filter((item) => item.changePercent > 0).length;
    const negatives = marketData.filter((item) => item.changePercent < 0).length;
    if (positives > negatives) return { label: 'Bullish', color: 'text-green-600 bg-green-50 border-green-200' };
    if (negatives > positives) return { label: 'Bearish', color: 'text-red-600 bg-red-50 border-red-200' };
    return { label: 'Balanced', color: 'text-gray-600 bg-gray-50 border-gray-200' };
  }, [marketData]);

  const lastUpdatedLabel = updatedAt
    ? new Date(updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'N/A';

  return (
    <section className="relative overflow-hidden bg-brand-bgDark py-20 sm:py-24" id="get-quotes">
      <div className="absolute inset-0">
        <div className="absolute -top-10 right-10 h-44 w-44 rounded-full bg-brand-primary/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-56 w-56 rounded-full bg-brand-accent/20 blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="outline" className="mb-4 border-brand-accent/40 text-brand-accent">
            Live Market Intelligence
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Real-time prices. Instant sourcing.
          </h2>
          <p className="text-base sm:text-lg text-slate-400">
            Track LME metals signals and raise your requirement — all in one place.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left: Live Market Ticker */}
          <Card className="border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-white">
                <BarChart3 className="h-5 w-5 text-brand-accent" />
                LME & Global Metals
              </CardTitle>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className={`inline-flex items-center rounded-full border px-2 py-1 ${marketSignal.color}`}>
                  {marketSignal.label}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-brand-accent/30 bg-brand-accent/10 px-2 py-1 text-brand-accent">
                  <Activity className="h-3.5 w-3.5" />
                  {sourceLabel}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/5 px-2 py-1 text-slate-400">
                  <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Refreshing' : `Updated ${lastUpdatedLabel}`}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {marketData.map((item) => (
                  <div
                    key={item.symbol}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition-colors hover:bg-white/10"
                  >
                    <div className="flex items-center gap-3">
                      {getTrendIcon(item.changePercent)}
                      <div>
                        <p className="font-medium text-white">{item.commodity}</p>
                        <p className="text-[11px] uppercase tracking-wide text-slate-500">{item.symbol}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-white">
                        ${item.price.toLocaleString()}
                        <span className="ml-1 text-xs text-slate-500">{item.unit}</span>
                      </p>
                      <p className={`text-xs font-medium ${getTrendColor(item.changePercent)}`}>
                        {item.changePercent > 0 ? '+' : ''}
                        {item.changePercent.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-500">
                Last update: <strong className="text-slate-400">{lastUpdatedLabel}</strong> • Auto refresh: every 2 min
                {isFallback && ' • Showing fallback snapshot'}
              </div>
              {fetchError && (
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-400">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {fetchError}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right: Lead Capture Form */}
          <div>
            <LeadCaptureForm />
          </div>
        </div>
      </div>
    </section>
  );
}

export default MarketDataSection;
