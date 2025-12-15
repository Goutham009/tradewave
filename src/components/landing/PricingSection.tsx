import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const plans = [
  {
    name: 'Starter',
    description: 'Perfect for small businesses getting started with B2B trade.',
    price: '0',
    period: 'month',
    features: [
      'Up to 5 requirements per month',
      'Access to verified suppliers',
      'Basic escrow protection',
      'Email support',
      'Standard documentation',
    ],
    cta: 'Get Started Free',
    popular: false,
  },
  {
    name: 'Professional',
    description: 'For growing businesses with regular trade requirements.',
    price: '299',
    period: 'month',
    features: [
      'Unlimited requirements',
      'Priority supplier matching',
      'Full escrow protection',
      'Blockchain verification',
      'Dedicated account manager',
      'Priority support 24/7',
      'Advanced analytics',
      'API access',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    description: 'Custom solutions for large organizations.',
    price: 'Custom',
    period: '',
    features: [
      'Everything in Professional',
      'Custom integration',
      'White-label options',
      'Dedicated infrastructure',
      'Custom smart contracts',
      'SLA guarantees',
      'On-site training',
      'Volume discounts',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 sm:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Choose the plan that fits your business. No hidden fees, no surprises.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-6xl gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                'relative rounded-2xl border bg-card p-8 transition-all',
                plan.popular && 'border-primary shadow-lg scale-105'
              )}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-sm font-medium text-white">
                  Most Popular
                </div>
              )}

              <div className="text-center">
                <h3 className="text-xl font-semibold text-foreground">{plan.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                
                <div className="mt-6">
                  {plan.price === 'Custom' ? (
                    <span className="text-4xl font-bold text-foreground">Custom</span>
                  ) : (
                    <>
                      <span className="text-4xl font-bold text-foreground">${plan.price}</span>
                      <span className="text-muted-foreground">/{plan.period}</span>
                    </>
                  )}
                </div>
              </div>

              <ul className="mt-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="h-5 w-5 flex-shrink-0 text-primary" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Link href={plan.name === 'Enterprise' ? '/contact' : '/register'}>
                  <Button
                    className="w-full"
                    variant={plan.popular ? 'gradient' : 'outline'}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-12 text-center text-sm text-muted-foreground">
          All plans include 2% transaction fee on successful trades.{' '}
          <Link href="/pricing" className="text-primary hover:underline">
            View full pricing details
          </Link>
        </p>
      </div>
    </section>
  );
}
