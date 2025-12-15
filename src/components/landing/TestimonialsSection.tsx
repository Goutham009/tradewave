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
    <section className="bg-slate-50 py-20 dark:bg-slate-900 sm:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Trusted by Industry Leaders
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            See what our customers have to say about their experience with Tradewave.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-6xl gap-8 sm:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="relative rounded-2xl bg-background p-8 shadow-sm transition-all hover:shadow-md"
            >
              <Quote className="absolute right-6 top-6 h-8 w-8 text-primary/10" />
              
              <div className="mb-4 flex gap-1">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              <blockquote className="text-foreground">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>

              <div className="mt-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
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
