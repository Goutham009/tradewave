import { Resend } from 'resend';
import { render } from '@react-email/components';
import prisma from '@/lib/db';

// Initialize Resend only when API key is available (avoids build-time errors)
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.EMAIL_FROM || 'Tradewave <noreply@tradewave.io>';
const FROM_NAME = process.env.EMAIL_FROM_NAME || 'Tradewave';
const MAX_RETRIES = 3;
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'support@tradewave.com';

export type EmailTemplateName =
  | 'welcome'
  | 'email_verification'
  | 'password_reset'
  | 'quote_received'
  | 'quote_accepted'
  | 'quote_rejected'
  | 'transaction_created'
  | 'transaction_updated'
  | 'payment_received'
  | 'payment_released'
  | 'delivery_update'
  | 'delivery_confirmed'
  | 'dispute_opened'
  | 'dispute_resolved'
  | 'weekly_digest';

export interface SendEmailOptions {
  to: string;
  subject: string;
  template: EmailTemplateName;
  data: Record<string, unknown>;
  userId?: string;
}

export interface EmailResult {
  success: boolean;
  emailLogId?: string;
  resendId?: string;
  error?: string;
}

async function checkEmailPreference(
  userId: string | undefined,
  template: EmailTemplateName
): Promise<boolean> {
  if (!userId) return true;

  const preference = await prisma.emailPreference.findUnique({
    where: { userId },
  });

  if (!preference) return true;
  if (preference.unsubscribedAt) return false;

  const templateToPreference: Record<string, keyof typeof preference> = {
    quote_received: 'quoteNotifications',
    quote_accepted: 'quoteNotifications',
    quote_rejected: 'quoteNotifications',
    transaction_created: 'transactionNotifications',
    transaction_updated: 'transactionNotifications',
    payment_received: 'paymentNotifications',
    payment_released: 'paymentNotifications',
    delivery_update: 'deliveryNotifications',
    delivery_confirmed: 'deliveryNotifications',
    dispute_opened: 'disputeNotifications',
    dispute_resolved: 'disputeNotifications',
    weekly_digest: 'weeklyDigest',
    welcome: 'systemNotifications',
    email_verification: 'systemNotifications',
    password_reset: 'systemNotifications',
  };

  const prefKey = templateToPreference[template];
  if (prefKey && typeof preference[prefKey] === 'boolean') {
    return preference[prefKey] as boolean;
  }

  return true;
}

async function isEmailBounced(email: string): Promise<boolean> {
  const bounce = await prisma.emailBounce.findUnique({
    where: { email },
  });
  return bounce?.bounceType === 'PERMANENT';
}

