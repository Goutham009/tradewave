import { Server as NetServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { NextApiRequest } from 'next';

export type NextApiResponseWithSocket = {
  socket: {
    server: NetServer & {
      io?: SocketIOServer;
    };
  };
};

// Socket.io event types
export const SOCKET_EVENTS = {
  // Connection
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
  
  // Notifications
  NEW_NOTIFICATION: 'new_notification',
  NOTIFICATION_READ: 'notification_read',
  NOTIFICATIONS_CLEARED: 'notifications_cleared',
  
  // Real-time updates
  TRANSACTION_UPDATE: 'transaction_update',
  QUOTATION_UPDATE: 'quotation_update',
  REQUIREMENT_UPDATE: 'requirement_update',
  ESCROW_UPDATE: 'escrow_update',
  
  // Dashboard
  DASHBOARD_REFRESH: 'dashboard_refresh',
  STATS_UPDATE: 'stats_update',
} as const;

// Notification types
export const NOTIFICATION_TYPES = {
  // Supplier notifications
  NEW_REQUIREMENT_MATCH: 'NEW_REQUIREMENT_MATCH',
  QUOTATION_ACCEPTED: 'QUOTATION_ACCEPTED',
  TRANSACTION_CREATED: 'TRANSACTION_CREATED',
  DELIVERY_CONFIRMED: 'DELIVERY_CONFIRMED',
  QUALITY_APPROVED: 'QUALITY_APPROVED',
  FUNDS_RELEASED: 'FUNDS_RELEASED',
  
  // Buyer notifications
  QUOTATION_RECEIVED: 'QUOTATION_RECEIVED',
  QUOTATION_EXPIRING: 'QUOTATION_EXPIRING',
  QUOTATION_EXPIRED: 'QUOTATION_EXPIRED',
  SHIPMENT_UPDATE: 'SHIPMENT_UPDATE',
  
  // General
  SYSTEM_ANNOUNCEMENT: 'SYSTEM_ANNOUNCEMENT',
  DISPUTE_OPENED: 'DISPUTE_OPENED',
  DISPUTE_RESOLVED: 'DISPUTE_RESOLVED',
} as const;

let io: SocketIOServer | null = null;

export function getSocketIO(): SocketIOServer | null {
  return io;
}

export function initSocketServer(server: NetServer): SocketIOServer {
  if (io) {
    console.log('Socket.IO already initialized');
    return io;
  }

  io = new SocketIOServer(server, {
    path: '/api/socketio',
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  io.on(SOCKET_EVENTS.CONNECTION, (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Join user-specific room
    socket.on(SOCKET_EVENTS.JOIN_ROOM, (userId: string) => {
      if (userId) {
        socket.join(`user:${userId}`);
        console.log(`User ${userId} joined their room`);
      }
    });

    // Leave room
    socket.on(SOCKET_EVENTS.LEAVE_ROOM, (userId: string) => {
      if (userId) {
        socket.leave(`user:${userId}`);
        console.log(`User ${userId} left their room`);
      }
    });

    // Mark notification as read
    socket.on(SOCKET_EVENTS.NOTIFICATION_READ, (notificationId: string) => {
      console.log(`Notification ${notificationId} marked as read`);
    });

    socket.on(SOCKET_EVENTS.DISCONNECT, () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  console.log('Socket.IO server initialized');
  return io;
}

// Helper functions to emit events
export function emitToUser(userId: string, event: string, data: any) {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
}

export function emitToAll(event: string, data: any) {
  if (io) {
    io.emit(event, data);
  }
}

export function emitToRoom(room: string, event: string, data: any) {
  if (io) {
    io.to(room).emit(event, data);
  }
}
