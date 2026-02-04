'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  prefix?: string;
  suffix?: string;
}

export function StatsCard({
  title,
  value,
  change,
  changeLabel = 'vs last period',
  icon: Icon,
  iconColor = 'text-brand-primary',
  iconBg = 'bg-brand-primary/10',
  prefix = '',
  suffix = '',
}: StatsCardProps) {
  const formattedValue =
    typeof value === 'number' ? value.toLocaleString() : value;

  const getTrendIcon = () => {
    if (change === undefined || change === 0) {
      return <Minus className="h-3 w-3" />;
    }
    return change > 0 ? (
      <TrendingUp className="h-3 w-3" />
    ) : (
      <TrendingDown className="h-3 w-3" />
    );
  };

  const getTrendColor = () => {
    if (change === undefined || change === 0) return 'text-slate-500';
    return change > 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {prefix}
              {formattedValue}
              {suffix}
            </p>
            {change !== undefined && (
              <div className={cn('mt-2 flex items-center gap-1 text-xs', getTrendColor())}>
                {getTrendIcon()}
                <span className="font-medium">
                  {change > 0 ? '+' : ''}
                  {change.toFixed(1)}%
                </span>
                <span className="text-muted-foreground">{changeLabel}</span>
              </div>
            )}
          </div>
          {Icon && (
            <div className={cn('rounded-xl p-3', iconBg)}>
              <Icon className={cn('h-5 w-5', iconColor)} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
