'use client';

import { useState, useCallback } from 'react';

interface Quotation {
  id: string;
  requirementId: string;
  supplierId: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  shipping: number;
  insurance: number;
  customs: number;
  taxes: number;
  platformFee: number;
  total: number;
  currency: string;
  leadTime: number;
  validUntil: string;
  notes: string | null;
  terms: string | null;
  certifications: string[];
  samples: boolean;
  sampleCost: number | null;
  status: string;
  createdAt: string;
  isExpired?: boolean;
  daysUntilExpiry?: number;
  savingsPercent?: number | null;
  requirement?: {
    id: string;
    title: string;
    category: string;
    quantity: number;
    unit: string;
    deliveryLocation: string;
    deliveryDeadline: string;
    targetPrice: number | null;
    buyer?: {
      id: string;
      name: string;
      companyName: string;
    };
  };
  supplier?: {
    id: string;
    name: string;
    companyName: string;
    location: string;
    verified: boolean;
    overallRating: number;
    totalReviews: number;
  };
}

interface QuotationSubmission {
  requirementId: string;
  supplierId: string;
  unitPrice: number;
  quantity: number;
  leadTime: number;
  validDays?: number;
  shipping?: number;
  insurance?: number;
  customs?: number;
  taxes?: number;
  notes?: string;
  terms?: string;
  certifications?: string[];
  samples?: boolean;
  sampleCost?: number;
}

interface UseQuotationsOptions {
  requirementId?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export function useQuotations(options: UseQuotationsOptions = {}) {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const fetchQuotations = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      });
      
      if (options.requirementId) params.append('requirementId', options.requirementId);
      if (options.status) params.append('status', options.status);
      if (options.sortBy) params.append('sortBy', options.sortBy);
      if (options.sortOrder) params.append('sortOrder', options.sortOrder);

      const response = await fetch(`/api/quotations?${params}`);
      const data = await response.json();

      if (data.status === 'success') {
        setQuotations(data.data.quotations);
        setPagination(data.data.pagination);
      } else {
        setError(data.error || 'Failed to fetch quotations');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, [options.requirementId, options.status, options.sortBy, options.sortOrder, pagination.limit]);

  const submitQuotation = useCallback(async (data: QuotationSubmission) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (result.status === 'success') {
        return { success: true, quotation: result.data.quotation };
      } else {
        setError(result.error || 'Failed to submit quotation');
        return { success: false, error: result.error };
      }
    } catch (err) {
      setError('Network error');
      return { success: false, error: 'Network error' };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    quotations,
    loading,
    error,
    pagination,
    fetchQuotations,
    submitQuotation,
    setQuotations,
  };
}

export function useQuotation(quotationId: string) {
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuotation = useCallback(async () => {
    if (!quotationId) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/quotations/${quotationId}`);
      const data = await response.json();

      if (data.status === 'success') {
        setQuotation(data.data.quotation);
      } else {
        setError(data.error || 'Failed to fetch quotation');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, [quotationId]);

  const acceptQuotation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/quotations/${quotationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ACCEPT' }),
      });
      const data = await response.json();

      if (data.status === 'success') {
        setQuotation(prev => prev ? { ...prev, status: 'ACCEPTED' } : null);
        return { 
          success: true, 
          transaction: data.data.transaction,
          paymentIntent: data.data.paymentIntent,
        };
      } else {
        setError(data.error || 'Failed to accept quotation');
        return { success: false, error: data.error };
      }
    } catch (err) {
      setError('Network error');
      return { success: false, error: 'Network error' };
    } finally {
      setLoading(false);
    }
  }, [quotationId]);

  const rejectQuotation = useCallback(async (reason?: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/quotations/${quotationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'REJECT', rejectionReason: reason }),
      });
      const data = await response.json();

      if (data.status === 'success') {
        setQuotation(prev => prev ? { ...prev, status: 'REJECTED' } : null);
        return { success: true };
      } else {
        setError(data.error || 'Failed to reject quotation');
        return { success: false, error: data.error };
      }
    } catch (err) {
      setError('Network error');
      return { success: false, error: 'Network error' };
    } finally {
      setLoading(false);
    }
  }, [quotationId]);

  const shortlistQuotation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/quotations/${quotationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SHORTLIST' }),
      });
      const data = await response.json();

      if (data.status === 'success') {
        setQuotation(prev => prev ? { ...prev, status: 'SHORTLISTED' } : null);
        return { success: true };
      } else {
        setError(data.error || 'Failed to shortlist quotation');
        return { success: false, error: data.error };
      }
    } catch (err) {
      setError('Network error');
      return { success: false, error: 'Network error' };
    } finally {
      setLoading(false);
    }
  }, [quotationId]);

  return {
    quotation,
    loading,
    error,
    fetchQuotation,
    acceptQuotation,
    rejectQuotation,
    shortlistQuotation,
    setQuotation,
  };
}
