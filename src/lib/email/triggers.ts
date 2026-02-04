import { render } from '@react-email/components';
import prisma from '@/lib/db';
import { Resend } from 'resend';
import { WelcomeEmail } from './templates/WelcomeEmail';
import { QuoteReceivedEmail } from './templates/QuoteReceivedEmail';
import { QuoteExpiringEmail } from './templates/QuoteExpiringEmail';
import { QuoteAcceptedEmail } from './templates/QuoteAcceptedEmail';
import { TransactionCreatedEmail } from './templates/TransactionCreatedEmail';
import { PaymentConfirmedEmail } from './templates/PaymentConfirmedEmail';
import { DeliveryReadyEmail } from './templates/DeliveryReadyEmail';
import { DeliveryConfirmedEmail } from './templates/DeliveryConfirmedEmail';
import { QualityApprovedEmail } from './templates/QualityApprovedEmail';
import { PaymentReleasedEmail } from './templates/PaymentReleasedEmail';
import { DisputeOpenedEmail } from './templates/DisputeOpenedEmail';
import { DisputeResolvedEmail } from './templates/DisputeResolvedEmail';
import { AdminAlertEmail } from './templates/AdminAlertEmail';
import { WeeklyDigestEmail } from './templates/WeeklyDigestEmail';

const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;
const FROM_EMAIL = process.env.EMAIL_FROM || 'Tradewave <noreply@tradewave.io>';
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://tradewave.io';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@tradewave.io';

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

async function canSendEmail(email: string, userId?: string, preferenceKey?: string): Promise<boolean> {
  const bounce = await prisma.emailBounce.findUnique({ where: { email } });
  if (bounce?.bounceType === 'PERMANENT') return false;
  if (userId && preferenceKey) {
    const pref = await prisma.emailPreference.findUnique({ where: { userId } });
    if (pref?.unsubscribedAt) return false;
    if (pref && preferenceKey in pref && !(pref as Record<string, unknown>)[preferenceKey]) return false;
  }
  return true;
}

async function logAndSend(to: string, subject: string, templateName: string, html: string, metadata?: object): Promise<EmailResult> {
  if (!resend) {
    return { success: false, error: 'Email service not configured' };
  }
  const log = await prisma.emailLog.create({
    data: { recipient: to, subject, templateName, status: 'PENDING', metadata: metadata || {} },
  });
  try {
    const result = await resend.emails.send({ from: FROM_EMAIL, to, subject, html });
    if (result.error) {
      await prisma.emailLog.update({ where: { id: log.id }, data: { status: 'FAILED', failureReason: result.error.message, retryCount: 1 } });
      return { success: false, error: result.error.message };
    }
    await prisma.emailLog.update({ where: { id: log.id }, data: { status: 'SENT', sentAt: new Date(), resendId: result.data?.id } });
    return { success: true, messageId: result.data?.id };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    await prisma.emailLog.update({ where: { id: log.id }, data: { status: 'FAILED', failureReason: msg, retryCount: 1 } });
    return { success: false, error: msg };
  }
}

const unsubUrl = (userId: string) => `${BASE_URL}/unsubscribe?userId=${userId}`;

export async function sendWelcomeEmail(userId: string, email: string, name: string): Promise<EmailResult> {
  if (!(await canSendEmail(email, userId, 'systemNotifications'))) return { success: false, error: 'Blocked' };
  const html = await render(WelcomeEmail({ userName: name, loginUrl: `${BASE_URL}/login`, unsubscribeUrl: unsubUrl(userId) }));
  return logAndSend(email, 'Welcome to Tradewave!', 'welcome', html, { userId, name });
}

