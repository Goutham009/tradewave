import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

let io: SocketIOServer | null = null;

export function initializeSocket(httpServer: HTTPServer): SocketIOServer {
  if (io) return io;

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    path: '/api/socket',
  });

  io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id);

    // Join user-specific room for targeted notifications
    socket.on('join-user-room', (userId: string) => {
      socket.join(`user:${userId}`);
      console.log(`User ${userId} joined their room`);
    });

    // Join requirement-specific room for status updates
    socket.on('join-requirement-room', (requirementId: string) => {
      socket.join(`requirement:${requirementId}`);
      console.log(`Socket joined requirement room: ${requirementId}`);
    });

    // Leave requirement room
    socket.on('leave-requirement-room', (requirementId: string) => {
      socket.leave(`requirement:${requirementId}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
}

export function getIO(): SocketIOServer | null {
  return io;
}

// Emit functions for different notification types
export function emitRequirementStatusUpdate(
  requirementId: string,
  data: {
    status: string;
    message: string;
    timestamp: Date;
  }
) {
  if (!io) return;
  
  io.to(`requirement:${requirementId}`).emit('requirement-status-update', {
    requirementId,
    ...data,
  });
}

export function emitQuotationReceived(
  userId: string,
  data: {
    requirementId: string;
    requirementName: string;
    supplierName: string;
    quotationId: string;
  }
) {
  if (!io) return;
  
  io.to(`user:${userId}`).emit('quotation-received', {
    type: 'quotation',
    message: `New quotation received from ${data.supplierName}`,
    timestamp: new Date(),
    ...data,
  });
}

export function emitQuotationsReady(
  userId: string,
  data: {
    requirementId: string;
    requirementName: string;
    quotationCount: number;
  }
) {
  if (!io) return;
  
  io.to(`user:${userId}`).emit('quotations-ready', {
    type: 'quotation-ready',
    message: `${data.quotationCount} quotations are ready for "${data.requirementName}"`,
    timestamp: new Date(),
    ...data,
  });
}

export function emitNewInvitation(
  supplierId: string,
  data: {
    invitationId: string;
    requirementId: string;
    productType: string;
    buyerCompany: string;
    expiresAt: Date;
  }
) {
  if (!io) return;
  
  io.to(`user:${supplierId}`).emit('new-invitation', {
    type: 'invitation',
    message: `New quotation request for "${data.productType}" from ${data.buyerCompany}`,
    timestamp: new Date(),
    ...data,
  });
}

export function emitModificationRequestUpdate(
  buyerId: string,
  data: {
    requestId: string;
    quotationId: string;
    status: 'approved' | 'rejected';
    message: string;
  }
) {
  if (!io) return;
  
  io.to(`user:${buyerId}`).emit('modification-request-update', {
    type: 'modification',
    timestamp: new Date(),
    ...data,
  });
}
