'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Search,
  Filter,
  Clock,
  DollarSign,
  MapPin,
  Package,
  Calendar,
  ArrowRight,
  Star,
  TrendingUp,
  Eye,
  Send,
  Building2,
  Zap,
} from 'lucide-react';

interface Opportunity {
  id: string;
  title: string;
  category: string;
  quantity: number;
  unit: string;
  budget: { min: number; max: number };
  currency: string;
  deadline: string;
  location: string;
  buyerName: string;
  buyerRating: number;
  description: string;
  status: 'NEW' | 'VIEWED' | 'QUOTED';
  matchScore: number;
  postedAt: string;
  quotationsReceived: number;
}

const mockOpportunities: Opportunity[] = [
  {
    id: 'opp-1',
    title: 'Steel Components for Manufacturing',
    category: 'Raw Materials',
    quantity: 5000,
    unit: 'kg',
    budget: { min: 20000, max: 30000 },
    currency: 'USD',
    deadline: '2024-02-15',
    location: 'New York, USA',
    buyerName: 'Acme Manufacturing Corp',
    buyerRating: 4.8,
    description: 'Looking for high-quality steel components for our manufacturing line. Must meet ISO 9001 standards.',
    status: 'NEW',
    matchScore: 95,
    postedAt: '2024-01-20',
    quotationsReceived: 3,
  },
  {
    id: 'opp-2',
    title: 'Electronic Circuit Boards - Bulk Order',
    category: 'Electronics',
    quantity: 10000,
    unit: 'units',
    budget: { min: 50000, max: 75000 },
    currency: 'USD',
    deadline: '2024-02-28',
    location: 'San Francisco, USA',
    buyerName: 'Tech Innovations Ltd',
    buyerRating: 4.9,
    description: 'Require PCB boards with specific specifications for our IoT devices. Long-term partnership possible.',
    status: 'VIEWED',
    matchScore: 88,
    postedAt: '2024-01-19',
    quotationsReceived: 7,
  },
  {
    id: 'opp-3',
    title: 'Textile Materials for Fashion Line',
    category: 'Textiles',
    quantity: 2000,
    unit: 'meters',
    budget: { min: 8000, max: 12000 },
    currency: 'USD',
    deadline: '2024-02-10',
    location: 'Los Angeles, USA',
    buyerName: 'Fashion Forward Inc',
    buyerRating: 4.5,
    description: 'Premium quality cotton and silk blend for our new spring collection.',
    status: 'QUOTED',
    matchScore: 82,
    postedAt: '2024-01-18',
    quotationsReceived: 12,
  },
  {
    id: 'opp-4',
    title: 'Industrial Machinery Parts',
    category: 'Machinery',
    quantity: 100,
    unit: 'pieces',
    budget: { min: 15000, max: 25000 },
    currency: 'USD',
    deadline: '2024-03-01',
    location: 'Chicago, USA',
    buyerName: 'Heavy Industries Co',
    buyerRating: 4.7,
    description: 'Replacement parts for CNC machines. OEM quality required.',
    status: 'NEW',
    matchScore: 78,
    postedAt: '2024-01-21',
    quotationsReceived: 2,
  },
];

const stats = [
  { label: 'New Opportunities', value: 24, icon: Zap, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { label: 'Matching Your Profile', value: 18, icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  { label: 'Quotes Submitted', value: 12, icon: Send, color: 'text-green-500', bg: 'bg-green-500/10' },
  { label: 'Won This Month', value: 5, icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-500/10' },
];

export default function OpportunitiesPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredOpportunities = mockOpportunities.filter(opp => {
    const matchesSearch = opp.title.toLowerCase().includes(search.toLowerCase()) ||
      opp.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || opp.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || opp.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NEW':
        return <Badge className="bg-blue-500/20 text-blue-600">New</Badge>;
      case 'VIEWED':
        return <Badge className="bg-yellow-500/20 text-yellow-600">Viewed</Badge>;
      case 'QUOTED':
        return <Badge className="bg-green-500/20 text-green-600">Quoted</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Opportunities</h1>
          <p className="text-muted-foreground">
            Browse and respond to buyer requirements matching your expertise
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search opportunities..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">All Categories</option>
                <option value="Raw Materials">Raw Materials</option>
                <option value="Electronics">Electronics</option>
                <option value="Textiles">Textiles</option>
                <option value="Machinery">Machinery</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">All Status</option>
                <option value="NEW">New</option>
                <option value="VIEWED">Viewed</option>
                <option value="QUOTED">Quoted</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Opportunities List */}
      <div className="space-y-4">
        {filteredOpportunities.map((opp) => {
          const daysUntilDeadline = Math.ceil(
            (new Date(opp.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          );

          return (
            <Card key={opp.id} className="transition-shadow hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  {/* Main Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <Package className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-lg">{opp.title}</h3>
                          {getStatusBadge(opp.status)}
                          {opp.matchScore >= 90 && (
                            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                              <Star className="mr-1 h-3 w-3" />
                              Top Match
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {opp.buyerName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            {opp.buyerRating}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {opp.location}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {opp.description}
                    </p>

                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span>{opp.quantity.toLocaleString()} {opp.unit}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>${opp.budget.min.toLocaleString()} - ${opp.budget.max.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className={daysUntilDeadline <= 7 ? 'text-orange-600 font-medium' : ''}>
                          {daysUntilDeadline} days left
                        </span>
                      </div>
                      <Badge variant="outline">{opp.category}</Badge>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 lg:items-end lg:text-right">
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">{opp.matchScore}%</div>
                        <p className="text-xs text-muted-foreground">Match Score</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {opp.quotationsReceived} quotes received
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Link href={`/opportunities/${opp.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                      </Link>
                      {opp.status !== 'QUOTED' && (
                        <Link href={`/quotations/new?opportunityId=${opp.id}`}>
                          <Button variant="gradient" size="sm">
                            <Send className="mr-2 h-4 w-4" />
                            Submit Quote
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredOpportunities.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="font-semibold mb-2">No opportunities found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or check back later for new opportunities.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
