'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft,
  FileText,
  Calendar,
  MapPin,
  DollarSign,
  Package,
  Edit,
  MessageSquare,
  Clock,
  CheckCircle2,
  Star,
  Building2,
} from 'lucide-react';

// Mock data - in real app, fetch from API
const requirement = {
  id: 'REQ-2024-001',
  title: 'Steel Components for Manufacturing',
  description: 'High-quality stainless steel components required for our manufacturing line. Must meet ISO 9001 standards and come with material certificates.',
  category: 'Raw Materials',
  subcategory: 'Stainless Steel',
  status: 'QUOTATIONS_READY',
  priority: 'HIGH',
  quantity: 5000,
  unit: 'kg',
  targetPrice: 25000,
  currency: 'USD',
  deliveryLocation: 'Mumbai, India',
  deliveryDeadline: '2024-02-15',
  createdAt: '2024-01-10',
  specifications: {
    grade: '304 Stainless Steel',
    thickness: '2-5mm',
    finish: 'Mill Finish',
    certification: 'ISO 9001, Material Test Certificate',
  },
  quotations: [
    {
      id: 'QUO-001',
      supplier: 'Shanghai Steel Co.',
      rating: 4.8,
      unitPrice: 4.5,
      total: 22500,
      leadTime: '14 days',
      status: 'SHORTLISTED',
    },
    {
      id: 'QUO-002',
      supplier: 'Mumbai Metals Ltd',
      rating: 4.5,
      unitPrice: 4.8,
      total: 24000,
      leadTime: '10 days',
      status: 'PENDING',
    },
    {
      id: 'QUO-003',
      supplier: 'Delhi Steel Works',
      rating: 4.2,
      unitPrice: 5.0,
      total: 25000,
      leadTime: '7 days',
      status: 'PENDING',
    },
  ],
};

const getStatusBadge = (status: string) => {
  const variants: Record<string, { variant: any; label: string }> = {
    DRAFT: { variant: 'secondary', label: 'Draft' },
    SUBMITTED: { variant: 'info', label: 'Submitted' },
    UNDER_REVIEW: { variant: 'warning', label: 'Under Review' },
    SOURCING: { variant: 'info', label: 'Sourcing' },
    QUOTATIONS_READY: { variant: 'success', label: 'Quotations Ready' },
    ACCEPTED: { variant: 'success', label: 'Accepted' },
    COMPLETED: { variant: 'success', label: 'Completed' },
  };
  const config = variants[status] || { variant: 'secondary', label: status };
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

const getPriorityBadge = (priority: string) => {
  const variants: Record<string, { variant: any; label: string }> = {
    LOW: { variant: 'secondary', label: 'Low' },
    MEDIUM: { variant: 'outline', label: 'Medium' },
    HIGH: { variant: 'warning', label: 'High' },
    URGENT: { variant: 'destructive', label: 'Urgent' },
  };
  const config = variants[priority] || { variant: 'secondary', label: priority };
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export default function RequirementDetailPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/requirements">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{requirement.id}</h1>
              {getStatusBadge(requirement.status)}
              {getPriorityBadge(requirement.priority)}
            </div>
            <p className="text-muted-foreground">{requirement.title}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Link href="/quotations">
            <Button variant="gradient">
              <MessageSquare className="mr-2 h-4 w-4" />
              View Quotations ({requirement.quotations.length})
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Requirement Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
                <p className="mt-1">{requirement.description}</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Category</h4>
                  <p className="mt-1">{requirement.category} / {requirement.subcategory}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Quantity</h4>
                  <p className="mt-1">{requirement.quantity.toLocaleString()} {requirement.unit}</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-2">
                  <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Target Budget</h4>
                    <p className="mt-1 font-semibold">
                      {requirement.currency} {requirement.targetPrice?.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Delivery Location</h4>
                    <p className="mt-1">{requirement.deliveryLocation}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Delivery Deadline</h4>
                  <p className="mt-1">{new Date(requirement.deliveryDeadline).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {Object.entries(requirement.specifications).map(([key, value]) => (
                  <div key={key} className="rounded-lg border p-3">
                    <h4 className="text-sm font-medium text-muted-foreground capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </h4>
                    <p className="mt-1">{value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quotations Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Quotations Received</span>
                <Badge variant="success">{requirement.quotations.length} quotes</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {requirement.quotations.map((quote) => (
                  <div
                    key={quote.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                        <Building2 className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{quote.supplier}</p>
                          {quote.status === 'SHORTLISTED' && (
                            <Badge variant="success">Shortlisted</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{quote.rating}</span>
                          <span>•</span>
                          <Clock className="h-3 w-3" />
                          <span>{quote.leadTime}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">${quote.total.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">
                        ${quote.unitPrice}/{requirement.unit}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/quotations" className="block">
                <Button variant="gradient" className="w-full">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Review Quotations
                </Button>
              </Link>
              <Button variant="outline" className="w-full">
                <Edit className="mr-2 h-4 w-4" />
                Edit Requirement
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { status: 'Created', date: requirement.createdAt, completed: true },
                  { status: 'Submitted', date: '2024-01-10', completed: true },
                  { status: 'Sourcing Started', date: '2024-01-11', completed: true },
                  { status: 'Quotations Received', date: '2024-01-12', completed: true },
                  { status: 'Under Negotiation', date: null, completed: false },
                  { status: 'Accepted', date: null, completed: false },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full ${
                          item.completed
                            ? 'bg-green-500 text-white'
                            : 'border-2 border-gray-300'
                        }`}
                      >
                        {item.completed && <CheckCircle2 className="h-4 w-4" />}
                      </div>
                      {idx < 5 && (
                        <div
                          className={`h-8 w-0.5 ${
                            item.completed ? 'bg-green-500' : 'bg-gray-200'
                          }`}
                        />
                      )}
                    </div>
                    <div>
                      <p className={`font-medium ${!item.completed && 'text-muted-foreground'}`}>
                        {item.status}
                      </p>
                      {item.date && (
                        <p className="text-sm text-muted-foreground">
                          {new Date(item.date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Price Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Target Budget</span>
                  <span className="font-medium">${requirement.targetPrice?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Lowest Quote</span>
                  <span className="font-medium text-green-600">$22,500</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Savings</span>
                  <span className="font-medium text-green-600">$2,500 (10%)</span>
                </div>
                <Progress value={90} className="h-2 mt-2" />
                <p className="text-xs text-muted-foreground text-center">
                  Best quote is 10% below budget
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
