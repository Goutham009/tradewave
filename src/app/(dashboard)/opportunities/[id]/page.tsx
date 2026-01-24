'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Building2, MapPin, Calendar, DollarSign, 
  Package, Clock, FileText, Star, CheckCircle2, Send,
  Globe, Shield, Award, TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Mock opportunity data
const getMockOpportunity = (id: string) => ({
  id,
  title: 'Industrial Steel Components - Q1 2024',
  description: 'We are looking for a reliable supplier to provide high-quality steel components for our manufacturing line upgrade. The components must meet ISO 9001:2015 standards and include full certification documentation.',
  category: 'Industrial Materials',
  quantity: 5000,
  unit: 'pieces',
  budget: 250000,
  currency: 'USD',
  deliveryLocation: 'Los Angeles, CA, USA',
  deliveryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
  deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  status: 'OPEN',
  matchScore: 94,
  createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  specifications: {
    material: 'Grade A Steel',
    thickness: '2.5mm - 5mm',
    coating: 'Galvanized or Powder Coated',
    certifications: 'ISO 9001:2015, ISO 14001:2015',
    packaging: 'Industrial crates with moisture protection',
  },
  requirements: [
    'Must have ISO 9001:2015 certification',
    'Minimum 5 years experience in steel manufacturing',
    'Ability to provide samples within 7 days',
    'Full quality inspection reports required',
    'Insurance coverage for international shipping',
  ],
  buyer: {
    id: 'buyer-001',
    name: 'TechCorp Industries',
    location: 'Los Angeles, CA',
    verified: true,
    rating: 4.9,
    totalOrders: 127,
    memberSince: '2019',
  },
  attachments: [
    { id: 'att-1', name: 'technical-specifications.pdf', size: 2450000 },
    { id: 'att-2', name: 'quality-requirements.pdf', size: 1280000 },
    { id: 'att-3', name: 'sample-images.zip', size: 5600000 },
  ],
  quotationsReceived: 8,
  viewsCount: 156,
});

export default function OpportunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const opportunity = getMockOpportunity(params.id as string);

  const handleSubmitQuote = () => {
    setIsSubmitting(true);
    // Simulate submission
    setTimeout(() => {
      setIsSubmitting(false);
      router.push('/quotations');
    }, 1500);
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  };

  const daysUntilDeadline = Math.ceil(
    (new Date(opportunity.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/opportunities" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Opportunities
          </Link>
          
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="success" className="text-sm">
                  {opportunity.matchScore}% Match
                </Badge>
                <Badge variant="info">
                  {opportunity.status}
                </Badge>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                {opportunity.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {opportunity.buyer.name}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {opportunity.deliveryLocation}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Posted {formatDate(opportunity.createdAt)}
                </span>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <Button 
                size="lg" 
                onClick={handleSubmitQuote}
                disabled={isSubmitting}
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? 'Submitting...' : 'Submit Quotation'}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                {daysUntilDeadline} days left to submit
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview Card */}
            <Card>
              <CardHeader>
                <CardTitle>Requirement Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground leading-relaxed">
                  {opportunity.description}
                </p>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Quantity</p>
                      <p className="font-semibold">{opportunity.quantity.toLocaleString()} {opportunity.unit}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                    <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Budget</p>
                      <p className="font-semibold">{formatCurrency(opportunity.budget, opportunity.currency)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                    <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Quote Deadline</p>
                      <p className="font-semibold">{formatDate(opportunity.deadline)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                    <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Delivery Date</p>
                      <p className="font-semibold">{formatDate(opportunity.deliveryDate)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Specifications */}
            <Card>
              <CardHeader>
                <CardTitle>Technical Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {Object.entries(opportunity.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-3 border-b last:border-0">
                      <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span>
                      <span className="font-medium text-foreground">{value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Supplier Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {opportunity.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{req}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Attachments */}
            <Card>
              <CardHeader>
                <CardTitle>Attachments</CardTitle>
                <CardDescription>{opportunity.attachments.length} files available</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {opportunity.attachments.map((file) => (
                    <div 
                      key={file.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">{file.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(1)} MB
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Buyer Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Buyer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-semibold text-primary">
                    {opportunity.buyer.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold flex items-center gap-2">
                      {opportunity.buyer.name}
                      {opportunity.buyer.verified && (
                        <Shield className="h-4 w-4 text-blue-500" />
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">{opportunity.buyer.location}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-amber-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="font-semibold">{opportunity.buyer.rating}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Rating</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">{opportunity.buyer.totalOrders}</p>
                    <p className="text-xs text-muted-foreground">Orders</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                  <Award className="h-4 w-4" />
                  Member since {opportunity.buyer.memberSince}
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Opportunity Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Quotations Received</span>
                  <span className="font-semibold">{opportunity.quotationsReceived}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Views</span>
                  <span className="font-semibold">{opportunity.viewsCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Time Remaining</span>
                  <span className="font-semibold text-amber-600">{daysUntilDeadline} days</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardContent className="pt-6 space-y-3">
                <Button className="w-full gap-2" onClick={handleSubmitQuote} disabled={isSubmitting}>
                  <Send className="h-4 w-4" />
                  Submit Quotation
                </Button>
                <Button variant="outline" className="w-full gap-2">
                  <Globe className="h-4 w-4" />
                  Contact Buyer
                </Button>
                <Button variant="ghost" className="w-full gap-2">
                  <TrendingUp className="h-4 w-4" />
                  View Similar
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
