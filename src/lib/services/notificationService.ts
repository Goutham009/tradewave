import prisma from '@/lib/db';
import { emitToUser, SOCKET_EVENTS, NOTIFICATION_TYPES } from '@/lib/socket/server';
import { sendEmail } from '@/lib/email/service';
import type { EmailTemplateName } from '@/lib/email/service';

export interface NotificationPayload {
  userId: string;
  type: string;
  title: string;
  message: string;
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  sendEmail?: boolean;
}

export interface NotificationResult {
  success: boolean;
  notification?: any;
  error?: string;
}

// Create and send notification
export async function createNotification(payload: NotificationPayload): Promise<NotificationResult> {
  try {
    // Create notification in database
    const notification = await prisma.notification.create({
      data: {
        userId: payload.userId,
        type: payload.type,
        title: payload.title,
        message: payload.message,
        resourceType: payload.resourceType,
        resourceId: payload.resourceId,
        read: false,
      } as any,
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

    // Send email notification if requested
    if (payload.sendEmail) {
      await sendEmailNotification(payload);
    }

    return { success: true, notification };
  } catch (error) {
    console.error('Failed to create notification:', error);
    return { success: false, error: 'Failed to create notification' };
  }
}

// Map notification types to email template names
const NOTIFICATION_TYPE_TO_TEMPLATE: Record<string, EmailTemplateName> = {
  [NOTIFICATION_TYPES.QUOTATION_RECEIVED]: 'quote_received',
  [NOTIFICATION_TYPES.QUOTATION_ACCEPTED]: 'quote_accepted',
  [NOTIFICATION_TYPES.QUOTATION_EXPIRING]: 'quote_received',
  [NOTIFICATION_TYPES.TRANSACTION_CREATED]: 'transaction_created',
  PAYMENT_RECEIVED: 'payment_received',
  [NOTIFICATION_TYPES.FUNDS_RELEASED]: 'payment_released',
  [NOTIFICATION_TYPES.DELIVERY_CONFIRMED]: 'delivery_confirmed',
  [NOTIFICATION_TYPES.SHIPMENT_UPDATE]: 'delivery_update',
  [NOTIFICATION_TYPES.DISPUTE_OPENED]: 'dispute_opened',
  [NOTIFICATION_TYPES.QUALITY_APPROVED]: 'transaction_updated',
  [NOTIFICATION_TYPES.NEW_REQUIREMENT_MATCH]: 'transaction_updated',
};

// Send email notification via the Resend-powered email service
async function sendEmailNotification(payload: NotificationPayload): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { email: true, name: true },
    });

    if (!user?.email) return;

    const template: EmailTemplateName =
      NOTIFICATION_TYPE_TO_TEMPLATE[payload.type] || 'transaction_updated';

    await sendEmail({
      to: user.email,
      subject: payload.title,
      template,
      data: {
        name: user.name || 'there',
        title: payload.title,
        message: payload.message,
        resourceType: payload.resourceType,
        resourceId: payload.resourceId,
        ...payload.metadata,
      },
      userId: payload.userId,
    });
  } catch (error) {
    console.error('Failed to send email notification:', error);
  }
}

// ============================================================================
// SUPPLIER NOTIFICATIONS
// ============================================================================

export async function notifySupplierNewRequirement(
  supplierId: string,
  userId: string,
  requirement: { id: string; title: string; category: string; quantity: number; unit: string }
): Promise<void> {
  await createNotification({
    userId,
    type: NOTIFICATION_TYPES.NEW_REQUIREMENT_MATCH,
    title: 'New Requirement Matching Your Category',
    message: `A new requirement "${requirement.title}" (${requirement.quantity} ${requirement.unit}) matches your categories.`,
    resourceType: 'requirement',
    resourceId: requirement.id,
    metadata: { supplierId, category: requirement.category },
    sendEmail: true,
  });
}

export async function notifySupplierQuotationAccepted(
  userId: string,
  quotation: { id: string; requirementTitle: string },
  transaction: { id: string; amount: number; currency: string }
): Promise<void> {
  await createNotification({
    userId,
    type: NOTIFICATION_TYPES.QUOTATION_ACCEPTED,
    title: '🎉 Quotation Accepted!',
    message: `Your quotation for "${quotation.requirementTitle}" has been accepted! Transaction value: ${transaction.currency} ${transaction.amount.toLocaleString()}`,
    resourceType: 'transaction',
    resourceId: transaction.id,
    metadata: { quotationId: quotation.id },
    sendEmail: true,
  });
}

export async function notifySupplierTransactionCreated(
  userId: string,
  transaction: { id: string; amount: number; currency: string; requirementTitle: string }
): Promise<void> {
  await createNotification({
    userId,
    type: NOTIFICATION_TYPES.TRANSACTION_CREATED,
    title: 'New Transaction Created',
    message: `A new transaction for "${transaction.requirementTitle}" worth ${transaction.currency} ${transaction.amount.toLocaleString()} has been created.`,
    resourceType: 'transaction',
    resourceId: transaction.id,
    sendEmail: true,
  });
}

