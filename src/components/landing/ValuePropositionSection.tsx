import React from 'react';
import { Shield, Clock, TrendingUp, Users, FileCheck, Lock } from 'lucide-react';

const values = [
  {
    icon: Shield,
    title: 'Secure Escrow Payments',
    description: 'Your funds are protected in escrow until delivery is confirmed. No more payment anxiety or supplier trust issues.',
  },
  {
    icon: FileCheck,
    title: 'Blockchain Verification',
    description: 'Every document and transaction is verified and recorded on the blockchain for complete transparency and immutability.',
  },
  {
    icon: Users,
    title: 'Verified Supplier Network',
    description: 'Access our curated network of pre-vetted, certified suppliers with transparent ratings and track records.',
  },
  {
    icon: Clock,
    title: 'Streamlined Process',
    description: 'From requirement to delivery in fewer steps. Our platform handles the complexity so you can focus on your business.',
  },
  {
    icon: TrendingUp,
    title: 'Competitive Pricing',
    description: 'Get multiple quotes from verified suppliers. Our transparent pricing ensures you always get the best deal.',
  },
  {
    icon: Lock,
    title: 'Smart Contract Automation',
    description: 'Automated contract execution based on pre-defined conditions. Reduce disputes and manual intervention.',
  },
];

export function ValuePropositionSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Why Choose Tradewave?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            We&apos;ve built the most secure and transparent B2B trade platform by combining 
            traditional payment security with blockchain technology.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {values.map((value) => {
            const Icon = value.icon;
            return (
              <div
                key={value.title}
                className="group relative rounded-2xl border bg-card p-8 transition-all hover:shadow-lg hover:-translate-y-1"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">{value.title}</h3>
                <p className="mt-2 text-muted-foreground">{value.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
