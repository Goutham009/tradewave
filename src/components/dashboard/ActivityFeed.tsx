'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, CreditCard, Truck, Package, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface Activity {
  id: string;
  type: 'quote' | 'transaction' | 'payment' | 'delivery';
  title: string;
  description: string;
  time: string;
  status?: 'success' | 'warning' | 'info';
}

const defaultActivities: Activity[] = [
  {
    id: '1',
    type: 'quote',
    title: 'New Quote Received',
    description: 'Quotation for "Industrial Pumps - 50 units"',
    time: '2 hours ago',
    status: 'info',
  },
  {
    id: '2',
    type: 'payment',
    title: 'Payment Released',
    description: '$8,500 for Transaction #TX-8921',
    time: '5 hours ago',
    status: 'success',
  },
  {
    id: '3',
    type: 'delivery',
    title: 'Delivery Confirmed',
    description: 'Order #ORD-4523 delivered successfully',
    time: '1 day ago',
    status: 'success',
  },
  {
    id: '4',
    type: 'transaction',
    title: 'New Transaction Created',
    description: 'Transaction #TX-9012 worth $12,000',
    time: '2 days ago',
    status: 'info',
  },
];

const iconMap = {
  quote: FileText,
  transaction: Package,
  payment: CreditCard,
  delivery: Truck,
};

const iconColorMap = {
  quote: 'bg-brand-primary/10 text-brand-primary',
  transaction: 'bg-brand-accent/10 text-brand-accent',
  payment: 'bg-brand-success/10 text-brand-success',
  delivery: 'bg-brand-warning/10 text-brand-warning',
};

interface ActivityFeedProps {
  activities?: Activity[];
}

export function ActivityFeed({ activities = defaultActivities }: ActivityFeedProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold text-brand-textDark">Recent Activity</CardTitle>
        <Link
          href="/activity"
          className="flex items-center gap-1 text-sm font-medium text-brand-primary hover:underline"
        >
          View All
          <ArrowRight className="h-4 w-4" />
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = iconMap[activity.type];
            const colorClass = iconColorMap[activity.type];

            return (
              <div
                key={activity.id}
                className="flex items-start gap-4 border-b border-slate-100 pb-4 last:border-0 last:pb-0"
              >
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${colorClass}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-brand-textDark">{activity.title}</p>
                    {activity.status && (
                      <Badge
                        variant={activity.status === 'success' ? 'success' : activity.status === 'warning' ? 'warning' : 'info'}
                        className="text-xs"
                      >
                        {activity.status}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-brand-textMedium">{activity.description}</p>
                  <p className="mt-1 text-xs text-brand-textMedium/70">{activity.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
