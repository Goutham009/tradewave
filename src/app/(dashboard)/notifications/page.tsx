'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
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
  Filter,
} from 'lucide-react';
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

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  resourceType?: string;
  resourceId?: string;
  createdAt: string;
  read: boolean;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [selectedType, setSelectedType] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications?limit=100');
      const data = await response.json();
      
      if (data.status === 'success') {
        setNotifications(data.data.notifications);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await fetch('/api/notifications/read-all', { method: 'POST' });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    handleMarkAsRead(notification.id);
    
    if (notification.resourceType && notification.resourceId) {
      const routes: Record<string, string> = {
        transaction: `/transactions/${notification.resourceId}`,
        quotation: `/quotations/${notification.resourceId}`,
        requirement: `/requirements/${notification.resourceId}`,
      };
      
      const route = routes[notification.resourceType];
      if (route) {
        router.push(route);
      }
    }
  };

  const filteredNotifications = notifications
    .filter((n) => filter === 'all' || !n.read)
    .filter((n) => !selectedType || n.type === selectedType);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const notificationTypes = Array.from(new Set(notifications.map((n) => n.type)));

  const getIcon = (type: string) => {
    return NOTIFICATION_ICONS[type] || Bell;
  };

  const getIconColor = (type: string) => {
    return NOTIFICATION_COLORS[type] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount} unread</Badge>
            )}
          </h1>
          <p className="text-muted-foreground">
            Stay updated on your requirements, quotations, and transactions
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" onClick={handleMarkAllAsRead}>
              <CheckCheck className="mr-2 h-4 w-4" />
              Mark all as read
            </Button>
          )}
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Preferences
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All ({notifications.length})
              </Button>
              <Button
                variant={filter === 'unread' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('unread')}
              >
                Unread ({unreadCount})
              </Button>
            </div>

            {notificationTypes.length > 0 && (
              <>
                <div className="h-6 w-px bg-border" />
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedType === null ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedType(null)}
                  >
                    <Filter className="mr-1 h-3 w-3" />
                    All Types
                  </Button>
                  {notificationTypes.slice(0, 5).map((type) => (
                    <Button
                      key={type}
                      variant={selectedType === type ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setSelectedType(type)}
                    >
                      {type.replace(/_/g, ' ')}
                    </Button>
                  ))}
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filter === 'unread' ? 'Unread Notifications' : 'All Notifications'}
          </CardTitle>
          <CardDescription>
            {filteredNotifications.length} notification(s)
          </CardDescription>
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
            <div className="divide-y">
              {filteredNotifications.map((notification) => {
                const Icon = getIcon(notification.type);
                const iconColor = getIconColor(notification.type);
                
                return (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-4 p-4 transition-colors hover:bg-muted/50 ${
                      !notification.read ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className={`p-2 rounded-full flex-shrink-0 ${iconColor}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    
                    <div 
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className={`font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {notification.title}
                          </p>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {notification.message}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {notification.type.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                          title="Mark as read"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(notification.id)}
                        title="Delete"
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
