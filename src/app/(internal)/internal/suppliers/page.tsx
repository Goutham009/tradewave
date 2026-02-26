'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Building2,
  Star,
  Package,
  MapPin,
  Eye,
} from 'lucide-react';
import Link from 'next/link';

interface Supplier {
  id: string;
  name: string;
  category: string;
  location: string;
  rating: number;
  completedOrders: number;
  activeOrders: number;
  status: 'verified' | 'pending' | 'suspended';
  specializations: string[];
}

const MOCK_SUPPLIERS: Supplier[] = [
  { id: 'SUP-001', name: 'Steel Industries Ltd', category: 'Raw Materials', location: 'Mumbai, India', rating: 4.8, completedOrders: 156, activeOrders: 12, status: 'verified', specializations: ['Steel', 'Iron', 'Metals'] },
  { id: 'SUP-002', name: 'Textile Masters', category: 'Textiles', location: 'Delhi, India', rating: 4.7, completedOrders: 89, activeOrders: 8, status: 'verified', specializations: ['Cotton', 'Silk', 'Polyester'] },
  { id: 'SUP-003', name: 'ChemPro Industries', category: 'Chemicals', location: 'Chennai, India', rating: 4.9, completedOrders: 234, activeOrders: 15, status: 'verified', specializations: ['Industrial Chemicals', 'Solvents'] },
  { id: 'SUP-004', name: 'ElectroComponents', category: 'Electronics', location: 'Bangalore, India', rating: 4.5, completedOrders: 67, activeOrders: 5, status: 'verified', specializations: ['Capacitors', 'Resistors', 'PCBs'] },
  { id: 'SUP-005', name: 'Global Plastics', category: 'Plastics', location: 'Pune, India', rating: 4.3, completedOrders: 45, activeOrders: 3, status: 'pending', specializations: ['PVC', 'HDPE', 'Packaging'] },
];

const STATUS_CONFIG = {
  verified: { label: 'Verified', className: 'bg-green-500/20 text-green-400' },
  pending: { label: 'Pending', className: 'bg-yellow-500/20 text-yellow-400' },
  suspended: { label: 'Suspended', className: 'bg-red-500/20 text-red-400' },
};

export default function SuppliersPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const categories = Array.from(new Set(MOCK_SUPPLIERS.map((s) => s.category)));

  const filteredSuppliers = MOCK_SUPPLIERS.filter((supplier) => {
    const matchesSearch = supplier.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || supplier.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">All Suppliers</h1>
        <p className="text-slate-400">Browse and manage verified suppliers</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search suppliers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-slate-900 border-slate-700"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={categoryFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setCategoryFilter('all')}
            size="sm"
            className="border-slate-700"
          >
            All
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={categoryFilter === cat ? 'default' : 'outline'}
              onClick={() => setCategoryFilter(cat)}
              size="sm"
              className="border-slate-700"
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Suppliers Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredSuppliers.map((supplier) => (
          <Card key={supplier.id} className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-green-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white">{supplier.name}</h3>
                      <Badge className={STATUS_CONFIG[supplier.status].className}>
                        {STATUS_CONFIG[supplier.status].label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm font-medium">{supplier.rating}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-1 text-sm text-slate-400">
                    <Badge variant="outline" className="text-xs">{supplier.category}</Badge>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {supplier.location}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-2">
                    {supplier.specializations.map((spec) => (
                      <Badge key={spec} variant="secondary" className="text-xs bg-slate-800">
                        {spec}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-slate-400">
                        <Package className="h-4 w-4 inline mr-1" />
                        {supplier.completedOrders} completed
                      </span>
                      <span className="text-blue-400">
                        {supplier.activeOrders} active
                      </span>
                    </div>
                    <Link href={`/internal/suppliers/${supplier.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
