'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Shield, AlertTriangle, CheckCircle, Clock, ExternalLink } from 'lucide-react';

interface CustomsClearanceProps {
  transactionId: string;
}

interface CustomsDocument {
  name: string;
  description?: string;
  status: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  fileUrl?: string;
}

interface TimelineEvent {
  title: string;
  description: string;
  completed: boolean;
  timestamp?: string;
}

interface CustomsInfo {
  entryNumber: string;
  portOfEntry: string;
  brokerName: string;
  status: 'PENDING' | 'DOCUMENTS_SUBMITTED' | 'UNDER_INSPECTION' | 'CLEARED' | 'HELD';
  dutyAmount: number;
  estimatedClearanceDate: string;
  actualClearanceDate?: string;
  holdReason?: string;
  documents: CustomsDocument[];
  timeline: TimelineEvent[];
}

const STATUS_CONFIG = {
  PENDING: { color: 'yellow', label: 'Pending' },
  DOCUMENTS_SUBMITTED: { color: 'blue', label: 'Documents Submitted' },
  UNDER_INSPECTION: { color: 'purple', label: 'Under Inspection' },
  CLEARED: { color: 'green', label: 'Cleared' },
  HELD: { color: 'red', label: 'Held' },
};

export function CustomsClearance({ transactionId }: CustomsClearanceProps) {
  const [customsInfo, setCustomsInfo] = useState<CustomsInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomsInfo();
  }, [transactionId]);

  const fetchCustomsInfo = async () => {
    try {
      const response = await fetch(`/api/transactions/${transactionId}/customs`);
      if (response.ok) {
        const data = await response.json();
        setCustomsInfo(data);
      }
    } catch (error) {
      console.error('Failed to fetch customs info:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-neutral-200 rounded w-1/3"></div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-neutral-100 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (!customsInfo) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <Shield className="w-12 h-12 mx-auto text-neutral-300 mb-4" />
          <p className="text-neutral-500">Customs clearance not initiated yet</p>
          <p className="text-sm text-neutral-400 mt-1">Information will be available once shipment reaches customs</p>
        </div>
      </Card>
    );
  }

  const statusConfig = STATUS_CONFIG[customsInfo.status] || STATUS_CONFIG.PENDING;

  return (
    <div className="space-y-6">
      {/* Customs Status Overview */}
      <Card className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-bold mb-2">Customs Clearance</h3>
            <p className="text-sm text-neutral-600">
              Entry #: <span className="font-mono font-semibold">{customsInfo.entryNumber}</span>
            </p>
          </div>
          <Badge variant={statusConfig.color as any}>
            {statusConfig.label}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-neutral-50 p-3 rounded-lg">
            <p className="text-sm text-neutral-600 mb-1">Port of Entry</p>
            <p className="font-semibold">{customsInfo.portOfEntry}</p>
          </div>
          <div className="bg-neutral-50 p-3 rounded-lg">
            <p className="text-sm text-neutral-600 mb-1">Customs Broker</p>
            <p className="font-semibold">{customsInfo.brokerName}</p>
          </div>
          <div className="bg-neutral-50 p-3 rounded-lg">
            <p className="text-sm text-neutral-600 mb-1">Estimated Clearance</p>
            <p className="font-semibold">
              {new Date(customsInfo.estimatedClearanceDate).toLocaleDateString()}
            </p>
          </div>
          <div className="bg-neutral-50 p-3 rounded-lg">
            <p className="text-sm text-neutral-600 mb-1">Duty Amount</p>
            <p className="font-semibold text-teal-600">${customsInfo.dutyAmount.toLocaleString()}</p>
          </div>
        </div>

        {customsInfo.status === 'HELD' && customsInfo.holdReason && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">Shipment Held</p>
                <p className="text-sm text-red-800 mt-1">{customsInfo.holdReason}</p>
              </div>
            </div>
          </div>
        )}

        {customsInfo.status === 'CLEARED' && customsInfo.actualClearanceDate && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Customs Cleared</p>
                <p className="text-sm text-green-700">
                  Cleared on {new Date(customsInfo.actualClearanceDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Required Documents */}
      <Card className="p-6">
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Required Documents
        </h4>
        <div className="space-y-3">
          {customsInfo.documents.map((doc, index) => (
            <div
              key={index}
              className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {doc.status === 'APPROVED' ? '✅' : doc.status === 'SUBMITTED' ? '📄' : '⏳'}
                </span>
                <div>
                  <p className="font-medium">{doc.name}</p>
                  {doc.description && (
                    <p className="text-xs text-neutral-600">{doc.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  variant={
                    doc.status === 'APPROVED' ? 'success' :
                    doc.status === 'SUBMITTED' ? 'info' :
                    doc.status === 'REJECTED' ? 'destructive' : 'warning'
                  }
                >
                  {doc.status}
                </Badge>
                {doc.fileUrl && (
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    View <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Customs Timeline */}
      <Card className="p-6">
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Clearance Timeline
        </h4>
        <div className="space-y-4">
          {customsInfo.timeline.map((event, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`w-3 h-3 rounded-full ${
                    event.completed ? 'bg-green-500' : 'bg-neutral-300'
                  }`}
                />
                {index < customsInfo.timeline.length - 1 && (
                  <div className="w-0.5 flex-1 bg-neutral-200 mt-2" />
                )}
              </div>
              <div className="flex-1 pb-4">
                <div className="flex justify-between items-start mb-1">
                  <p className={`font-semibold ${event.completed ? 'text-neutral-900' : 'text-neutral-400'}`}>
                    {event.title}
                  </p>
                  {event.timestamp && (
                    <p className="text-xs text-neutral-500">
                      {new Date(event.timestamp).toLocaleString()}
                    </p>
                  )}
                </div>
                <p className="text-sm text-neutral-600">{event.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
