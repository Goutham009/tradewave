// RFQ/Quote Email Templates

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://tradewave.io';

export const rfqCreatedBuyerTemplate = (data: {
  buyerName: string;
  rfqNumber: string;
  rfqTitle: string;
  expiresAt: string;
}) => ({
  subject: `RFQ Created: ${data.rfqNumber}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1e40af;">RFQ Created Successfully</h2>
      <p>Dear ${data.buyerName},</p>
      <p>Your Request for Quote has been created successfully.</p>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>RFQ Number:</strong> ${data.rfqNumber}</p>
        <p><strong>Title:</strong> ${data.rfqTitle}</p>
        <p><strong>Expires:</strong> ${data.expiresAt}</p>
      </div>
      
      <a href="${BASE_URL}/rfq" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
        View RFQ
      </a>
      
      <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
        Publish your RFQ to start receiving quotes from suppliers.
      </p>
    </div>
  `
});

export const rfqPublishedSellersTemplate = (data: {
  sellerName: string;
  rfqNumber: string;
  rfqTitle: string;
  buyerCompany: string;
  quantity: string;
  deliveryLocation: string;
  expiresAt: string;
  rfqId: string;
}) => ({
  subject: `New RFQ Invitation: ${data.rfqTitle}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1e40af;">You've Been Invited to Quote</h2>
      <p>Dear ${data.sellerName},</p>
      <p><strong>${data.buyerCompany}</strong> has invited you to submit a quote for their requirement.</p>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">${data.rfqTitle}</h3>
        <p><strong>RFQ Number:</strong> ${data.rfqNumber}</p>
        <p><strong>Quantity:</strong> ${data.quantity}</p>
        <p><strong>Delivery To:</strong> ${data.deliveryLocation}</p>
        <p><strong>Deadline:</strong> ${data.expiresAt}</p>
      </div>
      
      <a href="${BASE_URL}/seller/rfq/${data.rfqId}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
        View RFQ & Submit Quote
      </a>
      
      <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
        Don't miss this opportunity. Submit your quote before the deadline.
      </p>
    </div>
  `
});

export const quoteSubmittedBuyerTemplate = (data: {
  buyerName: string;
  rfqTitle: string;
  sellerCompany: string;
  quoteNumber: string;
  totalPrice: string;
  currency: string;
  quoteId: string;
}) => ({
  subject: `New Quote Received: ${data.quoteNumber}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #16a34a;">New Quote Received!</h2>
      <p>Dear ${data.buyerName},</p>
      <p>You've received a new quote for your RFQ.</p>
      
      <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #86efac;">
        <p><strong>RFQ:</strong> ${data.rfqTitle}</p>
        <p><strong>From:</strong> ${data.sellerCompany}</p>
        <p><strong>Quote Number:</strong> ${data.quoteNumber}</p>
        <p style="font-size: 24px; font-weight: bold; color: #16a34a;">${data.currency} ${data.totalPrice}</p>
      </div>
      
      <a href="${BASE_URL}/quote/${data.quoteId}" style="display: inline-block; background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
        Review Quote
      </a>
    </div>
  `
});

export const quoteReceivedSellerTemplate = (data: {
  sellerName: string;
  rfqTitle: string;
  quoteNumber: string;
  totalPrice: string;
  currency: string;
}) => ({
  subject: `Quote Submitted: ${data.quoteNumber}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1e40af;">Quote Submitted Successfully</h2>
      <p>Dear ${data.sellerName},</p>
      <p>Your quote has been submitted successfully.</p>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>RFQ:</strong> ${data.rfqTitle}</p>
        <p><strong>Quote Number:</strong> ${data.quoteNumber}</p>
        <p><strong>Total Amount:</strong> ${data.currency} ${data.totalPrice}</p>
      </div>
      
      <p>The buyer will review your quote and may contact you for negotiation.</p>
      
      <a href="${BASE_URL}/seller/quotes" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
        View My Quotes
      </a>
    </div>
  `
});