export async function notifySupplierDeliveryConfirmed(
  userId: string,
  transaction: { id: string; requirementTitle: string }
): Promise<void> {
  await createNotification({
    userId,
    type: NOTIFICATION_TYPES.DELIVERY_CONFIRMED,
    title: '✓ Delivery Confirmed',
    message: `The buyer has confirmed delivery for "${transaction.requirementTitle}". Quality approval pending.`,
    resourceType: 'transaction',
    resourceId: transaction.id,
    sendEmail: true,
  });
}

export async function notifySupplierQualityApproved(
  userId: string,
  transaction: { id: string; requirementTitle: string }
): Promise<void> {
  await createNotification({
    userId,
    type: NOTIFICATION_TYPES.QUALITY_APPROVED,
    title: '✓ Quality Approved',
    message: `Quality has been approved for "${transaction.requirementTitle}". Funds release in progress.`,
    resourceType: 'transaction',
    resourceId: transaction.id,
    sendEmail: true,
  });
}

export async function notifySupplierFundsReleased(
  userId: string,
  transaction: { id: string; requirementTitle: string; amount: number; currency: string }
): Promise<void> {
  await createNotification({
    userId,
    type: NOTIFICATION_TYPES.FUNDS_RELEASED,
    title: '💰 Payment Received!',
    message: `${transaction.currency} ${transaction.amount.toLocaleString()} has been released for "${transaction.requirementTitle}". The funds will be in your account shortly.`,
    resourceType: 'transaction',
    resourceId: transaction.id,
    sendEmail: true,
  });
}

// ============================================================================
// BUYER NOTIFICATIONS
// ============================================================================

export async function notifyBuyerQuotationReceived(
  userId: string,
  quotation: { id: string; supplierName: string; requirementTitle: string; total: number; currency: string }
): Promise<void> {
  await createNotification({
    userId,
    type: NOTIFICATION_TYPES.QUOTATION_RECEIVED,
    title: 'New Quotation Received',
    message: `${quotation.supplierName} submitted a quotation of ${quotation.currency} ${quotation.total.toLocaleString()} for "${quotation.requirementTitle}".`,
    resourceType: 'quotation',
    resourceId: quotation.id,
    sendEmail: true,
  });
}

export async function notifyBuyerQuotationExpiring(
  userId: string,
  quotation: { id: string; supplierName: string; requirementTitle: string; expiresIn: number }
): Promise<void> {
  await createNotification({
    userId,
    type: NOTIFICATION_TYPES.QUOTATION_EXPIRING,
    title: '⚠️ Quotation Expiring Soon',
    message: `Quotation from ${quotation.supplierName} for "${quotation.requirementTitle}" expires in ${quotation.expiresIn} day(s). Review and respond soon!`,
    resourceType: 'quotation',
    resourceId: quotation.id,
    sendEmail: true,
  });
}

export async function notifyBuyerShipmentUpdate(
  userId: string,
  transaction: { id: string; requirementTitle: string; status: string; trackingNumber?: string; location?: string }
): Promise<void> {
  let message = `Shipment update for "${transaction.requirementTitle}": ${transaction.status}`;
  if (transaction.location) {
    message += `. Current location: ${transaction.location}`;
  }

  await createNotification({
    userId,
    type: NOTIFICATION_TYPES.SHIPMENT_UPDATE,
    title: '🚚 Shipment Update',
    message,
    resourceType: 'transaction',
    resourceId: transaction.id,
    metadata: { trackingNumber: transaction.trackingNumber },
  });
}

// ============================================================================
// GENERAL NOTIFICATIONS
// ============================================================================

export async function notifyDisputeOpened(
  userId: string,
  transaction: { id: string; requirementTitle: string; role: 'buyer' | 'supplier' }
): Promise<void> {
  await createNotification({
    userId,
    type: NOTIFICATION_TYPES.DISPUTE_OPENED,
    title: '⚠️ Dispute Opened',
    message: `A dispute has been opened for "${transaction.requirementTitle}". Our team will review it shortly.`,
    resourceType: 'transaction',
    resourceId: transaction.id,
    sendEmail: true,
  });
}

// ============================================================================
// REAL-TIME UPDATES
// ============================================================================

export function emitTransactionUpdate(userId: string, transaction: any): void {
  emitToUser(userId, SOCKET_EVENTS.TRANSACTION_UPDATE, transaction);
}

export function emitQuotationUpdate(userId: string, quotation: any): void {
  emitToUser(userId, SOCKET_EVENTS.QUOTATION_UPDATE, quotation);
}

export function emitDashboardRefresh(userId: string): void {
  emitToUser(userId, SOCKET_EVENTS.DASHBOARD_REFRESH, { timestamp: new Date() });
}

export function emitStatsUpdate(userId: string, stats: any): void {
  emitToUser(userId, SOCKET_EVENTS.STATS_UPDATE, stats);
}
