'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  ArrowUpRight,
  DollarSign,
  Loader2,
  Package,
  Star,
  User,
  Building2,
  FileText,
  Calendar,
} from 'lucide-react';

interface Quotation {
  id: string;
  supplierName: string;
  supplierEmail: string;
  supplierRating: number;
  amount: number;
  unitPrice: number;
  quantity: number;
  currency: string;
  status: string;
  validUntil: string;
  createdAt: string;
  deliveryDays: number;
  notes: string;
}

interface Requirement {
  id: string;
  title: string;
  buyerName: string;
  buyerEmail: string;
  buyerCompany: string;
  category: string;
  quantity: number;
  unit: string;
  description: string;
  createdAt: string;
  status: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  SUBMITTED: { label: 'Pending Review', color: 'bg-blue-500/20 text-blue-400' },
  VERIFIED: { label: 'Verified', color: 'bg-green-500/20 text-green-400' },
  SHORTLISTED: { label: 'Shortlisted', color: 'bg-purple-500/20 text-purple-400' },
  SENT_TO_BUYER: { label: 'Sent to Buyer', color: 'bg-cyan-500/20 text-cyan-400' },
  ACCEPTED: { label: 'Accepted', color: 'bg-emerald-500/20 text-emerald-400' },
  REJECTED: { label: 'Rejected', color: 'bg-red-500/20 text-red-400' },
};

const MOCK_REQUIREMENTS: Record<string, Requirement> = {
  'REQ-2024-004': { id: 'REQ-2024-004', title: 'Textile Raw Materials - Cotton', buyerName: 'Mike Chen', buyerEmail: 'mike@fashionhub.com', buyerCompany: 'Fashion Hub Ltd', category: 'Textiles', quantity: 2000, unit: 'kg', description: 'High-quality cotton fabric for garment manufacturing. Need Grade A quality with proper certification.', createdAt: '2024-01-10', status: 'ACTIVE' },
  'REQ-2024-005': { id: 'REQ-2024-005', title: 'Chemical Compounds - Industrial', buyerName: 'Sarah Lee', buyerEmail: 'sarah@techsolutions.com', buyerCompany: 'Tech Solutions Inc', category: 'Chemicals', quantity: 100, unit: 'barrels', description: 'Industrial grade chemical compounds for manufacturing process. Must meet safety standards.', createdAt: '2024-01-08', status: 'ACTIVE' },
  'REQ-2024-001': { id: 'REQ-2024-001', title: 'Steel Components for Manufacturing', buyerName: 'John Smith', buyerEmail: 'john@acme.com', buyerCompany: 'Acme Corporation', category: 'Raw Materials', quantity: 1000, unit: 'units', description: 'Heavy-duty steel components for industrial machinery. Require tensile strength certification.', createdAt: '2024-01-05', status: 'ACTIVE' },
};

const MOCK_QUOTATIONS: Record<string, Quotation[]> = {
  'REQ-2024-004': [
    { id: 'QUO-2024-001', supplierName: 'Steel Inc', supplierEmail: 'sales@steelinc.com', supplierRating: 4.8, amount: 7200, unitPrice: 3.6, quantity: 2000, currency: 'USD', status: 'SUBMITTED', validUntil: '2024-02-15', createdAt: '2024-01-15', deliveryDays: 14, notes: 'Can provide bulk discount for orders over 5000kg' },
    { id: 'QUO-2024-002', supplierName: 'Textile Masters', supplierEmail: 'sales@textilemasters.com', supplierRating: 4.6, amount: 7800, unitPrice: 3.9, quantity: 2000, currency: 'USD', status: 'SUBMITTED', validUntil: '2024-02-20', createdAt: '2024-01-18', deliveryDays: 10, notes: 'Premium quality cotton with organic certification available' },
    { id: 'QUO-2024-003', supplierName: 'Cotton World', supplierEmail: 'sales@cottonworld.com', supplierRating: 4.3, amount: 6900, unitPrice: 3.45, quantity: 2000, currency: 'USD', status: 'SUBMITTED', validUntil: '2024-02-10', createdAt: '2024-01-12', deliveryDays: 21, notes: 'Standard delivery. Express shipping available at extra cost.' },
    { id: 'QUO-2024-008', supplierName: 'Global Fabrics', supplierEmail: 'orders@globalfabrics.com', supplierRating: 4.5, amount: 7100, unitPrice: 3.55, quantity: 2000, currency: 'USD', status: 'VERIFIED', validUntil: '2024-02-18', createdAt: '2024-01-16', deliveryDays: 12, notes: 'Quality guarantee with replacement policy' },
  ],
  'REQ-2024-005': [
    { id: 'QUO-2024-004', supplierName: 'ChemPro Industries', supplierEmail: 'sales@chempro.com', supplierRating: 4.9, amount: 2800, unitPrice: 28, quantity: 100, currency: 'USD', status: 'VERIFIED', validUntil: '2024-02-05', createdAt: '2024-01-10', deliveryDays: 7, notes: 'Fast delivery with all safety documentation included' },
    { id: 'QUO-2024-005', supplierName: 'Industrial Chemicals Co', supplierEmail: 'sales@indchem.com', supplierRating: 4.7, amount: 3100, unitPrice: 31, quantity: 100, currency: 'USD', status: 'VERIFIED', validUntil: '2024-02-25', createdAt: '2024-01-20', deliveryDays: 5, notes: 'Express delivery. MSDS sheets provided.' },
    { id: 'QUO-2024-006', supplierName: 'SafeChem Ltd', supplierEmail: 'sales@safechem.com', supplierRating: 4.5, amount: 2950, unitPrice: 29.5, quantity: 100, currency: 'USD', status: 'VERIFIED', validUntil: '2024-02-28', createdAt: '2024-01-21', deliveryDays: 10, notes: 'ISO certified. Includes handling instructions.' },
  ],
  'REQ-2024-001': [
    { id: 'QUO-2024-007', supplierName: 'Steel Industries Ltd', supplierEmail: 'sales@steelindustries.com', supplierRating: 4.8, amount: 4800, unitPrice: 4.8, quantity: 1000, currency: 'USD', status: 'SENT_TO_BUYER', validUntil: '2024-02-15', createdAt: '2024-01-22', deliveryDays: 12, notes: 'Premium grade steel with full certification' },
  ],
};

