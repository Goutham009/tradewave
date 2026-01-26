// KYB Email Templates

export const kybSubmittedAdminTemplate = (data: {
  businessName: string;
  country: string;
  contactEmail: string;
  submittedAt: string;
  kybId: string;
}) => ({
  subject: `New KYB Submission: ${data.businessName} (${data.country})`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1e40af;">New KYB Verification Request</h2>
      <p>A new business verification application has been submitted and requires review.</p>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Business Details</h3>
        <p><strong>Business Name:</strong> ${data.businessName}</p>
        <p><strong>Country:</strong> ${data.country}</p>
        <p><strong>Contact:</strong> ${data.contactEmail}</p>
        <p><strong>Submitted:</strong> ${data.submittedAt}</p>
      </div>
      
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/kyb/${data.kybId}" 
         style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
        Review Application
      </a>
      
      <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
        This is an automated notification from Tradewave.
      </p>
    </div>
  `
});

export const kybApprovedTemplate = (data: {
  businessName: string;
  userName: string;
  badgeType: string;
  trustScore: number;
  expiresAt: string;
}) => ({
  subject: `KYB Verified: ${data.businessName} is now verified!`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #16a34a;">Congratulations! Your Business is Verified</h2>
      <p>Dear ${data.userName},</p>
      <p>We're pleased to inform you that your business verification (KYB) for <strong>${data.businessName}</strong> has been approved.</p>
      
      <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #86efac;">
        <h3 style="margin-top: 0; color: #16a34a;">Verification Badge Earned</h3>
        <p><strong>Badge Type:</strong> ${data.badgeType}</p>
        <p><strong>Trust Score:</strong> ${data.trustScore}/100</p>
        <p><strong>Valid Until:</strong> ${data.expiresAt}</p>
      </div>
      
      <h3>What's Next?</h3>
      <ul>
        <li>Your verification badge is now displayed on your profile</li>
        <li>You have access to all platform features</li>
        <li>Trading partners can see your verified status</li>
        <li>Remember to renew your verification before it expires</li>
      </ul>
      
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/kyb/status" 
         style="display: inline-block; background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
        View Verification Status
      </a>
      
      <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
        Thank you for choosing Tradewave. If you have any questions, please contact our support team.
      </p>
    </div>
  `
});

export const kybRejectedTemplate = (data: {
  businessName: string;
  userName: string;
  rejectionReason: string;
}) => ({
  subject: `KYB Review: Action Required for ${data.businessName}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">KYB Verification Not Approved</h2>
      <p>Dear ${data.userName},</p>
      <p>We regret to inform you that your business verification application for <strong>${data.businessName}</strong> was not approved at this time.</p>
      
      <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #fecaca;">
        <h3 style="margin-top: 0; color: #dc2626;">Reason for Rejection</h3>
        <p>${data.rejectionReason}</p>
      </div>
      
      <h3>What Can You Do?</h3>
      <ul>
        <li>Review the rejection reason carefully</li>
        <li>Address the issues mentioned</li>
        <li>Gather any required additional documentation</li>
        <li>Submit a new application with correct information</li>
      </ul>
      
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/kyb/submit" 
         style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
        Submit New Application
      </a>
      
      <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
        If you believe this decision was made in error, please contact our support team.
      </p>
    </div>
  `
});

export const kybDocumentsRequiredTemplate = (data: {
  businessName: string;
  userName: string;
  adminNotes: string;
}) => ({
  subject: `Action Required: Additional Documents Needed for ${data.businessName}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #ea580c;">Additional Documents Required</h2>
      <p>Dear ${data.userName},</p>
      <p>Your KYB verification for <strong>${data.businessName}</strong> is under review, but we need additional documentation to proceed.</p>
      
      <div style="background: #fff7ed; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #fed7aa;">
        <h3 style="margin-top: 0; color: #ea580c;">Reviewer Notes</h3>
        <p>${data.adminNotes || 'Please upload the required documents to complete your verification.'}</p>
      </div>
      
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/kyb/status" 
         style="display: inline-block; background: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
        Upload Documents
      </a>
      
      <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
        Please upload the required documents as soon as possible to avoid delays in your verification.
      </p>
    </div>
  `
});

