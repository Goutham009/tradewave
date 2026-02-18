import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/db';

// Admin KYB Review Actions: APPROVE, REJECT, REQUEST_INFO
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user is admin
  const admin = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  });

  if (admin?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
  }

  const kybId = params.id;

  try {
    const body = await req.json();
    const { action, reason, notes } = body;

    // Validate action
    if (!['APPROVE', 'REJECT', 'REQUEST_INFO', 'START_REVIEW'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be APPROVE, REJECT, REQUEST_INFO, or START_REVIEW' },
        { status: 400 }
      );
    }

    // Get existing KYB
    const kyb = await prisma.supplierKYB.findUnique({
      where: { id: kybId },
      include: { user: true }
    });

    if (!kyb) {
      return NextResponse.json({ error: 'KYB application not found' }, { status: 404 });
    }

    let updateData: any = {
      reviewedByAdminId: session.user.id,
      adminNotes: notes || kyb.adminNotes,
      updatedAt: new Date()
    };

    let notificationType: string;
    let notificationTitle: string;
    let notificationMessage: string;
    let logAction: string;
    let logDetails: string;

    switch (action) {
      case 'START_REVIEW':
        updateData.status = 'UNDER_REVIEW';
        notificationType = 'KYB_UNDER_REVIEW';
        notificationTitle = 'KYB Under Review';
        notificationMessage = 'Your KYB application is now being reviewed by our compliance team.';
        logAction = 'REVIEW_STARTED';
        logDetails = `Admin ${session.user.email} started reviewing the KYB application.`;
        break;

      case 'APPROVE':
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1); // KYB valid for 1 year

        updateData.status = 'VERIFIED';
        updateData.verifiedAt = new Date();
        updateData.expiresAt = expiryDate;
        updateData.rejectionReason = null;
        updateData.rejectedAt = null;

        notificationType = 'KYB_VERIFIED';
        notificationTitle = 'KYB Approved!';
        notificationMessage = 'Congratulations! Your business verification has been approved. You can now accept quotes and receive requirements.';
        logAction = 'APPROVED';
        logDetails = `KYB approved by admin ${session.user.email}. Valid until ${expiryDate.toISOString()}.`;

        // Update user's KYB status
        await prisma.user.update({
          where: { id: kyb.userId },
          data: {
            kybStatus: 'COMPLETED',
            kybApprovedAt: new Date()
          }
        });

        // Create verification badge
        await prisma.verificationBadge.upsert({
          where: { kybId },
          create: {
            kybId,
            badgeType: 'VERIFIED',
            trustScore: 70,
            expiresAt: expiryDate
          },
          update: {
            badgeType: 'VERIFIED',
            trustScore: 70,
            expiresAt: expiryDate
          }
        });
        break;

      case 'REJECT':
        if (!reason) {
          return NextResponse.json(
            { error: 'Rejection reason is required' },
            { status: 400 }
          );
        }

        updateData.status = 'REJECTED';
        updateData.rejectionReason = reason;
        updateData.rejectedAt = new Date();

        notificationType = 'KYB_REJECTED';
        notificationTitle = 'KYB Application Rejected';
        notificationMessage = `Your KYB application has been rejected. Reason: ${reason}. You may appeal this decision or submit a new application.`;
        logAction = 'REJECTED';
        logDetails = `KYB rejected by admin ${session.user.email}. Reason: ${reason}`;

        // Update user's KYB status
        await prisma.user.update({
          where: { id: kyb.userId },
          data: { kybStatus: 'REJECTED' }
        });
        break;

      case 'REQUEST_INFO':
        if (!reason) {
          return NextResponse.json(
            { error: 'Info request reason is required' },
            { status: 400 }
          );
        }

        updateData.status = 'INFO_REQUESTED';
        updateData.infoRequestReason = reason;
        updateData.infoRequestedAt = new Date();
        updateData.infoRequestedByAdminId = session.user.id;

        notificationType = 'KYB_INFO_REQUESTED';
        notificationTitle = 'Additional Information Required';
        notificationMessage = `Our compliance team requires additional information for your KYB application: ${reason}`;
        logAction = 'INFO_REQUESTED';
        logDetails = `Admin ${session.user.email} requested additional information: ${reason}`;

        // Update user's KYB status
        await prisma.user.update({
          where: { id: kyb.userId },
          data: { kybStatus: 'INFO_REQUESTED' }
        });
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Update KYB record
    const updatedKyb = await prisma.supplierKYB.update({
      where: { id: kybId },
      data: updateData,
      include: {
        documents: true,
        complianceItems: true,
        riskAssessment: true,
        badge: true,
        user: { select: { id: true, email: true, name: true } }
      }
    });

    // Create verification log
    await prisma.verificationLog.create({
      data: {
        kybId,
        performedByAdminId: session.user.id,
        action: logAction,
        actionDetails: logDetails
      }
    });

    // Notify the user
    await prisma.notification.create({
      data: {
        userId: kyb.userId,
        type: notificationType as any,
        title: notificationTitle,
        message: notificationMessage,
        resourceType: 'kyb',
        resourceId: kybId
      }
    });

    // Note: In production, also notify the user's AM if assigned

    return NextResponse.json({
      success: true,
      action,
      kyb: updatedKyb
    });

  } catch (error) {
    console.error('Error reviewing KYB:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET - Fetch KYB details for admin review
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user is admin
  const admin = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  });

  if (admin?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
  }

  try {
    const kyb = await prisma.supplierKYB.findUnique({
      where: { id: params.id },
      include: {
        documents: {
          orderBy: { createdAt: 'desc' }
        },
        complianceItems: true,
        riskAssessment: true,
        badge: true,
        verificationLogs: {
          orderBy: { createdAt: 'desc' },
          take: 50
        },
        appeals: {
          orderBy: { createdAt: 'desc' }
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true
          }
        },
        reviewedByAdmin: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!kyb) {
      return NextResponse.json({ error: 'KYB not found' }, { status: 404 });
    }

    return NextResponse.json({ kyb });
  } catch (error) {
    console.error('Error fetching KYB:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
