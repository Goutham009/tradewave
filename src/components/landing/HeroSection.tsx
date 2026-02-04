'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShieldCheck, Zap, Globe2, Sparkles } from 'lucide-react';

const highlights = [
  'Verified business partners',
  'Escrow-protected payments',
  'Global trade coverage',
  'Real-time compliance checks',
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-bgDark via-slate-900 to-brand-bgDark py-24 sm:py-32">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-16 h-72 w-72 rounded-full bg-brand-primary/25 blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-brand-accent/20 blur-3xl animate-pulse-slow" />
        <div className="absolute top-1/3 right-1/4 h-40 w-40 rounded-full bg-white/10 blur-2xl animate-spin-slow" />
      </div>

      <div className="container relative mx-auto px-4">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="mb-6 inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-sm text-white/80 backdrop-blur">
              <Sparkles className="mr-2 h-4 w-4 text-brand-accent" />
              Trusted by 10,000+ verified traders
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Connect with{' '}
              <span className="bg-gradient-to-r from-brand-primary to-brand-accent bg-clip-text text-transparent">
                Trusted B2B Traders
              </span>{' '}
              Worldwide
            </h1>

            <p className="mt-6 max-w-2xl text-lg text-slate-300 sm:text-xl">
              Secure platform for trading between verified business partners. Escrow-backed payments, compliance monitoring, and intelligent matching so every deal feels effortless.
            </p>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              <Link href="/register">
                <Button size="lg" variant="gradient" className="w-full sm:w-auto">
                  Start Trading Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button size="lg" variant="outline" className="w-full border-white/30 text-white hover:bg-white/10 sm:w-auto">
                  See How It Works
                </Button>
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {highlights.map((highlight) => (
                <div key={highlight} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 backdrop-blur">
                  <ShieldCheck className="h-5 w-5 text-brand-accent" />
                  {highlight}
                </div>
              ))}
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                { label: 'Trade Volume', value: '$500M+' },
                { label: 'Verified Traders', value: '10K+' },
                { label: 'Countries', value: '65+' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-center">
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="mt-1 text-xs uppercase tracking-wide text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -top-6 left-6 rounded-2xl bg-white/10 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-white/80 backdrop-blur">
              Live marketplace
            </div>
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-3 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary/10 via-transparent to-brand-accent/10" />
              <Image
                src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80"
                alt="Professional traders collaborating"
                width={900}
                height={700}
                className="relative rounded-2xl object-cover"
                priority
              />
            </div>
            <div className="absolute -bottom-10 right-6 rounded-2xl border border-white/10 bg-slate-900/80 px-5 py-4 text-white shadow-xl backdrop-blur">
              <div className="flex items-center gap-3 text-sm">
                <Zap className="h-4 w-4 text-brand-accent" />
                <div>
                  <p className="font-semibold">Instant escrow release</p>
                  <p className="text-xs text-slate-400">Average payout in 18 hours</p>
                </div>
              </div>
            </div>
            <div className="absolute -left-6 bottom-16 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-xs text-white/80 backdrop-blur">
              <Globe2 className="mr-2 inline h-4 w-4 text-brand-accent" />
              Global network with 99.9% success rate
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
