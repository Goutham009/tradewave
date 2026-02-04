import React from 'react';
import {
  ShieldCheck,
  UserCheck,
  Zap,
  Target,
  Headphones,
  DollarSign,
} from 'lucide-react';

const features = [
  {
    title: 'Escrow Protected',
    description: 'Seller gets paid, buyer gets product - with funds protected until delivery is confirmed.',
    icon: ShieldCheck,
    accent: 'from-brand-success/15 to-brand-success/5 text-brand-success',
  },
  {
    title: 'Verified Traders',
    description: 'Every trader is verified with real ratings, KYB checks, and performance history.',
    icon: UserCheck,
    accent: 'from-brand-primary/15 to-brand-primary/5 text-brand-primary',
  },
  {
    title: 'Instant Payouts',
    description: 'Release escrow in hours with smart contract automation and bank-level security.',
    icon: Zap,
    accent: 'from-brand-accent/20 to-brand-accent/5 text-brand-accent',
  },
  {
    title: 'Smart Matching',
    description: 'AI-powered recommendations surface the right partners based on compliance and history.',
    icon: Target,
    accent: 'from-brand-primary/10 to-brand-accent/5 text-brand-primary',
  },
  {
    title: '24/7 Support',
    description: 'Global support team with trade expertise keeps deals moving at all times.',
    icon: Headphones,
    accent: 'from-brand-warning/20 to-brand-warning/5 text-brand-warning',
  },
  {
    title: 'Zero Hidden Fees',
    description: 'Transparent pricing built for long-term partnerships and repeat trade.',
    icon: DollarSign,
    accent: 'from-brand-success/10 to-brand-success/5 text-brand-success',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative overflow-hidden bg-slate-50 py-24 sm:py-32">
      <div className="absolute inset-0">
        <div className="absolute top-10 right-10 h-48 w-48 rounded-full bg-brand-primary/10 blur-3xl" />
        <div className="absolute bottom-0 left-10 h-56 w-56 rounded-full bg-brand-accent/10 blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center rounded-full bg-brand-primary/10 px-4 py-1.5 text-sm font-medium text-brand-primary">
            Features
          </span>
          <h2 className="mt-4 text-3xl font-bold text-brand-textDark sm:text-4xl lg:text-5xl">
            Built for modern, high-trust trade
          </h2>
          <p className="mt-6 text-lg text-brand-textMedium">
            Every layer of Tradewave is engineered to keep transactions safe, fast, and transparent.
          </p>
        </div>

        <div className="mx-auto mt-16 grid gap-6 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group rounded-2xl border border-white/70 bg-white p-8 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.accent}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-brand-textDark">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-brand-textMedium">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
