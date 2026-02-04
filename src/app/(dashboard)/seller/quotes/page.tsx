'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  FileText, Clock, CheckCircle, XCircle, 
  Eye, DollarSign, Calendar, Building2, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Quote {
  id: string;
  requirementTitle: string;
  buyerCompany: string;
  submittedDate: string;
  amount: number;
  status: 'pending' | 'under_review' | 'accepted' | 'rejected';
  validUntil: string;
}

export default function SubmittedQuotesPage() {
  const [quotes] = useState<Quote[]>([
    {
      id: 'QT-001',
      requirementTitle: 'Industrial Pumps - High Capacity',
      buyerCompany: 'ChemProcess Industries',
      submittedDate: '2024-01-15',
      amount: 45000,
      status: 'under_review',
      validUntil: '2024-02-15',
    },
    {
      id: 'QT-002',
      requirementTitle: 'Precision Valves - Stainless Steel',
      buyerCompany: 'Industrial Solutions Ltd',
      submittedDate: '2024-01-12',
      amount: 28500,
      status: 'pending',
      validUntil: '2024-02-12',
    },
    {
      id: 'QT-003',
      requirementTitle: 'Hydraulic Cylinders - Custom',
      buyerCompany: 'Heavy Machinery Co.',
      submittedDate: '2024-01-08',
      amount: 67000,
      status: 'accepted',
      validUntil: '2024-02-08',
    },
    {
      id: 'QT-004',
      requirementTitle: 'Electric Motors - 50HP',
      buyerCompany: 'PowerTech Manufacturing',
      submittedDate: '2024-01-05',
      amount: 32000,
      status: 'rejected',
      validUntil: '2024-02-05',
    },
  ]);

  const getStatusBadge = (status: Quote['status']) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      under_review: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      accepted: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    const labels = {
      pending: 'Pending',
      under_review: 'Under Review',
      accepted: 'Accepted',
      rejected: 'Rejected',
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getStatusIcon = (status: Quote['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'under_review':
        return <Eye className="w-5 h-5 text-blue-500" />;
      case 'accepted':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const stats = {
    total: quotes.length,
    pending: quotes.filter(q => q.status === 'pending' || q.status === 'under_review').length,
    accepted: quotes.filter(q => q.status === 'accepted').length,
    totalValue: quotes.filter(q => q.status === 'accepted').reduce((sum, q) => sum + q.amount, 0),
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Submitted Quotes</h1>
          <p className="text-gray-500 mt-1">Track all your quotation submissions</p>
        </div>
        <Link href="/seller/rfq">
          <Button>
            <FileText className="w-4 h-4 mr-2" />
            New Invitations
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Quotes</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Accepted</p>
                <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Won Value</p>
                <p className="text-2xl font-bold text-blue-600">${stats.totalValue.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quotes List */}
      <Card>
        <CardHeader>
          <CardTitle>All Quotes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {quotes.map((quote) => (
              <div 
                key={quote.id}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {getStatusIcon(quote.status)}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{quote.requirementTitle}</p>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" />
                        {quote.buyerCompany}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {quote.submittedDate}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">${quote.amount.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Valid until {quote.validUntil}</p>
                  </div>
                  {getStatusBadge(quote.status)}
                  <Button variant="ghost" size="sm">
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
