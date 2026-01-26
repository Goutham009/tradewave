// Trust Score & Blacklist Email Templates

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://tradewave.io';

// Buyer Emails
export const trustScoreAlertTemplate = (data: {
  buyerName: string;
  previousScore: number;
  newScore: number;
  scoreDrop: number;
  riskLevel: string;
}) => ({
  subject: `Trust Score Alert: Your score dropped by ${data.scoreDrop} points`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Trust Score Alert</h2>
      <p>Dear ${data.buyerName},</p>
      <p>Your buyer trust score has decreased significantly.</p>
      
      <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #fecaca;">
        <p><strong>Previous Score:</strong> ${data.previousScore}/100</p>
        <p><strong>New Score:</strong> ${data.newScore}/100</p>
        <p><strong>Change:</strong> -${data.scoreDrop} points</p>
        <p><strong>Risk Level:</strong> ${data.riskLevel}</p>
      </div>
      
      <p>This may affect your ability to transact with sellers. Please review your recent activity and contact support if you believe this is an error.</p>
      
      <a href="${BASE_URL}/account/trust-score" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
        View Details
      </a>
    </div>
  `
});

export const newFlagNotificationTemplate = (data: {
  buyerName: string;
  flagType: string;
  severity: string;
  description: string;
}) => ({
  subject: `New Risk Flag Added to Your Account`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #ea580c;">Risk Flag Notification</h2>
      <p>Dear ${data.buyerName},</p>
      <p>A new risk flag has been added to your account.</p>
      
      <div style="background: #fff7ed; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #fed7aa;">
        <p><strong>Flag Type:</strong> ${data.flagType.replace(/_/g, ' ')}</p>
        <p><strong>Severity:</strong> ${data.severity}</p>
        <p><strong>Details:</strong> ${data.description}</p>
      </div>
      
      <p>If you believe this flag is incorrect, you can submit an appeal.</p>
      
      <a href="${BASE_URL}/account/appeals" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
        Submit Appeal
      </a>
    </div>
  `
});

export const flagAppealSubmittedTemplate = (data: {
  buyerName: string;
  flagType: string;
  appealId: string;
}) => ({
  subject: `Appeal Submitted Successfully`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Appeal Submitted</h2>
      <p>Dear ${data.buyerName},</p>
      <p>Your appeal has been submitted and is under review.</p>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Appeal ID:</strong> ${data.appealId}</p>
        <p><strong>Flag Type:</strong> ${data.flagType.replace(/_/g, ' ')}</p>
        <p><strong>Status:</strong> Pending Review</p>
      </div>
      
      <p>We will notify you once a decision has been made.</p>
    </div>
  `
});

export const flagAppealApprovedTemplate = (data: {
  buyerName: string;
  flagType: string;
  adminDecision: string;
}) => ({
  subject: `Good News: Your Appeal Was Approved`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #16a34a;">Appeal Approved!</h2>
      <p>Dear ${data.buyerName},</p>
      <p>Great news! Your appeal has been approved and the flag has been removed from your account.</p>
      
      <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #86efac;">
        <p><strong>Flag Type:</strong> ${data.flagType.replace(/_/g, ' ')}</p>
        <p><strong>Decision:</strong> ${data.adminDecision}</p>
      </div>
      
      <p>Your trust score may be recalculated to reflect this change.</p>
    </div>
  `
});

export const flagAppealRejectedTemplate = (data: {
  buyerName: string;
  flagType: string;
  adminDecision: string;
}) => ({
  subject: `Appeal Decision: Not Approved`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #6b7280;">Appeal Decision</h2>
      <p>Dear ${data.buyerName},</p>
      <p>After careful review, your appeal was not approved.</p>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Flag Type:</strong> ${data.flagType.replace(/_/g, ' ')}</p>
        <p><strong>Decision:</strong> ${data.adminDecision}</p>
      </div>
      
      <p>If you have additional evidence, you may submit a new appeal.</p>
    </div>
  `
});

export const blacklistNotificationTemplate = (data: {
  buyerName: string;
  reason: string;
  description: string;
  severity: string;
  expiresAt?: string;
}) => ({
  subject: `Important: Account Blacklisted`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Account Blacklisted</h2>
      <p>Dear ${data.buyerName},</p>
      <p>Your account has been added to the blacklist.</p>
      
      <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #fecaca;">
        <p><strong>Reason:</strong> ${data.reason.replace(/_/g, ' ')}</p>
        <p><strong>Details:</strong> ${data.description}</p>
        <p><strong>Type:</strong> ${data.severity}</p>
        ${data.expiresAt ? `<p><strong>Expires:</strong> ${data.expiresAt}</p>` : '<p><strong>Duration:</strong> Permanent</p>'}
      </div>
      
      <p>While blacklisted, you will not be able to make purchases on the platform. You may submit an appeal if you believe this is an error.</p>
      
      <a href="${BASE_URL}/account/appeals/blacklist" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
        Submit Appeal
      </a>
    </div>
  `
});

