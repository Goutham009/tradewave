import React from 'react';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    quote: "Tradewave transformed our procurement process. The blockchain verification gives us confidence in every transaction, and the escrow system has eliminated payment disputes.",
    author: "Sarah Chen",
    role: "Head of Procurement",
    company: "TechFlow Industries",
    rating: 5,
  },
  {
    quote: "We've reduced our sourcing time by 60% since switching to Tradewave. The curated supplier network and transparent pricing make decision-making so much easier.",
    author: "Michael Rodriguez",
    role: "Supply Chain Director",
    company: "Global Manufacturing Co.",
    rating: 5,
  },
  {
    quote: "The smart contract automation has saved us countless hours in contract management. Plus, the audit trail feature is invaluable for compliance.",
    author: "Emma Thompson",
    role: "Operations Manager",
    company: "Atlantic Trade Partners",
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section className="bg-gradient-to-b from-slate-50 to-slate-100 py-24 dark:from-slate-900 dark:to-slate-800/50 sm:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
            Testimonials
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Trusted by Industry Leaders
          </h2>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            See what our customers have to say about their experience with Tradewave.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-6xl gap-8 sm:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group relative rounded-2xl bg-background p-8 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-slate-100 dark:border-slate-800"
            >
              <Quote className="absolute right-6 top-6 h-10 w-10 text-primary/10 group-hover:text-primary/20 transition-colors" />
              
              <div className="mb-5 flex gap-1">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                ))}
              </div>

              <blockquote className="text-foreground leading-relaxed text-base">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>

              <div className="mt-8 flex items-center gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-lg font-semibold text-white shadow-md">
                  {testimonial.author.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-foreground">{testimonial.author}</div>
                  <div className="text-sm text-muted-foreground">
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
