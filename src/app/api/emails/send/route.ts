import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import { sendEmail, EmailTemplateName } from '@/lib/email/service';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { to, subject, template, data } = body;

    if (!to || !subject || !template) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, template' },
        { status: 400 }
      );
    }

    const validTemplates: EmailTemplateName[] = [
      'welcome',
      'email_verification',
      'password_reset',
      'quote_received',
      'quote_accepted',
      'quote_rejected',
      'transaction_created',
      'transaction_updated',
      'payment_received',
      'payment_released',
      'delivery_update',
      'delivery_confirmed',
      'dispute_opened',
      'dispute_resolved',
      'weekly_digest',
    ];

    if (!validTemplates.includes(template)) {
      return NextResponse.json(
        { error: `Invalid template. Valid templates: ${validTemplates.join(', ')}` },
        { status: 400 }
      );
    }

    const result = await sendEmail({
      to,
      subject,
      template,
      data: data || {},
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      emailLogId: result.emailLogId,
      resendId: result.resendId,
    });
  } catch (error) {
    console.error('Email send error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
