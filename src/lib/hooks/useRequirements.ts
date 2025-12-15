'use client';

import { useState, useEffect, useCallback } from 'react';

interface Requirement {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  status: string;
  priority: string;
  quantity: number;
  unit: string;
  targetPrice?: number;
  currency: string;
  deliveryLocation: string;
  deliveryDeadline: string;
  createdAt: string;
  quotations?: any[];
  _count?: {
    quotations: number;
    transactions: number;
  };
}

interface UseRequirementsOptions {
  status?: string;
  page?: number;
  limit?: number;
}

interface UseRequirementsReturn {
  requirements: Requirement[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  refetch: () => void;
}

export function useRequirements(options: UseRequirementsOptions = {}): UseRequirementsReturn {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const fetchRequirements = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (options.status) params.set('status', options.status);
      if (options.page) params.set('page', options.page.toString());
      if (options.limit) params.set('limit', options.limit.toString());

      const response = await fetch(`/api/requirements?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch requirements');
      }

      const data = await response.json();
      setRequirements(data.requirements);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [options.status, options.page, options.limit]);

  useEffect(() => {
    fetchRequirements();
  }, [fetchRequirements]);

  return {
    requirements,
    loading,
    error,
    pagination,
    refetch: fetchRequirements,
  };
}

export function useRequirement(id: string) {
  const [requirement, setRequirement] = useState<Requirement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequirement = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/requirements/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch requirement');
      }

      const data = await response.json();
      setRequirement(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRequirement();
  }, [fetchRequirement]);

  return {
    requirement,
    loading,
    error,
    refetch: fetchRequirement,
  };
}

export async function createRequirement(data: Partial<Requirement>) {
  const response = await fetch('/api/requirements', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create requirement');
  }

  return response.json();
}

export async function updateRequirement(id: string, data: Partial<Requirement>) {
  const response = await fetch(`/api/requirements/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update requirement');
  }

  return response.json();
}

export async function deleteRequirement(id: string) {
  const response = await fetch(`/api/requirements/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete requirement');
  }

  return response.json();
}
