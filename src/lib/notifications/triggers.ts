import prisma from '@/lib/db';
import { emitToUser, SOCKET_EVENTS, NOTIFICATION_TYPES } from '@/lib/socket/server';

// Helper to create notification in DB and emit via socket
async function createAndEmitNotification(payload: {
  userId: string;
  type: string;
  title: string;
  message: string;
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, any>;
}) {
  try {
    // Create notification in database
    const notification = await (prisma as any).notification.create({
      data: {
        userId: payload.userId,
        type: payload.type,
        title: payload.title,
        message: payload.message,
        resourceType: payload.resourceType,
        resourceId: payload.resourceId,
        metadata: payload.metadata || {},
        read: false,
      },
    });

    // Emit real-time notification via Socket.io
    emitToUser(payload.userId, SOCKET_EVENTS.NEW_NOTIFICATION, {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      resourceType: notification.resourceType,
      resourceId: notification.resourceId,
      createdAt: notification.createdAt,
      read: false,
    });

    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
    return null;
  }
}

// ============================================================================
// SUPPLIER NOTIFICATIONS (pass userId directly - quotation.userId or lookup)
// ============================================================================

export async function notifySupplierNewRequirement(
  userId: string,
  requirement: { id: string; title: string; category: string; quantity: number; unit: string }
) {
  await createAndEmitNotification({
    userId,
    type: NOTIFICATION_TYPES.NEW_REQUIREMENT_MATCH,
    title: 'New Requirement Matching Your Category',
    message: `A new requirement "${requirement.title}" (${requirement.quantity} ${requirement.unit}) matches your categories.`,
    resourceType: 'requirement',
    resourceId: requirement.id,
    metadata: { category: requirement.category },
  });
}

export async function notifySupplierQuotationAccepted(
  userId: string,
  quotationId: string,
  requirementTitle: string,
  transactionId: string,
  amount: number,
  currency: string
) {
  await createAndEmitNotification({
    userId,
    type: NOTIFICATION_TYPES.QUOTATION_ACCEPTED,
    title: '🎉 Quotation Accepted!',
    message: `Your quotation for "${requirementTitle}" has been accepted! Transaction value: ${currency} ${amount.toLocaleString()}`,
    resourceType: 'transaction',
    resourceId: transactionId,
    metadata: { quotationId },
  });
}

export async function notifySupplierTransactionCreated(
  userId: string,
  transactionId: string,
  requirementTitle: string,
  amount: number,
  currency: string
) {
  await createAndEmitNotification({
    userId,
    type: NOTIFICATION_TYPES.TRANSACTION_CREATED,
    title: 'New Transaction Created',
    message: `A new transaction for "${requirementTitle}" worth ${currency} ${amount.toLocaleString()} has been created.`,
    resourceType: 'transaction',
    resourceId: transactionId,
  });
}

export async function notifySupplierDeliveryConfirmed(
  userId: string,
  transactionId: string,
  requirementTitle: string
) {
  await createAndEmitNotification({
    userId,
    type: NOTIFICATION_TYPES.DELIVERY_CONFIRMED,
    title: '✓ Delivery Confirmed',
    message: `The buyer has confirmed delivery for "${requirementTitle}". Quality approval pending.`,
    resourceType: 'transaction',
    resourceId: transactionId,
  });
}

export async function notifySupplierQualityApproved(
  userId: string,
  transactionId: string,
  requirementTitle: string
) {
  await createAndEmitNotification({
    userId,
    type: NOTIFICATION_TYPES.QUALITY_APPROVED,
    title: '✓ Quality Approved',
    message: `Quality has been approved for "${requirementTitle}". Funds release in progress.`,
    resourceType: 'transaction',
    resourceId: transactionId,
  });
}

export async function notifySupplierFundsReleased(
  userId: string,
  transactionId: string,
  requirementTitle: string,
  amount: number,
  currency: string
) {
  await createAndEmitNotification({
    userId,
    type: NOTIFICATION_TYPES.FUNDS_RELEASED,
    title: '💰 Payment Received!',
    message: `${currency} ${amount.toLocaleString()} has been released for "${requirementTitle}". The funds will be in your account shortly.`,
    resourceType: 'transaction',
    resourceId: transactionId,
  });
}

// ============================================================================
// BUYER NOTIFICATIONS
// ============================================================================

export async function notifyQuotationReceived(
  buyerId: string,
  quotationId: string,
  supplierName: string,
  requirementTitle: string,
  total: number,
  currency: string
) {
  await createAndEmitNotification({
    userId: buyerId,
    type: NOTIFICATION_TYPES.QUOTATION_RECEIVED,
    title: 'New Quotation Received',
    message: `${supplierName} submitted a quotation of ${currency} ${total.toLocaleString()} for "${requirementTitle}".`,
    resourceType: 'quotation',
    resourceId: quotationId,
  });
}

export async function notifyQuotationExpiring(
  buyerId: string,
  quotationId: string,
  supplierName: string,
  requirementTitle: string,
  expiresIn: number
) {
  await createAndEmitNotification({
    userId: buyerId,
    type: NOTIFICATION_TYPES.QUOTATION_EXPIRING,
    title: '⚠️ Quotation Expiring Soon',
    message: `Quotation from ${supplierName} for "${requirementTitle}" expires in ${expiresIn} day(s). Review and respond soon!`,
    resourceType: 'quotation',
    resourceId: quotationId,
  });
}

export async function notifyShipmentUpdate(
  buyerId: string,
  transactionId: string,
  requirementTitle: string,
  status: string,
  location?: string
) {
  let message = `Shipment update for "${requirementTitle}": ${status}`;
  if (location) {
    message += `. Current location: ${location}`;
  }

  await createAndEmitNotification({
    userId: buyerId,
    type: NOTIFICATION_TYPES.SHIPMENT_UPDATE,
    title: '🚚 Shipment Update',
    message,
    resourceType: 'transaction',
    resourceId: transactionId,
  });
}

// ============================================================================
// GENERAL NOTIFICATIONS
// ============================================================================

export async function notifyDisputeOpened(
  userId: string,
  transactionId: string,
  requirementTitle: string
) {
  await createAndEmitNotification({
    userId,
    type: NOTIFICATION_TYPES.DISPUTE_OPENED,
    title: '⚠️ Dispute Opened',
    message: `A dispute has been opened for "${requirementTitle}". Our team will review it shortly.`,
    resourceType: 'transaction',
    resourceId: transactionId,
  });
}

// ============================================================================
// REAL-TIME DASHBOARD UPDATES
// ============================================================================

export function emitTransactionUpdate(userId: string, transaction: any) {
  emitToUser(userId, SOCKET_EVENTS.TRANSACTION_UPDATE, transaction);
}

export function emitQuotationUpdate(userId: string, quotation: any) {
  emitToUser(userId, SOCKET_EVENTS.QUOTATION_UPDATE, quotation);
}

export function emitDashboardRefresh(userId: string) {
  emitToUser(userId, SOCKET_EVENTS.DASHBOARD_REFRESH, { timestamp: new Date() });
}

export function emitStatsUpdate(userId: string, stats: any) {
  emitToUser(userId, SOCKET_EVENTS.STATS_UPDATE, stats);
}
