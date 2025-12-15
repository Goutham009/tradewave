import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export interface CreatePaymentIntentParams {
  amount: number;
  currency: string;
  transactionId: string;
  buyerId: string;
  metadata?: Record<string, string>;
}

export interface PaymentResult {
  success: boolean;
  paymentIntentId?: string;
  clientSecret?: string;
  error?: string;
}

export async function createPaymentIntent(
  params: CreatePaymentIntentParams
): Promise<PaymentResult> {
  try {
    const { amount, currency, transactionId, buyerId, metadata } = params;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata: {
        transactionId,
        buyerId,
        ...metadata,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      success: true,
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret || undefined,
    };
  } catch (error: any) {
    console.error('Payment intent creation failed:', error);
    return {
      success: false,
      error: error.message || 'Failed to create payment intent',
    };
  }
}

export async function confirmPayment(paymentIntentId: string): Promise<PaymentResult> {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      return {
        success: true,
        paymentIntentId: paymentIntent.id,
      };
    }

    return {
      success: false,
      error: `Payment status: ${paymentIntent.status}`,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to confirm payment',
    };
  }
}

export async function refundPayment(
  paymentIntentId: string,
  amount?: number
): Promise<PaymentResult> {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
    });

    return {
      success: refund.status === 'succeeded',
      paymentIntentId: refund.payment_intent as string,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to process refund',
    };
  }
}

export async function getPaymentStatus(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return {
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      metadata: paymentIntent.metadata,
    };
  } catch (error: any) {
    throw new Error(`Failed to get payment status: ${error.message}`);
  }
}

export async function createCustomer(email: string, name: string, companyName?: string) {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        companyName: companyName || '',
      },
    });
    return customer;
  } catch (error: any) {
    throw new Error(`Failed to create customer: ${error.message}`);
  }
}
