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
    description: 'Funds release only after delivery confirmation.',
    icon: ShieldCheck,
    accent: 'from-brand-success/15 to-brand-success/5 text-brand-success',
  },
  {
    title: 'Verified Traders',
    description: 'KYB-vetted profiles with real trading history.',
    icon: UserCheck,
    accent: 'from-brand-primary/15 to-brand-primary/5 text-brand-primary',
  },
  {
    title: 'Instant Payouts',
    description: 'Fast settlement once milestones are complete.',
    icon: Zap,
    accent: 'from-brand-accent/20 to-brand-accent/5 text-brand-accent',
  },
  {
    title: 'Smart Matching',
    description: 'Match with the right counterparties quickly.',
    icon: Target,
    accent: 'from-brand-primary/10 to-brand-accent/5 text-brand-primary',
  },
  {
    title: '24/7 Support',
    description: 'Trade specialists support every region and timezone.',
    icon: Headphones,
    accent: 'from-brand-warning/20 to-brand-warning/5 text-brand-warning',
  },
  {
    title: 'Zero Hidden Fees',
    description: 'Transparent pricing with no hidden surprises.',
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
            Built for high-trust global trade
          </h2>
          <p className="mt-5 text-base text-brand-textMedium sm:text-lg">
            A compact stack for safer execution and faster deal flow.
          </p>
        </div>

        <div className="mx-auto mt-14 grid gap-6 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-2xl border border-white/70 bg-white p-7 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-brand-primary/40 via-brand-accent/40 to-brand-success/40" />
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.accent}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-brand-textDark">
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
