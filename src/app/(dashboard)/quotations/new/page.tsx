'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import QuotationSubmitForm from '@/components/quotations/QuotationSubmitForm';

type QuotationRequirement = {
  id: string;
  title: string;
  description: string;
  category: string;
  quantity: number;
  unit: string;
  targetPrice: number | null;
  currency: string;
  deliveryLocation: string;
  deliveryDeadline: string;
};

type SupplierRequirementDetailResponse = {
  cardId: string;
  requirementId: string;
  daysLeft: number | null;
  isExpired: boolean;
  requirement: {
    title: string;
    description: string;
    category: string;
    quantity: number;
    unit: string;
    budgetMin: number | null;
    budgetMax: number | null;
    currency: string;
    deliveryLocation: string;
    deliveryDeadline: string;
  };
};

export default function NewQuotationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const cardId = searchParams.get('card') || '';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requirement, setRequirement] = useState<QuotationRequirement | null>(null);
  const [cardContext, setCardContext] = useState<SupplierRequirementDetailResponse | null>(null);

  const fetchRequirementCard = useCallback(async () => {
    if (!cardId) {
      setError('Missing supplier requirement card ID. Open this page from your requirement invitation.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/supplier/requirements/${cardId}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to load requirement invitation');
        return;
      }

      const payload = data as SupplierRequirementDetailResponse;
      setCardContext(payload);
      setRequirement({
        id: payload.requirementId,
        title: payload.requirement.title,
        description: payload.requirement.description,
        category: payload.requirement.category,
        quantity: payload.requirement.quantity,
        unit: payload.requirement.unit,
        targetPrice: payload.requirement.budgetMax ?? payload.requirement.budgetMin ?? null,
        currency: payload.requirement.currency,
        deliveryLocation: payload.requirement.deliveryLocation,
        deliveryDeadline: payload.requirement.deliveryDeadline,
      });
    } catch {
      setError('Network error while loading requirement invitation.');
    } finally {
      setLoading(false);
    }
  }, [cardId]);

  useEffect(() => {
    void fetchRequirementCard();
  }, [fetchRequirementCard]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!requirement || error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Requirement not available</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {error || 'We could not load the requirement invitation. Please return to your requirements and try again.'}
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
            Card: {cardContext?.cardId || cardId} • Requirement: {cardContext?.requirementId || requirement.id}
          </p>
        </div>
      </div>

      {cardContext?.isExpired && (
        <Card>
          <CardContent className="py-4 text-sm text-red-600">
            This invitation deadline has passed. Contact procurement/admin if you need reactivation.
          </CardContent>
        </Card>
      )}

      <QuotationSubmitForm
        requirement={requirement}
        supplierRequirementCardId={cardId}
        onCancel={() => router.back()}
        onSuccess={() => router.push('/quotations?view=submitted')}
      />
    </div>
  );
}
