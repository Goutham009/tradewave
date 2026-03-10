import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/services/notificationService';

// POST /api/supplier/transactions/[id]/production - Confirm production start or update progress
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const {
      action, // 'confirm_start' | 'update_progress' | 'mark_complete'
      supplierId,
      // For confirm_start
      productionStartDate,
      expectedCompletionDate,
      qualityInspectionDate,
      expectedShipmentDate,
      expectedDeliveryDate,
      productionSchedule,
      productionManagerName,
      productionManagerPhone,
      productionManagerEmail,
      // For update_progress
      progressPercentage,
      progressNotes,
      progressPhotos,
      // For mark_complete
      completionNotes,
      inspectionCertificateUrl,
    } = body;

    if (!supplierId || !action) {
      return NextResponse.json({ error: 'supplierId and action are required' }, { status: 400 });
    }

    const transaction: any = await prisma.transaction.findUnique({
      where: { id: params.id },
      include: {
        requirement: {
          select: {
            assignedAccountManagerId: true,
            title: true,
          },
        },
      },
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    if (transaction.supplierId !== supplierId) {
      return NextResponse.json({ error: 'This transaction does not belong to you' }, { status: 403 });
    }

    switch (action) {
      case 'confirm_start': {
        // Validate that payment has been received
        const validStatuses = ['PAYMENT_RECEIVED', 'PAYMENT_CONFIRMED', 'PAID', 'ESCROW_HELD', 'CONFIRMED'];
        if (!validStatuses.includes(transaction.status)) {
          return NextResponse.json(
            { error: `Cannot start production. Transaction status is ${transaction.status}. Payment must be received first.` },
            { status: 400 }
          );
        }

        await prisma.transaction.update({
          where: { id: params.id },
          data: {
            status: 'PRODUCTION',
            productionStartDate: productionStartDate ? new Date(productionStartDate) : new Date(),
            expectedCompletionDate: expectedCompletionDate ? new Date(expectedCompletionDate) : null,
            qualityInspectionDate: qualityInspectionDate ? new Date(qualityInspectionDate) : null,
            expectedShipmentDate: expectedShipmentDate ? new Date(expectedShipmentDate) : null,
            estimatedDelivery: expectedDeliveryDate ? new Date(expectedDeliveryDate) : null,
            productionSchedule: productionSchedule || null,
            productionManagerName: productionManagerName || null,
            productionManagerPhone: productionManagerPhone || null,
            productionManagerEmail: productionManagerEmail || null,
            productionProgress: 0,
          } as any,
        });

        await createNotification({
          userId: transaction.buyerId,
          type: 'SYSTEM',
          title: 'Production Started',
          message: `Production has started for ${transaction.requirement?.title || 'your order'}. We will keep you updated on progress.`,
          resourceType: 'transaction',
          resourceId: params.id,
          sendEmail: true,
        });

        if (transaction.requirement?.assignedAccountManagerId) {
          await createNotification({
            userId: transaction.requirement.assignedAccountManagerId,
            type: 'SYSTEM',
            title: 'Production Started for Client Order',
            message: `Supplier has started production for transaction ${params.id}.`,
            resourceType: 'transaction',
            resourceId: params.id,
            sendEmail: true,
          });
        }

        return NextResponse.json({
          status: 'success',
          message: 'Production confirmed. Buyer has been notified.',
          transactionStatus: 'PRODUCTION',
        });
      }

      case 'update_progress': {
        if (transaction.status !== 'PRODUCTION') {
          return NextResponse.json(
            { error: 'Transaction must be in PRODUCTION status to update progress' },
            { status: 400 }
          );
        }

        await prisma.transaction.update({
          where: { id: params.id },
          data: {
            productionProgress: progressPercentage || null,
            lastProgressUpdate: new Date(),
            lastProgressNotes: progressNotes || null,
          } as any,
        });

        await createNotification({
          userId: transaction.buyerId,
          type: 'SYSTEM',
          title: 'Production Progress Updated',
          message: `Production progress is now ${progressPercentage || 0}% for ${transaction.requirement?.title || 'your order'}.`,
          resourceType: 'transaction',
          resourceId: params.id,
          metadata: {
            progressPercentage: progressPercentage || 0,
            progressNotes: progressNotes || null,
            progressPhotos: progressPhotos || [],
          },
          sendEmail: true,
        });

        return NextResponse.json({
          status: 'success',
          message: 'Production progress updated.',
          progress: progressPercentage,
        });
      }

      case 'mark_complete': {
        if (transaction.status !== 'PRODUCTION') {
          return NextResponse.json(
            { error: 'Transaction must be in PRODUCTION status to mark complete' },
            { status: 400 }
          );
        }

        await prisma.transaction.update({
          where: { id: params.id },
          data: {
            status: 'QUALITY_INSPECTION' as any,
            productionProgress: 100,
            productionCompletedAt: new Date(),
            productionCompletionNotes: completionNotes || null,
          } as any,
        });

        await createNotification({
          userId: transaction.buyerId,
          type: 'QUALITY_APPROVED',
          title: 'Production Completed',
          message: `Production is complete for ${transaction.requirement?.title || 'your order'} and is moving to quality inspection.`,
          resourceType: 'transaction',
          resourceId: params.id,
          metadata: {
            completionNotes: completionNotes || null,
            inspectionCertificateUrl: inspectionCertificateUrl || null,
          },
          sendEmail: true,
        });

        const inspectionTeam = await prisma.user.findMany({
          where: {
            role: { in: ['ADMIN', 'PROCUREMENT_OFFICER'] },
          },
          select: { id: true },
        });

        await Promise.all(
          inspectionTeam.map((member) =>
            createNotification({
              userId: member.id,
              type: 'QUALITY_APPROVED',
              title: 'Quality Inspection Required',
              message: `Production is complete for transaction ${params.id}. Please begin quality inspection.`,
              resourceType: 'transaction',
              resourceId: params.id,
              sendEmail: true,
            })
          )
        );

        return NextResponse.json({
          status: 'success',
          message: 'Production marked as complete. Quality inspection is next.',
          transactionStatus: 'QUALITY_INSPECTION',
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid action. Use: confirm_start, update_progress, mark_complete' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error updating production:', error);
    return NextResponse.json(
      { error: 'Failed to update production', details: error.message },
      { status: 500 }
    );
  }
}
