import React from 'react';
import Image from 'next/image';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    quote: 'Escrow removed payment anxiety and cut our procurement cycle by weeks.',
    author: 'Sarah Chen',
    role: 'Head of Procurement',
    company: 'TechFlow Industries',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
  },
  {
    quote: 'We reduced sourcing time by 60% with better match quality from day one.',
    author: 'Michael Rodriguez',
    role: 'Supply Chain Director',
    company: 'Global Manufacturing Co.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
  },
  {
    quote: 'Reliable payout automation made Tradewave our default cross-border channel.',
    author: 'Emma Thompson',
    role: 'Operations Manager',
    company: 'Atlantic Trade Partners',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=80',
  },
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="relative overflow-hidden bg-white py-24 sm:py-32">
      <div className="absolute inset-0">
        <div className="absolute top-8 left-8 h-40 w-40 rounded-full bg-brand-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-12 h-52 w-52 rounded-full bg-brand-accent/10 blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center rounded-full bg-brand-primary/10 px-4 py-1.5 text-sm font-medium text-brand-primary">
            Testimonials
          </span>
          <h2 className="mt-4 text-3xl font-bold text-brand-textDark sm:text-4xl lg:text-5xl">
            Trusted by global trade leaders
          </h2>
          <p className="mt-5 text-base text-brand-textMedium sm:text-lg">
            Real outcomes from teams scaling high-value transactions.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-6xl gap-6 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.author}
              className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-gradient-to-b from-slate-50 to-white p-7 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-brand-primary/30 via-brand-accent/30 to-brand-success/30" />
              <Quote className="absolute right-6 top-6 h-10 w-10 text-brand-primary/10 group-hover:text-brand-primary/20 transition-colors" />

              <div className="mb-5 flex gap-1">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                ))}
              </div>

              <blockquote className="text-brand-textDark leading-relaxed text-[15px]">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>

              <div className="mt-7 flex items-center gap-4 border-t border-slate-200/70 pt-5">
                <div className="relative h-12 w-12 overflow-hidden rounded-full">
                  <Image src={testimonial.avatar} alt={testimonial.author} fill sizes="48px" className="object-cover" />
                </div>
                <div>
                  <div className="font-semibold text-brand-textDark">{testimonial.author}</div>
                  <div className="text-sm text-brand-textMedium">
                    {testimonial.role}, {testimonial.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
