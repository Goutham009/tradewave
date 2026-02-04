'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Globe, BarChart3 } from 'lucide-react';
import { LeadCaptureForm } from './LeadCaptureForm';

// Mock market data - in production, fetch from real API
const marketData = [
  {
    commodity: 'Copper',
    price: 8542.50,
    change: 2.3,
    unit: 'USD/MT',
    trend: 'up',
  },
  {
    commodity: 'Aluminum',
    price: 2285.00,
    change: -0.8,
    unit: 'USD/MT',
    trend: 'down',
  },
  {
    commodity: 'Steel HRC',
    price: 645.00,
    change: 1.2,
    unit: 'USD/MT',
    trend: 'up',
  },
  {
    commodity: 'Zinc',
    price: 2456.75,
    change: 0,
    unit: 'USD/MT',
    trend: 'neutral',
  },
  {
    commodity: 'Nickel',
    price: 16250.00,
    change: 3.1,
    unit: 'USD/MT',
    trend: 'up',
  },
  {
    commodity: 'Lead',
    price: 2089.50,
    change: -1.5,
    unit: 'USD/MT',
    trend: 'down',
  },
];

const stats = [
  { label: 'Active Suppliers', value: '2,500+', icon: Globe },
  { label: 'Countries Covered', value: '45+', icon: Globe },
  { label: 'Avg Response Time', value: '< 24hrs', icon: BarChart3 },
  { label: 'Successful Trades', value: '$50M+', icon: TrendingUp },
];

export function MarketDataSection() {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <section className="relative overflow-hidden bg-brand-bgLight py-16" id="get-quotes">
      <div className="absolute inset-0">
        <div className="absolute -top-10 right-10 h-40 w-40 rounded-full bg-brand-primary/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-brand-accent/10 blur-3xl" />
      </div>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 relative">
          <Badge variant="outline" className="mb-4 border-brand-primary/30 text-brand-primary">
            Live Market Data
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-brand-textDark mb-4">
            Source smarter with real-time insights
          </h2>
          <p className="text-lg text-brand-textMedium">
            Get competitive quotes from verified suppliers. No login required.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Side: Market Data + Stats */}
          <div className="space-y-6">
            {/* Market Prices */}
            <Card className="border border-white/80 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-brand-primary" />
                  Today's Market Prices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {marketData.map((item) => (
                    <div
                      key={item.commodity}
                      className="flex items-center justify-between py-2 border-b last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        {getTrendIcon(item.trend)}
                        <span className="font-medium">{item.commodity}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-brand-textDark">
                          ${item.price.toLocaleString()}
                          <span className="text-xs text-gray-500 ml-1">
                            /{item.unit.split('/')[1]}
                          </span>
                        </p>
                        <p className={`text-xs ${getTrendColor(item.trend)}`}>
                          {item.change > 0 ? '+' : ''}
                          {item.change}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-4 text-center">
                  Prices updated every 15 minutes • Data from LME
                </p>
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.label} className="text-center border border-white/80">
                    <CardContent className="pt-6">
                      <Icon className="h-6 w-6 mx-auto text-brand-accent mb-2" />
                      <p className="text-2xl font-bold text-brand-textDark">{stat.value}</p>
                      <p className="text-sm text-brand-textMedium">{stat.label}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Trust Badges */}
            <Card className="bg-gradient-to-r from-brand-primary/10 to-brand-accent/10 border-brand-primary/20">
              <CardContent className="py-4">
                <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-brand-textDark">
                  <span className="flex items-center gap-1">
                    ✓ Verified Suppliers Only
                  </span>
                  <span className="flex items-center gap-1">
                    ✓ Escrow Protection
                  </span>
                  <span className="flex items-center gap-1">
                    ✓ Quality Guaranteed
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side: Lead Capture Form */}
          <div>
            <LeadCaptureForm />
          </div>
        </div>
      </div>
    </section>
  );
}

export default MarketDataSection;
