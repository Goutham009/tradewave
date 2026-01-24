import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { emitToUser } from '@/lib/socket/server';

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    let processed = 0;
    let autoReleased = 0;
    let completed = 0;
    let reminders = 0;

    // 1. Auto-release funds for QUALITY_APPROVED transactions
    const approvedTransactions = await prisma.transaction.findMany({
      where: {
        status: 'QUALITY_APPROVED',
        fundsReleasedAt: null,
      },
      include: {
        supplier: true,
        buyer: true,
      },
    });

    for (const transaction of approvedTransactions) {
      try {
        const amount = Number(transaction.amount);
        const platformFee = amount * 0.02;
        const payoutAmount = amount - platformFee;

        await prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            status: 'FUNDS_RELEASED',
            fundsReleasedAt: new Date(),
            releaseReason: 'auto-release',
            platformFee,
            payoutAmount,
            releaseTransactionId: `auto_payout_${transaction.id}_${Date.now()}`,
          },
        });

        await prisma.transactionStatusHistory.create({
          data: {
            transactionId: transaction.id,
            oldStatus: 'QUALITY_APPROVED',
            newStatus: 'FUNDS_RELEASED',
            reason: 'Automatic fund release after quality approval',
            metadata: { platformFee, payoutAmount },
          },
        });

        await prisma.escrowTransaction.updateMany({
          where: { transactionId: transaction.id },
          data: {
            status: 'RELEASED',
            releaseDate: new Date(),
          },
        });

        // Notify parties
        emitToUser(transaction.supplierId, 'fundsReleased', {
          transactionId: transaction.id,
          amount: payoutAmount,
          timestamp: new Date(),
        });

        emitToUser(transaction.buyerId, 'fundsReleased', {
          transactionId: transaction.id,
          amount: payoutAmount,
          timestamp: new Date(),
        });

        autoReleased++;
        processed++;
      } catch (err) {
        console.error(`Failed to auto-release funds for ${transaction.id}:`, err);
      }
    }

    // 2. Mark FUNDS_RELEASED as COMPLETED after 48 hours
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const releasedTransactions = await prisma.transaction.findMany({
      where: {
        status: 'FUNDS_RELEASED',
        fundsReleasedAt: {
          lt: fortyEightHoursAgo,
        },
      },
      include: {
        supplier: true,
        buyer: true,
      },
    });

    for (const transaction of releasedTransactions) {
      try {
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            status: 'COMPLETED',
          },
        });

        await prisma.transactionStatusHistory.create({
          data: {
            transactionId: transaction.id,
            oldStatus: 'FUNDS_RELEASED',
            newStatus: 'COMPLETED',
            reason: 'Automatic completion after 48 hours',
          },
        });

        await prisma.transactionMilestone.create({
          data: {
            transactionId: transaction.id,
            status: 'COMPLETED',
            description: 'Transaction completed automatically',
            actor: 'system',
          },
        });

        // Notify parties
        emitToUser(transaction.supplierId, 'transactionCompleted', {
          transactionId: transaction.id,
          timestamp: new Date(),
        });

        emitToUser(transaction.buyerId, 'transactionCompleted', {
          transactionId: transaction.id,
          timestamp: new Date(),
        });

        completed++;
        processed++;
      } catch (err) {
        console.error(`Failed to complete transaction ${transaction.id}:`, err);
      }
    }

    // 3. Send reminders for QUALITY_PENDING > 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const pendingQualityTransactions = await prisma.transaction.findMany({
      where: {
        status: 'QUALITY_PENDING',
        deliveryConfirmedAt: {
          lt: sevenDaysAgo,
        },
      },
      include: {
        buyer: true,
      },
    });

    for (const transaction of pendingQualityTransactions) {
      try {
        // Create reminder notification
        await prisma.notification.create({
          data: {
            userId: transaction.buyerId,
            type: 'QUALITY_APPROVED', // Using existing type for reminder
            title: 'Quality Assessment Reminder',
            message: `Please assess the quality of your order. If not assessed within 3 more days, quality will be auto-approved.`,
            resourceType: 'transaction',
            resourceId: transaction.id,
          },
        });

        reminders++;
        processed++;
      } catch (err) {
        console.error(`Failed to send reminder for ${transaction.id}:`, err);
      }
    }

    // 4. Auto-approve quality after 10 days (7 + 3 grace period)
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    const overdueQualityTransactions = await prisma.transaction.findMany({
      where: {
        status: 'QUALITY_PENDING',
        deliveryConfirmedAt: {
          lt: tenDaysAgo,
        },
      },
      include: {
        supplier: true,
        buyer: true,
      },
    });

    for (const transaction of overdueQualityTransactions) {
      try {
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            status: 'QUALITY_APPROVED',
            qualityAssessmentAt: new Date(),
            qualityRating: 4, // Default good rating
            qualityNotes: 'Auto-approved after 10-day assessment period',
            acceptanceReason: 'Auto-approved - no issues reported within deadline',
          },
        });

        await prisma.transactionStatusHistory.create({
          data: {
            transactionId: transaction.id,
            oldStatus: 'QUALITY_PENDING',
            newStatus: 'QUALITY_APPROVED',
            reason: 'Auto-approved after deadline',
          },
        });

        await prisma.escrowTransaction.updateMany({
          where: { transactionId: transaction.id },
          data: {
            qualityApproved: true,
            qualityApprovedAt: new Date(),
          },
        });

        // Notify parties
        emitToUser(transaction.supplierId, 'qualityApproved', {
          transactionId: transaction.id,
          rating: 4,
          autoApproved: true,
          timestamp: new Date(),
        });

        emitToUser(transaction.buyerId, 'qualityApproved', {
          transactionId: transaction.id,
          rating: 4,
          autoApproved: true,
          timestamp: new Date(),
        });

        processed++;
      } catch (err) {
        console.error(`Failed to auto-approve quality for ${transaction.id}:`, err);
      }
    }

    return NextResponse.json({
      success: true,
      processed,
      autoReleased,
      completed,
      reminders,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Transaction auto-progress cron error:', error);
    return NextResponse.json(
      { error: 'Failed to process transactions' },
      { status: 500 }
    );
  }
}
