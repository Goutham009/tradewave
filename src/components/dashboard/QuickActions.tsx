'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Clock, BarChart3, ArrowRight } from 'lucide-react';

const actions = [
  {
    icon: FileText,
    title: 'Post New Requirement',
    description: 'Start sourcing products',
    href: '/requirements/new',
    iconBg: 'bg-brand-primary/10',
    iconColor: 'text-brand-primary',
  },
  {
    icon: Clock,
    title: 'View Quotations',
    description: '8 pending review',
    href: '/quotations',
    iconBg: 'bg-brand-warning/10',
    iconColor: 'text-brand-warning',
  },
  {
    icon: BarChart3,
    title: 'View Analytics',
    description: 'Track your performance',
    href: '/analytics',
    iconBg: 'bg-brand-accent/10',
    iconColor: 'text-brand-accent',
  },
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-bold text-brand-textDark">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Link key={index} href={action.href}>
              <div className="group flex items-center gap-4 rounded-xl p-3 transition-all duration-200 hover:bg-slate-50">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${action.iconBg}`}>
                  <Icon className={`h-5 w-5 ${action.iconColor}`} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-brand-textDark">{action.title}</p>
                  <p className="text-sm text-brand-textMedium">{action.description}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-brand-textMedium/50 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
