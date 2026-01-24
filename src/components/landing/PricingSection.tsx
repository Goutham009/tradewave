'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const plans = [
  {
    name: 'Starter',
    description: 'Perfect for small businesses getting started with B2B trade',
    monthlyPrice: 0,
    annualPrice: 0,
    features: [
      'Up to 5 requirements per month',
      'Basic supplier matching',
      'Email support',
      'Standard escrow protection',
      'Basic analytics dashboard',
    ],
    cta: 'Get Started Free',
    popular: false,
  },
  {
    name: 'Professional',
    description: 'For growing businesses with regular trading needs',
    monthlyPrice: 99,
    annualPrice: 79,
    features: [
      'Unlimited requirements',
      'Priority supplier matching',
      'Priority email & chat support',
      'Advanced escrow with insurance',
      'Full analytics & reports',
      'API access',
      'Custom payment terms',
      'Dedicated account manager',
    ],
    cta: 'Start 14-Day Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    description: 'Custom solutions for large-scale operations',
    monthlyPrice: null,
    annualPrice: null,
    features: [
      'Everything in Professional',
      'Custom integrations',
      'White-label options',
      'SLA guarantees',
      'On-premise deployment',
      'Custom compliance',
      'Dedicated support team',
      'Training & onboarding',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section id="pricing" className="py-24 bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <Badge variant="outline" className="mb-4">
            <Sparkles className="mr-1 h-3 w-3" />
            Pricing
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Choose the plan that best fits your business needs. All plans include core platform features.
          </p>

          {/* Toggle */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <span className={cn('text-sm font-medium', !isAnnual ? 'text-foreground' : 'text-muted-foreground')}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={cn(
                'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                isAnnual ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'
              )}
            >
              <span
                className={cn(
                  'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                  isAnnual ? 'translate-x-5' : 'translate-x-0'
                )}
              />
            </button>
            <span className={cn('text-sm font-medium', isAnnual ? 'text-foreground' : 'text-muted-foreground')}>
              Annual
              <Badge variant="secondary" className="ml-2 text-xs">
                Save 20%
              </Badge>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={cn(
                'relative flex flex-col transition-all duration-300 hover:shadow-xl',
                plan.popular && 'border-primary shadow-lg scale-105 lg:scale-110'
              )}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-white px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              <CardHeader className="pb-8 pt-6">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription className="mt-2">{plan.description}</CardDescription>
                <div className="mt-6">
                  {plan.monthlyPrice !== null ? (
                    <>
                      <span className="text-4xl font-bold">
                        ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                      </span>
                      <span className="text-muted-foreground">/month</span>
                      {isAnnual && plan.monthlyPrice > 0 && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          Billed annually (${plan.annualPrice * 12}/year)
                        </p>
                      )}
                    </>
                  ) : (
                    <span className="text-4xl font-bold">Custom</span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="h-5 w-5 shrink-0 text-primary" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <div className="p-6 pt-0">
                <Link href={plan.name === 'Enterprise' ? '/contact' : '/register'}>
                  <Button
                    className="w-full"
                    variant={plan.popular ? 'gradient' : 'outline'}
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>

        {/* Bottom Note */}
        <p className="mt-12 text-center text-sm text-muted-foreground">
          All plans include SSL encryption, 24/7 monitoring, and GDPR compliance.
          <br />
          Need a custom plan?{' '}
          <Link href="/contact" className="text-primary hover:underline">
            Contact our sales team
          </Link>
        </p>
      </div>
    </section>
  );
}
