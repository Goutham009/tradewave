'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  FileCheck, DollarSign, Calendar, Building2, 
  TrendingUp, Clock, CheckCircle, ArrowRight, Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Contract {
  id: string;
  title: string;
  buyerCompany: string;
  awardedDate: string;
  value: number;
  status: 'active' | 'completed' | 'in_progress';
  deliveryDate: string;
  progress: number;
}

export default function WonContractsPage() {
  const [contracts] = useState<Contract[]>([
    {
      id: 'CT-001',
      title: 'Hydraulic Cylinders - Custom',
      buyerCompany: 'Heavy Machinery Co.',
      awardedDate: '2024-01-10',
      value: 67000,
      status: 'in_progress',
      deliveryDate: '2024-03-15',
      progress: 45,
    },
    {
      id: 'CT-002',
      title: 'Industrial Bearings - Bulk Order',
      buyerCompany: 'AutoParts Manufacturing',
      awardedDate: '2024-01-05',
      value: 34500,
      status: 'active',
      deliveryDate: '2024-02-28',
      progress: 70,
    },
    {
      id: 'CT-003',
      title: 'Precision Gears - Grade A',
      buyerCompany: 'Machinery Solutions Inc.',
      awardedDate: '2023-12-20',
      value: 52000,
      status: 'completed',
      deliveryDate: '2024-01-15',
      progress: 100,
    },
  ]);

  const getStatusBadge = (status: Contract['status']) => {
    const styles = {
      active: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      in_progress: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    };
    const labels = {
      active: 'Active',
      in_progress: 'In Progress',
      completed: 'Completed',
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const stats = {
    total: contracts.length,
    active: contracts.filter(c => c.status === 'active' || c.status === 'in_progress').length,
    completed: contracts.filter(c => c.status === 'completed').length,
    totalValue: contracts.reduce((sum, c) => sum + c.value, 0),
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Won Contracts</h1>
          <p className="text-gray-500 mt-1">Manage your awarded contracts and track deliveries</p>
        </div>
        <Link href="/seller/quotes">
          <Button variant="outline">
            <FileCheck className="w-4 h-4 mr-2" />
            View All Quotes
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Contracts</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileCheck className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active</p>
                <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Value</p>
                <p className="text-2xl font-bold text-emerald-600">${stats.totalValue.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contracts List */}
      <Card>
        <CardHeader>
          <CardTitle>All Contracts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {contracts.map((contract) => (
              <div 
                key={contract.id}
                className="p-4 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                      <FileCheck className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{contract.title}</p>
                      <div className="flex items-center gap-3 mt-0.5 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5" />
                          {contract.buyerCompany}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Awarded: {contract.awardedDate}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">${contract.value.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Due: {contract.deliveryDate}</p>
                    </div>
                    {getStatusBadge(contract.status)}
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-500">Fulfillment Progress</span>
                    <span className="font-medium">{contract.progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${contract.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 mt-4">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-1" />
                    Contract PDF
                  </Button>
                  <Button size="sm">
                    View Details
                    <ArrowRight className="w-4 h-4 ml-1" />
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
