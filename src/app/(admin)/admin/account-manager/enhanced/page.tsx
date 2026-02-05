'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ConsultationScheduler } from '@/components/admin/ConsultationScheduler';
import { DocumentUploadManager } from '@/components/admin/DocumentUploadManager';
import { BuyerCommunicationHistory } from '@/components/admin/BuyerCommunicationHistory';
import { RequirementStatusTimeline } from '@/components/admin/RequirementStatusTimeline';
import { Calendar, FileText, MessageSquare, Clock, Users, Package } from 'lucide-react';

interface Requirement {
  id: string;
  buyerId: string;
  companyName: string;
  contactName: string;
  productType: string;
  quantity: number;
  unit: string;
  status: string;
}

const mockRequirements: Requirement[] = [
  {
    id: 'REQ-2024-001',
    buyerId: 'buyer-001',
    companyName: 'TechCorp Industries',
    contactName: 'John Smith',
    productType: 'Industrial Sensors',
    quantity: 5000,
    unit: 'pieces',
    status: 'PENDING_VERIFICATION',
  },
  {
    id: 'REQ-2024-002',
    buyerId: 'buyer-002',
    companyName: 'Global Manufacturing Co.',
    contactName: 'Sarah Chen',
    productType: 'Steel Beams - Construction Grade',
    quantity: 100,
    unit: 'tons',
    status: 'IN_CONSULTATION',
  },
  {
    id: 'REQ-2024-003',
    buyerId: 'buyer-003',
    companyName: 'Premier Retail Ltd',
    contactName: 'Mike Johnson',
    productType: 'LED Display Panels',
    quantity: 200,
    unit: 'units',
    status: 'VERIFIED',
  },
];

const statusColors: Record<string, string> = {
  PENDING_VERIFICATION: 'bg-yellow-500/20 text-yellow-400',
  IN_CONSULTATION: 'bg-blue-500/20 text-blue-400',
  VERIFIED: 'bg-green-500/20 text-green-400',
  READY_FOR_MATCHING: 'bg-purple-500/20 text-purple-400',
};

export default function EnhancedAccountManagerDashboard() {
  const [selectedRequirement, setSelectedRequirement] = useState<Requirement | null>(null);
  const [activeTab, setActiveTab] = useState('scheduler');

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Enhanced Account Manager Dashboard</h1>
          <p className="text-slate-400">Phase A: Advanced buyer verification and communication tools</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4 bg-slate-800 border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {mockRequirements.filter(r => r.status === 'PENDING_VERIFICATION').length}
              </p>
              <p className="text-xs text-slate-400">Pending Verification</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-slate-800 border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {mockRequirements.filter(r => r.status === 'IN_CONSULTATION').length}
              </p>
              <p className="text-xs text-slate-400">In Consultation</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-slate-800 border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {mockRequirements.filter(r => r.status === 'VERIFIED').length}
              </p>
              <p className="text-xs text-slate-400">Verified</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-slate-800 border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{mockRequirements.length}</p>
              <p className="text-xs text-slate-400">Total Requirements</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Requirement Selection */}
      <Card className="p-4 bg-slate-800 border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Package className="w-5 h-5" />
          Buyer Requirements
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
              <div className="flex justify-between items-start mb-2">
                <p className="font-semibold text-white">{req.companyName}</p>
                <Badge className={statusColors[req.status] || 'bg-slate-500/20 text-slate-400'}>
                  {req.status.replace(/_/g, ' ')}
                </Badge>
              </div>
              <p className="text-sm text-slate-300">{req.contactName}</p>
              <p className="text-xs text-slate-400">{req.productType}</p>
              <p className="text-xs text-slate-500 mt-1">
                {req.quantity} {req.unit}
              </p>
            </button>
          ))}
        </div>
      </Card>

      {selectedRequirement && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-slate-800 border border-slate-700">
            <TabsTrigger value="scheduler" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Consultation Scheduler
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Document Verification
            </TabsTrigger>
            <TabsTrigger value="communication" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Communication History
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Status Timeline
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scheduler" className="mt-4">
            <Card className="p-6 bg-slate-800 border-slate-700">
              <ConsultationScheduler />
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="mt-4">
            <Card className="p-6 bg-slate-800 border-slate-700">
              <DocumentUploadManager 
                requirementId={selectedRequirement.id}
                buyerId={selectedRequirement.buyerId}
              />
            </Card>
          </TabsContent>

          <TabsContent value="communication" className="mt-4">
            <Card className="p-6 bg-slate-800 border-slate-700">
              <BuyerCommunicationHistory 
                buyerId={selectedRequirement.buyerId}
                requirementId={selectedRequirement.id}
              />
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="mt-4">
            <Card className="p-6 bg-slate-800 border-slate-700">
              <RequirementStatusTimeline requirementId={selectedRequirement.id} />
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {!selectedRequirement && (
        <Card className="p-8 text-center bg-slate-800 border-slate-700">
          <Users className="w-12 h-12 mx-auto mb-4 text-slate-400" />
          <p className="text-slate-400">Select a buyer requirement above to manage the verification workflow</p>
        </Card>
      )}
    </div>
  );
}
