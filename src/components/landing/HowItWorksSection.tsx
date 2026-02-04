import React from 'react';
import { UserPlus, Search, Lock, BadgeCheck } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: UserPlus,
    title: 'Create Account',
    description: 'Register in minutes and complete KYB verification to unlock trusted trading partners.',
  },
  {
    number: '02',
    icon: Search,
    title: 'Browse & Connect',
    description: 'Discover verified suppliers and buyers with real performance metrics and full transaction transparency.',
  },
  {
    number: '03',
    icon: Lock,
    title: 'Secure Transaction',
    description: 'Funds flow through escrow with smart contract conditions protecting both sides.',
  },
  {
    number: '04',
    icon: BadgeCheck,
    title: 'Get Paid Fast',
    description: 'Delivery confirmation triggers payout within hours, backed by compliance monitoring.',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-white py-20 sm:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center rounded-full bg-brand-primary/10 px-4 py-1.5 text-sm font-medium text-brand-primary">
            How it works
          </span>
          <h2 className="mt-4 text-3xl font-bold text-brand-textDark sm:text-4xl">
            A frictionless flow from discovery to payout
          </h2>
          <p className="mt-4 text-lg text-brand-textMedium">
            Tradewave connects you with verified partners and protects every step of the trade lifecycle.
          </p>
        </div>

        <div className="mx-auto mt-16 grid gap-6 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="relative rounded-2xl border border-slate-200/70 bg-slate-50 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-widest text-brand-textMedium">
                    Step {step.number}
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <h3 className="mt-6 text-xl font-semibold text-brand-textDark">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-brand-textMedium">
                  {step.description}
                </p>
                {index < steps.length - 1 && (
                  <div className="absolute -right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary lg:flex">
                    <span className="text-sm">→</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
