import React from 'react';
import { 
  Shield, FileCheck, Wallet, BarChart3, Bell, Globe2,
  Truck, FileText, Users, Lock, Zap, HeadphonesIcon
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const featureCategories = [
  {
    id: 'blockchain',
    label: 'Blockchain',
    features: [
      {
        icon: FileCheck,
        title: 'Document Verification',
        description: 'All documents are hashed and stored on blockchain for tamper-proof verification.',
      },
      {
        icon: Shield,
        title: 'Immutable Audit Trail',
        description: 'Every action is recorded on the blockchain, providing complete transparency.',
      },
      {
        icon: Lock,
        title: 'Smart Contracts',
        description: 'Automated contract execution ensures terms are met before release.',
      },
    ],
  },
  {
    id: 'payments',
    label: 'Payments',
    features: [
      {
        icon: Wallet,
        title: 'Secure Escrow',
        description: 'Funds held safely until delivery confirmation. Full buyer protection.',
      },
      {
        icon: Zap,
        title: 'Fast Releases',
        description: 'Instant escrow release upon delivery confirmation.',
      },
      {
        icon: BarChart3,
        title: 'Transparent Fees',
        description: 'No hidden charges. Clear pricing from start to finish.',
      },
    ],
  },
  {
    id: 'logistics',
    label: 'Logistics',
    features: [
      {
        icon: Truck,
        title: 'Real-time Tracking',
        description: 'Track your shipment from production to delivery.',
      },
      {
        icon: Globe2,
        title: 'Global Network',
        description: 'Shipping partners in 45+ countries for seamless delivery.',
      },
      {
        icon: FileText,
        title: 'Documentation',
        description: 'All shipping documents managed in one place.',
      },
    ],
  },
  {
    id: 'support',
    label: 'Support',
    features: [
      {
        icon: Users,
        title: 'Dedicated Manager',
        description: 'Personal account manager for all your trade needs.',
      },
      {
        icon: HeadphonesIcon,
        title: '24/7 Support',
        description: 'Round-the-clock support via chat, email, and phone.',
      },
      {
        icon: Bell,
        title: 'Smart Alerts',
        description: 'Real-time notifications for all transaction updates.',
      },
    ],
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 sm:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Powerful Features for Modern Trade
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Everything you need to manage your B2B trade operations with confidence.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-5xl">
          <Tabs defaultValue="blockchain" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              {featureCategories.map((category) => (
                <TabsTrigger key={category.id} value={category.id}>
                  {category.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {featureCategories.map((category) => (
              <TabsContent key={category.id} value={category.id} className="mt-8">
                <div className="grid gap-6 sm:grid-cols-3">
                  {category.features.map((feature) => {
                    const Icon = feature.icon;
                    return (
                      <div
                        key={feature.title}
                        className="rounded-xl border bg-card p-6 transition-all hover:shadow-md"
                      >
                        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                        <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </section>
  );
}