export const negotiationMessageTemplate = (data: {
  recipientName: string;
  senderName: string;
  rfqTitle: string;
  messagePreview: string;
  quoteId: string;
}) => ({
  subject: `New Message on Quote for: ${data.rfqTitle}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1e40af;">New Negotiation Message</h2>
      <p>Dear ${data.recipientName},</p>
      <p><strong>${data.senderName}</strong> sent you a message regarding the quote for "${data.rfqTitle}".</p>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
        <p style="font-style: italic;">"${data.messagePreview}"</p>
      </div>
      
      <a href="${BASE_URL}/quote/${data.quoteId}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
        View & Respond
      </a>
    </div>
  `
});

export const counterOfferReceivedTemplate = (data: {
  sellerName: string;
  buyerCompany: string;
  rfqTitle: string;
  originalPrice: string;
  proposedPrice: string;
  currency: string;
  quoteId: string;
}) => ({
  subject: `Counter-Offer Received for: ${data.rfqTitle}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #ea580c;">Counter-Offer Received</h2>
      <p>Dear ${data.sellerName},</p>
      <p><strong>${data.buyerCompany}</strong> has submitted a counter-offer for your quote.</p>
      
      <div style="background: #fff7ed; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #fed7aa;">
        <p><strong>RFQ:</strong> ${data.rfqTitle}</p>
        <p><strong>Your Price:</strong> ${data.currency} ${data.originalPrice}</p>
        <p><strong>Proposed Price:</strong> <span style="color: #ea580c; font-weight: bold;">${data.currency} ${data.proposedPrice}</span></p>
      </div>
      
      <a href="${BASE_URL}/quote/${data.quoteId}" style="display: inline-block; background: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
        Review Counter-Offer
      </a>
    </div>
  `
});

export const quoteAcceptedTemplate = (data: {
  sellerName: string;
  buyerCompany: string;
  rfqTitle: string;
  quoteNumber: string;
  totalPrice: string;
  currency: string;
  transactionId: string;
}) => ({
  subject: `🎉 Quote Accepted: ${data.quoteNumber}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #16a34a;">Congratulations! Your Quote Was Accepted!</h2>
      <p>Dear ${data.sellerName},</p>
      <p>Great news! <strong>${data.buyerCompany}</strong> has accepted your quote.</p>
      
      <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #86efac;">
        <p><strong>RFQ:</strong> ${data.rfqTitle}</p>
        <p><strong>Quote:</strong> ${data.quoteNumber}</p>
        <p style="font-size: 24px; font-weight: bold; color: #16a34a;">${data.currency} ${data.totalPrice}</p>
      </div>
      
      <p>A transaction has been created. Please proceed with the order fulfillment.</p>
      
      <a href="${BASE_URL}/transactions/${data.transactionId}" style="display: inline-block; background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
        View Transaction
      </a>
    </div>
  `
});

export const quoteRejectedTemplate = (data: {
  sellerName: string;
  buyerCompany: string;
  rfqTitle: string;
  quoteNumber: string;
  reason?: string;
}) => ({
  subject: `Quote Not Selected: ${data.quoteNumber}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #6b7280;">Quote Not Selected</h2>
      <p>Dear ${data.sellerName},</p>
      <p>We regret to inform you that <strong>${data.buyerCompany}</strong> did not select your quote for their RFQ.</p>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>RFQ:</strong> ${data.rfqTitle}</p>
        <p><strong>Quote:</strong> ${data.quoteNumber}</p>
        ${data.reason ? `<p><strong>Reason:</strong> ${data.reason}</p>` : ''}
      </div>
      
      <p>Don't be discouraged! There are many more opportunities waiting for you.</p>
      
      <a href="${BASE_URL}/seller/rfq" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
        Browse More RFQs
      </a>
    </div>
  `
});

