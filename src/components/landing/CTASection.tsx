import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShieldCheck, Sparkles, Users } from 'lucide-react';

export function CTASection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-primary via-brand-primaryHover to-brand-accent py-20 sm:py-28">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-24 h-96 w-96 rounded-full bg-white/15 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute top-12 left-1/3 h-24 w-24 rounded-full bg-white/20 blur-2xl animate-pulse-slow" />
      </div>

      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white">
            <Sparkles className="mr-2 h-4 w-4" />
            Ready to trade smarter?
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Launch your next deal with more confidence
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base text-white/90 sm:text-lg">
            Go live in minutes, connect with verified businesses, and move money through protected escrow rails.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/register">
              <Button size="lg" className="bg-white text-brand-primary hover:bg-white/90">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10">
                Book Demo
              </Button>
            </Link>
          </div>

          <div className="mt-12 grid gap-3 text-white/85 sm:grid-cols-3">
            <div className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2">
              <ShieldCheck className="h-5 w-5" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2">
              <Users className="h-5 w-5" />
              <span>Dedicated onboarding team</span>
            </div>
            <div className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2">
              <Sparkles className="h-5 w-5" />
              <span>Launch in under 24 hours</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
