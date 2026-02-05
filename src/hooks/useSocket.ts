'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';

const SOCKET_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const SOCKET_EVENTS = {
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
  NEW_NOTIFICATION: 'new_notification',
  NOTIFICATION_READ: 'notification_read',
  NOTIFICATIONS_CLEARED: 'notifications_cleared',
  TRANSACTION_UPDATE: 'transaction_update',
  QUOTATION_UPDATE: 'quotation_update',
  REQUIREMENT_UPDATE: 'requirement_update',
  ESCROW_UPDATE: 'escrow_update',
  DASHBOARD_REFRESH: 'dashboard_refresh',
  STATS_UPDATE: 'stats_update',
  // Phase B: Real-time updates
  REQUIREMENT_STATUS_UPDATE: 'requirement-status-update',
  QUOTATION_RECEIVED: 'quotation-received',
  QUOTATIONS_READY: 'quotations-ready',
  NEW_INVITATION: 'new-invitation',
  MODIFICATION_REQUEST_UPDATE: 'modification-request-update',
} as const;

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  resourceType?: string;
  resourceId?: string;
  createdAt: string;
  read: boolean;
}

export function useSocket() {
  const { data: session } = useSession();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!session?.user?.id) return;

    // Initialize socket connection
    const socket = io(SOCKET_URL, {
      path: '/api/socketio',
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setIsConnected(true);
      
      // Join user's room
      socket.emit(SOCKET_EVENTS.JOIN_ROOM, session.user.id);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    // Listen for new notifications
    socket.on(SOCKET_EVENTS.NEW_NOTIFICATION, (notification: Notification) => {
      console.log('New notification received:', notification);
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
      
      // Play notification sound (optional)
      playNotificationSound();
      
      // Show browser notification if permitted
      showBrowserNotification(notification);
    });

    return () => {
      if (socket) {
        socket.emit(SOCKET_EVENTS.LEAVE_ROOM, session.user.id);
        socket.disconnect();
      }
    };
  }, [session?.user?.id]);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    
    if (socketRef.current) {
      socketRef.current.emit(SOCKET_EVENTS.NOTIFICATION_READ, notificationId);
    }
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    
    if (socketRef.current) {
      socketRef.current.emit(SOCKET_EVENTS.NOTIFICATIONS_CLEARED);
    }
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Subscribe to specific events
  const subscribe = useCallback((event: string, callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
    
    return () => {
      if (socketRef.current) {
        socketRef.current.off(event, callback);
      }
    };
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    subscribe,
    setNotifications,
    setUnreadCount,
  };
}

// Helper: Play notification sound
function playNotificationSound() {
  try {
    const audio = new Audio('/sounds/notification.mp3');
    audio.volume = 0.3;
    audio.play().catch(() => {
      // Autoplay might be blocked
    });
  } catch (e) {
    // Audio not supported
  }
}

// Helper: Show browser notification
function showBrowserNotification(notification: Notification) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(notification.title, {
      body: notification.message,
      icon: '/logo.png',
      tag: notification.id,
    });
  }
}

// Hook for requesting notification permission
export function useNotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    }
    return 'denied' as NotificationPermission;
  }, []);

  return { permission, requestPermission };
}

// Hook for real-time dashboard updates
export function useDashboardUpdates(onRefresh: () => void) {
  const { subscribe } = useSocket();

  useEffect(() => {
    const unsubscribe = subscribe(SOCKET_EVENTS.DASHBOARD_REFRESH, () => {
      onRefresh();
    });

    return unsubscribe;
  }, [subscribe, onRefresh]);
}

// Hook for transaction updates
export function useTransactionUpdates(
  transactionId: string | null,
  onUpdate: (transaction: any) => void
) {
  const { subscribe } = useSocket();

  useEffect(() => {
    if (!transactionId) return;

    const unsubscribe = subscribe(SOCKET_EVENTS.TRANSACTION_UPDATE, (data) => {
      if (data.id === transactionId) {
        onUpdate(data);
      }
    });

    return unsubscribe;
  }, [transactionId, subscribe, onUpdate]);
}
