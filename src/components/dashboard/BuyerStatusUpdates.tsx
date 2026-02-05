'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, X } from 'lucide-react';

interface StatusUpdate {
  id: string;
  type: 'status' | 'quotation' | 'notification';
  message: string;
  timestamp: Date;
  requirementId?: string;
  read: boolean;
}

export function BuyerStatusUpdates() {
  const [updates, setUpdates] = useState<StatusUpdate[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    // Request notification permission on mount
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Simulate real-time updates with polling (can be replaced with WebSocket)
    const pollUpdates = async () => {
      try {
        const response = await fetch('/api/buyer/status-updates');
        if (response.ok) {
          const data = await response.json();
          if (data.updates && data.updates.length > 0) {
            setUpdates(prev => {
              const newUpdates = data.updates.filter(
                (u: StatusUpdate) => !prev.some(p => p.id === u.id)
              );
              
              // Show browser notification for new updates
              newUpdates.forEach((update: StatusUpdate) => {
                showBrowserNotification(update);
              });
              
              return [...newUpdates, ...prev].slice(0, 10);
            });
          }
        }
      } catch (error) {
        // Silently fail - will retry on next poll
      }
    };

    // Poll every 30 seconds
    const interval = setInterval(pollUpdates, 30000);
    
    // Initial fetch
    pollUpdates();

    // Demo: Add some mock updates after 2 seconds
    setTimeout(() => {
      const mockUpdates: StatusUpdate[] = [
        {
          id: 'update-1',
          type: 'quotation',
          message: 'New quotations received for "Industrial Sensors" - 3 suppliers responded',
          timestamp: new Date(),
          requirementId: 'REQ-2024-001',
          read: false,
        },
        {
          id: 'update-2',
          type: 'status',
          message: 'Your requirement "Steel Beams" is now in procurement review',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          requirementId: 'REQ-2024-002',
          read: false,
        },
      ];
      setUpdates(mockUpdates);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const showBrowserNotification = (update: StatusUpdate) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Tradewave Update', {
        body: update.message,
        icon: '/logo.png',
      });
    }
  };

  const markAsRead = (updateId: string) => {
    setUpdates(prev => 
      prev.map(u => u.id === updateId ? { ...u, read: true } : u)
    );
  };

  const dismissUpdate = (updateId: string) => {
    setUpdates(prev => prev.filter(u => u.id !== updateId));
  };

  const unreadCount = updates.filter(u => !u.read).length;

  if (updates.length === 0) {
    return null;
  }

  return (
    <Card className="p-4 bg-gradient-to-r from-teal-50 to-blue-50 border-teal-200">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center font-bold">
              {unreadCount}
            </span>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-teal-900">Recent Updates</h3>
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-teal-600 hover:text-teal-800"
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </button>
          </div>
          
          {isExpanded && (
            <div className="space-y-2">
              {updates.map((update) => (
                <div 
                  key={update.id} 
                  className={`flex justify-between items-start text-sm p-2 rounded-lg transition-colors ${
                    update.read ? 'bg-white/50' : 'bg-white shadow-sm'
                  }`}
                  onClick={() => markAsRead(update.id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={
                        update.type === 'quotation' ? 'success' : 
                        update.type === 'status' ? 'info' : 'default'
                      }>
                        {update.type === 'quotation' ? '📬 Quotation' : 
                         update.type === 'status' ? '📊 Status' : '🔔 Update'}
                      </Badge>
                      {!update.read && (
                        <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
                      )}
                    </div>
                    <p className="text-teal-800">{update.message}</p>
                    <span className="text-xs text-teal-600">
                      {new Date(update.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      dismissUpdate(update.id);
                    }}
                    className="text-neutral-400 hover:text-neutral-600 ml-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