export async function sendEmail(options: SendEmailOptions): Promise<EmailResult> {
  const { to, subject, template, data, userId } = options;

  try {
    // Check if email is permanently bounced
    if (await isEmailBounced(to)) {
      return {
        success: false,
        error: 'Email address has permanently bounced',
      };
    }

    // Check user preferences
    const canSend = await checkEmailPreference(userId, template);
    if (!canSend) {
      return {
        success: false,
        error: 'User has opted out of this notification type',
      };
    }

    // Create email log entry
    const emailLog = await prisma.emailLog.create({
      data: {
        recipient: to,
        subject,
        templateName: template,
        status: 'PENDING',
        metadata: data as object,
        maxRetries: MAX_RETRIES,
      },
    });

    // Generate email HTML from template
    const html = await generateEmailHtml(template, data);

    // Check if Resend is configured
    if (!resend) {
      console.warn('Resend not configured - email not sent:', { to, subject });
      await prisma.emailLog.update({
        where: { id: emailLog.id },
        data: { status: 'FAILED', failureReason: 'Email service not configured' },
      });
      return { success: false, error: 'Email service not configured' };
    }

    // Send via Resend
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    if (result.error) {
      await prisma.emailLog.update({
        where: { id: emailLog.id },
        data: {
          status: 'FAILED',
          failureReason: result.error.message,
          retryCount: 1,
        },
      });

      return {
        success: false,
        emailLogId: emailLog.id,
        error: result.error.message,
      };
    }

    // Update log with success
    await prisma.emailLog.update({
      where: { id: emailLog.id },
      data: {
        status: 'SENT',
        sentAt: new Date(),
        resendId: result.data?.id,
      },
    });

    return {
      success: true,
      emailLogId: emailLog.id,
      resendId: result.data?.id,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function retryFailedEmails(): Promise<{ processed: number; succeeded: number }> {
  const failedEmails = await prisma.emailLog.findMany({
    where: {
      status: 'FAILED',
      retryCount: { lt: prisma.emailLog.fields.maxRetries },
    },
    take: 50,
  });

  let succeeded = 0;

  // Check if Resend is configured
  if (!resend) {
    console.warn('Resend not configured - cannot retry emails');
    return { processed: 0, succeeded: 0 };
  }

  for (const emailLog of failedEmails) {
    try {
      const html = await generateEmailHtml(
        emailLog.templateName as EmailTemplateName,
        emailLog.metadata as Record<string, unknown>
      );

      const result = await resend.emails.send({
        from: FROM_EMAIL,
        to: emailLog.recipient,
        subject: emailLog.subject,
        html,
      });

      if (result.error) {
        await prisma.emailLog.update({
          where: { id: emailLog.id },
          data: {
            retryCount: { increment: 1 },
            failureReason: result.error.message,
          },
        });
      } else {
        await prisma.emailLog.update({
          where: { id: emailLog.id },
          data: {
            status: 'SENT',
            sentAt: new Date(),
            resendId: result.data?.id,
          },
        });
        succeeded++;
      }
    } catch (error) {
      await prisma.emailLog.update({
        where: { id: emailLog.id },
        data: {
          retryCount: { increment: 1 },
          failureReason: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  }

  return { processed: failedEmails.length, succeeded };
}

export async function handleBounce(
  email: string,
  bounceType: 'PERMANENT' | 'TEMPORARY',
  reason?: string
): Promise<void> {
  await prisma.emailBounce.upsert({
    where: { email },
    create: {
      email,
      bounceType,
      reason,
      bouncedAt: new Date(),
    },
    update: {
      bounceType,
      reason,
      bouncedAt: new Date(),
    },
  });

  // Update any pending emails for this address
  if (bounceType === 'PERMANENT') {
    await prisma.emailLog.updateMany({
      where: {
        recipient: email,
        status: 'PENDING',
      },
      data: {
        status: 'BOUNCED',
        failureReason: `Permanent bounce: ${reason || 'Unknown'}`,
      },
    });
  }
}

async function generateEmailHtml(
  template: EmailTemplateName,
  data: Record<string, unknown>
): Promise<string> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tradewave.io';
  const unsubscribeUrl = `${baseUrl}/unsubscribe`;

  const templates: Record<EmailTemplateName, () => string> = {
    welcome: () => welcomeTemplate(data, baseUrl, unsubscribeUrl),
    email_verification: () => emailVerificationTemplate(data, baseUrl),
    password_reset: () => passwordResetTemplate(data, baseUrl),
    quote_received: () => quoteReceivedTemplate(data, baseUrl, unsubscribeUrl),
    quote_accepted: () => quoteAcceptedTemplate(data, baseUrl, unsubscribeUrl),
    quote_rejected: () => quoteRejectedTemplate(data, baseUrl, unsubscribeUrl),
    transaction_created: () => transactionCreatedTemplate(data, baseUrl, unsubscribeUrl),
    transaction_updated: () => transactionUpdatedTemplate(data, baseUrl, unsubscribeUrl),
    payment_received: () => paymentReceivedTemplate(data, baseUrl, unsubscribeUrl),
    payment_released: () => paymentReleasedTemplate(data, baseUrl, unsubscribeUrl),
    delivery_update: () => deliveryUpdateTemplate(data, baseUrl, unsubscribeUrl),
    delivery_confirmed: () => deliveryConfirmedTemplate(data, baseUrl, unsubscribeUrl),
    dispute_opened: () => disputeOpenedTemplate(data, baseUrl, unsubscribeUrl),
    dispute_resolved: () => disputeResolvedTemplate(data, baseUrl, unsubscribeUrl),
    weekly_digest: () => weeklyDigestTemplate(data, baseUrl, unsubscribeUrl),
  };

  return templates[template]();
}

// Base email wrapper
function emailWrapper(content: string, unsubscribeUrl?: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tradewave</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f4f4f5; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); padding: 32px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; }
    .content { padding: 32px; }
    .button { display: inline-block; background: #0ea5e9; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 16px 0; }
    .button:hover { background: #0284c7; }
    .footer { background: #f4f4f5; padding: 24px; text-align: center; font-size: 12px; color: #71717a; }
    .info-box { background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 16px; margin: 16px 0; border-radius: 0 8px 8px 0; }
    .warning-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 16px 0; border-radius: 0 8px 8px 0; }
    .success-box { background: #dcfce7; border-left: 4px solid #22c55e; padding: 16px; margin: 16px 0; border-radius: 0 8px 8px 0; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e4e4e7; }
    th { background: #f4f4f5; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Tradewave</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Tradewave. All rights reserved.</p>
      <p>B2B Trade & Logistics Platform</p>
      ${unsubscribeUrl ? `<p><a href="${unsubscribeUrl}" style="color: #71717a;">Unsubscribe from emails</a></p>` : ''}
    </div>
  </div>
</body>
</html>`;
}

// Email Templates
function welcomeTemplate(data: Record<string, unknown>, baseUrl: string, unsubscribeUrl: string): string {
  const name = data.name as string || 'there';
  return emailWrapper(`
    <h2>Welcome to Tradewave, ${name}! 🎉</h2>
    <p>Thank you for joining Tradewave, the B2B trade and logistics platform that connects buyers with verified suppliers.</p>
    <div class="info-box">
      <strong>What you can do:</strong>
      <ul>
        <li>Post requirements and receive competitive quotes</li>
        <li>Connect with verified suppliers worldwide</li>
        <li>Track transactions with blockchain transparency</li>
        <li>Manage payments securely through escrow</li>
      </ul>
    </div>
    <p style="text-align: center;">
      <a href="${baseUrl}/dashboard" class="button">Go to Dashboard</a>
    </p>
    <p>If you have any questions, our support team is here to help.</p>
  `, unsubscribeUrl);
}

function emailVerificationTemplate(data: Record<string, unknown>, baseUrl: string): string {
  const token = data.token as string;
  const verifyUrl = `${baseUrl}/verify-email?token=${token}`;
  return emailWrapper(`
    <h2>Verify Your Email Address</h2>
    <p>Please click the button below to verify your email address and activate your Tradewave account.</p>
    <p style="text-align: center;">
      <a href="${verifyUrl}" class="button">Verify Email</a>
    </p>
    <p style="font-size: 12px; color: #71717a;">This link will expire in 24 hours. If you didn't create an account, you can ignore this email.</p>
  `);
}

function passwordResetTemplate(data: Record<string, unknown>, baseUrl: string): string {
  const token = data.token as string;
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;
  return emailWrapper(`
    <h2>Reset Your Password</h2>
    <p>We received a request to reset your password. Click the button below to create a new password.</p>
    <p style="text-align: center;">
      <a href="${resetUrl}" class="button">Reset Password</a>
    </p>
    <div class="warning-box">
      <strong>Security Notice:</strong> This link will expire in 1 hour. If you didn't request this, please ignore this email or contact support if you're concerned about your account security.
    </div>
  `);
}

function quoteReceivedTemplate(data: Record<string, unknown>, baseUrl: string, unsubscribeUrl: string): string {
  const quoteId = data.quoteId as string;
  const requirementTitle = data.requirementTitle as string;
  const supplierName = data.supplierName as string;
  const amount = data.amount as string;
  return emailWrapper(`
    <h2>New Quote Received 📋</h2>
    <p>You've received a new quote for your requirement.</p>
    <table>
      <tr><th>Requirement</th><td>${requirementTitle}</td></tr>
      <tr><th>Supplier</th><td>${supplierName}</td></tr>
      <tr><th>Quote Amount</th><td><strong>${amount}</strong></td></tr>
    </table>
    <p style="text-align: center;">
      <a href="${baseUrl}/quotations/${quoteId}" class="button">View Quote</a>
    </p>
  `, unsubscribeUrl);
}

function quoteAcceptedTemplate(data: Record<string, unknown>, baseUrl: string, unsubscribeUrl: string): string {
  const quoteId = data.quoteId as string;
  const requirementTitle = data.requirementTitle as string;
  const buyerName = data.buyerName as string;
  return emailWrapper(`
    <h2>Quote Accepted! 🎉</h2>
    <div class="success-box">
      <strong>Great news!</strong> Your quote has been accepted.
    </div>
    <table>
      <tr><th>Requirement</th><td>${requirementTitle}</td></tr>
      <tr><th>Buyer</th><td>${buyerName}</td></tr>
    </table>
    <p>A new transaction has been created. Please proceed with the next steps.</p>
    <p style="text-align: center;">
      <a href="${baseUrl}/quotations/${quoteId}" class="button">View Details</a>
    </p>
  `, unsubscribeUrl);
}

function quoteRejectedTemplate(data: Record<string, unknown>, baseUrl: string, unsubscribeUrl: string): string {
  const requirementTitle = data.requirementTitle as string;
  const reason = data.reason as string || 'No reason provided';
  return emailWrapper(`
    <h2>Quote Update</h2>
    <p>Unfortunately, your quote for "${requirementTitle}" was not accepted.</p>
    ${reason !== 'No reason provided' ? `<div class="info-box"><strong>Feedback:</strong> ${reason}</div>` : ''}
    <p>Don't be discouraged! Continue responding to requirements to find the right opportunities.</p>
    <p style="text-align: center;">
      <a href="${baseUrl}/requirements" class="button">Browse Requirements</a>
    </p>
  `, unsubscribeUrl);
}

function transactionCreatedTemplate(data: Record<string, unknown>, baseUrl: string, unsubscribeUrl: string): string {
  const transactionId = data.transactionId as string;
  const requirementTitle = data.requirementTitle as string;
  const amount = data.amount as string;
  return emailWrapper(`
    <h2>New Transaction Created 📦</h2>
    <p>A new transaction has been created for your order.</p>
    <table>
      <tr><th>Transaction ID</th><td>${transactionId}</td></tr>
      <tr><th>Item</th><td>${requirementTitle}</td></tr>
      <tr><th>Amount</th><td><strong>${amount}</strong></td></tr>
    </table>
    <p style="text-align: center;">
      <a href="${baseUrl}/transactions/${transactionId}" class="button">View Transaction</a>
    </p>
  `, unsubscribeUrl);
}

function transactionUpdatedTemplate(data: Record<string, unknown>, baseUrl: string, unsubscribeUrl: string): string {
  const transactionId = data.transactionId as string;
  const status = data.status as string;
  const updateMessage = data.message as string || 'The transaction status has been updated.';
  return emailWrapper(`
    <h2>Transaction Update</h2>
    <div class="info-box">
      <strong>Status:</strong> ${status}
    </div>
    <p>${updateMessage}</p>
    <p style="text-align: center;">
      <a href="${baseUrl}/transactions/${transactionId}" class="button">View Transaction</a>
    </p>
  `, unsubscribeUrl);
}

function paymentReceivedTemplate(data: Record<string, unknown>, baseUrl: string, unsubscribeUrl: string): string {
  const transactionId = data.transactionId as string;
  const amount = data.amount as string;
  return emailWrapper(`
    <h2>Payment Received 💰</h2>
    <div class="success-box">
      <strong>Payment Confirmed!</strong> We've received your payment of ${amount}.
    </div>
    <p>The funds are now held securely in escrow until the transaction is completed.</p>
    <p style="text-align: center;">
      <a href="${baseUrl}/transactions/${transactionId}" class="button">View Transaction</a>
    </p>
  `, unsubscribeUrl);
}

function paymentReleasedTemplate(data: Record<string, unknown>, baseUrl: string, unsubscribeUrl: string): string {
  const transactionId = data.transactionId as string;
  const amount = data.amount as string;
  return emailWrapper(`
    <h2>Payment Released 🎉</h2>
    <div class="success-box">
      <strong>Funds Released!</strong> ${amount} has been released from escrow.
    </div>
    <p>The payment has been processed and will be credited to your account.</p>
    <p style="text-align: center;">
      <a href="${baseUrl}/transactions/${transactionId}" class="button">View Transaction</a>
    </p>
  `, unsubscribeUrl);
}

function deliveryUpdateTemplate(data: Record<string, unknown>, baseUrl: string, unsubscribeUrl: string): string {
  const transactionId = data.transactionId as string;
  const status = data.status as string;
  const location = data.location as string || 'In transit';
  const eta = data.eta as string || 'To be confirmed';
  return emailWrapper(`
    <h2>Delivery Update 🚚</h2>
    <table>
      <tr><th>Status</th><td>${status}</td></tr>
      <tr><th>Location</th><td>${location}</td></tr>
      <tr><th>ETA</th><td>${eta}</td></tr>
    </table>
    <p style="text-align: center;">
      <a href="${baseUrl}/transactions/${transactionId}" class="button">Track Shipment</a>
    </p>
  `, unsubscribeUrl);
}

function deliveryConfirmedTemplate(data: Record<string, unknown>, baseUrl: string, unsubscribeUrl: string): string {
  const transactionId = data.transactionId as string;
  return emailWrapper(`
    <h2>Delivery Confirmed ✅</h2>
    <div class="success-box">
      <strong>Order Delivered!</strong> Your shipment has been successfully delivered.
    </div>
    <p>Please confirm receipt and inspect the goods. If everything is satisfactory, you can release the payment to the supplier.</p>
    <p style="text-align: center;">
      <a href="${baseUrl}/transactions/${transactionId}" class="button">Confirm & Release Payment</a>
    </p>
  `, unsubscribeUrl);
}

function disputeOpenedTemplate(data: Record<string, unknown>, baseUrl: string, unsubscribeUrl: string): string {
  const disputeId = data.disputeId as string;
  const transactionId = data.transactionId as string;
  const reason = data.reason as string;
  return emailWrapper(`
    <h2>Dispute Opened ⚠️</h2>
    <div class="warning-box">
      <strong>A dispute has been opened</strong> for transaction ${transactionId}.
    </div>
    <p><strong>Reason:</strong> ${reason}</p>
    <p>Our team will review the dispute and may reach out for additional information. Please respond promptly to help resolve this matter.</p>
    <p style="text-align: center;">
      <a href="${baseUrl}/disputes/${disputeId}" class="button">View Dispute</a>
    </p>
  `, unsubscribeUrl);
}

function disputeResolvedTemplate(data: Record<string, unknown>, baseUrl: string, unsubscribeUrl: string): string {
  const disputeId = data.disputeId as string;
  const resolution = data.resolution as string;
  const outcome = data.outcome as string;
  return emailWrapper(`
    <h2>Dispute Resolved ✅</h2>
    <div class="success-box">
      <strong>The dispute has been resolved.</strong>
    </div>
    <table>
      <tr><th>Outcome</th><td>${outcome}</td></tr>
      <tr><th>Resolution</th><td>${resolution}</td></tr>
    </table>
    <p style="text-align: center;">
      <a href="${baseUrl}/disputes/${disputeId}" class="button">View Details</a>
    </p>
  `, unsubscribeUrl);
}

function weeklyDigestTemplate(data: Record<string, unknown>, baseUrl: string, unsubscribeUrl: string): string {
  const name = data.name as string || 'there';
  const stats = data.stats as {
    newRequirements?: number;
    quotesReceived?: number;
    transactionsCompleted?: number;
    totalVolume?: string;
  } || {};
  return emailWrapper(`
    <h2>Your Weekly Digest 📊</h2>
    <p>Hi ${name}, here's your weekly summary from Tradewave:</p>
    <table>
      <tr><th>New Requirements</th><td>${stats.newRequirements || 0}</td></tr>
      <tr><th>Quotes Received</th><td>${stats.quotesReceived || 0}</td></tr>
      <tr><th>Transactions Completed</th><td>${stats.transactionsCompleted || 0}</td></tr>
      <tr><th>Total Volume</th><td>${stats.totalVolume || '$0'}</td></tr>
    </table>
    <p style="text-align: center;">
      <a href="${baseUrl}/dashboard" class="button">View Dashboard</a>
    </p>
  `, unsubscribeUrl);
}

export default {
  sendEmail,
  retryFailedEmails,
  handleBounce,
};
