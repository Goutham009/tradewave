'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const faqs = [
  {
    question: 'How does the escrow payment system work?',
    answer: 'When you accept a quotation, payment is transferred to our secure escrow account. The funds are held safely until you confirm receipt and satisfaction with the delivered goods. Only then is the payment released to the supplier. This protects both buyers and suppliers in every transaction.',
  },
  {
    question: 'What is blockchain verification and why does it matter?',
    answer: 'We use blockchain technology to create immutable records of all documents and transactions. Every contract, invoice, and milestone is hashed and stored on the blockchain, making it impossible to tamper with records. This provides complete transparency and serves as indisputable proof for compliance and dispute resolution.',
  },
  {
    question: 'How are suppliers verified on Tradewave?',
    answer: 'All suppliers undergo a rigorous verification process including business registration checks, certification validation, site inspections (for major suppliers), and ongoing performance monitoring. We also collect and display verified ratings from previous transactions.',
  },
  {
    question: 'What happens if there\'s a dispute with my order?',
    answer: 'Our dispute resolution process is straightforward. If you have an issue, our dedicated account managers work with both parties to resolve it. The escrow funds remain protected during this process. If needed, we have a formal arbitration process, and all blockchain-recorded evidence is available for reference.',
  },
  {
    question: 'Can I integrate Tradewave with my existing systems?',
    answer: 'Yes! Our Professional and Enterprise plans include API access for integration with your ERP, inventory management, and accounting systems. We provide comprehensive documentation and dedicated integration support.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept bank transfers (wire transfers, ACH), credit/debit cards, and major payment platforms. All payments are processed through secure, PCI-compliant channels. Cryptocurrency support is coming soon.',
  },
  {
    question: 'How long does it take to get quotations?',
    answer: 'Typically, you\'ll receive initial quotations within 24-48 hours of submitting your requirement. For complex or custom orders, it may take up to 5 business days. Our team actively works with suppliers to ensure you get competitive quotes quickly.',
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
          <p className="mt-4 text-lg text-brand-textMedium">
            Everything you need to know about Tradewave. Can&apos;t find the answer you&apos;re looking for?{' '}
            <a href="/contact" className="text-brand-primary hover:underline">
              Contact our support team
            </a>
            .
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-3xl">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="rounded-2xl border border-slate-200/70 bg-white shadow-sm transition-all duration-300 hover:shadow-md"
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
