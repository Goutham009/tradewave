import React from 'react';
import { FileText, Search, CreditCard, Package, CheckCircle2, ArrowRight } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: FileText,
    title: 'Submit Your Requirement',
    description: 'Describe what you need, including specifications, quantity, and delivery timeline. Our team reviews and validates your request.',
  },
  {
    number: '02',
    icon: Search,
    title: 'Receive Curated Quotations',
    description: 'We source quotes from our verified supplier network. Compare prices, terms, and supplier ratings side by side.',
  },
  {
    number: '03',
    icon: CreditCard,
    title: 'Secure Payment to Escrow',
    description: 'Pay securely via bank transfer or card. Funds are held in escrow and protected until delivery confirmation.',
  },
  {
    number: '04',
    icon: Package,
    title: 'Track Your Order',
    description: 'Monitor production, shipping, and delivery in real-time. All milestones recorded on blockchain for transparency.',
  },
  {
    number: '05',
    icon: CheckCircle2,
    title: 'Confirm & Release',
    description: 'Inspect your goods, confirm delivery, and escrow is released to supplier. Smart contract executes automatically.',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-slate-50 py-20 dark:bg-slate-900 sm:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            How Tradewave Works
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            A simple, secure process from requirement to delivery. 
            We handle the complexity so you can focus on your business.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-5xl">
          <div className="space-y-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.number}
                  className="relative flex gap-6 rounded-xl bg-background p-6 shadow-sm transition-all hover:shadow-md"
                >
                  {/* Number */}
                  <div className="flex-shrink-0">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-bold text-white">
                      {step.number}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-primary" />
                      <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
                    </div>
                    <p className="mt-2 text-muted-foreground">{step.description}</p>
                  </div>

                  {/* Connector */}
                  {index < steps.length - 1 && (
                    <div className="absolute -bottom-4 left-10 hidden h-8 w-0.5 bg-primary/20 sm:block" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
