import React from 'react';
import { Shield, Clock, TrendingUp, Users, FileCheck, Lock } from 'lucide-react';

const values = [
  {
    icon: Shield,
    title: 'Secure Escrow Payments',
    description: 'Funds stay protected until delivery is confirmed, eliminating payment anxiety for both sides.',
    accent: 'bg-brand-success/10 text-brand-success',
  },
  {
    icon: FileCheck,
    title: 'Blockchain Verification',
    description: 'Every document and milestone is tamper-proof, creating instant trust and compliance clarity.',
    accent: 'bg-brand-primary/10 text-brand-primary',
  },
  {
    icon: Users,
    title: 'Verified Partner Network',
    description: 'Work only with vetted businesses backed by performance history and continuous monitoring.',
    accent: 'bg-brand-accent/10 text-brand-accent',
  },
  {
    icon: Clock,
    title: 'Streamlined Operations',
    description: 'Accelerate trade cycles with automated workflows, smart alerts, and guided steps.',
    accent: 'bg-brand-warning/10 text-brand-warning',
  },
  {
    icon: TrendingUp,
    title: 'Competitive Pricing',
    description: 'Compare live quotes and market benchmarks to lock the best deal every time.',
    accent: 'bg-brand-primary/10 text-brand-primary',
  },
  {
    icon: Lock,
    title: 'Smart Contract Automation',
    description: 'Programmatic release rules reduce disputes and speed up payment completion.',
    accent: 'bg-brand-success/10 text-brand-success',
  },
];

export function ValuePropositionSection() {
  return (
    <section className="py-20 sm:py-28 bg-white">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center rounded-full bg-brand-accent/10 px-4 py-1.5 text-sm font-medium text-brand-accent">
            Why Tradewave
          </span>
          <h2 className="mt-4 text-3xl font-bold text-brand-textDark sm:text-4xl">
            The most trusted B2B marketplace stack
          </h2>
          <p className="mt-4 text-lg text-brand-textMedium">
            We combine secure escrow, compliance monitoring, and transparent performance insights to help you trade with confidence.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {values.map((value) => {
            const Icon = value.icon;
            return (
              <div
                key={value.title}
                className="group relative rounded-2xl border border-slate-200/70 bg-slate-50 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${value.accent}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-brand-textDark">{value.title}</h3>
                <p className="mt-2 text-brand-textMedium">{value.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
