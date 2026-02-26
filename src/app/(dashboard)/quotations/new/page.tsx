'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import QuotationSubmitForm from '@/components/quotations/QuotationSubmitForm';

const REQUIREMENT_LOOKUP = {
  'req-abc-001': {
    id: 'req-abc-001',
    title: 'Industrial Steel Pipes - Grade 304',
    description: 'Need seamless Grade 304 pipes for industrial transfer systems.',
    category: 'Industrial Materials',
    quantity: 500,
    unit: 'MT',
    targetPrice: 1200,
    currency: 'USD',
    deliveryLocation: 'Mumbai Port (JNPT), India',
    deliveryDeadline: '2026-05-15',
  },
  'req-abc-002': {
    id: 'req-abc-002',
    title: 'Copper Wire - Industrial Grade',
    description: 'Electrolytic tough pitch copper wire for electrical harness assemblies.',
    category: 'Metals & Alloys',
    quantity: 200,
    unit: 'MT',
    targetPrice: 9000,
    currency: 'USD',
    deliveryLocation: 'Shanghai, China',
    deliveryDeadline: '2026-06-01',
  },
  'req-abc-003': {
    id: 'req-abc-003',
    title: 'Aluminum Sheets - 5mm',
    description: '5mm sheets with tight flatness tolerance for fabrication use.',
    category: 'Metals & Alloys',
    quantity: 150,
    unit: 'MT',
    targetPrice: 2400,
    currency: 'USD',
    deliveryLocation: 'Rotterdam, Netherlands',
    deliveryDeadline: '2026-04-20',
  },
} as const;

const SUPPLIER_CONTEXT = {
  id: 'sup-demo-001',
  name: 'Supplier User',
  companyName: 'Demo Supplier Co.',
};

export default function NewQuotationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const requirementId = searchParams.get('req') || '';
  const cardId = searchParams.get('card') || '';

  const requirement = useMemo(() => {
    if (!requirementId) {
      return null;
    }
    return REQUIREMENT_LOOKUP[requirementId as keyof typeof REQUIREMENT_LOOKUP] || null;
  }, [requirementId]);

  if (!requirement) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Requirement not found</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            We could not find the requirement to create a quotation. Please return to the requirements page and try again.
          </p>
          <Link href="/requirements">
            <Button variant="outline">Back to Requirements</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Submit Quotation</h1>
          <p className="text-muted-foreground">
            Card: {cardId || 'N/A'} • Requirement: {requirement.id}
          </p>
        </div>
      </div>

      <QuotationSubmitForm
        requirement={requirement}
        supplier={SUPPLIER_CONTEXT}
        onCancel={() => router.back()}
        onSuccess={() => router.push('/quotations?view=submitted')}
      />
    </div>
  );
}