export const blacklistAppealSubmittedTemplate = (data: {
  buyerName: string;
  appealId: string;
}) => ({
  subject: `Blacklist Appeal Submitted`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Blacklist Appeal Submitted</h2>
      <p>Dear ${data.buyerName},</p>
      <p>Your blacklist appeal has been submitted and is under review.</p>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Appeal ID:</strong> ${data.appealId}</p>
        <p><strong>Status:</strong> Pending Review</p>
      </div>
      
      <p>We will notify you once a decision has been made. This process may take 3-5 business days.</p>
    </div>
  `
});

export const blacklistAppealApprovedTemplate = (data: {
  buyerName: string;
  adminDecision: string;
}) => ({
  subject: `Blacklist Appeal Approved - Account Reinstated`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #16a34a;">Account Reinstated!</h2>
      <p>Dear ${data.buyerName},</p>
      <p>Great news! Your blacklist appeal has been approved and your account has been reinstated.</p>
      
      <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #86efac;">
        <p><strong>Decision:</strong> ${data.adminDecision}</p>
      </div>
      
      <p>You can now resume normal trading activities on the platform.</p>
      
      <a href="${BASE_URL}/dashboard" style="display: inline-block; background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
        Go to Dashboard
      </a>
    </div>
  `
});

export const blacklistAppealRejectedTemplate = (data: {
  buyerName: string;
  adminDecision: string;
}) => ({
  subject: `Blacklist Appeal Decision: Not Approved`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #6b7280;">Appeal Decision</h2>
      <p>Dear ${data.buyerName},</p>
      <p>After careful review, your blacklist appeal was not approved.</p>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Decision:</strong> ${data.adminDecision}</p>
      </div>
      
      <p>If you have additional evidence or circumstances have changed, you may submit a new appeal after 30 days.</p>
    </div>
  `
});

export const unblacklistedTemplate = (data: {
  buyerName: string;
  reason?: string;
}) => ({
  subject: `Account Removed from Blacklist`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #16a34a;">Account Reinstated</h2>
      <p>Dear ${data.buyerName},</p>
      <p>Your account has been removed from the blacklist.</p>
      
      ${data.reason ? `
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Reason:</strong> ${data.reason}</p>
      </div>
      ` : ''}
      
      <p>You can now resume normal trading activities on the platform.</p>
      
      <a href="${BASE_URL}/dashboard" style="display: inline-block; background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
        Go to Dashboard
      </a>
    </div>
  `
});

// Seller Emails
export const buyerRiskAlertTemplate = (data: {
  sellerName: string;
  buyerCompany: string;
  riskLevel: string;
  trustScore: number;
  transactionId?: string;
}) => ({
  subject: `High-Risk Buyer Alert: ${data.buyerCompany}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #ea580c;">Buyer Risk Alert</h2>
      <p>Dear ${data.sellerName},</p>
      <p>A buyer you've transacted with has a high risk rating. Please review carefully before proceeding.</p>
      
      <div style="background: #fff7ed; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #fed7aa;">
        <p><strong>Buyer:</strong> ${data.buyerCompany}</p>
        <p><strong>Risk Level:</strong> ${data.riskLevel}</p>
        <p><strong>Trust Score:</strong> ${data.trustScore}/100</p>
      </div>
      
      <a href="${BASE_URL}/seller/trust" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
        View Buyer Details
      </a>
    </div>
  `
});

export const buyerFlaggedTemplate = (data: {
  sellerName: string;
  buyerCompany: string;
  flagType: string;
  severity: string;
}) => ({
  subject: `Buyer Flagged: ${data.buyerCompany}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #ea580c;">Buyer Risk Flag</h2>
      <p>Dear ${data.sellerName},</p>
      <p>A buyer you've transacted with has been flagged for suspicious activity.</p>
      
      <div style="background: #fff7ed; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #fed7aa;">
        <p><strong>Buyer:</strong> ${data.buyerCompany}</p>
        <p><strong>Flag Type:</strong> ${data.flagType.replace(/_/g, ' ')}</p>
        <p><strong>Severity:</strong> ${data.severity}</p>
      </div>
      
      <p>Exercise caution with any pending transactions with this buyer.</p>
    </div>
  `
});

