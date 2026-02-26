import React from 'react';
import Image from 'next/image';
import { UserPlus, Search, Lock, BadgeCheck } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: UserPlus,
    title: 'Create Account',
    description: 'Sign up and finish KYB to unlock verified partners.',
    image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=400&q=80',
  },
  {
    number: '02',
    icon: Search,
    title: 'Discover Matches',
    description: 'Compare vetted suppliers or buyers with live performance signals.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80',
  },
  {
    number: '03',
    icon: Lock,
    title: 'Secure in Escrow',
    description: 'Lock terms and protect funds until milestones are confirmed.',
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=400&q=80',
  },
  {
    number: '04',
    icon: BadgeCheck,
    title: 'Settle & Scale',
    description: 'Complete delivery, release payment, and repeat with confidence.',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative overflow-hidden bg-brand-bgLight py-20 sm:py-28">
      <div className="container mx-auto px-4">
        <div className="relative mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center rounded-full bg-brand-primary/10 px-4 py-1.5 text-sm font-medium text-brand-primary">
            How it works
          </span>
          <h2 className="mt-4 text-3xl font-bold text-brand-textDark sm:text-4xl">
            A clean flow from discovery to payout
          </h2>
          <p className="mt-4 text-base text-brand-textMedium sm:text-lg">
            Four steps. Fully tracked. Built for repeat global trade.
          </p>
        </div>

        <div className="mx-auto mt-14 grid gap-6 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                {/* Step image */}
                <div className="relative h-40 w-full overflow-hidden">
                  <Image
                    src={step.image}
                    alt={step.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-brand-primary">
                    Step {step.number}
                  </span>
                </div>

                <div className="p-5">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-brand-textDark">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm text-brand-textMedium">
                    {step.description}
                  </p>
                </div>

                {index < steps.length - 1 && (
                  <div className="absolute -right-3 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-brand-primary/20 bg-white text-brand-primary shadow-md lg:flex">
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
