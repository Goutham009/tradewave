// Email service exports
export { sendEmail, retryFailedEmails, handleBounce } from './service';
export type { EmailTemplateName, SendEmailOptions, EmailResult } from './service';

// Email trigger helpers
export {
  sendWelcomeEmail,
  sendQuoteReceivedEmail,
  sendQuoteExpiringEmail,
  sendQuoteAcceptedEmail,
  sendTransactionCreatedEmail,
  sendPaymentConfirmedEmail,
  sendDeliveryReadyEmail,
  sendDeliveryConfirmedEmail,
  sendQualityApprovedEmail,
  sendPaymentReleasedEmail,
  sendDisputeOpenedEmail,
  sendDisputeResolvedEmail,
  sendAdminAlertEmail,
  sendWeeklyDigestEmail,
} from './triggers';