export async function sendQuoteReceivedEmail(quotationId: string): Promise<EmailResult> {
  const q = await prisma.quotation.findUnique({ where: { id: quotationId }, include: { requirement: { include: { buyer: true } }, supplier: true } });
  if (!q) return { success: false, error: 'Quotation not found' };
  const buyer = q.requirement.buyer;
  if (!(await canSendEmail(buyer.email, buyer.id, 'quoteNotifications'))) return { success: false, error: 'Blocked' };
  const html = await render(QuoteReceivedEmail({
    buyerName: buyer.name, supplierName: q.supplier?.companyName || 'Supplier', quoteAmount: q.total.toString(),
    currency: q.currency || 'USD', expiryDate: q.validUntil?.toLocaleDateString() || 'N/A',
    quotationLink: `${BASE_URL}/quotations/${quotationId}`, requirementTitle: q.requirement.title, unsubscribeUrl: unsubUrl(buyer.id),
  }));
  return logAndSend(buyer.email, `New Quote for ${q.requirement.title}`, 'quote_received', html, { quotationId });
}

export async function sendQuoteExpiringEmail(quotationId: string): Promise<EmailResult> {
  const q = await prisma.quotation.findUnique({ where: { id: quotationId }, include: { requirement: { include: { buyer: true } }, supplier: true } });
  if (!q || !q.validUntil) return { success: false, error: 'Quotation not found' };
  const buyer = q.requirement.buyer;
  if (!(await canSendEmail(buyer.email, buyer.id, 'quoteNotifications'))) return { success: false, error: 'Blocked' };
  const hoursLeft = Math.max(0, Math.round((q.validUntil.getTime() - Date.now()) / (1000 * 60 * 60)));
  const html = await render(QuoteExpiringEmail({
    buyerName: buyer.name, supplierName: q.supplier?.companyName || 'Supplier', quoteAmount: q.total.toString(),
    currency: q.currency || 'USD', expiresIn: `${hoursLeft} hours`,
    quotationLink: `${BASE_URL}/quotations/${quotationId}`, requirementTitle: q.requirement.title, unsubscribeUrl: unsubUrl(buyer.id),
  }));
  return logAndSend(buyer.email, `Quote Expiring Soon - ${q.requirement.title}`, 'quote_expiring', html, { quotationId });
}

export async function sendQuoteAcceptedEmail(quotationId: string, transactionId: string): Promise<EmailResult[]> {
  const q = await prisma.quotation.findUnique({ where: { id: quotationId }, include: { requirement: { include: { buyer: true } }, supplier: true } });
  if (!q) return [{ success: false, error: 'Quotation not found' }];
  const results: EmailResult[] = [];
  const link = `${BASE_URL}/transactions/${transactionId}`;
  // Email to supplier
  if (q.supplier && await canSendEmail(q.supplier.email || '', q.supplierId || '', 'quoteNotifications')) {
    const html = await render(QuoteAcceptedEmail({
      partyName: q.supplier.companyName || 'Supplier', isSupplier: true, amount: q.total.toString(),
      currency: q.currency || 'USD', transactionLink: link, requirementTitle: q.requirement.title,
      otherPartyName: q.requirement.buyer.name, unsubscribeUrl: unsubUrl(q.supplierId || ''),
    }));
    results.push(await logAndSend(q.supplier.email || '', 'Your Quote was Accepted!', 'quote_accepted', html, { quotationId, transactionId }));
  }
  // Email to buyer
  if (await canSendEmail(q.requirement.buyer.email, q.requirement.buyer.id, 'quoteNotifications')) {
    const html = await render(QuoteAcceptedEmail({
      partyName: q.requirement.buyer.name, isSupplier: false, amount: q.total.toString(),
      currency: q.currency || 'USD', transactionLink: link, requirementTitle: q.requirement.title,
      otherPartyName: q.supplier?.companyName || 'Supplier', unsubscribeUrl: unsubUrl(q.requirement.buyer.id),
    }));
    results.push(await logAndSend(q.requirement.buyer.email, 'Quote Accepted - Transaction Created', 'quote_accepted', html, { quotationId, transactionId }));
  }
  return results;
}

