'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QuotationTemplates } from '@/components/dashboard/QuotationTemplates';
import { QuotationForm } from '@/components/dashboard/QuotationForm';
import { SupplierHistoricalData } from '@/components/dashboard/SupplierHistoricalData';
import { SupplierPerformanceMetrics } from '@/components/dashboard/SupplierPerformanceMetrics';
import { FileText, Clock, Send, BarChart3, History, Zap } from 'lucide-react';

const mockInvitations = [
  {
    id: 'inv-001', requirementId: 'REQ-2024-001', status: 'PENDING',
    expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    requirement: { productType: 'Industrial Sensors', quantity: 5000, unit: 'pieces', companyName: 'TechCorp Industries', additionalNotes: 'ISO 9001 certified preferred' },
  },
  {
    id: 'inv-002', requirementId: 'REQ-2024-002', status: 'PENDING',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    requirement: { productType: 'LED Display Panels', quantity: 200, unit: 'units', companyName: 'Premier Retail Ltd', additionalNotes: '55-inch commercial grade' },
  },
];

export default function SupplierDashboardPage() {
  const [invitations] = useState(mockInvitations);
  const [selectedInvitation, setSelectedInvitation] = useState<typeof mockInvitations[0] | null>(null);
  const [activeTab, setActiveTab] = useState('invitations');

  const getTimeRemaining = (expiresAt: string) => {
    const hours = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60)));
    return hours < 24 ? `${hours}h remaining` : `${Math.floor(hours / 24)}d remaining`;
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Supplier Dashboard</h1>
          <p className="text-neutral-600">Manage invitations and submit quotations</p>
        </div>
      </div>

      <SupplierPerformanceMetrics />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="invitations" className="flex items-center gap-1">
            <Zap className="w-4 h-4" />Active Invitations ({invitations.length})
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-1">
            <FileText className="w-4 h-4" />Templates
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-1">
            <History className="w-4 h-4" />History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="invitations" className="mt-4">
          <div className="grid grid-cols-3 gap-6">
            <Card className="p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Send className="w-4 h-4" />Pending Invitations
              </h3>
              <div className="space-y-3">
                {invitations.map((inv) => (
                  <button key={inv.id} onClick={() => setSelectedInvitation(inv)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      selectedInvitation?.id === inv.id ? 'border-teal-500 bg-teal-50' : 'border-neutral-200 hover:border-neutral-300'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium text-sm">{inv.requirement.productType}</p>
                      <Badge variant="warning">{getTimeRemaining(inv.expiresAt)}</Badge>
                    </div>
                    <p className="text-xs text-neutral-600">{inv.requirement.companyName}</p>
                    <p className="text-xs text-neutral-500">{inv.requirement.quantity.toLocaleString()} {inv.requirement.unit}</p>
                  </button>
                ))}
                {invitations.length === 0 && (
                  <p className="text-center py-8 text-neutral-500">No pending invitations</p>
                )}
              </div>
            </Card>

            <Card className="col-span-2 p-4">
              {selectedInvitation ? (
                <QuotationForm 
                  invitation={selectedInvitation} 
                  onSubmitSuccess={() => setSelectedInvitation(null)} 
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-neutral-500">
                  <FileText className="w-12 h-12 mb-4 opacity-30" />
                  <p>Select an invitation to submit a quotation</p>
                </div>
              )}
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="mt-4">
          <QuotationTemplates onSelect={(template) => {
            console.log('Template selected:', template);
            alert(`Template "${template.name}" selected. Switch to Invitations tab to use it.`);
          }} />
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <SupplierHistoricalData />
        </TabsContent>
      </Tabs>
    </div>
  );
}
