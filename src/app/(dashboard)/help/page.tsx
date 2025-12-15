'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Book,
  MessageCircle,
  Mail,
  Phone,
  FileText,
  Video,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  HelpCircle,
  Shield,
  CreditCard,
  Package,
  Link as LinkIcon,
} from 'lucide-react';

const faqs = [
  {
    category: 'Getting Started',
    icon: Book,
    questions: [
      {
        q: 'How do I submit my first requirement?',
        a: 'Navigate to Requirements > New Requirement. Fill in the details about what you need, including quantity, specifications, and delivery timeline. Our team will start sourcing from our verified supplier network.',
      },
      {
        q: 'How long does it take to receive quotations?',
        a: 'Typically, you\'ll receive your first quotations within 24-48 hours. Complex or specialized requirements may take longer as we ensure we match you with the most suitable suppliers.',
      },
      {
        q: 'What industries do you serve?',
        a: 'We serve a wide range of industries including manufacturing, electronics, textiles, chemicals, automotive, medical devices, and more. Contact us if you\'re unsure about your specific industry.',
      },
    ],
  },
  {
    category: 'Payments & Escrow',
    icon: CreditCard,
    questions: [
      {
        q: 'How does the escrow system work?',
        a: 'When you accept a quotation, your payment is held securely in escrow. Funds are only released to the supplier once you confirm delivery and quality. This protects both parties in the transaction.',
      },
      {
        q: 'What payment methods do you accept?',
        a: 'We accept bank transfers, credit cards (Visa, Mastercard, Amex), and wire transfers. All payments are processed securely through our payment partners.',
      },
      {
        q: 'Can I get a refund if something goes wrong?',
        a: 'Yes. If the delivery doesn\'t match specifications or quality standards, you can raise a dispute. Our team will investigate and process refunds from escrow as appropriate.',
      },
    ],
  },
  {
    category: 'Blockchain & Verification',
    icon: LinkIcon,
    questions: [
      {
        q: 'What is recorded on the blockchain?',
        a: 'We record document hashes, transaction milestones, and audit logs on the blockchain. This provides an immutable record of your trade history that can be verified at any time.',
      },
      {
        q: 'How do I verify a document?',
        a: 'Go to Blockchain > Document Verification. Enter the document hash (SHA-256) and click Verify. The system will check if the hash exists on the blockchain and show registration details.',
      },
      {
        q: 'Do I need a crypto wallet?',
        a: 'No. Our blockchain features are for transparency and verification only. All payments are in traditional FIAT currencies. You don\'t need any cryptocurrency or wallet.',
      },
    ],
  },
  {
    category: 'Orders & Shipping',
    icon: Package,
    questions: [
      {
        q: 'How can I track my order?',
        a: 'Go to Transactions to see all your orders. Each transaction shows real-time status updates, milestone progress, and estimated delivery dates.',
      },
      {
        q: 'What happens if my order is delayed?',
        a: 'You\'ll receive automatic notifications about any delays. Significant delays may qualify for compensation under our service guarantee. Contact support for specific cases.',
      },
      {
        q: 'How do I confirm delivery?',
        a: 'When your order arrives, go to Transactions, find your order, and click "Confirm Delivery". Inspect the goods for quality before confirming. This triggers the escrow release process.',
      },
    ],
  },
];

const resources = [
  {
    title: 'User Guide',
    description: 'Complete guide to using Tradewave',
    icon: Book,
    link: '#',
  },
  {
    title: 'Video Tutorials',
    description: 'Step-by-step video walkthroughs',
    icon: Video,
    link: '#',
  },
  {
    title: 'API Documentation',
    description: 'For developers and integrations',
    icon: FileText,
    link: '#',
  },
  {
    title: 'Security Guide',
    description: 'Learn about our security measures',
    icon: Shield,
    link: '#',
  },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>('Getting Started');
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  const filteredFaqs = faqs.map((category) => ({
    ...category,
    questions: category.questions.filter(
      (q) =>
        q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.a.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((category) => category.questions.length > 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold tracking-tight">Help Center</h1>
        <p className="text-muted-foreground mt-2">
          Find answers to common questions or contact our support team
        </p>
        <div className="relative mt-6">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search for help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 text-lg"
          />
        </div>
      </div>

      {/* Quick Contact */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
              <MessageCircle className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="mt-4 font-semibold">Live Chat</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Chat with our support team
            </p>
            <Badge variant="success" className="mt-2">Online</Badge>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
              <Mail className="h-6 w-6 text-green-500" />
            </div>
            <h3 className="mt-4 font-semibold">Email Support</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              support@tradewave.io
            </p>
            <p className="mt-2 text-xs text-muted-foreground">Response within 24h</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10">
              <Phone className="h-6 w-6 text-purple-500" />
            </div>
            <h3 className="mt-4 font-semibold">Phone Support</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              +1 (800) 123-4567
            </p>
            <p className="mt-2 text-xs text-muted-foreground">Mon-Fri 9am-6pm IST</p>
          </CardContent>
        </Card>
      </div>

      {/* Resources */}
      <Card>
        <CardHeader>
          <CardTitle>Resources</CardTitle>
          <CardDescription>Guides and documentation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {resources.map((resource) => {
              const Icon = resource.icon;
              return (
                <a
                  key={resource.title}
                  href={resource.link}
                  className="flex items-center gap-3 rounded-lg border p-4 hover:bg-accent transition-colors"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{resource.title}</p>
                    <p className="text-xs text-muted-foreground">{resource.description}</p>
                  </div>
                </a>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredFaqs.map((category) => {
              const Icon = category.icon;
              const isExpanded = expandedCategory === category.category;

              return (
                <div key={category.category} className="border rounded-lg">
                  <button
                    onClick={() => setExpandedCategory(isExpanded ? null : category.category)}
                    className="flex w-full items-center justify-between p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-semibold">{category.category}</span>
                      <Badge variant="outline">{category.questions.length}</Badge>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="border-t px-4 pb-4">
                      {category.questions.map((q, idx) => {
                        const qKey = `${category.category}-${idx}`;
                        const isQExpanded = expandedQuestion === qKey;

                        return (
                          <div key={idx} className="border-b last:border-0">
                            <button
                              onClick={() => setExpandedQuestion(isQExpanded ? null : qKey)}
                              className="flex w-full items-center justify-between py-4 text-left"
                            >
                              <span className="font-medium pr-4">{q.q}</span>
                              {isQExpanded ? (
                                <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              )}
                            </button>
                            {isQExpanded && (
                              <p className="pb-4 text-sm text-muted-foreground">
                                {q.a}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Still need help */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10">
        <CardContent className="p-8 text-center">
          <h3 className="text-xl font-semibold">Still need help?</h3>
          <p className="mt-2 text-muted-foreground">
            Our support team is ready to assist you with any questions
          </p>
          <div className="mt-4 flex justify-center gap-4">
            <Button variant="gradient">
              <MessageCircle className="mr-2 h-4 w-4" />
              Start Live Chat
            </Button>
            <Button variant="outline">
              <Mail className="mr-2 h-4 w-4" />
              Send Email
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
