// =============================================================================
// PHASE 9: ADMIN TIER CHANGE ACTION API
// GET /api/admin/tier-changes/[requestId] - Get single request details
// PATCH /api/admin/tier-changes/[requestId] - Approve/Reject/Hold/Investigate
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/db';
import { SUPPLIER_TIER_THRESHOLDS } from '@/lib/compliance';

interface RouteParams {
  params: { requestId: string };
}

// GET - Get single tier change request details
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { requestId } = params;

    const tierRequest = await prisma.supplierTierChangeRequest.findUnique({
      where: { id: requestId },
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            companyName: true,
            email: true,
            overallRating: true,
            totalReviews: true,
            verified: true,
          },
        },
        tierNotification: true,
      },
    });

    if (!tierRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Get supplier's compliance record
    const complianceRecord = await prisma.supplierComplianceRecord.findUnique({
      where: { supplierId: tierRequest.supplierId },
    });

    // Get supplier's violation history
    const violations = await prisma.supplierComplianceViolation.findMany({
      where: { supplierId: tierRequest.supplierId },
      orderBy: { detectedAt: 'desc' },
      take: 10,
    });

    // Get tier audit history
    const auditHistory = await prisma.supplierTierAuditLog.findMany({
      where: { supplierId: tierRequest.supplierId },
      orderBy: { changedAt: 'desc' },
      take: 5,
    });

    const proposedTierInfo = SUPPLIER_TIER_THRESHOLDS[tierRequest.proposedTier as keyof typeof SUPPLIER_TIER_THRESHOLDS];
    const previousTierInfo = SUPPLIER_TIER_THRESHOLDS[tierRequest.previousTier as keyof typeof SUPPLIER_TIER_THRESHOLDS];

    return NextResponse.json({
      request: {
        id: tierRequest.id,
        status: tierRequest.status,
        proposedTier: tierRequest.proposedTier,
        proposedTierLabel: `(Seller Tier) ${proposedTierInfo?.displayName || tierRequest.proposedTier}`,
        previousTier: tierRequest.previousTier,
        previousTierLabel: `(Seller Tier) ${previousTierInfo?.displayName || tierRequest.previousTier}`,
        changeReason: tierRequest.changeReason,
        metricsSnapshot: tierRequest.metricsSnapshot ? JSON.parse(tierRequest.metricsSnapshot) : null,
        approvalDeadline: tierRequest.approvalDeadline,
        createdAt: tierRequest.createdAt,
        reviewedAt: tierRequest.reviewedAt,
        adminNotes: tierRequest.adminNotes,
      },
      supplier: {
        ...tierRequest.supplier,
        tierLabel: `(Seller Tier) ${previousTierInfo?.displayName || tierRequest.previousTier}`,
      },
      notification: tierRequest.tierNotification ? {
        severity: tierRequest.tierNotification.severity,
        actionDeadline: tierRequest.tierNotification.actionDeadline,
        isEscalated: tierRequest.tierNotification.isEscalated,
      } : null,
      compliance: complianceRecord ? {
        score: complianceRecord.complianceScore,
        riskLevel: complianceRecord.riskLevel,
        isComplianceRisk: complianceRecord.isComplianceRisk,
        activeViolations: complianceRecord.activeViolations,
        totalViolations: complianceRecord.totalViolations,
      } : null,
      violations: violations.map(v => ({
        id: v.id,
        type: v.violationType,
        severity: v.severity,
        status: v.status,
        detectedAt: v.detectedAt,
      })),
      auditHistory: auditHistory.map(a => ({
        previousTier: a.previousTier,
        newTier: a.newTier,
        changeReason: a.changeReason,
        changedAt: a.changedAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching tier change request:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tier change request' },
      { status: 500 }
    );
  }
}

// PATCH - Admin action: Approve/Reject/Hold/Investigate
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { requestId } = params;
    const body = await request.json();
    const { action, notes, rejectionReason } = body;

    if (!action || !['APPROVE', 'REJECT', 'HOLD', 'INVESTIGATE'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be APPROVE, REJECT, HOLD, or INVESTIGATE' },
        { status: 400 }
      );
    }

    // Get the request
    const tierRequest = await prisma.supplierTierChangeRequest.findUnique({
      where: { id: requestId },
      include: { supplier: true },
    });

    if (!tierRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    if (tierRequest.status !== 'PENDING' && tierRequest.status !== 'ON_HOLD' && tierRequest.status !== 'INVESTIGATING') {
      return NextResponse.json(
        { error: 'Request has already been processed' },
        { status: 400 }
      );
    }

    const now = new Date();
    let newStatus: string;
    let executedAt: Date | null = null;

    switch (action) {
      case 'APPROVE':
        newStatus = 'APPROVED';
        executedAt = now;
        
        // Execute the tier change
        await prisma.supplierLoyaltyTier.upsert({
          where: { supplierId: tierRequest.supplierId },
          create: {
            supplierId: tierRequest.supplierId,
            currentTier: tierRequest.proposedTier,
            tierAppliedAt: now,
            tierApprovedByAdminId: session.user.id,
            tierApprovalNotes: notes,
            previousTiers: JSON.stringify([tierRequest.previousTier]),
          },
          update: {
            currentTier: tierRequest.proposedTier,
            tierAppliedAt: now,
            tierApprovedByAdminId: session.user.id,
            tierApprovalNotes: notes,
            previousTiers: {
              set: await (async () => {
                const existing = await prisma.supplierLoyaltyTier.findUnique({
                  where: { supplierId: tierRequest.supplierId },
                  select: { previousTiers: true },
                });
                const history = existing?.previousTiers ? JSON.parse(existing.previousTiers) : [];
                history.push(tierRequest.previousTier);
                return JSON.stringify(history.slice(-10));
              })(),
            },
          },
        });

        // Create audit log
        await prisma.supplierTierAuditLog.create({
          data: {
            supplierId: tierRequest.supplierId,
            previousTier: tierRequest.previousTier,
            newTier: tierRequest.proposedTier,
            changeReason: tierRequest.changeReason,
            triggeredBy: 'ADMIN_APPROVAL',
            metricsSnapshot: tierRequest.metricsSnapshot || '{}',
            changedAt: now,
            effectiveDate: now,
            approvedByAdminId: session.user.id,
            approvedAt: now,
            approvalNotes: notes,
          },
        });

        // Create notification for supplier
        await prisma.supplierComplianceNotification.create({
          data: {
            supplierId: tierRequest.supplierId,
            notificationType: 'TIER_CHANGE_APPROVED',
            subject: `Your seller tier has been updated to ${tierRequest.proposedTier}`,
            message: `Your seller tier has been changed from ${tierRequest.previousTier} to ${tierRequest.proposedTier}. ${notes || ''}`,
            channel: 'EMAIL',
          },
        });
        break;

      case 'REJECT':
        newStatus = 'REJECTED';
        
        // Create notification for supplier
        await prisma.supplierComplianceNotification.create({
          data: {
            supplierId: tierRequest.supplierId,
            notificationType: 'TIER_CHANGE_REJECTED',
            subject: `Tier change request rejected`,
            message: `Your tier change request has been rejected. Reason: ${rejectionReason || 'Not specified'}`,
            channel: 'EMAIL',
          },
        });
        break;

      case 'HOLD':
        newStatus = 'ON_HOLD';
        break;

      case 'INVESTIGATE':
        newStatus = 'INVESTIGATING';
        break;

      default:
        newStatus = tierRequest.status;
    }

    // Update the request
    const updatedRequest = await prisma.supplierTierChangeRequest.update({
      where: { id: requestId },
      data: {
        status: newStatus,
        reviewedByAdminId: session.user.id,
        reviewedAt: now,
        adminDecision: action,
        adminNotes: notes,
        rejectionReason: action === 'REJECT' ? rejectionReason : null,
        executedAt,
        executedByAdminId: action === 'APPROVE' ? session.user.id : null,
        executionNotes: action === 'APPROVE' ? notes : null,
      },
    });

    // Update notification
    await prisma.adminSupplierTierNotification.updateMany({
      where: { tierChangeRequestId: requestId },
      data: {
        isAcknowledged: true,
        acknowledgedAt: now,
        acknowledgedByAdminId: session.user.id,
        requiresAction: false,
      },
    });

    const tierInfo = SUPPLIER_TIER_THRESHOLDS[tierRequest.proposedTier as keyof typeof SUPPLIER_TIER_THRESHOLDS];

    return NextResponse.json({
      success: true,
      message: `Tier change request ${action.toLowerCase()}ed successfully`,
      request: {
        id: updatedRequest.id,
        status: updatedRequest.status,
        proposedTier: updatedRequest.proposedTier,
        tierLabel: `(Seller Tier) ${tierInfo?.displayName || updatedRequest.proposedTier}`,
        action,
        processedAt: now,
      },
    });
  } catch (error) {
    console.error('Error processing tier change request:', error);
    return NextResponse.json(
      { error: 'Failed to process tier change request' },
      { status: 500 }
    );
  }
}