export const kybBadgeEarnedTemplate = (data: {
  businessName: string;
  userName: string;
  badgeType: string;
  trustScore: number;
}) => ({
  subject: `${data.badgeType} Badge Earned: ${data.businessName}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #ca8a04;">🏆 New Verification Badge Earned!</h2>
      <p>Dear ${data.userName},</p>
      <p>Congratulations! <strong>${data.businessName}</strong> has earned a new verification badge.</p>
      
      <div style="background: #fefce8; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #fde047; text-align: center;">
        <h1 style="margin: 0; font-size: 48px;">🏅</h1>
        <h2 style="margin: 10px 0; color: #ca8a04;">${data.badgeType} VERIFIED</h2>
        <p style="margin: 0;">Trust Score: <strong>${data.trustScore}/100</strong></p>
      </div>
      
      <p>This badge demonstrates your commitment to business transparency and builds trust with your trading partners.</p>
      
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/kyb/status" 
         style="display: inline-block; background: #ca8a04; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
        View Your Badge
      </a>
    </div>
  `
});

export const kybExpirationReminderTemplate = (data: {
  businessName: string;
  userName: string;
  expiresAt: string;
  daysRemaining: number;
}) => ({
  subject: `KYB Expiring Soon: ${data.businessName} (${data.daysRemaining} days remaining)`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #ea580c;">⚠️ KYB Verification Expiring Soon</h2>
      <p>Dear ${data.userName},</p>
      <p>Your business verification for <strong>${data.businessName}</strong> will expire in <strong>${data.daysRemaining} days</strong>.</p>
      
      <div style="background: #fff7ed; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #fed7aa;">
        <p><strong>Expiration Date:</strong> ${data.expiresAt}</p>
        <p><strong>Days Remaining:</strong> ${data.daysRemaining}</p>
      </div>
      
      <p>To maintain your verified status and continue enjoying all platform benefits, please renew your verification before it expires.</p>
      
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/kyb/submit" 
         style="display: inline-block; background: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
        Renew Verification
      </a>
      
      <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
        If your verification expires, your badge will be removed and some platform features may be restricted.
      </p>
    </div>
  `
});

export const kybSuspendedTemplate = (data: {
  businessName: string;
  userName: string;
  reason: string;
}) => ({
  subject: `Important: ${data.businessName} Verification Suspended`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">⛔ KYB Verification Suspended</h2>
      <p>Dear ${data.userName},</p>
      <p>We regret to inform you that the verification for <strong>${data.businessName}</strong> has been suspended.</p>
      
      <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #fecaca;">
        <h3 style="margin-top: 0; color: #dc2626;">Reason</h3>
        <p>${data.reason}</p>
      </div>
      
      <p>While suspended:</p>
      <ul>
        <li>Your verification badge will not be displayed</li>
        <li>Some platform features may be restricted</li>
        <li>Trading partners will not see verified status</li>
      </ul>
      
      <p>If you believe this suspension was made in error or would like to appeal, please contact our support team immediately.</p>
      
      <a href="mailto:support@tradewave.io" 
         style="display: inline-block; background: #6b7280; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
        Contact Support
      </a>
    </div>
  `
});

export const kybDocumentVerificationFailedTemplate = (data: {
  businessName: string;
  userName: string;
  documentType: string;
  reason: string;
}) => ({
  subject: `Document Verification Failed: ${data.documentType}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Document Verification Failed</h2>
      <p>Dear ${data.userName},</p>
      <p>A document you uploaded for <strong>${data.businessName}</strong> could not be verified.</p>
      
      <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #fecaca;">
        <p><strong>Document Type:</strong> ${data.documentType}</p>
        <p><strong>Issue:</strong> ${data.reason}</p>
      </div>
      
      <p>Please upload a new, valid document to continue with your verification.</p>
      
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/kyb/status" 
         style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
        Upload New Document
      </a>
    </div>
  `
});