export const quoteExpiredTemplate = (data: {
  recipientName: string;
  quoteNumber: string;
  rfqTitle: string;
  expiredAt: string;
}) => ({
  subject: `Quote Expired: ${data.quoteNumber}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Quote Has Expired</h2>
      <p>Dear ${data.recipientName},</p>
      <p>The following quote has expired and is no longer valid.</p>
      
      <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #fecaca;">
        <p><strong>Quote:</strong> ${data.quoteNumber}</p>
        <p><strong>RFQ:</strong> ${data.rfqTitle}</p>
        <p><strong>Expired On:</strong> ${data.expiredAt}</p>
      </div>
      
      <p>If you're still interested, you may submit a new quote.</p>
    </div>
  `
});

export const rfqClosingSoonTemplate = (data: {
  sellerName: string;
  rfqNumber: string;
  rfqTitle: string;
  expiresAt: string;
  hoursRemaining: number;
  rfqId: string;
}) => ({
  subject: `⏰ RFQ Closing Soon: ${data.rfqTitle}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #ea580c;">RFQ Closing Soon!</h2>
      <p>Dear ${data.sellerName},</p>
      <p>The following RFQ will close in <strong>${data.hoursRemaining} hours</strong>.</p>
      
      <div style="background: #fff7ed; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #fed7aa;">
        <p><strong>RFQ:</strong> ${data.rfqTitle}</p>
        <p><strong>RFQ Number:</strong> ${data.rfqNumber}</p>
        <p><strong>Closes:</strong> ${data.expiresAt}</p>
      </div>
      
      <p>Don't miss your chance to submit a quote!</p>
      
      <a href="${BASE_URL}/seller/rfq/${data.rfqId}" style="display: inline-block; background: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
        Submit Quote Now
      </a>
    </div>
  `
});

export const quoteConvertedTransactionTemplate = (data: {
  buyerName: string;
  sellerCompany: string;
  rfqTitle: string;
  quoteNumber: string;
  transactionId: string;
  totalPrice: string;
  currency: string;
}) => ({
  subject: `Transaction Created from Quote: ${data.quoteNumber}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #16a34a;">Transaction Created</h2>
      <p>Dear ${data.buyerName},</p>
      <p>Your accepted quote has been converted to a transaction.</p>
      
      <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #86efac;">
        <p><strong>RFQ:</strong> ${data.rfqTitle}</p>
        <p><strong>Supplier:</strong> ${data.sellerCompany}</p>
        <p><strong>Quote:</strong> ${data.quoteNumber}</p>
        <p style="font-size: 24px; font-weight: bold; color: #16a34a;">${data.currency} ${data.totalPrice}</p>
      </div>
      
      <p>The supplier has been notified and will begin processing your order.</p>
      
      <a href="${BASE_URL}/transactions/${data.transactionId}" style="display: inline-block; background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
        View Transaction
      </a>
    </div>
  `
});

export const rfqPublicAnnouncementTemplate = (data: {
  rfqNumber: string;
  rfqTitle: string;
  buyerCompany: string;
  quantity: string;
  deliveryLocation: string;
  expiresAt: string;
  rfqId: string;
}) => ({
  subject: `New Public RFQ: ${data.rfqTitle}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1e40af;">New RFQ on Marketplace</h2>
      <p>A new public RFQ has been posted that may interest you.</p>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">${data.rfqTitle}</h3>
        <p><strong>From:</strong> ${data.buyerCompany}</p>
        <p><strong>RFQ Number:</strong> ${data.rfqNumber}</p>
        <p><strong>Quantity:</strong> ${data.quantity}</p>
        <p><strong>Delivery To:</strong> ${data.deliveryLocation}</p>
        <p><strong>Deadline:</strong> ${data.expiresAt}</p>
      </div>
      
      <a href="${BASE_URL}/seller/rfq/${data.rfqId}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
        View & Submit Quote
      </a>
    </div>
  `
});
