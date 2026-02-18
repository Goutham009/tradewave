'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Package,
  User,
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  FileText,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

interface Requirement {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  quantity: number;
  unit: string;
  budgetMin: number | null;
  budgetMax: number | null;
  currency: string;
  deliveryLocation: string;
  deliveryDeadline: string;
  priority: string;
  amVerified: boolean;
  adminReviewed: boolean;
  buyer: { id: string; name: string; email: string; companyName: string };
  accountManager?: { id: string; name: string };
  suppliersContacted: number;
  quotesReceived: number;
  createdAt: string;
  specifications?: string;
  additionalNotes?: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING_AM_VERIFICATION: { label: 'Pending AM', color: 'bg-slate-500/20 text-slate-400' },
  PENDING_ADMIN_REVIEW: { label: 'Pending Review', color: 'bg-blue-500/20 text-blue-400' },
  VERIFIED: { label: 'Verified', color: 'bg-purple-500/20 text-purple-400' },
  QUOTES_PENDING: { label: 'Quotes Pending', color: 'bg-yellow-500/20 text-yellow-400' },
  QUOTATIONS_READY: { label: 'Quotes Ready', color: 'bg-cyan-500/20 text-cyan-400' },
  ACCEPTED: { label: 'Accepted', color: 'bg-green-500/20 text-green-400' },
  COMPLETED: { label: 'Completed', color: 'bg-green-500/20 text-green-400' },
};

const MOCK_REQUIREMENT: Requirement = {
  id: 'REQ-2024-001',
  title: 'Steel Coils - Grade A',
  description: 'Hot rolled steel coils for automotive manufacturing. Must meet ASTM A1011 specifications. Surface finish should be free of defects and suitable for painting.',
  category: 'Steel',
  status: 'PENDING_ADMIN_REVIEW',
  quantity: 500,
  unit: 'tons',
  budgetMin: 400,
  budgetMax: 450,
  currency: 'USD',
  deliveryLocation: 'Detroit, Michigan, USA',
  deliveryDeadline: '2024-03-15',
  priority: 'HIGH',
  amVerified: true,
  adminReviewed: false,
  buyer: { id: 'b1', name: 'John Smith', email: 'john@acmecorp.com', companyName: 'Acme Corporation' },
  accountManager: { id: 'am1', name: 'Sarah Johnson' },
  suppliersContacted: 0,
  quotesReceived: 0,
  createdAt: '2024-02-15T10:30:00Z',
  specifications: 'Thickness: 2.0-3.0mm\nWidth: 1200-1500mm\nCoil weight: 15-25 tons\nStandard: ASTM A1011',
  additionalNotes: 'Prefer suppliers with ISO 9001 certification. Previous supplier was Steel Industries Ltd.',
};

