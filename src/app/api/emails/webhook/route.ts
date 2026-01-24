import { NextRequest, NextResponse } from 'next/server';
import { handleBounce } from '@/lib/email/service';
import prisma from '@/lib/db';

// Resend webhook handler for email events
export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature (in production, verify with Resend's signing secret)
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
    const signature = request.headers.get('svix-signature');
    
    // Skip signature verification in development
    if (process.env.NODE_ENV === 'production' && webhookSecret && !signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }

    const body = await request.json();
    const { type, data } = body;

    switch (type) {
      case 'email.delivered':
        // Update email log status
        if (data.email_id) {
          await prisma.emailLog.updateMany({
            where: { resendId: data.email_id },
            data: { status: 'SENT', sentAt: new Date() },
          });
        }
        break;

      case 'email.bounced':
        // Handle bounce
        if (data.to?.[0]) {
          const bounceType = data.bounce?.type === 'hard' ? 'PERMANENT' : 'TEMPORARY';
          await handleBounce(data.to[0], bounceType, data.bounce?.message);
        }
        
        // Update email log
        if (data.email_id) {
          await prisma.emailLog.updateMany({
            where: { resendId: data.email_id },
            data: { 
              status: 'BOUNCED',
              failureReason: data.bounce?.message || 'Email bounced',
            },
          });
        }
        break;

      case 'email.complained':
        // Handle spam complaint as permanent bounce
        if (data.to?.[0]) {
          await handleBounce(data.to[0], 'PERMANENT', 'Spam complaint');
        }
        break;

      case 'email.delivery_delayed':
        // Log delivery delay
        if (data.email_id) {
          await prisma.emailLog.updateMany({
            where: { resendId: data.email_id },
            data: { 
              failureReason: `Delivery delayed: ${data.delay?.message || 'Unknown reason'}`,
            },
          });
        }
        break;

      default:
        console.log('Unhandled webhook event:', type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
