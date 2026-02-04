'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface FilterPanelProps {
  filters: {
    categories: string[];
    tiers: string[];
    industries: string[];
  };
  selectedFilters: {
    category?: string;
    tier?: string[];
    industry?: string;
  };
  onFilterChange: (filters: any) => void;
  onClear: () => void;
}

export function FilterPanel({
  filters,
  selectedFilters,
  onFilterChange,
  onClear,
}: FilterPanelProps) {
  const toggleTier = (tier: string) => {
    const current = selectedFilters.tier || [];
    const updated = current.includes(tier)
      ? current.filter((t) => t !== tier)
      : [...current, tier];
    onFilterChange({ ...selectedFilters, tier: updated });
  };

  const hasActiveFilters =
    selectedFilters.category ||
    (selectedFilters.tier && selectedFilters.tier.length > 0) ||
    selectedFilters.industry;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg font-semibold">Filters</CardTitle>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="h-8 px-2 text-xs"
          >
            <X className="mr-1 h-3 w-3" />
            Clear
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Category Filter */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Category
          </label>
          <select
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
            value={selectedFilters.category || ''}
            onChange={(e) =>
              onFilterChange({ ...selectedFilters, category: e.target.value || undefined })
            }
          >
            <option value="">All Categories</option>
            {filters.categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Tier Filter */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Supplier Tier
          </label>
          <div className="space-y-2">
            {filters.tiers.map((tier) => {
              const isSelected = selectedFilters.tier?.includes(tier);
              return (
                <label
                  key={tier}
                  className="flex cursor-pointer items-center gap-2"
                >
                  <input
                    type="checkbox"
                    checked={isSelected || false}
                    onChange={() => toggleTier(tier)}
                    className="h-4 w-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary"
                  />
                  <Badge
                    variant={
                      tier === 'TRUSTED'
                        ? 'success'
                        : tier === 'STANDARD'
                        ? 'info'
                        : 'warning'
                    }
                    className="text-xs"
                  >
                    {tier}
                  </Badge>
                </label>
              );
            })}
          </div>
        </div>

        {/* Industry Filter */}
        {filters.industries.length > 0 && (
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Industry
            </label>
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
              value={selectedFilters.industry || ''}
              onChange={(e) =>
                onFilterChange({ ...selectedFilters, industry: e.target.value || undefined })
              }
            >
              <option value="">All Industries</option>
              {filters.industries.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
