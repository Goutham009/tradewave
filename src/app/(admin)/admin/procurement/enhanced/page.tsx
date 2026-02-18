'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { InternalSupplierSearchTool } from '@/components/admin/InternalSupplierSearchTool';
import { QuotationComparisonMatrix } from '@/components/admin/QuotationComparisonMatrix';
import { SupplierHistoricalPerformance } from '@/components/admin/SupplierHistoricalPerformance';
import { SupplierRecommendationNotes } from '@/components/admin/SupplierRecommendationNotes';
import { Search, TrendingUp, History, MessageSquare, Package } from 'lucide-react';

interface Requirement {
  id: string;
  buyerCompany: string;
  productType: string;
  quantity: number;
  unit: string;
  status: string;
}

const mockRequirements: Requirement[] = [
  {
    id: 'REQ-2024-001',
    buyerCompany: 'TechCorp Industries',
    productType: 'Industrial Sensors',
    quantity: 5000,
    unit: 'pieces',
    status: 'VERIFIED',
  },
  {
    id: 'REQ-2024-002',
    buyerCompany: 'Global Manufacturing Co.',
    productType: 'Steel Beams - Construction Grade',
    quantity: 100,
    unit: 'tons',
    status: 'QUOTATIONS_RECEIVED',
  },
  {
    id: 'REQ-2024-003',
    buyerCompany: 'Premier Retail Ltd',
    productType: 'LED Display Panels',
    quantity: 200,
    unit: 'units',
    status: 'QUOTATIONS_RECEIVED',
  },
];

export default function EnhancedProcurementDashboard() {
  const [selectedRequirement, setSelectedRequirement] = useState<Requirement | null>(null);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('search');

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Enhanced Procurement Dashboard</h1>
          <p className="text-slate-400">Phase A: Advanced supplier selection and quotation management</p>
        </div>
      </div>

      {/* Requirement Selection */}
      <Card className="p-4 bg-slate-800 border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Package className="w-5 h-5" />
          Active Requirements
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {mockRequirements.map((req) => (
            <button
              key={req.id}
              onClick={() => setSelectedRequirement(req)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                selectedRequirement?.id === req.id
                  ? 'border-teal-500 bg-teal-500/10'
                  : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
              }`}
            >
              <p className="font-semibold text-white">{req.id}</p>
              <p className="text-sm text-slate-300">{req.buyerCompany}</p>
              <p className="text-xs text-slate-400">{req.productType}</p>
              <p className="text-xs text-slate-500 mt-1">
                {req.quantity} {req.unit}
              </p>
              <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs ${
                req.status === 'VERIFIED' ? 'bg-blue-500/20 text-blue-400' :
                req.status === 'QUOTATIONS_RECEIVED' ? 'bg-green-500/20 text-green-400' :
                'bg-yellow-500/20 text-yellow-400'
              }`}>
                {req.status.replace(/_/g, ' ')}
              </span>
            </button>
          ))}
        </div>
      </Card>

      {selectedRequirement && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-slate-800 border border-slate-700">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Supplier Search
            </TabsTrigger>
            <TabsTrigger value="comparison" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Quotation Matrix
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              Supplier Performance
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Notes & Recommendations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="mt-4">
            <Card className="p-6 bg-slate-800 border-slate-700">
              <InternalSupplierSearchTool 
                requirementId={selectedRequirement.id}
                onSuppliersSelected={(ids) => {
                  if (ids.length > 0) setSelectedSupplierId(ids[0]);
                }}
              />
            </Card>
          </TabsContent>

          <TabsContent value="comparison" className="mt-4">
            <Card className="p-6 bg-slate-800 border-slate-700">
              <QuotationComparisonMatrix 
                requirementId={selectedRequirement.id}
                onSendToAdmin={(quotationIds) => {
                  console.log('Sending quotations to admin for approval:', quotationIds);
                }}
              />
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="mt-4">
            <Card className="p-6 bg-slate-800 border-slate-700">
              {selectedSupplierId ? (
                <SupplierHistoricalPerformance supplierId={selectedSupplierId} />
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select a supplier from the search results to view their historical performance</p>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="notes" className="mt-4">
            <Card className="p-6 bg-slate-800 border-slate-700">
              {selectedSupplierId ? (
                <SupplierRecommendationNotes 
                  supplierId={selectedSupplierId}
                  requirementId={selectedRequirement.id}
                />
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select a supplier from the search results to view and add notes</p>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {!selectedRequirement && (
        <Card className="p-8 text-center bg-slate-800 border-slate-700">
          <Package className="w-12 h-12 mx-auto mb-4 text-slate-400" />
          <p className="text-slate-400">Select a requirement above to start the procurement workflow</p>
        </Card>
      )}
    </div>
  );
}