export async function sendTransactionCreatedEmail(transactionId: string): Promise<EmailResult[]> {
  const t = await prisma.transaction.findUnique({ where: { id: transactionId }, include: { buyer: true, supplier: true, requirement: true } });
  if (!t) return [{ success: false, error: 'Transaction not found' }];
  const results: EmailResult[] = [];
  const link = `${BASE_URL}/transactions/${transactionId}`;
  const deliveryDate = t.estimatedDelivery?.toLocaleDateString() || 'TBD';
  // Buyer email
  if (await canSendEmail(t.buyer.email, t.buyer.id, 'transactionNotifications')) {
    const html = await render(TransactionCreatedEmail({
      partyName: t.buyer.name, isBuyer: true, amount: t.amount.toString(), currency: t.currency || 'USD',
      deliveryDate, transactionId, transactionLink: link, requirementTitle: t.requirement?.title || 'Order',
      otherPartyName: t.supplier?.companyName || 'Supplier', unsubscribeUrl: unsubUrl(t.buyer.id),
    }));
    results.push(await logAndSend(t.buyer.email, `Transaction Created - ${transactionId}`, 'transaction_created', html, { transactionId }));
  }
  // Supplier email
  if (t.supplier && await canSendEmail(t.supplier.email || '', t.supplierId || '', 'transactionNotifications')) {
    const html = await render(TransactionCreatedEmail({
      partyName: t.supplier.companyName || 'Supplier', isBuyer: false, amount: t.amount.toString(), currency: t.currency || 'USD',
      deliveryDate, transactionId, transactionLink: link, requirementTitle: t.requirement?.title || 'Order',
      otherPartyName: t.buyer.name, unsubscribeUrl: unsubUrl(t.supplierId || ''),
    }));
    results.push(await logAndSend(t.supplier.email || '', `New Order - ${transactionId}`, 'transaction_created', html, { transactionId }));
  }
  return results;
}

export async function sendPaymentConfirmedEmail(transactionId: string): Promise<EmailResult[]> {
  const t = await prisma.transaction.findUnique({ where: { id: transactionId }, include: { buyer: true, supplier: true } });
  if (!t) return [{ success: false, error: 'Transaction not found' }];
  const results: EmailResult[] = [];
  const link = `${BASE_URL}/transactions/${transactionId}`;
  // Buyer
  if (await canSendEmail(t.buyer.email, t.buyer.id, 'paymentNotifications')) {
    const html = await render(PaymentConfirmedEmail({
      partyName: t.buyer.name, isBuyer: true, amount: t.amount.toString(), currency: t.currency || 'USD',
      orderId: transactionId, transactionLink: link, unsubscribeUrl: unsubUrl(t.buyer.id),
    }));
    results.push(await logAndSend(t.buyer.email, 'Payment Confirmed', 'payment_confirmed', html, { transactionId }));
  }
  // Supplier
  if (t.supplier && await canSendEmail(t.supplier.email || '', t.supplierId || '', 'paymentNotifications')) {
    const html = await render(PaymentConfirmedEmail({
      partyName: t.supplier.companyName || 'Supplier', isBuyer: false, amount: t.amount.toString(), currency: t.currency || 'USD',
      orderId: transactionId, transactionLink: link, unsubscribeUrl: unsubUrl(t.supplierId || ''),
    }));
    results.push(await logAndSend(t.supplier.email || '', 'Payment Received - Prepare Order', 'payment_confirmed', html, { transactionId }));
  }
  return results;
}

export async function sendDeliveryReadyEmail(transactionId: string, trackingNumber?: string): Promise<EmailResult> {
  const t = await prisma.transaction.findUnique({ where: { id: transactionId }, include: { buyer: true } });
  if (!t) return { success: false, error: 'Transaction not found' };
  if (!(await canSendEmail(t.buyer.email, t.buyer.id, 'deliveryNotifications'))) return { success: false, error: 'Blocked' };
  const html = await render(DeliveryReadyEmail({
    buyerName: t.buyer.name, trackingNumber, estimatedDelivery: t.estimatedDelivery?.toLocaleDateString() || 'TBD',
    transactionLink: `${BASE_URL}/transactions/${transactionId}`, orderId: transactionId, unsubscribeUrl: unsubUrl(t.buyer.id),
  }));
  return logAndSend(t.buyer.email, 'Your Order Has Shipped!', 'delivery_ready', html, { transactionId, trackingNumber });
}