export default function RequirementDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [requirement, setRequirement] = useState<Requirement | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'send'>('approve');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchRequirement();
  }, [params.id]);

  const fetchRequirement = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/requirements/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setRequirement(data.data);
      } else {
        throw new Error('Not found');
      }
    } catch (error) {
      // Use mock data
      setRequirement({ ...MOCK_REQUIREMENT, id: params.id as string });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (type: 'approve' | 'reject' | 'send') => {
    setActionType(type);
    setNotes('');
    setShowActionModal(true);
  };

  const handleSubmitAction = async () => {
    if (!requirement) return;
    
    setProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (actionType === 'approve') {
      setRequirement(prev => prev ? { ...prev, status: 'VERIFIED', adminReviewed: true } : null);
    } else if (actionType === 'reject') {
      setRequirement(prev => prev ? { ...prev, status: 'REJECTED' } : null);
    } else if (actionType === 'send') {
      setRequirement(prev => prev ? { ...prev, status: 'QUOTES_PENDING' } : null);
    }
    
    setProcessing(false);
    setShowActionModal(false);
  };

  const formatCurrency = (amount: number | null, currency: string = 'USD') => {
    if (amount === null) return '-';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!requirement) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
        <p className="text-white text-lg">Requirement not found</p>
        <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()} className="text-slate-400">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">{requirement.title}</h1>
            <p className="text-slate-400">{requirement.id}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {requirement.status === 'PENDING_ADMIN_REVIEW' && (
            <>
              <Button onClick={() => handleAction('reject')} variant="outline" className="border-red-600 text-red-400">
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button onClick={() => handleAction('approve')} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve & Send to Procurement
              </Button>
            </>
          )}
          {requirement.status === 'VERIFIED' && (
            <Button onClick={() => handleAction('send')} className="bg-purple-600 hover:bg-purple-700">
              <Send className="h-4 w-4 mr-2" />
              Send to Suppliers
            </Button>
          )}
          {requirement.status === 'QUOTATIONS_READY' && (
            <Button onClick={() => router.push(`/admin/quotations?requirementId=${requirement.id}`)} className="bg-cyan-600 hover:bg-cyan-700">
              <FileText className="h-4 w-4 mr-2" />
              Review Quotes
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Package className="h-5 w-5" />
                Requirement Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-slate-400 mb-1">Description</p>
                <p className="text-white">{requirement.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Category</p>
                  <p className="text-white">{requirement.category}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Priority</p>
                  <Badge className={
                    requirement.priority === 'URGENT' ? 'bg-red-500/20 text-red-400' :
                    requirement.priority === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                    requirement.priority === 'MEDIUM' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-slate-500/20 text-slate-400'
                  }>
                    {requirement.priority}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Quantity</p>
                  <p className="text-white">{requirement.quantity} {requirement.unit}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Budget Range</p>
                  <p className="text-white">
                    {formatCurrency(requirement.budgetMin, requirement.currency)} - {formatCurrency(requirement.budgetMax, requirement.currency)}
                  </p>
                </div>
              </div>

              {requirement.specifications && (
                <div>
                  <p className="text-xs text-slate-400 mb-1">Specifications</p>
                  <pre className="text-white bg-slate-900 p-3 rounded-lg text-sm whitespace-pre-wrap">{requirement.specifications}</pre>
                </div>
              )}

              {requirement.additionalNotes && (
                <div>
                  <p className="text-xs text-slate-400 mb-1">Additional Notes</p>
                  <p className="text-slate-300 bg-slate-900 p-3 rounded-lg">{requirement.additionalNotes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Delivery Info */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Delivery Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Location</p>
                  <p className="text-white">{requirement.deliveryLocation}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Deadline</p>
                  <p className="text-white">{new Date(requirement.deliveryDeadline).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-sm">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={STATUS_CONFIG[requirement.status]?.color || 'bg-slate-500/20 text-slate-400'}>
                {STATUS_CONFIG[requirement.status]?.label || requirement.status}
              </Badge>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">AM Verified</span>
                  <span className={requirement.amVerified ? 'text-green-400' : 'text-slate-500'}>
                    {requirement.amVerified ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Admin Reviewed</span>
                  <span className={requirement.adminReviewed ? 'text-green-400' : 'text-slate-500'}>
                    {requirement.adminReviewed ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Suppliers Contacted</span>
                  <span className="text-white">{requirement.suppliersContacted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Quotes Received</span>
                  <span className="text-white">{requirement.quotesReceived}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Buyer Info */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <User className="h-4 w-4" />
                Buyer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white font-medium">{requirement.buyer.name}</p>
              <p className="text-slate-400 text-sm">{requirement.buyer.companyName}</p>
              <p className="text-slate-500 text-sm">{requirement.buyer.email}</p>
            </CardContent>
          </Card>

          {/* Account Manager */}
          {requirement.accountManager && (
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Account Manager
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white font-medium">{requirement.accountManager.name}</p>
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-400">Created</p>
              <p className="text-white text-sm">{new Date(requirement.createdAt).toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Modal */}
      <Dialog open={showActionModal} onOpenChange={setShowActionModal}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' && 'Approve Requirement'}
              {actionType === 'reject' && 'Reject Requirement'}
              {actionType === 'send' && 'Send to Suppliers'}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {actionType === 'approve' && 'This will approve the requirement and send it to the procurement team for supplier matching.'}
              {actionType === 'reject' && 'This will reject the requirement and notify the buyer.'}
              {actionType === 'send' && 'This will send the requirement to matched suppliers for quotations.'}
            </DialogDescription>
          </DialogHeader>

          <div>
            <p className="text-xs text-slate-400 mb-1">Notes (optional)</p>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes..."
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowActionModal(false)} className="border-slate-600 text-slate-300">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitAction}
              disabled={processing}
              className={
                actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                actionType === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                'bg-purple-600 hover:bg-purple-700'
              }
            >
              {processing ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing...</>
              ) : (
                actionType === 'approve' ? 'Approve' :
                actionType === 'reject' ? 'Reject' : 'Send'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