export const buyerBlacklistedSellerTemplate = (data: {
  sellerName: string;
  buyerCompany: string;
  reason: string;
}) => ({
  subject: `Buyer Blacklisted: ${data.buyerCompany}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Buyer Blacklisted</h2>
      <p>Dear ${data.sellerName},</p>
      <p>A buyer you've transacted with has been added to the platform blacklist.</p>
      
      <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #fecaca;">
        <p><strong>Buyer:</strong> ${data.buyerCompany}</p>
        <p><strong>Reason:</strong> ${data.reason.replace(/_/g, ' ')}</p>
      </div>
      
      <p>Any pending transactions with this buyer may be affected. Please contact support if you have concerns.</p>
    </div>
  `
});

export const chargebackInitiatedTemplate = (data: {
  sellerName: string;
  buyerCompany: string;
  transactionId: string;
  amount: string;
  currency: string;
}) => ({
  subject: `Chargeback Initiated by ${data.buyerCompany}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Chargeback Alert</h2>
      <p>Dear ${data.sellerName},</p>
      <p>A buyer has initiated a chargeback on a transaction.</p>
      
      <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #fecaca;">
        <p><strong>Buyer:</strong> ${data.buyerCompany}</p>
        <p><strong>Transaction:</strong> ${data.transactionId}</p>
        <p><strong>Amount:</strong> ${data.currency} ${data.amount}</p>
      </div>
      
      <p>Please gather any evidence (shipping proof, communications, etc.) to dispute this chargeback.</p>
      
      <a href="${BASE_URL}/transactions/${data.transactionId}" style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
        View Transaction
      </a>
    </div>
  `
});

// Admin Emails
export const fraudPatternDetectedTemplate = (data: {
  patternType: string;
  affectedBuyers: number;
  description: string;
}) => ({
  subject: `[URGENT] Fraud Pattern Detected: ${data.patternType}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Fraud Pattern Detected</h2>
      <p>The system has detected a suspicious pattern that requires immediate attention.</p>
      
      <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #fecaca;">
        <p><strong>Pattern Type:</strong> ${data.patternType}</p>
        <p><strong>Affected Buyers:</strong> ${data.affectedBuyers}</p>
        <p><strong>Description:</strong> ${data.description}</p>
      </div>
      
      <a href="${BASE_URL}/admin/trust" style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
        Review Now
      </a>
    </div>
  `
});

export const appealPendingReviewTemplate = (data: {
  appealType: string;
  buyerName: string;
  buyerCompany: string;
  submittedAt: string;
}) => ({
  subject: `New ${data.appealType} Appeal Requires Review`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #7c3aed;">Appeal Pending Review</h2>
      <p>A new appeal has been submitted and requires your review.</p>
      
      <div style="background: #f5f3ff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #c4b5fd;">
        <p><strong>Type:</strong> ${data.appealType}</p>
        <p><strong>Buyer:</strong> ${data.buyerCompany} (${data.buyerName})</p>
        <p><strong>Submitted:</strong> ${data.submittedAt}</p>
      </div>
      
      <a href="${BASE_URL}/admin/trust/appeals" style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
        Review Appeal
      </a>
    </div>
  `
});

export const bulkFlagSummaryTemplate = (data: {
  flagCount: number;
  flagType: string;
  reason: string;
  performedBy: string;
}) => ({
  subject: `Bulk Flag Action: ${data.flagCount} Buyers Flagged`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #ea580c;">Bulk Flag Summary</h2>
      <p>A bulk flagging action has been performed.</p>
      
      <div style="background: #fff7ed; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #fed7aa;">
        <p><strong>Buyers Flagged:</strong> ${data.flagCount}</p>
        <p><strong>Flag Type:</strong> ${data.flagType}</p>
        <p><strong>Reason:</strong> ${data.reason}</p>
        <p><strong>Performed By:</strong> ${data.performedBy}</p>
      </div>
      
      <a href="${BASE_URL}/admin/trust/flags" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
        View Flags
      </a>
    </div>
  `
});
