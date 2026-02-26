import React from 'react';
import { ShieldCheck, TrendingUp, CheckCircle2, BadgeCheck, Timer } from 'lucide-react';

const stats = [
  {
    icon: ShieldCheck,
    value: '10,000+ Verified Traders',
    description: 'KYB checks and compliance monitoring.',
    accent: 'bg-brand-primary/10 text-brand-primary',
  },
  {
    icon: TrendingUp,
    value: '$500M+ Traded Safely',
    description: 'Escrow-backed flows with transparent fees.',
    accent: 'bg-brand-accent/10 text-brand-accent',
  },
  {
    icon: CheckCircle2,
    value: '99.9% Transaction Success',
    description: 'Proven completion rates with dispute controls.',
    accent: 'bg-brand-success/10 text-brand-success',
  },
];

const trustPillars = [
  { icon: BadgeCheck, label: 'Verified counterparties only' },
  { icon: ShieldCheck, label: 'Escrow milestone protection' },
  { icon: Timer, label: '24h compliance escalation' },
];

export function TrustSection() {
  return (
    <section id="trust" className="relative overflow-hidden bg-brand-bgLight py-20 sm:py-28">
      <div className="absolute inset-0">
        <div className="absolute -top-10 right-10 h-40 w-40 rounded-full bg-brand-primary/10 blur-2xl" />
        <div className="absolute bottom-0 left-0 h-56 w-56 rounded-full bg-brand-accent/10 blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div>
            <span className="inline-flex items-center rounded-full bg-brand-primary/10 px-4 py-1.5 text-sm font-medium text-brand-primary">
              Risk-aware by design
            </span>
            <h2 className="mt-4 text-3xl font-bold text-brand-textDark sm:text-4xl">
              Confidence baked into every transaction
            </h2>
            <p className="mt-4 text-base text-brand-textMedium sm:text-lg">
              Every deal is backed by verification, escrow controls, and monitored execution.
            </p>

            <div className="mt-6 space-y-3">
              {trustPillars.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <div key={pillar.label} className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="text-sm font-medium text-brand-textDark">{pillar.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.value}
                  className="group rounded-2xl border border-white/70 bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${stat.accent}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-brand-textDark">
                    {stat.value}
                  </h3>
                  <p className="mt-2 text-sm text-brand-textMedium">
                    {stat.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-brand-primary/20 bg-gradient-to-r from-brand-primary/10 via-white to-brand-accent/10 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-brand-textDark">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5">
              <CheckCircle2 className="h-4 w-4 text-brand-success" />
              Verified only network
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5">
              <ShieldCheck className="h-4 w-4 text-brand-primary" />
              Escrow-first settlement
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5">
              <TrendingUp className="h-4 w-4 text-brand-accent" />
              Transparent performance tracking
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