export async function sendDeliveryConfirmedEmail(transactionId: string): Promise<EmailResult> {
  const t = await prisma.transaction.findUnique({ where: { id: transactionId }, include: { buyer: true, supplier: true } });
  if (!t || !t.supplier) return { success: false, error: 'Transaction not found' };
  if (!(await canSendEmail(t.supplier.email || '', t.supplierId || '', 'deliveryNotifications'))) return { success: false, error: 'Blocked' };
  const html = await render(DeliveryConfirmedEmail({
    sellerName: t.supplier.companyName || 'Supplier', buyerName: t.buyer.name,
    orderId: transactionId, transactionLink: `${BASE_URL}/transactions/${transactionId}`, unsubscribeUrl: unsubUrl(t.supplierId || ''),
  }));
  return logAndSend(t.supplier.email || '', 'Delivery Confirmed', 'delivery_confirmed', html, { transactionId });
}

export async function sendQualityApprovedEmail(transactionId: string): Promise<EmailResult> {
  const t = await prisma.transaction.findUnique({ where: { id: transactionId }, include: { supplier: true } });
  if (!t || !t.supplier) return { success: false, error: 'Transaction not found' };
  if (!(await canSendEmail(t.supplier.email || '', t.supplierId || '', 'transactionNotifications'))) return { success: false, error: 'Blocked' };
  const html = await render(QualityApprovedEmail({
    supplierName: t.supplier.companyName || 'Supplier', amount: t.amount.toString(), currency: t.currency || 'USD',
    orderId: transactionId, transactionLink: `${BASE_URL}/transactions/${transactionId}`, unsubscribeUrl: unsubUrl(t.supplierId || ''),
  }));
  return logAndSend(t.supplier.email || '', 'Quality Approved - Funds Being Released', 'quality_approved', html, { transactionId });
}

export async function sendPaymentReleasedEmail(transactionId: string): Promise<EmailResult> {
  const t = await prisma.transaction.findUnique({ where: { id: transactionId }, include: { supplier: true } });
  if (!t || !t.supplier) return { success: false, error: 'Transaction not found' };
  if (!(await canSendEmail(t.supplier.email || '', t.supplierId || '', 'paymentNotifications'))) return { success: false, error: 'Blocked' };
  const html = await render(PaymentReleasedEmail({
    supplierName: t.supplier.companyName || 'Supplier', amount: t.amount.toString(), currency: t.currency || 'USD',
    orderId: transactionId, transactionLink: `${BASE_URL}/transactions/${transactionId}`, unsubscribeUrl: unsubUrl(t.supplierId || ''),
  }));
  return logAndSend(t.supplier.email || '', 'Payment Released!', 'payment_released', html, { transactionId });
}

export async function sendDisputeOpenedEmail(disputeId: string): Promise<EmailResult[]> {
  const d = await prisma.dispute.findUnique({ where: { id: disputeId }, include: { transaction: { include: { buyer: true, supplier: true } }, filedByUser: true } });
  if (!d || !d.transaction) return [{ success: false, error: 'Dispute not found' }];
  const results: EmailResult[] = [];
  const link = `${BASE_URL}/disputes/${disputeId}`;
  const parties = [d.transaction.buyer, d.transaction.supplier].filter(Boolean);
  for (const party of parties) {
    if (!party) continue;
    const email = 'email' in party ? party.email : (party as { email?: string }).email;
    const id = 'id' in party ? party.id : '';
    const name = 'name' in party ? party.name : (party as { companyName?: string }).companyName || 'Party';
    if (!email || !(await canSendEmail(email, id, 'disputeNotifications'))) continue;
    const isInitiator = d.filedByUserId === id;
    const html = await render(DisputeOpenedEmail({
      recipientName: name, initiatorName: d.filedByUser?.name || 'User', reason: d.reason || 'Not specified',
      orderId: d.transactionId, disputeId, disputeLink: link, isInitiator, unsubscribeUrl: unsubUrl(id),
    }));
    results.push(await logAndSend(email, `Dispute ${isInitiator ? 'Filed' : 'Opened'} - ${d.transactionId}`, 'dispute_opened', html, { disputeId }));
  }
  // Admin alert
  const adminHtml = await render(AdminAlertEmail({ alertType: 'New Dispute Filed', details: { 'Dispute ID': disputeId, 'Transaction': d.transactionId, 'Reason': d.reason || 'N/A' }, actionLink: link, priority: 'high' }));
  results.push(await logAndSend(ADMIN_EMAIL, '[HIGH] New Dispute Filed', 'admin_alert', adminHtml, { disputeId }));
  return results;
}

