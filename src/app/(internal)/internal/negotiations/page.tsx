'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  MessageSquare,
  DollarSign,
  Clock,
  ArrowRight,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';

interface Negotiation {
  id: string;
  requirementTitle: string;
  buyerName: string;
  supplierName: string;
  originalPrice: number;
  currentOffer: number;
  status: 'active' | 'pending_response' | 'agreed' | 'declined';
  lastUpdate: string;
  rounds: number;
}

const MOCK_NEGOTIATIONS: Negotiation[] = [
  { id: 'NEG-001', requirementTitle: 'Steel Components', buyerName: 'Acme Corporation', supplierName: 'Steel Industries Ltd', originalPrice: 25000, currentOffer: 23500, status: 'active', lastUpdate: '2 hours ago', rounds: 3 },
  { id: 'NEG-002', requirementTitle: 'Cotton Fabric', buyerName: 'Fashion Hub Ltd', supplierName: 'Textile Masters', originalPrice: 45000, currentOffer: 42000, status: 'pending_response', lastUpdate: '1 day ago', rounds: 2 },
  { id: 'NEG-003', requirementTitle: 'Industrial Chemicals', buyerName: 'Tech Solutions Inc', supplierName: 'ChemPro Industries', originalPrice: 15000, currentOffer: 14200, status: 'agreed', lastUpdate: '3 days ago', rounds: 4 },
  { id: 'NEG-004', requirementTitle: 'Electronic Components', buyerName: 'ElectroMart', supplierName: 'ElectroComponents', originalPrice: 75000, currentOffer: 70000, status: 'declined', lastUpdate: '5 days ago', rounds: 5 },
];

const STATUS_CONFIG = {
  active: { label: 'Active', className: 'bg-blue-500/20 text-blue-400' },
  pending_response: { label: 'Pending Response', className: 'bg-yellow-500/20 text-yellow-400' },
  agreed: { label: 'Agreed', className: 'bg-green-500/20 text-green-400' },
  declined: { label: 'Declined', className: 'bg-red-500/20 text-red-400' },
};

export default function NegotiationsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredNegotiations = MOCK_NEGOTIATIONS.filter((neg) => {
    const matchesSearch = neg.requirementTitle.toLowerCase().includes(search.toLowerCase()) ||
      neg.buyerName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || neg.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Negotiations</h1>
        <p className="text-slate-400">Manage ongoing price negotiations between buyers and suppliers</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search negotiations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-slate-900 border-slate-700"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('all')}
            size="sm"
            className="border-slate-700"
          >
            All
          </Button>
          <Button
            variant={statusFilter === 'active' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('active')}
            size="sm"
            className="border-slate-700"
          >
            Active
          </Button>
          <Button
            variant={statusFilter === 'pending_response' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('pending_response')}
            size="sm"
            className="border-slate-700"
          >
            Pending
          </Button>
          <Button
            variant={statusFilter === 'agreed' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('agreed')}
            size="sm"
            className="border-slate-700"
          >
            Agreed
          </Button>
        </div>
      </div>

      {/* Negotiations List */}
      <div className="space-y-4">
        {filteredNegotiations.map((neg) => (
          <Card key={neg.id} className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                    neg.status === 'agreed' ? 'bg-green-500/20' :
                    neg.status === 'declined' ? 'bg-red-500/20' : 'bg-blue-500/20'
                  }`}>
                    {neg.status === 'agreed' ? <CheckCircle className="h-6 w-6 text-green-500" /> :
                     neg.status === 'declined' ? <XCircle className="h-6 w-6 text-red-500" /> :
                     <MessageSquare className="h-6 w-6 text-blue-500" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white">{neg.requirementTitle}</h3>
                      <Badge className={STATUS_CONFIG[neg.status].className}>
                        {STATUS_CONFIG[neg.status].label}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-400 mt-1">
                      {neg.buyerName} ↔ {neg.supplierName}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {neg.lastUpdate}
                      </span>
                      <span>{neg.rounds} rounds</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-400 line-through">${neg.originalPrice.toLocaleString()}</span>
                    <ArrowRight className="h-4 w-4 text-slate-500" />
                    <span className="text-lg font-bold text-white">${neg.currentOffer.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-green-400 mt-1">
                    {Math.round((1 - neg.currentOffer / neg.originalPrice) * 100)}% reduction
                  </p>
                  {(neg.status === 'active' || neg.status === 'pending_response') && (
                    <Link href={`/internal/negotiations/${neg.id}`}>
                      <Button variant="outline" size="sm" className="mt-2 border-slate-700">
                        View Details
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
