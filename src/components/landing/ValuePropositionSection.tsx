import React from 'react';
import Image from 'next/image';
import { ShieldCheck, Users, TrendingUp, Zap } from 'lucide-react';

const blocks = [
  {
    tag: 'Verified Network',
    title: 'Trade only with vetted businesses',
    description:
      'Every counterparty passes KYB verification before they can trade. Real business data, real track records — no anonymous deals.',
    icon: Users,
    image:
      'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Business professionals in a meeting',
    stats: [
      { value: '10K+', label: 'Verified traders' },
      { value: '99.9%', label: 'Success rate' },
    ],
  },
  {
    tag: 'Escrow Protection',
    title: 'Payments secured at every milestone',
    description:
      'Funds sit in escrow until delivery is confirmed. No more chasing payments or worrying about non-delivery — every rupee is accounted for.',
    icon: ShieldCheck,
    image:
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Secure financial transaction',
    stats: [
      { value: '$500M+', label: 'Protected value' },
      { value: '0', label: 'Payment disputes' },
    ],
  },
  {
    tag: 'Market Intelligence',
    title: 'Live prices powering smarter decisions',
    description:
      'LME metal prices, commodity benchmarks, and trend signals update in real time — so you negotiate with data, not guesswork.',
    icon: TrendingUp,
    image:
      'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Financial market data dashboard',
    stats: [
      { value: '6+', label: 'Markets tracked' },
      { value: '2 min', label: 'Refresh cycle' },
    ],
  },
  {
    tag: 'Speed & Automation',
    title: 'From requirement to quote in hours',
    description:
      'Post your need, get matched with suppliers, and receive verified quotes — often within the same business day. Automations handle the rest.',
    icon: Zap,
    image:
      'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Fast shipping and logistics',
    stats: [
      { value: '<24h', label: 'Avg quote time' },
      { value: '65+', label: 'Countries' },
    ],
  },
];

export function ValuePropositionSection() {
  return (
    <section id="why-tradewave" className="relative overflow-hidden bg-white py-20 sm:py-28">
      <div className="container mx-auto px-4">
        <div className="relative mx-auto max-w-3xl text-center mb-16">
          <span className="inline-flex items-center rounded-full bg-brand-accent/10 px-4 py-1.5 text-sm font-medium text-brand-accent">
            Why Tradewave
          </span>
          <h2 className="mt-4 text-3xl font-bold text-brand-textDark sm:text-4xl">
            Everything you need for safer, faster global trade
          </h2>
          <p className="mt-4 text-base text-brand-textMedium sm:text-lg">
            Built for procurement teams who need verified partners, protected payments, and real-time intelligence.
          </p>
        </div>

        <div className="space-y-24">
          {blocks.map((block, index) => {
            const Icon = block.icon;
            const isReversed = index % 2 !== 0;

            return (
              <div
                key={block.title}
                className={`flex flex-col items-center gap-12 lg:flex-row ${isReversed ? 'lg:flex-row-reverse' : ''}`}
              >
                {/* Image */}
                <div className="relative w-full lg:w-1/2">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-xl">
                    <Image
                      src={block.image}
                      alt={block.imageAlt}
                      fill
                      className="object-cover transition-transform duration-500 hover:scale-105"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                  {/* Floating stat cards */}
                  <div className="absolute -bottom-6 left-6 right-6 flex gap-3">
                    {block.stats.map((stat) => (
                      <div
                        key={stat.label}
                        className="flex-1 rounded-xl border border-white/80 bg-white px-4 py-3 text-center shadow-lg"
                      >
                        <p className="text-xl font-bold text-brand-primary">{stat.value}</p>
                        <p className="text-xs text-brand-textMedium">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div className="w-full lg:w-1/2">
                  <div className="inline-flex items-center gap-2 rounded-full bg-brand-primary/10 px-3 py-1.5 text-sm font-medium text-brand-primary">
                    <Icon className="h-4 w-4" />
                    {block.tag}
                  </div>
                  <h3 className="mt-4 text-2xl font-bold text-brand-textDark sm:text-3xl">
                    {block.title}
                  </h3>
                  <p className="mt-4 text-base leading-relaxed text-brand-textMedium sm:text-lg">
                    {block.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
