'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const faqs = [
  {
    question: 'How does the escrow payment system work?',
    answer: 'After quote acceptance, funds move into escrow and release only when agreed delivery milestones are confirmed by both parties.',
  },
  {
    question: 'What is blockchain verification and why does it matter?',
    answer: 'Critical documents and milestones are hashed into tamper-evident logs for stronger compliance, audits, and dispute evidence.',
  },
  {
    question: 'How are suppliers verified on Tradewave?',
    answer: 'Suppliers pass KYB checks, certification review, and ongoing performance monitoring before they can participate in transactions.',
  },
  {
    question: 'What happens if there\'s a dispute with my order?',
    answer: 'Escrow remains protected while account managers mediate. If needed, formal arbitration uses verified transaction evidence.',
  },
  {
    question: 'Can I integrate Tradewave with my existing systems?',
    answer: 'Yes. API access is available for ERP, inventory, and finance integrations on supported plans.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'Bank transfer, cards, and supported rails. Payments are processed through secure, compliant channels.',
  },
  {
    question: 'How long does it take to get quotations?',
    answer: 'Most requirements receive initial quotes in 24-48 hours. Complex sourcing may take up to 5 business days.',
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="relative overflow-hidden bg-brand-bgLight py-20 sm:py-28">
      <div className="absolute inset-0">
        <div className="absolute top-0 right-16 h-40 w-40 rounded-full bg-brand-primary/10 blur-3xl" />
        <div className="absolute bottom-0 left-10 h-52 w-52 rounded-full bg-brand-accent/10 blur-3xl" />
      </div>
      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center rounded-full bg-brand-primary/10 px-4 py-1.5 text-sm font-medium text-brand-primary">
            FAQs
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-brand-textDark sm:text-4xl">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-base text-brand-textMedium sm:text-lg">
            Quick answers before you start trading. Need more details?{' '}
            <a href="/contact" className="text-brand-primary hover:underline">
              Contact our support team
            </a>
            .
          </p>
        </div>

        <div className="mx-auto mt-14 max-w-3xl">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm transition-all duration-300 hover:shadow-md"
              >
                <button
                  className="flex w-full items-center justify-between px-6 py-5 text-left"
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                >
                  <span className="font-medium text-brand-textDark">{faq.question}</span>
                  <ChevronDown
                    className={cn(
                      'h-5 w-5 text-brand-textMedium transition-transform',
                      openIndex === index && 'rotate-180'
                    )}
                  />
                </button>
                <div
                  className={cn(
                    'overflow-hidden transition-all',
                    openIndex === index ? 'max-h-96' : 'max-h-0'
                  )}
                >
                  <p className="px-6 pb-5 text-brand-textMedium">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
