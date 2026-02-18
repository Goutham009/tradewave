import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/db';

// Check KYB renewal status for the current user
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const kyb = await prisma.supplierKYB.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        status: true,
        expiresAt: true,
        verifiedAt: true,
        businessName: true
      }
    });

    if (!kyb) {
      return NextResponse.json({ needsKYB: true, status: 'NOT_STARTED' });
    }

    const now = new Date();
    const expiresAt = kyb.expiresAt ? new Date(kyb.expiresAt) : null;

    // Check if KYB is expired
    if (expiresAt && expiresAt < now && kyb.status === 'VERIFIED') {
      // Mark as expired
      await prisma.supplierKYB.update({
        where: { id: kyb.id },
        data: { status: 'EXPIRED' }
      });

      await prisma.user.update({
        where: { id: session.user.id },
        data: { kybStatus: 'EXPIRED' }
      });

      await prisma.verificationLog.create({
        data: {
          kybId: kyb.id,
          action: 'EXPIRED',
          actionDetails: `KYB expired on ${expiresAt.toISOString()}. Renewal required.`
        }
      });

      // Notify user
      await prisma.notification.create({
        data: {
          userId: session.user.id,
          type: 'KYB_EXPIRATION_REMINDER',
          title: 'KYB Verification Expired',
          message: 'Your KYB verification has expired. Please renew to continue accepting quotes and receiving requirements.',
          resourceType: 'kyb',
          resourceId: kyb.id
        }
      });

      return NextResponse.json({
        needsRenewal: true,
        status: 'EXPIRED',
        expiredAt: expiresAt,
        message: 'Your KYB verification has expired. Please renew to continue.'
      });
    }

    // Check if KYB is expiring soon (within 30 days)
    if (expiresAt && kyb.status === 'VERIFIED') {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      if (expiresAt < thirtyDaysFromNow) {
        const daysUntilExpiry = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        return NextResponse.json({
          needsRenewal: false,
          expiringSoon: true,
          status: 'VERIFIED',
          expiresAt,
          daysUntilExpiry,
          message: `Your KYB verification expires in ${daysUntilExpiry} days. Consider renewing soon.`
        });
      }
    }

    return NextResponse.json({
      needsRenewal: false,
      expiringSoon: false,
      status: kyb.status,
      expiresAt: kyb.expiresAt,
      verifiedAt: kyb.verifiedAt
    });

  } catch (error) {
    console.error('Error checking KYB renewal:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Initiate KYB renewal process
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const kyb = await prisma.supplierKYB.findUnique({
      where: { userId: session.user.id }
    });

    if (!kyb) {
      return NextResponse.json({ error: 'No KYB application found' }, { status: 404 });
    }

    // Only allow renewal if VERIFIED or EXPIRED
    if (!['VERIFIED', 'EXPIRED'].includes(kyb.status)) {
      return NextResponse.json(
        { error: 'KYB renewal is only available for verified or expired applications' },
        { status: 400 }
      );
    }

    // Update status to initiate renewal
    const updatedKyb = await prisma.supplierKYB.update({
      where: { id: kyb.id },
      data: {
        status: 'PENDING',
        // Reset automated checks for re-verification
        sanctionsCheckStatus: null,
        pepCheckStatus: null,
        adverseMediaCheckStatus: null,
        creditCheckStatus: null,
        registryCheckStatus: null,
        documentAICheckStatus: null,
        bankVerificationStatus: null,
        automatedChecksStartedAt: null,
        automatedChecksCompletedAt: null
      }
    });

    await prisma.verificationLog.create({
      data: {
        kybId: kyb.id,
        action: 'RENEWAL_INITIATED',
        actionDetails: 'KYB renewal process initiated by user.'
      }
    });

    // Notify admins
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          type: 'KYB_SUBMITTED',
          title: 'KYB Renewal Submitted',
          message: `${kyb.businessName} has submitted a KYB renewal application.`,
          resourceType: 'kyb',
          resourceId: kyb.id
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'KYB renewal process initiated. Your application will be reviewed.',
      kyb: updatedKyb
    });

  } catch (error) {
    console.error('Error initiating KYB renewal:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
