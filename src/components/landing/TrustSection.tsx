import React from 'react';
import { ShieldCheck, TrendingUp, CheckCircle2 } from 'lucide-react';

const stats = [
  {
    icon: ShieldCheck,
    value: '10,000+ Verified Traders',
    description: 'Every business is KYB-verified and monitored for compliance.',
    accent: 'bg-brand-primary/10 text-brand-primary',
  },
  {
    icon: TrendingUp,
    value: '$500M+ Traded Safely',
    description: 'Escrow-backed transactions with transparent fee protection.',
    accent: 'bg-brand-accent/10 text-brand-accent',
  },
  {
    icon: CheckCircle2,
    value: '99.9% Transaction Success',
    description: 'Industry-leading success rate with dispute safeguards.',
    accent: 'bg-brand-success/10 text-brand-success',
  },
];

export function TrustSection() {
  return (
    <section id="trust" className="relative overflow-hidden bg-brand-bgLight py-20 sm:py-28">
      <div className="absolute inset-0">
        <div className="absolute -top-10 right-10 h-32 w-32 rounded-full bg-brand-primary/10 blur-2xl" />
        <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-brand-accent/10 blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center rounded-full bg-brand-primary/10 px-4 py-1.5 text-sm font-medium text-brand-primary">
            Built for serious traders
          </span>
          <h2 className="mt-4 text-3xl font-bold text-brand-textDark sm:text-4xl">
            Confidence baked into every transaction
          </h2>
          <p className="mt-4 text-lg text-brand-textMedium">
            Tradewave combines escrow protection, verified counterparties, and real-time monitoring so you can trade without fear.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.value}
                className="group rounded-2xl border border-white/60 bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
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
    </section>
  );
}
