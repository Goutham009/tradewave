import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let preferences = await prisma.emailPreference.findUnique({
      where: { userId: session.user.id },
    });

    // Create default preferences if not exists
    if (!preferences) {
      preferences = await prisma.emailPreference.create({
        data: {
          userId: session.user.id,
        },
      });
    }

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Get email preferences error:', error);
    return NextResponse.json(
      { error: 'Failed to get email preferences' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      quoteNotifications,
      transactionNotifications,
      paymentNotifications,
      deliveryNotifications,
      disputeNotifications,
      systemNotifications,
      weeklyDigest,
    } = body;

    const preferences = await prisma.emailPreference.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        quoteNotifications: quoteNotifications ?? true,
        transactionNotifications: transactionNotifications ?? true,
        paymentNotifications: paymentNotifications ?? true,
        deliveryNotifications: deliveryNotifications ?? true,
        disputeNotifications: disputeNotifications ?? true,
        systemNotifications: systemNotifications ?? true,
        weeklyDigest: weeklyDigest ?? false,
      },
      update: {
        ...(quoteNotifications !== undefined && { quoteNotifications }),
        ...(transactionNotifications !== undefined && { transactionNotifications }),
        ...(paymentNotifications !== undefined && { paymentNotifications }),
        ...(deliveryNotifications !== undefined && { deliveryNotifications }),
        ...(disputeNotifications !== undefined && { disputeNotifications }),
        ...(systemNotifications !== undefined && { systemNotifications }),
        ...(weeklyDigest !== undefined && { weeklyDigest }),
      },
    });

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Update email preferences error:', error);
    return NextResponse.json(
      { error: 'Failed to update email preferences' },
      { status: 500 }
    );
  }
}
