'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Search,
  CheckCircle,
  Eye,
  Building2,
  Clock,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';

interface VerificationItem {
  id: string;
  type: 'kyb' | 'requirement';
  companyName: string;
  submittedAt: string;
  status: string;
  priority: 'high' | 'medium' | 'low';
  details: {
    contactPerson?: string;
    email?: string;
    phone?: string;
    documents?: string[];
    requirementTitle?: string;
    category?: string;
    quantity?: number;
    budget?: number;
  };
}

const MOCK_VERIFICATIONS: VerificationItem[] = [
  {
    id: 'VER-001',
    type: 'kyb',
    companyName: 'Tech Solutions Inc',
    submittedAt: '2024-01-20',
    status: 'pending',
    priority: 'high',
    details: {
      contactPerson: 'John Smith',
      email: 'john@techsolutions.com',
      phone: '+1 234 567 8900',
      documents: ['Business License', 'Tax Certificate', 'Bank Statement'],
    },
  },
  {
    id: 'VER-002',
    type: 'requirement',
    companyName: 'Acme Corporation',
    submittedAt: '2024-01-19',
    status: 'pending',
    priority: 'medium',
    details: {
      requirementTitle: 'Steel Components for Manufacturing',
      category: 'Raw Materials',
      quantity: 5000,
      budget: 25000,
    },
  },
  {
    id: 'VER-003',
    type: 'kyb',
    companyName: 'Global Traders LLC',
    submittedAt: '2024-01-18',
    status: 'pending',
    priority: 'low',
    details: {
      contactPerson: 'Sarah Johnson',
      email: 'sarah@globaltraders.com',
      phone: '+1 345 678 9012',
      documents: ['Business License', 'Tax Certificate'],
    },
  },
  {
    id: 'VER-004',
    type: 'requirement',
    companyName: 'Fashion Hub Ltd',
    submittedAt: '2024-01-17',
    status: 'pending',
    priority: 'high',
    details: {
      requirementTitle: 'Cotton Fabric - Premium Quality',
      category: 'Textiles',
      quantity: 10000,
      budget: 45000,
    },
  },
];

const PRIORITY_CONFIG = {
  high: { label: 'High', className: 'bg-red-500/20 text-red-400' },
  medium: { label: 'Medium', className: 'bg-yellow-500/20 text-yellow-400' },
  low: { label: 'Low', className: 'bg-green-500/20 text-green-400' },
};

export default function VerificationQueuePage() {
  const [verifications, setVerifications] = useState<VerificationItem[]>(MOCK_VERIFICATIONS);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<VerificationItem | null>(null);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const filteredVerifications = verifications.filter((item) => {
    const matchesSearch = item.companyName.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleRequestDocs = (item: VerificationItem) => {
    setSelectedItem(item);
    setNotes('');
    setShowRequestDialog(true);
  };

  const handleSendRequest = async () => {
    if (!selectedItem) return;
    setProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setProcessing(false);
    setSelectedItem(null);
    setShowRequestDialog(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Verification Queue</h1>
        <p className="text-slate-400">Review and verify KYB documents and buyer requirements</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by company name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-slate-900 border-slate-700"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={typeFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setTypeFilter('all')}
            className="border-slate-700"
          >
            All
          </Button>
          <Button
            variant={typeFilter === 'kyb' ? 'default' : 'outline'}
            onClick={() => setTypeFilter('kyb')}
            className="border-slate-700"
          >
            KYB
          </Button>
          <Button
            variant={typeFilter === 'requirement' ? 'default' : 'outline'}
            onClick={() => setTypeFilter('requirement')}
            className="border-slate-700"
          >
            Requirements
          </Button>
        </div>
      </div>

      {/* Verification Cards */}
      <div className="grid gap-4">
        {filteredVerifications.map((item) => (
          <Card key={item.id} className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                    item.type === 'kyb' ? 'bg-blue-500/20' : 'bg-purple-500/20'
                  }`}>
                    {item.type === 'kyb' ? (
                      <Building2 className="h-6 w-6 text-blue-500" />
                    ) : (
                      <FileText className="h-6 w-6 text-purple-500" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white">{item.companyName}</h3>
                      <Badge variant="outline" className="text-xs">
                        {item.type === 'kyb' ? 'KYB Verification' : 'Requirement'}
                      </Badge>
                      <Badge className={PRIORITY_CONFIG[item.priority].className}>
                        {PRIORITY_CONFIG[item.priority].label}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-400 mt-1">
                      {item.type === 'kyb' 
                        ? `Contact: ${item.details.contactPerson} • ${item.details.documents?.length} documents`
                        : `${item.details.requirementTitle} • ${item.details.category}`
                      }
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                      <Clock className="h-3 w-3" />
                      Submitted {item.submittedAt}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/internal/verification/${item.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-slate-700"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRequestDocs(item)}
                    className="border-yellow-600 text-yellow-400 hover:bg-yellow-500/10"
                  >
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Request Docs
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredVerifications.length === 0 && (
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="py-12 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white">All caught up!</h3>
              <p className="text-slate-400">No pending verifications at the moment.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Action Dialog */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="bg-slate-900 border-slate-800 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">
              Request Additional Documents
            </DialogTitle>
            <DialogDescription>
              {selectedItem?.companyName} - Request missing KYB documents on behalf of admin
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedItem?.type === 'kyb' ? (
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-slate-400">Contact Person</label>
                  <p className="text-white">{selectedItem.details.contactPerson}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Email</label>
                  <p className="text-white">{selectedItem.details.email}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Phone</label>
                  <p className="text-white">{selectedItem.details.phone}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Documents Submitted</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedItem.details.documents?.map((doc) => (
                      <Badge key={doc} variant="outline">{doc}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-slate-400">Requirement</label>
                  <p className="text-white">{selectedItem?.details.requirementTitle}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Category</label>
                  <p className="text-white">{selectedItem?.details.category}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-400">Quantity</label>
                    <p className="text-white">{selectedItem?.details.quantity?.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">Budget</label>
                    <p className="text-white">${selectedItem?.details.budget?.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="text-sm text-slate-400">Request Notes</label>
              <Textarea
                placeholder="List the specific documents needed and any clarification..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 bg-slate-800 border-slate-700"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setSelectedItem(null); setShowRequestDialog(false); }} className="border-slate-700">
              Cancel
            </Button>
            <Button
              onClick={handleSendRequest}
              disabled={processing || !notes.trim()}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              {processing ? 'Sending...' : 'Send Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
