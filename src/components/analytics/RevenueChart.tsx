'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface DataPoint {
  date: string;
  value: number;
}

interface RevenueChartProps {
  data: DataPoint[];
  title?: string;
  valuePrefix?: string;
}

export function RevenueChart({
  data,
  title = 'Revenue Trend',
  valuePrefix = '$',
}: RevenueChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value));
  const minValue = Math.min(...data.map((d) => d.value));
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const average = total / data.length;

  // Calculate trend
  const firstHalf = data.slice(0, Math.floor(data.length / 2));
  const secondHalf = data.slice(Math.floor(data.length / 2));
  const firstAvg = firstHalf.reduce((s, d) => s + d.value, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((s, d) => s + d.value, 0) / secondHalf.length;
  const trendUp = secondAvg >= firstAvg;
  const trendPercent = firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        <div
          className={`flex items-center gap-1 text-sm font-medium ${
            trendUp ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {trendUp ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
          {Math.abs(trendPercent).toFixed(1)}%
        </div>
      </CardHeader>
      <CardContent>
        {/* Chart */}
        <div className="relative h-48">
          <div className="absolute inset-0 flex items-end justify-between gap-1">
            {data.map((item, index) => {
              const height = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
              return (
                <div
                  key={index}
                  className="group relative flex-1"
                  style={{ height: '100%' }}
                >
                  <div
                    className="absolute bottom-0 w-full rounded-t bg-gradient-to-t from-brand-primary to-brand-primary/70 transition-all duration-200 hover:from-brand-primary/90 hover:to-brand-primary/60"
                    style={{ height: `${Math.max(height, 2)}%` }}
                  />
                  {/* Tooltip */}
                  <div className="pointer-events-none absolute -top-12 left-1/2 z-10 hidden -translate-x-1/2 rounded bg-slate-900 px-2 py-1 text-xs text-white group-hover:block">
                    <div className="font-medium">
                      {valuePrefix}
                      {item.value.toLocaleString()}
                    </div>
                    <div className="text-slate-400">
                      {new Date(item.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* X-axis labels */}
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>
            {new Date(data[0].date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
          <span>
            {new Date(data[data.length - 1].date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-3 gap-4 border-t pt-4">
          <div>
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-lg font-semibold">
              {valuePrefix}
              {total.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Average</p>
            <p className="text-lg font-semibold">
              {valuePrefix}
              {average.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Peak</p>
            <p className="text-lg font-semibold">
              {valuePrefix}
              {maxValue.toLocaleString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