export default function QuotationDetailPage() {
  const params = useParams();
  const requirementId = params.requirementId as string;
  
  const [requirement, setRequirement] = useState<Requirement | null>(null);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load mock data
    const req = MOCK_REQUIREMENTS[requirementId];
    const quotes = MOCK_QUOTATIONS[requirementId] || [];
    setRequirement(req || null);
    setQuotations(quotes);
    setLoading(false);
  }, [requirementId]);

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(amount);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  if (!requirement) {
    return (
      <div className="p-6 text-center">
        <p className="text-slate-400">Requirement not found</p>
        <Link href="/admin/quotations" className="text-blue-400 hover:underline mt-2 inline-block">Back to Quotations</Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/quotations" className="p-2 hover:bg-slate-700 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </Link>
          <div>
            <p className="text-xs font-mono text-slate-500">{requirement.id}</p>
            <h1 className="text-2xl font-bold text-white">{requirement.title}</h1>
            <p className="text-slate-400">{requirement.buyerCompany} • {requirement.category}</p>
          </div>
        </div>
        <Badge className="bg-slate-700 text-slate-200">{quotations.length} quotations</Badge>
      </div>

      {/* Requirement Details */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Package className="w-5 h-5" /> Requirement Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-slate-400">Buyer</p>
              <p className="text-white font-medium">{requirement.buyerName}</p>
              <p className="text-sm text-slate-400">{requirement.buyerEmail}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Quantity Required</p>
              <p className="text-white font-medium">{requirement.quantity.toLocaleString()} {requirement.unit}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Created</p>
              <p className="text-white font-medium">{new Date(requirement.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Status</p>
              <p className="text-white font-medium">{requirement.status.replace(/_/g, ' ')}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs text-slate-400">Description</p>
            <p className="text-slate-300 mt-1">{requirement.description}</p>
          </div>
        </CardContent>
      </Card>

      {/* Quotations */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="w-5 h-5" /> Quotations ({quotations.length})
            </span>
          </CardTitle>
          <CardDescription className="text-slate-400">
            Each quotation shows status only. Open a quote to review, approve, add margin, and take actions.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {quotations.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-slate-600" />
              <p className="text-slate-400">No quotations received yet</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700">
              {quotations.map((q) => {
                return (
                  <div key={q.id} className="p-6 hover:bg-slate-700/30 transition-colors">
                    <div className="flex items-center justify-between gap-6">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                            {q.supplierName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-white">{q.supplierName}</p>
                            <p className="text-xs text-slate-400">{q.supplierEmail}</p>
                          </div>
                          <div className="ml-2 flex items-center gap-1 text-yellow-400">
                            <Star className="h-4 w-4 fill-yellow-400" />
                            <span className="text-sm">{q.supplierRating}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                          <div className="rounded-lg bg-slate-900 p-3">
                            <p className="text-xs text-slate-400">Supplier Price</p>
                            <p className="text-white font-semibold">{formatCurrency(q.amount, q.currency)}</p>
                          </div>
                          <div className="rounded-lg bg-slate-900 p-3">
                            <p className="text-xs text-slate-400">Delivery</p>
                            <p className="text-white font-semibold">{q.deliveryDays} days</p>
                          </div>
                          <div className="rounded-lg bg-slate-900 p-3">
                            <p className="text-xs text-slate-400">Valid Until</p>
                            <p className="text-white font-semibold">{new Date(q.validUntil).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <Badge className={STATUS_CONFIG[q.status]?.color || 'bg-slate-500/20 text-slate-400'}>
                          {STATUS_CONFIG[q.status]?.label || q.status}
                        </Badge>
                        <Link href={`/admin/quotations/${requirementId}/${q.id}`}>
                          <Button variant="outline" className="border-slate-600 text-slate-200">
                            Open Quote
                            <ArrowUpRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
