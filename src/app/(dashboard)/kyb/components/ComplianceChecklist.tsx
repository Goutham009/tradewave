'use client';

import { useState } from 'react';
import { CheckCircle, Clock, AlertTriangle, XCircle, FileText, Link } from 'lucide-react';

const STATUS_CONFIG: Record<string, { color: string; icon: any; label: string; bgColor: string }> = {
  PENDING: { color: 'text-yellow-600', icon: Clock, label: 'Pending', bgColor: 'bg-yellow-50' },
  IN_PROGRESS: { color: 'text-blue-600', icon: Clock, label: 'In Progress', bgColor: 'bg-blue-50' },
  COMPLETED: { color: 'text-green-600', icon: CheckCircle, label: 'Completed', bgColor: 'bg-green-50' },
  NOT_APPLICABLE: { color: 'text-gray-600', icon: XCircle, label: 'N/A', bgColor: 'bg-gray-50' },
  FAILED: { color: 'text-red-600', icon: XCircle, label: 'Failed', bgColor: 'bg-red-50' }
};

interface ComplianceItem {
  id: string;
  itemType: string;
  displayName: string;
  description: string;
  status: string;
  isMandatory: boolean;
  isRecommended: boolean;
  documentId?: string;
  document?: any;
  expiryDate?: string;
  completedDate?: string;
  notes?: string;
}

interface ComplianceChecklistProps {
  kybId: string;
  items: ComplianceItem[];
  onUpdate: () => void;
}

export function ComplianceChecklist({ kybId, items, onUpdate }: ComplianceChecklistProps) {
  const [updating, setUpdating] = useState<string | null>(null);

  const mandatoryItems = items.filter(item => item.isMandatory);
  const recommendedItems = items.filter(item => item.isRecommended);
  const otherItems = items.filter(item => !item.isMandatory && !item.isRecommended);

  const completedMandatory = mandatoryItems.filter(item => item.status === 'COMPLETED').length;
  const completedRecommended = recommendedItems.filter(item => item.status === 'COMPLETED').length;

  const mandatoryProgress = mandatoryItems.length > 0 
    ? Math.round((completedMandatory / mandatoryItems.length) * 100) 
    : 100;

  const handleStatusUpdate = async (itemId: string, newStatus: string) => {
    setUpdating(itemId);
    try {
      const res = await fetch(`/api/kyb/${kybId}/compliance`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ complianceItemId: itemId, status: newStatus })
      });

      if (res.ok) {
        onUpdate();
      }
    } catch (err) {
      console.error('Failed to update compliance item:', err);
    } finally {
      setUpdating(null);
    }
  };

  const renderItem = (item: ComplianceItem) => {
    const statusConfig = STATUS_CONFIG[item.status] || STATUS_CONFIG.PENDING;
    const StatusIcon = statusConfig.icon;

    return (
      <div key={item.id} className={`p-4 rounded-lg border ${statusConfig.bgColor}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={`mt-1 ${statusConfig.color}`}>
              <StatusIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{item.displayName}</h4>
                {item.isMandatory && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">Required</span>
                )}
                {item.isRecommended && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">Recommended</span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">{item.description}</p>
              {item.document && (
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                  <FileText className="w-4 h-4" />
                  <span>{item.document.documentName}</span>
                </div>
              )}
              {item.completedDate && (
                <p className="text-xs text-gray-400 mt-1">
                  Completed: {new Date(item.completedDate).toLocaleDateString()}
                </p>
              )}
              {item.expiryDate && (
                <p className="text-xs text-orange-600 mt-1">
                  Expires: {new Date(item.expiryDate).toLocaleDateString()}
                </p>
              )}
              {item.notes && (
                <p className="text-sm text-gray-600 mt-2 italic">{item.notes}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${statusConfig.color}`}>
              {statusConfig.label}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Progress Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-white border rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Mandatory Requirements</span>
            <span className={`font-semibold ${mandatoryProgress === 100 ? 'text-green-600' : 'text-yellow-600'}`}>
              {completedMandatory}/{mandatoryItems.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className={`h-2 rounded-full ${mandatoryProgress === 100 ? 'bg-green-600' : 'bg-yellow-500'}`}
              style={{ width: `${mandatoryProgress}%` }} />
          </div>
        </div>
        <div className="p-4 bg-white border rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Recommended Items</span>
            <span className="font-semibold text-blue-600">
              {completedRecommended}/{recommendedItems.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${recommendedItems.length > 0 ? (completedRecommended / recommendedItems.length) * 100 : 0}%` }} />
          </div>
        </div>
      </div>

      {/* Mandatory Items */}
      {mandatoryItems.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Mandatory Requirements
          </h3>
          <div className="space-y-3">
            {mandatoryItems.map(renderItem)}
          </div>
        </div>
      )}

      {/* Recommended Items */}
      {recommendedItems.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            Recommended
          </h3>
          <div className="space-y-3">
            {recommendedItems.map(renderItem)}
          </div>
        </div>
      )}

      {/* Other Items */}
      {otherItems.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Additional Items</h3>
          <div className="space-y-3">
            {otherItems.map(renderItem)}
          </div>
        </div>
      )}
    </div>
  );
}

export default ComplianceChecklist;
