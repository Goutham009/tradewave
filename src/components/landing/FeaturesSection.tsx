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
    <section id="features" className="py-24 sm:py-32 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
            Features
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Powerful Features for Modern Trade
          </h2>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            Everything you need to manage your B2B trade operations with confidence.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-5xl">
          <Tabs defaultValue="blockchain" className="w-full">
            <TabsList className="grid w-full grid-cols-4 h-14 p-1.5 bg-muted/50 rounded-xl">
              {featureCategories.map((category) => (
                <TabsTrigger key={category.id} value={category.id} className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium">
                  {category.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {featureCategories.map((category) => (
              <TabsContent key={category.id} value={category.id} className="mt-10">
                <div className="grid gap-8 sm:grid-cols-3">
                  {category.features.map((feature) => {
                    const Icon = feature.icon;
                    return (
                      <div
                        key={feature.title}
                        className="group rounded-2xl border bg-card p-8 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
                      >
                        <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 group-hover:from-primary/30 group-hover:to-primary/10 transition-colors">
                          <Icon className="h-7 w-7 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                        <p className="mt-3 text-muted-foreground leading-relaxed">{feature.description}</p>
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
