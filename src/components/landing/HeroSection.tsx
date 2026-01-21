'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Zap, Globe, CheckCircle } from 'lucide-react';

const highlights = [
  'Blockchain-verified transactions',
  'Secure escrow payments',
  'Global supplier network',
  'Real-time tracking',
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-20 sm:py-32">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-32 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-white/80 backdrop-blur">
            <Zap className="mr-2 h-4 w-4 text-yellow-400" />
            Trusted by 500+ businesses worldwide
          </div>

          {/* Headline */}
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Transform Your{' '}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              B2B Trade
            </span>{' '}
            Experience
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300 sm:text-xl">
            Streamline your international trade with blockchain-powered transparency, 
            secure escrow payments, and a curated network of verified suppliers.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="#get-quotes">
              <Button size="lg" variant="gradient" className="w-full sm:w-auto">
                Get Free Quotes
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button size="lg" variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 sm:w-auto">
                See How It Works
              </Button>
            </Link>
          </div>
          
          {/* No Login Badge */}
          <p className="mt-4 text-sm text-slate-400">
            ✨ No login required to get started
          </p>

          {/* Highlights */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            {highlights.map((highlight) => (
              <div key={highlight} className="flex items-center text-sm text-slate-300">
                <CheckCircle className="mr-2 h-4 w-4 text-green-400" />
                {highlight}
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mx-auto mt-20 grid max-w-4xl grid-cols-2 gap-8 sm:grid-cols-4">
          {[
            { label: 'Trade Volume', value: '$2.5B+' },
            { label: 'Active Buyers', value: '500+' },
            { label: 'Verified Suppliers', value: '1,200+' },
            { label: 'Countries', value: '45+' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-white sm:text-4xl">{stat.value}</div>
              <div className="mt-1 text-sm text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mx-auto mt-16 flex flex-wrap items-center justify-center gap-8 opacity-60">
          <div className="flex items-center gap-2 text-white">
            <Shield className="h-5 w-5" />
            <span className="text-sm">SOC 2 Compliant</span>
          </div>
          <div className="flex items-center gap-2 text-white">
            <Globe className="h-5 w-5" />
            <span className="text-sm">GDPR Ready</span>
          </div>
          <div className="flex items-center gap-2 text-white">
            <Zap className="h-5 w-5" />
            <span className="text-sm">99.9% Uptime</span>
          </div>
        </div>
      </div>
    </section>
  );
}
