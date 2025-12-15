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
    <section id="faq" className="bg-slate-50 py-20 dark:bg-slate-900 sm:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Everything you need to know about Tradewave. Can&apos;t find the answer you&apos;re looking for?{' '}
            <a href="/contact" className="text-primary hover:underline">
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
                className="rounded-lg border bg-background"
              >
                <button
                  className="flex w-full items-center justify-between px-6 py-4 text-left"
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                >
                  <span className="font-medium text-foreground">{faq.question}</span>
                  <ChevronDown
                    className={cn(
                      'h-5 w-5 text-muted-foreground transition-transform',
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
                  <p className="px-6 pb-4 text-muted-foreground">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
