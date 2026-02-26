'use client';

import { useState } from 'react';
import { 
  Users, Phone, Mail, Clock, CheckCircle, AlertCircle, 
  Calendar, FileText, MessageSquare, TrendingUp, Filter, Eye,
  RotateCcw, UserCheck, Settings, BarChart3, AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface Requirement {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  productType: string;
  quantity: number;
  unit: string;
  status: 'PENDING_VERIFICATION' | 'IN_CONSULTATION' | 'VERIFIED' | 'READY_FOR_MATCHING';
  urgencyScore: number;
  submittedAt: string;
  lastContactAt?: string;
  assignedAM?: string;
}

const mockRequirements: Requirement[] = [
  {
    id: '1',
    companyName: 'TechCorp Industries',
    contactName: 'John Smith',
    contactEmail: 'john@techcorp.com',
    contactPhone: '+1 555-0123',
    productType: 'Industrial Sensors',
    quantity: 5000,
    unit: 'pieces',
    status: 'PENDING_VERIFICATION',
    urgencyScore: 85,
    submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    assignedAM: 'Sarah Johnson',
  },
  {
    id: '2',
    companyName: 'Global Manufacturing Co.',
    contactName: 'Sarah Chen',
    contactEmail: 'sarah@globalmanuf.com',
    contactPhone: '+1 555-0456',
    productType: 'Steel Beams - Construction Grade',
    quantity: 100,
    unit: 'tons',
    status: 'IN_CONSULTATION',
    urgencyScore: 65,
    submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    lastContactAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    assignedAM: 'Michael Chen',
  },
  {
    id: '3',
    companyName: 'Premier Retail Ltd',
    contactName: 'Mike Johnson',
    contactEmail: 'mike@premierretail.com',
    contactPhone: '+1 555-0789',
    productType: 'LED Display Panels',
    quantity: 200,
    unit: 'units',
    status: 'VERIFIED',
    urgencyScore: 45,
    submittedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    lastContactAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    assignedAM: 'David Park',
  },
  {
    id: '4',
    companyName: 'AutoParts Direct',
    contactName: 'Emily Brown',
    contactEmail: 'emily@autoparts.com',
    contactPhone: '+1 555-0321',
    productType: 'Brake Components',
    quantity: 10000,
    unit: 'pieces',
    status: 'PENDING_VERIFICATION',
    urgencyScore: 90,
    submittedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    assignedAM: 'Lisa Wong',
  },
];

const accountManagers = [
  { id: 'am1', name: 'Sarah Johnson', pendingCount: 3, activeClients: 45 },
  { id: 'am2', name: 'Michael Chen', pendingCount: 5, activeClients: 42 },
  { id: 'am3', name: 'David Park', pendingCount: 2, activeClients: 38 },
  { id: 'am4', name: 'Lisa Wong', pendingCount: 4, activeClients: 35 },
];

const statusColors = {
  PENDING_VERIFICATION: 'bg-yellow-100 text-yellow-700',
  IN_CONSULTATION: 'bg-blue-100 text-blue-700',
  VERIFIED: 'bg-green-100 text-green-700',
  READY_FOR_MATCHING: 'bg-purple-100 text-purple-700',
};

const statusLabels = {
  PENDING_VERIFICATION: 'Pending Verification',
  IN_CONSULTATION: 'In Consultation',
  VERIFIED: 'Verified',
  READY_FOR_MATCHING: 'Ready for Matching',
};

export default function AccountManagerDashboard() {
  const [requirements, setRequirements] = useState<Requirement[]>(mockRequirements);
  const [selectedReq, setSelectedReq] = useState<Requirement | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [selectedAM, setSelectedAM] = useState<string>('');

  const filteredRequirements = filter === 'all' 
    ? requirements 
    : requirements.filter(r => r.status === filter);

  const stats = {
    pending: requirements.filter(r => r.status === 'PENDING_VERIFICATION').length,
    inConsultation: requirements.filter(r => r.status === 'IN_CONSULTATION').length,
    verified: requirements.filter(r => r.status === 'VERIFIED').length,
    total: requirements.length,
  };

  const updateStatus = (id: string, newStatus: Requirement['status']) => {
    setRequirements(prev => 
      prev.map(r => r.id === id ? { ...r, status: newStatus } : r)
    );
    if (selectedReq?.id === id) {
      setSelectedReq(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const handleReassign = () => {
    if (selectedReq && selectedAM) {
      setRequirements(prev =>
        prev.map(r => r.id === selectedReq.id ? { ...r, assignedAM: selectedAM } : r)
      );
      setSelectedReq(prev => prev ? { ...prev, assignedAM: selectedAM } : null);
      setShowReassignModal(false);
      setSelectedAM('');
    }
  };

  const handleAdminOverride = (newStatus: Requirement['status']) => {
    if (selectedReq) {
      updateStatus(selectedReq.id, newStatus);
      setShowOverrideModal(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">AM Verification Queue - Admin Overview</h1>
          <p className="text-slate-400 mt-1">Monitor and override AM verification workflow</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-slate-600 text-slate-300" onClick={() => window.location.href = '/admin/account-managers'}>
            <Users className="w-4 h-4 mr-2" />
            View All AMs
          </Button>
          <Button variant="outline" className="border-slate-600 text-slate-300" onClick={() => window.location.href = '/admin/account-managers/analytics'}>
            <BarChart3 className="w-4 h-4 mr-2" />
            AM Analytics
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.pending}</p>
              <p className="text-sm text-slate-400">Pending Verification</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Phone className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.inConsultation}</p>
              <p className="text-sm text-slate-400">In Consultation</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.verified}</p>
              <p className="text-sm text-slate-400">Verified</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-sm text-slate-400">Total Assigned</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Requirements List */}
        <div className="lg:col-span-2 bg-slate-800 rounded-xl border border-slate-700">
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Assigned Requirements</h2>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
            >
              <option value="all">All Status</option>
              <option value="PENDING_VERIFICATION">Pending Verification</option>
              <option value="IN_CONSULTATION">In Consultation</option>
              <option value="VERIFIED">Verified</option>
            </select>
          </div>
          <div className="divide-y divide-slate-700">
            {filteredRequirements.map((req) => (
              <div
                key={req.id}
                onClick={() => setSelectedReq(req)}
                className={`p-4 cursor-pointer hover:bg-slate-700/50 transition-colors ${
                  selectedReq?.id === req.id ? 'bg-slate-700/50' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-white">{req.companyName}</h3>
                      {req.urgencyScore >= 70 && (
                        <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">
                          High Priority
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400">{req.productType}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {req.quantity.toLocaleString()} {req.unit} • Submitted {new Date(req.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[req.status]}`}>
                    {statusLabels[req.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Details Panel */}
        <div className="bg-slate-800 rounded-xl border border-slate-700">
          <div className="p-4 border-b border-slate-700">
            <h2 className="text-lg font-semibold text-white">Requirement Details</h2>
          </div>
          {selectedReq ? (
            <div className="p-4 space-y-4">
              <div>
                <p className="text-xs text-slate-500 uppercase mb-1">Company</p>
                <p className="text-white font-medium">{selectedReq.companyName}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase mb-1">Contact</p>
                <p className="text-white">{selectedReq.contactName}</p>
                <a href={`mailto:${selectedReq.contactEmail}`} className="text-blue-400 text-sm hover:underline">
                  {selectedReq.contactEmail}
                </a>
                <p className="text-slate-400 text-sm">{selectedReq.contactPhone}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase mb-1">Product Request</p>
                <p className="text-white">{selectedReq.productType}</p>
                <p className="text-slate-400 text-sm">{selectedReq.quantity.toLocaleString()} {selectedReq.unit}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase mb-1">Urgency Score</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${selectedReq.urgencyScore >= 70 ? 'bg-red-500' : selectedReq.urgencyScore >= 40 ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ width: `${selectedReq.urgencyScore}%` }}
                    />
                  </div>
                  <span className="text-white text-sm font-medium">{selectedReq.urgencyScore}</span>
                </div>
              </div>

              {/* Assigned AM */}
              <div>
                <p className="text-xs text-slate-500 uppercase mb-1">Assigned AM</p>
                <div className="flex items-center justify-between">
                  <p className="text-white">{selectedReq.assignedAM || 'Unassigned'}</p>
                  <button
                    onClick={() => setShowReassignModal(true)}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    Reassign
                  </button>
                </div>
              </div>

              {/* AM Actions (Normal Workflow) */}
              <div className="pt-4 border-t border-slate-700 space-y-2">
                <p className="text-xs text-slate-500 uppercase mb-2">AM Workflow</p>
                {selectedReq.status === 'PENDING_VERIFICATION' && (
                  <button
                    onClick={() => updateStatus(selectedReq.id, 'IN_CONSULTATION')}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Phone className="w-4 h-4 inline mr-2" />
                    Start Consultation
                  </button>
                )}
                {selectedReq.status === 'IN_CONSULTATION' && (
                  <button
                    onClick={() => updateStatus(selectedReq.id, 'VERIFIED')}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4 inline mr-2" />
                    Mark as Verified
                  </button>
                )}
                {selectedReq.status === 'VERIFIED' && (
                  <button
                    onClick={() => updateStatus(selectedReq.id, 'READY_FOR_MATCHING')}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Users className="w-4 h-4 inline mr-2" />
                    Send to Procurement
                  </button>
                )}
              </div>

              {/* Admin Override Options */}
              <div className="pt-4 border-t border-slate-700 space-y-2">
                <p className="text-xs text-red-400 uppercase mb-2 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Admin Override
                </p>
                <button
                  onClick={() => setShowOverrideModal(true)}
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors border border-slate-600"
                >
                  <Settings className="w-4 h-4 inline mr-2" />
                  Force Status Change
                </button>
                <button
                  onClick={() => setShowReassignModal(true)}
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors border border-slate-600"
                >
                  <RotateCcw className="w-4 h-4 inline mr-2" />
                  Reassign to Different AM
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center">
              <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">Select a requirement to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Reassign Modal */}
      <Dialog open={showReassignModal} onOpenChange={setShowReassignModal}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Reassign Requirement</DialogTitle>
            <DialogDescription className="text-slate-400">
              Select a different Account Manager to handle this requirement.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {accountManagers.map((am) => (
              <div
                key={am.id}
                onClick={() => setSelectedAM(am.name)}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedAM === am.name
                    ? 'border-red-500 bg-red-500/10'
                    : 'border-slate-600 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">{am.name}</p>
                    <p className="text-xs text-slate-400">{am.activeClients} clients • {am.pendingCount} pending</p>
                  </div>
                  {selectedAM === am.name && (
                    <CheckCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReassignModal(false)} className="border-slate-600 text-slate-300">
              Cancel
            </Button>
            <Button onClick={handleReassign} disabled={!selectedAM} className="bg-red-600 hover:bg-red-700">
              Reassign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Override Modal */}
      <Dialog open={showOverrideModal} onOpenChange={setShowOverrideModal}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Admin Override
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Force a status change. This will bypass the normal AM workflow.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <button
              onClick={() => handleAdminOverride('PENDING_VERIFICATION')}
              className={`w-full p-3 rounded-lg text-left border border-slate-600 hover:border-yellow-500/50 transition-colors ${
                selectedReq?.status === 'PENDING_VERIFICATION' ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={selectedReq?.status === 'PENDING_VERIFICATION'}
            >
              <span className="font-medium text-yellow-400">Reset to Pending Verification</span>
              <p className="text-xs text-slate-400 mt-1">Send back to initial state</p>
            </button>
            <button
              onClick={() => handleAdminOverride('IN_CONSULTATION')}
              className={`w-full p-3 rounded-lg text-left border border-slate-600 hover:border-blue-500/50 transition-colors ${
                selectedReq?.status === 'IN_CONSULTATION' ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={selectedReq?.status === 'IN_CONSULTATION'}
            >
              <span className="font-medium text-blue-400">Set to In Consultation</span>
              <p className="text-xs text-slate-400 mt-1">Mark as being consulted by AM</p>
            </button>
            <button
              onClick={() => handleAdminOverride('VERIFIED')}
              className={`w-full p-3 rounded-lg text-left border border-slate-600 hover:border-green-500/50 transition-colors ${
                selectedReq?.status === 'VERIFIED' ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={selectedReq?.status === 'VERIFIED'}
            >
              <span className="font-medium text-green-400">Force Verify</span>
              <p className="text-xs text-slate-400 mt-1">Skip consultation and verify directly</p>
            </button>
            <button
              onClick={() => handleAdminOverride('READY_FOR_MATCHING')}
              className={`w-full p-3 rounded-lg text-left border border-slate-600 hover:border-purple-500/50 transition-colors ${
                selectedReq?.status === 'READY_FOR_MATCHING' ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={selectedReq?.status === 'READY_FOR_MATCHING'}
            >
              <span className="font-medium text-purple-400">Send to Procurement</span>
              <p className="text-xs text-slate-400 mt-1">Skip to procurement matching</p>
            </button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOverrideModal(false)} className="border-slate-600 text-slate-300">
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
