import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyUnsubscribeToken } from '@/lib/email/unsubscribe';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');
    const token = searchParams.get('token');
    const type = searchParams.get('type'); // Optional: specific notification type to unsubscribe

    if (!userId || !email || !token) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Verify token
    if (!verifyUnsubscribeToken(userId, email, token)) {
      return NextResponse.json(
        { error: 'Invalid unsubscribe link' },
        { status: 403 }
      );
    }

    // Get or create preferences
    let preferences = await prisma.emailPreference.findUnique({
      where: { userId },
    });

    if (!preferences) {
      preferences = await prisma.emailPreference.create({
        data: { userId },
      });
    }

    // Return current preferences for the unsubscribe page
    return NextResponse.json({
      email,
      preferences: {
        quoteNotifications: preferences.quoteNotifications,
        transactionNotifications: preferences.transactionNotifications,
        paymentNotifications: preferences.paymentNotifications,
        deliveryNotifications: preferences.deliveryNotifications,
        disputeNotifications: preferences.disputeNotifications,
        systemNotifications: preferences.systemNotifications,
        weeklyDigest: preferences.weeklyDigest,
        unsubscribedAt: preferences.unsubscribedAt,
      },
    });
  } catch (error) {
    console.error('Unsubscribe GET error:', error);
    return NextResponse.json(
      { error: 'Failed to process unsubscribe request' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, email, token, type, unsubscribeAll } = body;

    if (!userId || !email || !token) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Verify token
    if (!verifyUnsubscribeToken(userId, email, token)) {
      return NextResponse.json(
        { error: 'Invalid unsubscribe link' },
        { status: 403 }
      );
    }

    const updateData: Record<string, boolean | Date> = {};

    if (unsubscribeAll) {
      // Unsubscribe from all emails
      updateData.unsubscribedAt = new Date();
      updateData.quoteNotifications = false;
      updateData.transactionNotifications = false;
      updateData.paymentNotifications = false;
      updateData.deliveryNotifications = false;
      updateData.disputeNotifications = false;
      updateData.systemNotifications = false;
      updateData.weeklyDigest = false;
    } else if (type) {
      // Unsubscribe from specific type
      const typeMap: Record<string, string> = {
        quote: 'quoteNotifications',
        transaction: 'transactionNotifications',
        payment: 'paymentNotifications',
        delivery: 'deliveryNotifications',
        dispute: 'disputeNotifications',
        system: 'systemNotifications',
        digest: 'weeklyDigest',
      };

      const prefKey = typeMap[type];
      if (prefKey) {
        updateData[prefKey] = false;
      }
    }

    const preferences = await prisma.emailPreference.upsert({
      where: { userId },
      create: {
        userId,
        ...updateData,
      },
      update: updateData,
    });

    return NextResponse.json({
      success: true,
      message: unsubscribeAll
        ? 'You have been unsubscribed from all emails'
        : `You have been unsubscribed from ${type || 'selected'} notifications`,
      preferences,
    });
  } catch (error) {
    console.error('Unsubscribe POST error:', error);
    return NextResponse.json(
      { error: 'Failed to process unsubscribe request' },
      { status: 500 }
    );
  }
}