export async function sendDisputeResolvedEmail(disputeId: string): Promise<EmailResult[]> {
  const d = await prisma.dispute.findUnique({ where: { id: disputeId }, include: { transaction: { include: { buyer: true, supplier: true } } } });
  if (!d || !d.transaction) return [{ success: false, error: 'Dispute not found' }];
  const results: EmailResult[] = [];
  const link = `${BASE_URL}/disputes/${disputeId}`;
  const parties = [d.transaction.buyer, d.transaction.supplier].filter(Boolean);
  for (const party of parties) {
    if (!party) continue;
    const email = 'email' in party ? party.email : (party as { email?: string }).email;
    const id = 'id' in party ? party.id : '';
    const name = 'name' in party ? party.name : (party as { companyName?: string }).companyName || 'Party';
    if (!email || !(await canSendEmail(email, id, 'disputeNotifications'))) continue;
    const html = await render(DisputeResolvedEmail({
      partyName: name, resolution: d.adminDecision || 'Resolved', fundDistribution: d.resolutionReason || 'As per resolution',
      disputeId, orderId: d.transactionId, disputeLink: link, unsubscribeUrl: unsubUrl(id),
    }));
    results.push(await logAndSend(email, 'Dispute Resolved', 'dispute_resolved', html, { disputeId }));
  }
  return results;
}

export async function sendAdminAlertEmail(alertType: string, details: Record<string, string>, priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'): Promise<EmailResult> {
  const html = await render(AdminAlertEmail({ alertType, details, actionLink: `${BASE_URL}/admin`, priority }));
  return logAndSend(ADMIN_EMAIL, `[${priority.toUpperCase()}] ${alertType}`, 'admin_alert', html, { alertType, priority });
}

export async function sendWeeklyDigestEmail(userId: string): Promise<EmailResult> {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { emailPreferences: true } });
  if (!user || !user.emailPreferences?.weeklyDigest) return { success: false, error: 'User not found or digest disabled' };
  if (!(await canSendEmail(user.email, userId, 'weeklyDigest'))) return { success: false, error: 'Blocked' };
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [reqs, quotes, transactions] = await Promise.all([
    prisma.requirement.count({ where: { buyerId: userId, createdAt: { gte: weekAgo } } }),
    prisma.quotation.count({ where: { requirement: { buyerId: userId }, createdAt: { gte: weekAgo } } }),
    prisma.transaction.count({ where: { buyerId: userId, status: 'COMPLETED', updatedAt: { gte: weekAgo } } }),
  ]);
  const pending = await prisma.quotation.count({ where: { requirement: { buyerId: userId }, status: 'PENDING' } });
  const html = await render(WeeklyDigestEmail({
    userName: user.name, weekStats: { newRequirements: reqs, quotesReceived: quotes, quotesAccepted: 0, transactionsCompleted: transactions, totalVolume: '$0', pendingActions: pending },
    digestLink: `${BASE_URL}/dashboard`, unsubscribeUrl: unsubUrl(userId),
  }));
  return logAndSend(user.email, 'Your Weekly Tradewave Digest', 'weekly_digest', html, { userId });
}
