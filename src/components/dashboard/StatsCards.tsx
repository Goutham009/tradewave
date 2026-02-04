'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, CheckCircle2, Clock, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string;
  trend: string;
  isPositive: boolean;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}

function StatCard({ label, value, trend, isPositive, icon, iconBg, iconColor }: StatCardProps) {
  return (
    <Card className="group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-brand-textMedium">{label}</p>
            <p className="mt-2 text-3xl font-bold text-brand-textDark">{value}</p>
            <div className={cn(
              'mt-2 flex items-center gap-1 text-sm font-medium',
              isPositive ? 'text-brand-success' : 'text-brand-error'
            )}>
              {isPositive ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span>{trend}</span>
            </div>
          </div>
          <div className={cn('rounded-xl p-3', iconBg)}>
            <div className={iconColor}>{icon}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface StatsCardsProps {
  revenue?: string;
  revenueChange?: string;
  completedOrders?: number;
  ordersChange?: string;
  pendingOrders?: number;
  avgRating?: number;
  ratingChange?: string;
}

export function StatsCards({
  revenue = '$12,450',
  revenueChange = '+15%',
  completedOrders = 24,
  ordersChange = '+3 from last month',
  pendingOrders = 2,
  avgRating = 4.8,
  ratingChange = '+0.2 from last month',
}: StatsCardsProps) {
  const stats = [
    {
      label: 'Revenue (Month)',
      value: revenue,
      trend: revenueChange,
      isPositive: true,
      icon: <DollarSign className="h-6 w-6" />,
      iconBg: 'bg-brand-success/10',
      iconColor: 'text-brand-success',
    },
    {
      label: 'Completed Orders',
      value: completedOrders.toString(),
      trend: ordersChange,
      isPositive: true,
      icon: <CheckCircle2 className="h-6 w-6" />,
      iconBg: 'bg-brand-primary/10',
      iconColor: 'text-brand-primary',
    },
    {
      label: 'Pending Orders',
      value: pendingOrders.toString(),
      trend: 'On track',
      isPositive: true,
      icon: <Clock className="h-6 w-6" />,
      iconBg: 'bg-brand-warning/10',
      iconColor: 'text-brand-warning',
    },
    {
      label: 'Avg Rating',
      value: `${avgRating}★`,
      trend: ratingChange,
      isPositive: true,
      icon: <Star className="h-6 w-6" />,
      iconBg: 'bg-brand-accent/10',
      iconColor: 'text-brand-accent',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}
