'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Mail, Phone, Users, FileText, Plus } from 'lucide-react';

interface Communication {
  id: string;
  buyerId: string;
  requirementId: string | null;
  message: string;
  type: 'EMAIL' | 'PHONE' | 'MEETING' | 'NOTE';
  createdAt: string;
  accountManager: {
    id: string;
    name: string;
    role: string;
  };
}

interface BuyerCommunicationHistoryProps {
  buyerId: string;
  requirementId?: string;
}

const mockCommunications: Communication[] = [
  {
    id: 'comm-001',
    buyerId: 'buyer-001',
    requirementId: 'req-001',
    message: 'Initial consultation call completed. Buyer confirmed requirements for 5000 industrial sensors. Discussed preferred delivery timeline and budget constraints.',
    type: 'PHONE',
    createdAt: '2024-01-20T10:30:00Z',
    accountManager: {
      id: 'am-001',
      name: 'Sarah Johnson',
      role: 'Account Manager',
    },
  },
  {
    id: 'comm-002',
    buyerId: 'buyer-001',
    requirementId: 'req-001',
    message: 'Sent detailed quotation comparison document via email. Highlighted top 3 supplier options with pricing breakdown.',
    type: 'EMAIL',
    createdAt: '2024-01-19T14:20:00Z',
    accountManager: {
      id: 'am-001',
      name: 'Sarah Johnson',
      role: 'Account Manager',
    },
  },
  {
    id: 'comm-003',
    buyerId: 'buyer-001',
    requirementId: null,
    message: 'Quarterly review meeting scheduled. Will discuss current orders and potential future requirements.',
    type: 'MEETING',
    createdAt: '2024-01-18T09:15:00Z',
    accountManager: {
      id: 'am-002',
      name: 'David Chen',
      role: 'Senior Account Manager',
    },
  },
  {
    id: 'comm-004',
    buyerId: 'buyer-001',
    requirementId: 'req-001',
    message: 'Note: Buyer prefers ISO 9001 certified suppliers. Has worked with Industrial Solutions Ltd before - positive experience.',
    type: 'NOTE',
    createdAt: '2024-01-17T16:45:00Z',
    accountManager: {
      id: 'am-001',
      name: 'Sarah Johnson',
      role: 'Account Manager',
    },
  },
];

export function BuyerCommunicationHistory({ 
  buyerId, 
  requirementId 
}: BuyerCommunicationHistoryProps) {
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [messageType, setMessageType] = useState<Communication['type']>('NOTE');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCommunications();
  }, [buyerId, requirementId]);

  const fetchCommunications = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let filtered = mockCommunications.filter(c => c.buyerId === 'buyer-001');
    if (requirementId) {
      filtered = filtered.filter(c => c.requirementId === requirementId || c.requirementId === null);
    }
    setCommunications(filtered);
    setLoading(false);
  };

  const handleAddCommunication = async () => {
    if (!newMessage.trim()) return;

    setSubmitting(true);

    try {
      const response = await fetch('/api/admin/communications/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerId,
          requirementId,
          message: newMessage,
          type: messageType,
        }),
      });

      if (response.ok) {
        const newComm: Communication = {
          id: `comm-${Date.now()}`,
          buyerId,
          requirementId: requirementId || null,
          message: newMessage,
          type: messageType,
          createdAt: new Date().toISOString(),
          accountManager: {
            id: 'current-user',
            name: 'Current User',
            role: 'Account Manager',
          },
        };
        setCommunications([newComm, ...communications]);
        setNewMessage('');
      }
    } catch {
      // For demo
      const newComm: Communication = {
        id: `comm-${Date.now()}`,
        buyerId,
        requirementId: requirementId || null,
        message: newMessage,
        type: messageType,
        createdAt: new Date().toISOString(),
        accountManager: {
          id: 'current-user',
          name: 'Current User',
          role: 'Account Manager',
        },
      };
      setCommunications([newComm, ...communications]);
      setNewMessage('');
    }

    setSubmitting(false);
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'EMAIL': return <Mail className="w-5 h-5" />;
      case 'PHONE': return <Phone className="w-5 h-5" />;
      case 'MEETING': return <Users className="w-5 h-5" />;
      case 'NOTE': return <FileText className="w-5 h-5" />;
      default: return <MessageSquare className="w-5 h-5" />;
    }
  };

  const getTypeBadgeVariant = (type: string) => {
    switch(type) {
      case 'EMAIL': return 'info';
      case 'PHONE': return 'success';
      case 'MEETING': return 'warning';
      case 'NOTE': return 'default';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Card className="p-8 text-center">
        <p className="text-neutral-500">Loading communication history...</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <MessageSquare className="w-5 h-5" />
        Communication History
      </h3>

      {/* Add New Communication */}
      <div className="mb-6 p-4 bg-neutral-50 rounded-lg">
        <div className="flex gap-3 mb-3">
          <select
            value={messageType}
            onChange={(e) => setMessageType(e.target.value as Communication['type'])}
            className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="NOTE">📝 Note</option>
            <option value="EMAIL">📧 Email</option>
            <option value="PHONE">📞 Phone Call</option>
            <option value="MEETING">🤝 Meeting</option>
          </select>
        </div>

        <textarea
          className="w-full px-3 py-2 border border-neutral-300 rounded-lg mb-3 focus:ring-2 focus:ring-primary/20 focus:border-primary"
          rows={3}
          placeholder="Add communication details..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />

        <Button onClick={handleAddCommunication} disabled={submitting || !newMessage.trim()}>
          <Plus className="w-4 h-4 mr-2" />
          {submitting ? 'Adding...' : 'Add Communication'}
        </Button>
      </div>

      {/* Communication Timeline */}
      <div className="space-y-4">
        {communications.length === 0 ? (
          <p className="text-sm text-neutral-500 text-center py-4">
            No communication history yet
          </p>
        ) : (
          communications.map((comm, index) => (
            <div key={comm.id} className="relative">
              {/* Timeline Line */}
              {index !== communications.length - 1 && (
                <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-neutral-200" />
              )}

              <div className="flex gap-4">
                {/* Icon */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white ${
                  comm.type === 'EMAIL' ? 'bg-blue-500' :
                  comm.type === 'PHONE' ? 'bg-green-500' :
                  comm.type === 'MEETING' ? 'bg-amber-500' :
                  'bg-neutral-400'
                }`}>
                  {getTypeIcon(comm.type)}
                </div>

                {/* Content */}
                <div className="flex-1 border border-neutral-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant={getTypeBadgeVariant(comm.type)}>
                      {comm.type}
                    </Badge>
                    <span className="text-xs text-neutral-500">
                      {new Date(comm.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-sm text-neutral-700 mb-2">{comm.message}</p>

                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <span>By: {comm.accountManager.name}</span>
                    {comm.requirementId && (
                      <>
                        <span>•</span>
                        <span>Req #{comm.requirementId.slice(0, 8)}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
