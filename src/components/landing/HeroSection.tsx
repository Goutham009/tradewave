'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShieldCheck, Globe2, TrendingUp } from 'lucide-react';

const heroStats = [
  { value: '10K+', label: 'Verified Businesses', icon: ShieldCheck },
  { value: '$500M+', label: 'Trade Value Protected', icon: TrendingUp },
  { value: '65+', label: 'Countries Covered', icon: Globe2 },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-brand-bgDark">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=2000&q=80"
          alt="Global trade and logistics"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-bgDark via-brand-bgDark/90 to-brand-bgDark/60" />
      </div>

      <div className="container relative mx-auto px-4 py-24 sm:py-32 lg:py-40">
        <div className="max-w-2xl">
          <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl lg:leading-[1.1]">
            Source globally.{' '}
            <span className="bg-gradient-to-r from-brand-primary to-brand-accent bg-clip-text text-transparent">
              Trade confidently.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-lg text-slate-300 leading-relaxed">
            Tradewave connects you with verified suppliers, protects payments through escrow, and gives you live market intelligence — all in one platform.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link href="#get-quotes">
              <Button size="lg" variant="gradient" className="w-full sm:w-auto text-base px-8">
                Get Free Quotes
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button size="lg" variant="outline" className="w-full border-white/30 text-white hover:bg-white/10 sm:w-auto text-base px-8">
                See How It Works
              </Button>
            </Link>
          </div>

          {/* Stats strip */}
          <div className="mt-14 flex flex-wrap gap-8">
            {heroStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
                    <Icon className="h-5 w-5 text-brand-accent" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-slate-400">{stat.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Trusted by strip */}
      <div className="relative border-t border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto flex flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 py-4">
          {['Metals', 'Minerals', 'Chemicals', 'Energy', 'Textiles', 'Agri Inputs'].map((industry) => (
            <span key={industry} className="text-sm font-medium uppercase tracking-wider text-slate-400">
              {industry}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
