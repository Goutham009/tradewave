'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, User } from 'lucide-react';

interface TimelineEntry {
  id: string;
  status: string;
  note: string | null;
  timestamp: string;
  updatedBy: {
    id: string;
    name: string;
    role: string;
  } | null;
}

interface RequirementStatusTimelineProps {
  requirementId: string;
}

const statuses = [
  { key: 'SUBMITTED', label: 'Submitted', icon: '📝' },
  { key: 'PENDING_VERIFICATION', label: 'Pending Verification', icon: '⏳' },
  { key: 'VERIFIED', label: 'Verified', icon: '✅' },
  { key: 'SUPPLIER_SELECTION', label: 'Supplier Selection', icon: '🔍' },
  { key: 'AWAITING_QUOTES', label: 'Awaiting Quotes', icon: '📊' },
  { key: 'QUOTATIONS_RECEIVED', label: 'Quotations Received', icon: '📬' },
  { key: 'QUOTATIONS_READY', label: 'Sent to Buyer', icon: '✉️' },
  { key: 'IN_NEGOTIATION', label: 'In Negotiation', icon: '💬' },
  { key: 'TRANSACTION_CREATED', label: 'Transaction Created', icon: '🤝' },
  { key: 'PAYMENT_CONFIRMED', label: 'Payment Confirmed', icon: '💰' },
  { key: 'IN_TRANSIT', label: 'In Transit', icon: '🚚' },
  { key: 'DELIVERED', label: 'Delivered', icon: '📦' },
  { key: 'COMPLETED', label: 'Completed', icon: '🎉' },
];

const mockTimeline: TimelineEntry[] = [
  {
    id: 'tl-001',
    status: 'SUBMITTED',
    note: 'Requirement submitted by buyer',
    timestamp: '2024-01-15T08:00:00Z',
    updatedBy: null,
  },
  {
    id: 'tl-002',
    status: 'PENDING_VERIFICATION',
    note: 'Assigned to account manager for verification',
    timestamp: '2024-01-15T08:30:00Z',
    updatedBy: {
      id: 'system',
      name: 'System',
      role: 'Automated',
    },
  },
  {
    id: 'tl-003',
    status: 'VERIFIED',
    note: 'Buyer consultation completed. Requirements confirmed.',
    timestamp: '2024-01-16T10:30:00Z',
    updatedBy: {
      id: 'am-001',
      name: 'Sarah Johnson',
      role: 'Account Manager',
    },
  },
  {
    id: 'tl-004',
    status: 'SUPPLIER_SELECTION',
    note: 'Sent to procurement team for supplier selection',
    timestamp: '2024-01-16T11:00:00Z',
    updatedBy: {
      id: 'am-001',
      name: 'Sarah Johnson',
      role: 'Account Manager',
    },
  },
  {
    id: 'tl-005',
    status: 'AWAITING_QUOTES',
    note: 'Quotation requests sent to 8 suppliers',
    timestamp: '2024-01-17T09:00:00Z',
    updatedBy: {
      id: 'proc-001',
      name: 'David Chen',
      role: 'Procurement Team',
    },
  },
  {
    id: 'tl-006',
    status: 'QUOTATIONS_RECEIVED',
    note: '6 quotations received from suppliers',
    timestamp: '2024-01-19T14:00:00Z',
    updatedBy: {
      id: 'system',
      name: 'System',
      role: 'Automated',
    },
  },
];

export function RequirementStatusTimeline({ requirementId }: RequirementStatusTimelineProps) {
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [currentStatus, setCurrentStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimeline();
  }, [requirementId]);

  const fetchTimeline = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setTimeline(mockTimeline);
    setCurrentStatus('QUOTATIONS_RECEIVED');
    setLoading(false);
  };

  const getStatusIndex = (status: string) => {
    return statuses.findIndex(s => s.key === status);
  };

  const currentIndex = getStatusIndex(currentStatus);

  if (loading) {
    return (
      <Card className="p-8 text-center">
        <p className="text-neutral-500">Loading timeline...</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
        <Clock className="w-5 h-5" />
        Requirement Timeline
      </h3>

      {/* Visual Progress Bar */}
      <div className="mb-8 overflow-x-auto pb-4">
        <div className="relative min-w-max">
          <div className="absolute top-6 left-0 right-0 h-1 bg-neutral-200" />
          <div 
            className="absolute top-6 left-0 h-1 bg-teal-500 transition-all duration-500"
            style={{ width: `${(currentIndex / (statuses.length - 1)) * 100}%` }}
          />
          
          <div className="relative flex justify-between" style={{ minWidth: `${statuses.length * 80}px` }}>
            {statuses.map((status, index) => {
              const isPast = index <= currentIndex;
              const isCurrent = index === currentIndex;
              const timelineEntry = timeline.find(t => t.status === status.key);
              
              return (
                <div key={status.key} className="flex flex-col items-center" style={{ width: '80px' }}>
                  <div 
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${
                      isPast 
                        ? 'bg-teal-500 text-white shadow-md' 
                        : 'bg-neutral-200 text-neutral-400'
                    } ${isCurrent ? 'ring-4 ring-teal-200 scale-110' : ''}`}
                  >
                    {status.icon}
                  </div>
                  <p className={`text-xs mt-2 text-center leading-tight ${
                    isPast ? 'font-semibold text-neutral-800' : 'text-neutral-500'
                  }`}>
                    {status.label}
                  </p>
                  {timelineEntry && (
                    <p className="text-xs text-neutral-400 mt-1">
                      {new Date(timelineEntry.timestamp).toLocaleDateString()}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Current Status Badge */}
      <div className="mb-6 p-4 bg-teal-50 rounded-lg border border-teal-200">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-teal-600" />
          <div>
            <p className="font-semibold text-teal-800">Current Status</p>
            <p className="text-sm text-teal-600">
              {statuses.find(s => s.key === currentStatus)?.label || currentStatus}
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Timeline */}
      <div className="space-y-4">
        <h4 className="font-semibold mb-3">Detailed History</h4>
        {timeline.length === 0 ? (
          <p className="text-sm text-neutral-500 text-center py-4">
            No timeline events yet
          </p>
        ) : (
          [...timeline].reverse().map((entry, index) => (
            <div key={entry.id} className="relative">
              {index !== timeline.length - 1 && (
                <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-neutral-200" />
              )}

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-xl">
                  {statuses.find(s => s.key === entry.status)?.icon || '📋'}
                </div>

                <div className="flex-1 border border-neutral-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="success">
                        {statuses.find(s => s.key === entry.status)?.label || entry.status}
                      </Badge>
                    </div>
                    <span className="text-xs text-neutral-500">
                      {new Date(entry.timestamp).toLocaleString()}
                    </span>
                  </div>
                  
                  {entry.note && (
                    <p className="text-sm text-neutral-600 mb-2">{entry.note}</p>
                  )}

                  {entry.updatedBy && (
                    <p className="text-xs text-neutral-500 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      By: {entry.updatedBy.name} ({entry.updatedBy.role})
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
