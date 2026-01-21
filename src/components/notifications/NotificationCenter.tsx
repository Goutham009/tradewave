'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Bell,
  Check,
  CheckCheck,
  X,
  Package,
  DollarSign,
  Truck,
  FileText,
  AlertTriangle,
  Clock,
  Star,
  MessageSquare,
  Settings,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import { useSocket, Notification, SOCKET_EVENTS } from '@/hooks/useSocket';
import { formatDistanceToNow } from 'date-fns';

const NOTIFICATION_ICONS: Record<string, any> = {
  NEW_REQUIREMENT_MATCH: Package,
  QUOTATION_ACCEPTED: Star,
  QUOTATION_RECEIVED: MessageSquare,
  QUOTATION_EXPIRING: Clock,
  QUOTATION_EXPIRED: Clock,
  TRANSACTION_CREATED: FileText,
  DELIVERY_CONFIRMED: Truck,
  QUALITY_APPROVED: Check,
  FUNDS_RELEASED: DollarSign,
  SHIPMENT_UPDATE: Truck,
  DISPUTE_OPENED: AlertTriangle,
  DISPUTE_RESOLVED: Check,
  SYSTEM_ANNOUNCEMENT: Bell,
};

const NOTIFICATION_COLORS: Record<string, string> = {
  NEW_REQUIREMENT_MATCH: 'bg-blue-100 text-blue-600',
  QUOTATION_ACCEPTED: 'bg-green-100 text-green-600',
  QUOTATION_RECEIVED: 'bg-purple-100 text-purple-600',
  QUOTATION_EXPIRING: 'bg-yellow-100 text-yellow-600',
  QUOTATION_EXPIRED: 'bg-red-100 text-red-600',
  TRANSACTION_CREATED: 'bg-blue-100 text-blue-600',
  DELIVERY_CONFIRMED: 'bg-green-100 text-green-600',
  QUALITY_APPROVED: 'bg-green-100 text-green-600',
  FUNDS_RELEASED: 'bg-emerald-100 text-emerald-600',
  SHIPMENT_UPDATE: 'bg-blue-100 text-blue-600',
  DISPUTE_OPENED: 'bg-red-100 text-red-600',
  DISPUTE_RESOLVED: 'bg-green-100 text-green-600',
  SYSTEM_ANNOUNCEMENT: 'bg-gray-100 text-gray-600',
};

interface NotificationCenterProps {
  onClose?: () => void;
}

export default function NotificationCenter({ onClose }: NotificationCenterProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { notifications, unreadCount, markAsRead, markAllAsRead, setNotifications, setUnreadCount } = useSocket();
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  // Fetch notifications from API on mount
  useEffect(() => {
    if (session?.user?.id) {
      fetchNotifications();
    }
  }, [session?.user?.id]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications');
      const data = await response.json();
      
      if (data.status === 'success') {
        setNotifications(data.data.notifications);
        setUnreadCount(data.data.notifications.filter((n: any) => !n.read).length);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notification: Notification) => {
    if (notification.read) return;
    
    try {
      await fetch(`/api/notifications/${notification.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true }),
      });
      markAsRead(notification.id);
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await fetch('/api/notifications/read-all', {
        method: 'POST',
      });
      markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    handleMarkAsRead(notification);
    
    // Navigate to resource
    if (notification.resourceType && notification.resourceId) {
      const routes: Record<string, string> = {
        transaction: `/transactions/${notification.resourceId}`,
        quotation: `/quotations/${notification.resourceId}`,
        requirement: `/requirements/${notification.resourceId}`,
      };
      
      const route = routes[notification.resourceType];
      if (route) {
        router.push(route);
        onClose?.();
      }
    }
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  const getIcon = (type: string) => {
    const IconComponent = NOTIFICATION_ICONS[type] || Bell;
    return IconComponent;
  };

  const getIconColor = (type: string) => {
    return NOTIFICATION_COLORS[type] || 'bg-gray-100 text-gray-600';
  };

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
                <CheckCheck className="h-4 w-4 mr-1" />
                Mark all read
              </Button>
            )}
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Filter tabs */}
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              filter === 'all' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              filter === 'unread' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Bell className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-sm text-muted-foreground">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </p>
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto">
            {filteredNotifications.map((notification) => {
              const Icon = getIcon(notification.type);
              const iconColor = getIconColor(notification.type);
              
              return (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`flex items-start gap-3 p-4 cursor-pointer transition-colors border-b last:border-b-0 hover:bg-muted/50 ${
                    !notification.read ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className={`p-2 rounded-full flex-shrink-0 ${iconColor}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-medium line-clamp-1 ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  
                  {notification.resourceType && (
                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                  )}
                </div>
              );
            })}
          </div>
        )}
        
        {/* View all link */}
        {notifications.length > 0 && (
          <div className="p-3 border-t">
            <Button 
              variant="ghost" 
              className="w-full text-sm"
              onClick={() => {
                router.push('/notifications');
                onClose?.();
              }}
            >
              View all notifications
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Notification Bell Button Component
export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount } = useSocket();

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 z-50">
            <NotificationCenter onClose={() => setIsOpen(false)} />
          </div>
        </>
      )}
    </div>
  );
}
