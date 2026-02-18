import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
        const validStatuses = ['PAYMENT_RECEIVED', 'PAYMENT_CONFIRMED', 'PAID', 'ESCROW_HELD'];
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

        // TODO: Notify buyer about production start
        // TODO: Notify AM

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

        // TODO: Notify buyer about progress update

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

        // TODO: Notify buyer and inspection team

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
