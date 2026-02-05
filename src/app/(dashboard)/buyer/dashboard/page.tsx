'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BuyerStatusUpdates } from '@/components/dashboard/BuyerStatusUpdates';
import { QuotationAnalytics } from '@/components/dashboard/QuotationAnalytics';
import { RequestModificationModal } from '@/components/dashboard/RequestModificationModal';
import { NotificationService } from '@/lib/notifications';
import { Package, FileText, Clock, CheckCircle, Bell, BarChart3, Eye, Edit3 } from 'lucide-react';

const mockRequirements = [
  {
    id: 'REQ-2024-001',
    productType: 'Industrial Sensors',
    quantity: 5000,
    unit: 'pieces',
    status: 'QUOTATIONS_READY',
    submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    quotations: [
      { id: 'q1', totalPrice: 45000, unitPrice: 9, deliveryTime: 14, paymentTerms: '30% Advance, 70% on Delivery',
        supplier: { id: 's1', companyName: 'SensorTech Solutions', rating: 4.9, complianceTier: 'TRUSTED', totalTransactions: 342 }},
      { id: 'q2', totalPrice: 42500, unitPrice: 8.5, deliveryTime: 21, paymentTerms: '50% Advance, 50% on Delivery',
        supplier: { id: 's2', companyName: 'Precision Components', rating: 4.7, complianceTier: 'VERIFIED', totalTransactions: 189 }},
      { id: 'q3', totalPrice: 48000, unitPrice: 9.6, deliveryTime: 10, paymentTerms: '100% Advance',
        supplier: { id: 's3', companyName: 'QuickShip Electronics', rating: 4.5, complianceTier: 'STANDARD', totalTransactions: 87 }},
    ],
  },
  { id: 'REQ-2024-002', productType: 'Steel Beams', quantity: 100, unit: 'tons', status: 'IN_PROGRESS',
    submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), quotations: [] },
  { id: 'REQ-2024-003', productType: 'LED Display Panels', quantity: 200, unit: 'units', status: 'PENDING_VERIFICATION',
    submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), quotations: [] },
];

export default function BuyerDashboardPage() {
  const [requirements] = useState(mockRequirements);
  const [selectedReq, setSelectedReq] = useState<typeof mockRequirements[0] | null>(null);
  const [modModal, setModModal] = useState<{ open: boolean; quotation: any }>({ open: false, quotation: null });

  useEffect(() => { NotificationService.requestPermission(); }, []);

  const stats = {
    total: requirements.length,
    ready: requirements.filter(r => r.status === 'QUOTATIONS_READY').length,
    progress: requirements.filter(r => r.status === 'IN_PROGRESS').length,
    pending: requirements.filter(r => r.status === 'PENDING_VERIFICATION').length,
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Buyer Dashboard</h1>
          <p className="text-neutral-600">Manage requirements and quotations</p>
        </div>
        <Button><Package className="w-4 h-4 mr-2" />New Requirement</Button>
      </div>

      <BuyerStatusUpdates />

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, icon: Package, color: 'blue' },
          { label: 'Quotations Ready', value: stats.ready, icon: CheckCircle, color: 'green' },
          { label: 'In Progress', value: stats.progress, icon: Clock, color: 'amber' },
          { label: 'Pending', value: stats.pending, icon: Bell, color: 'purple' },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 bg-${s.color}-100 rounded-lg flex items-center justify-center`}>
                <s.icon className={`w-5 h-5 text-${s.color}-600`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-neutral-600">{s.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><FileText className="w-4 h-4" />Requirements</h3>
          <div className="space-y-3">
            {requirements.map((req) => (
              <button key={req.id} onClick={() => setSelectedReq(req)}
                className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                  selectedReq?.id === req.id ? 'border-teal-500 bg-teal-50' : 'border-neutral-200 hover:border-neutral-300'}`}>
                <div className="flex justify-between items-start mb-1">
                  <p className="font-medium text-sm">{req.productType}</p>
                  <Badge variant={req.status === 'QUOTATIONS_READY' ? 'success' : req.status === 'IN_PROGRESS' ? 'warning' : 'info'}>
                    {req.status.replace(/_/g, ' ')}
                  </Badge>
                </div>
                <p className="text-xs text-neutral-600">{req.quantity.toLocaleString()} {req.unit}</p>
                {req.quotations.length > 0 && <p className="text-xs text-teal-600 mt-1 font-medium">{req.quotations.length} quotations</p>}
              </button>
            ))}
          </div>
        </Card>

        <Card className="col-span-2 p-4">
          {selectedReq ? (
            <Tabs defaultValue="quotations">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-semibold">{selectedReq.productType}</h3>
                  <p className="text-sm text-neutral-600">{selectedReq.quantity.toLocaleString()} {selectedReq.unit}</p>
                </div>
              </div>
              <TabsList>
                <TabsTrigger value="quotations"><FileText className="w-4 h-4 mr-1" />Quotations</TabsTrigger>
                <TabsTrigger value="analytics"><BarChart3 className="w-4 h-4 mr-1" />Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="quotations" className="mt-4 space-y-3">
                {selectedReq.quotations.length > 0 ? selectedReq.quotations.map((q, i) => (
                  <div key={q.id} className={`p-4 rounded-lg border ${i === 0 ? 'border-teal-300 bg-teal-50/50' : 'border-neutral-200'}`}>
                    <div className="flex justify-between mb-3">
                      <div>
                        <p className="font-semibold">{q.supplier.companyName}</p>
                        <Badge variant={q.supplier.complianceTier === 'TRUSTED' ? 'success' : 'info'}>{q.supplier.complianceTier}</Badge>
                        <span className="text-xs ml-2">⭐ {q.supplier.rating}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-teal-600">${q.totalPrice.toLocaleString()}</p>
                        <p className="text-xs text-neutral-600">{q.deliveryTime} days delivery</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">Accept</Button>
                      <Button size="sm" variant="outline" onClick={() => setModModal({ open: true, quotation: q })}>
                        <Edit3 className="w-4 h-4 mr-1" />Modify
                      </Button>
                    </div>
                  </div>
                )) : <p className="text-center py-8 text-neutral-500">No quotations yet</p>}
              </TabsContent>

              <TabsContent value="analytics" className="mt-4">
                <QuotationAnalytics requirement={selectedReq} />
              </TabsContent>
            </Tabs>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-neutral-500">
              <Eye className="w-12 h-12 mb-4 opacity-30" />
              <p>Select a requirement to view details</p>
            </div>
          )}
        </Card>
      </div>

      {modModal.open && modModal.quotation && (
        <RequestModificationModal
          quotation={modModal.quotation}
          onClose={() => setModModal({ open: false, quotation: null })}
          onSubmit={() => setModModal({ open: false, quotation: null })}
        />
      )}
    </div>
  );
}
