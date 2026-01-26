// Order History & Repeat Buyer Email Templates

export const orderHistoryEmailTemplates = {
  // Buyer Emails
  PURCHASE_CONFIRMATION: {
    subject: 'Order Confirmed - {{orderNumber}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1e40af;">Order Confirmed!</h1>
        <p>Hi {{buyerName}},</p>
        <p>Your order <strong>{{orderNumber}}</strong> has been confirmed.</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Order Details</h3>
          <p><strong>Product:</strong> {{productName}}</p>
          <p><strong>Quantity:</strong> {{quantity}} {{quantityUnit}}</p>
          <p><strong>Total:</strong> {{currency}} {{totalAmount}}</p>
          <p><strong>Supplier:</strong> {{supplierName}}</p>
        </div>
        
        <p>Expected delivery: {{estimatedDelivery}}</p>
        
        <a href="{{trackOrderUrl}}" style="display: inline-block; background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Track Order</a>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          Thank you for your order!<br>
          The Tradewave Team
        </p>
      </div>
    `
  },

  DELIVERY_COMPLETED: {
    subject: 'Delivery Completed - Please Rate Your Purchase',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #059669;">Delivery Completed!</h1>
        <p>Hi {{buyerName}},</p>
        <p>Your order <strong>{{orderNumber}}</strong> has been delivered.</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Product:</strong> {{productName}}</p>
          <p><strong>Delivered:</strong> {{deliveryDate}}</p>
        </div>
        
        <p>How was your experience? Please take a moment to rate your purchase.</p>
        
        <a href="{{rateOrderUrl}}" style="display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Rate This Order</a>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          Your feedback helps other buyers and suppliers!
        </p>
      </div>
    `
  },

  LOYALTY_TIER_UPGRADED: {
    subject: 'Congratulations! You\'ve Been Upgraded to {{newTier}}!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #7c3aed;">🎉 Tier Upgrade!</h1>
        <p>Hi {{buyerName}},</p>
        <p>Congratulations! You've been upgraded to <strong>{{newTier}}</strong> tier!</p>
        
        <div style="background: linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%); color: white; padding: 30px; border-radius: 12px; margin: 20px 0; text-align: center;">
          <h2 style="margin: 0;">{{newTier}}</h2>
          <p style="margin: 10px 0 0 0;">Your new loyalty tier</p>
        </div>
        
        <h3>Your New Benefits:</h3>
        <ul>
          <li>{{discountPercentage}}% discount on all purchases</li>
          <li>{{pointsPerDollar}} points per $1 spent</li>
          {{#if freeShipping}}<li>Free shipping on orders over {{freeShippingThreshold}}</li>{{/if}}
          {{#if prioritySupport}}<li>Priority customer support</li>{{/if}}
        </ul>
        
        <a href="{{loyaltyUrl}}" style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Your Benefits</a>
      </div>
    `
  },

  LOYALTY_TIER_DOWNGRADED: {
    subject: 'Your Loyalty Tier Has Changed',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626;">Loyalty Tier Update</h1>
        <p>Hi {{buyerName}},</p>
        <p>Your loyalty tier has been updated from {{previousTier}} to <strong>{{newTier}}</strong>.</p>
        
        <p>This change was made because: {{reason}}</p>
        
        <h3>Your Current Benefits:</h3>
        <ul>
          <li>{{discountPercentage}}% discount on all purchases</li>
          <li>{{pointsPerDollar}} points per $1 spent</li>
        </ul>
        
        <p>Keep ordering to regain your higher tier status!</p>
        
        <a href="{{loyaltyUrl}}" style="display: inline-block; background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Loyalty Status</a>
      </div>
    `
  },

  LOYALTY_POINTS_EARNED: {
    subject: 'You Earned {{points}} Loyalty Points!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #059669;">Points Earned!</h1>
        <p>Hi {{buyerName}},</p>
        <p>You've earned <strong>{{points}} points</strong> from your recent order!</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="font-size: 36px; font-weight: bold; color: #059669; margin: 0;">{{totalPoints}}</p>
          <p style="color: #6b7280; margin: 5px 0 0 0;">Total Available Points</p>
        </div>
        
        <p>Use your points to get discounts on future purchases!</p>
        
        <a href="{{redeemUrl}}" style="display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Redeem Points</a>
      </div>
    `
  },

  LOYALTY_POINTS_EXPIRED: {
    subject: 'Your Loyalty Points Are Expiring Soon',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626;">Points Expiring Soon!</h1>
        <p>Hi {{buyerName}},</p>
        <p><strong>{{expiringPoints}} points</strong> will expire on {{expiryDate}}.</p>
        
        <p>Use your points before they expire to save on your next order!</p>
        
        <a href="{{shopUrl}}" style="display: inline-block; background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Shop Now</a>
      </div>
    `
  },

  AUTO_REORDER_PLACED: {
    subject: 'Auto-Reorder Placed - {{productName}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1e40af;">Auto-Reorder Placed</h1>
        <p>Hi {{buyerName}},</p>
        <p>Your scheduled auto-reorder has been placed successfully!</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Product:</strong> {{productName}}</p>
          <p><strong>Quantity:</strong> {{quantity}} {{quantityUnit}}</p>
          <p><strong>Total:</strong> {{currency}} {{totalAmount}}</p>
          <p><strong>Supplier:</strong> {{supplierName}}</p>
        </div>
        
        <p>Next scheduled order: {{nextOrderDate}}</p>
        
        <a href="{{manageUrl}}" style="display: inline-block; background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Manage Auto-Reorders</a>
      </div>
    `
  },

  AUTO_REORDER_FAILED: {
    subject: 'Auto-Reorder Failed - Action Required',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626;">Auto-Reorder Failed</h1>
        <p>Hi {{buyerName}},</p>
        <p>Your scheduled auto-reorder for <strong>{{productName}}</strong> could not be processed.</p>
        
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <p><strong>Reason:</strong> {{failureReason}}</p>
        </div>
        
        <p>Please review your auto-reorder settings and try again.</p>
        
        <a href="{{manageUrl}}" style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Fix Auto-Reorder</a>
      </div>
    `
  },

  SUBSCRIPTION_RENEWAL: {
    subject: 'Your Subscription Will Renew on {{renewalDate}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1e40af;">Subscription Renewal Reminder</h1>
        <p>Hi {{buyerName}},</p>
        <p>Your subscription <strong>{{subscriptionName}}</strong> will renew on {{renewalDate}}.</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Amount:</strong> {{currency}} {{amount}}</p>
          <p><strong>Items:</strong> {{itemCount}} products</p>
        </div>
        
        <p>If you need to make changes, please do so before the renewal date.</p>
        
        <a href="{{manageUrl}}" style="display: inline-block; background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Manage Subscription</a>
      </div>
    `
  },

  SUBSCRIPTION_BILLING_UPCOMING: {
    subject: 'Upcoming Subscription Billing - {{subscriptionName}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1e40af;">Billing Reminder</h1>
        <p>Hi {{buyerName}},</p>
        <p>Your subscription <strong>{{subscriptionName}}</strong> will be billed on {{billingDate}}.</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Amount:</strong> {{currency}} {{amount}}</p>
          <p><strong>Payment Method:</strong> {{paymentMethod}}</p>
        </div>
        
        <a href="{{manageUrl}}" style="display: inline-block; background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Subscription</a>
      </div>
    `
  },

  REPEAT_PURCHASE_DISCOUNT: {
    subject: 'Special Discount for Repeat Customers!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #059669;">🎁 Exclusive Offer!</h1>
        <p>Hi {{buyerName}},</p>
        <p>As a valued repeat customer, you've unlocked a special <strong>{{discountPercentage}}% discount</strong> on your next order!</p>
        
        <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; padding: 30px; border-radius: 12px; margin: 20px 0; text-align: center;">
          <p style="font-size: 48px; font-weight: bold; margin: 0;">{{discountPercentage}}%</p>
          <p style="margin: 10px 0 0 0;">OFF YOUR NEXT ORDER</p>
        </div>
        
        <p>Use code: <strong>{{discountCode}}</strong></p>
        <p>Valid until: {{expiryDate}}</p>
        
        <a href="{{shopUrl}}" style="display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Shop Now</a>
      </div>
    `
  },

  ABANDONED_CART: {
    subject: 'You Left Items in Your Cart',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1e40af;">Complete Your Order</h1>
        <p>Hi {{buyerName}},</p>
        <p>You have items waiting in your saved quotes. Don't miss out!</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          {{#each items}}
          <p><strong>{{productName}}</strong> - {{quantity}} {{quantityUnit}}</p>
          {{/each}}
        </div>
        
        <a href="{{checkoutUrl}}" style="display: inline-block; background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Complete Order</a>
      </div>
    `
  },

  // Supplier Emails
  REPEAT_CUSTOMER_ORDER: {
    subject: 'Repeat Customer Order - {{buyerName}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1e40af;">Repeat Customer Order!</h1>
        <p>Hi {{supplierName}},</p>
        <p><strong>{{buyerName}}</strong> has placed another order with you!</p>
        
        <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>This is their {{orderCount}}th order</strong> with your company.</p>
        </div>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Order Details</h3>
          <p><strong>Product:</strong> {{productName}}</p>
          <p><strong>Quantity:</strong> {{quantity}} {{quantityUnit}}</p>
          <p><strong>Total:</strong> {{currency}} {{totalAmount}}</p>
        </div>
        
        <a href="{{orderUrl}}" style="display: inline-block; background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Order</a>
      </div>
    `
  },

  AUTO_REORDER_NOTIFICATION: {
    subject: 'Auto-Reorder Received - {{productName}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1e40af;">Auto-Reorder Received</h1>
        <p>Hi {{supplierName}},</p>
        <p>An automatic reorder has been placed for <strong>{{productName}}</strong>.</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Buyer:</strong> {{buyerName}}</p>
          <p><strong>Quantity:</strong> {{quantity}} {{quantityUnit}}</p>
          <p><strong>Frequency:</strong> {{frequency}}</p>
        </div>
        
        <p>Please process this order as usual.</p>
        
        <a href="{{orderUrl}}" style="display: inline-block; background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Order</a>
      </div>
    `
  },

  // Admin Emails
  REPEAT_BUYER_MILESTONE: {
    subject: 'Buyer Milestone - {{buyerName}} Reached {{milestone}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #7c3aed;">🏆 Buyer Milestone!</h1>
        <p><strong>{{buyerName}}</strong> has reached a significant milestone!</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Milestone:</strong> {{milestone}}</p>
          <p><strong>Total Orders:</strong> {{totalOrders}}</p>
          <p><strong>Total Spent:</strong> {{currency}} {{totalSpent}}</p>
          <p><strong>Current Tier:</strong> {{currentTier}}</p>
        </div>
        
        <a href="{{buyerProfileUrl}}" style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Buyer Profile</a>
      </div>
    `
  },

  CHURN_RISK_ALERT: {
    subject: '⚠️ High Churn Risk Alert - {{buyerName}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626;">⚠️ Churn Risk Alert</h1>
        <p>A high-value customer is at risk of churning.</p>
        
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <p><strong>Buyer:</strong> {{buyerName}}</p>
          <p><strong>Company:</strong> {{companyName}}</p>
          <p><strong>Days Since Last Order:</strong> {{daysSinceLastOrder}}</p>
          <p><strong>Lifetime Value:</strong> {{currency}} {{lifetimeValue}}</p>
          <p><strong>Total Orders:</strong> {{totalOrders}}</p>
        </div>
        
        <p>Consider reaching out with a retention offer.</p>
        
        <a href="{{buyerProfileUrl}}" style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Buyer Profile</a>
      </div>
    `
  }
};

export type OrderHistoryEmailTemplate = keyof typeof orderHistoryEmailTemplates;
