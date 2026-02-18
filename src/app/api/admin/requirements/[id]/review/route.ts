import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/admin/requirements/[id]/review - Admin reviews and approves requirement
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const {
      action, // 'approve', 'reject', 'request_changes'
      adminNotes,
      adminReviewedBy,
      // Procurement assignment (when approving)
      assignedProcurementOfficerId,
      procurementPriority,
      matchingInstructions, // JSON object with matching criteria
      // Direct send to supplier (for reorders)
      sentDirectlyToSupplier,
      sendTo, // 'direct' | 'procurement'
    } = body;

    const requirement = await prisma.requirement.findUnique({
      where: { id: params.id },
    });

    if (!requirement) {
      return NextResponse.json({ error: 'Requirement not found' }, { status: 404 });
    }

    if (action === 'approve') {
      const isDirectSend = sentDirectlyToSupplier || sendTo === 'direct';

      // Update requirement
      const updatedRequirement = await prisma.requirement.update({
        where: { id: params.id },
        data: {
          status: 'VERIFIED',
          adminReviewed: true,
          adminReviewedBy: adminReviewedBy || null,
          adminReviewedAt: new Date(),
          adminNotes: adminNotes || null,
          sentDirectlyToSupplier: isDirectSend,
          procurementAssigned: !isDirectSend && !!assignedProcurementOfficerId,
          assignedProcurementOfficerId: !isDirectSend ? (assignedProcurementOfficerId || null) : null,
          procurementAssignedAt: !isDirectSend && assignedProcurementOfficerId ? new Date() : null,
          procurementPriority: procurementPriority || 'NORMAL',
        } as any,
      });

      // If direct send to preferred supplier (reorder scenario)
      let supplierCard = null;
      if (isDirectSend && (requirement as any).preferredSupplierId) {
        supplierCard = await prisma.supplierRequirementCard.create({
          data: {
            requirementId: params.id,
            supplierId: (requirement as any).preferredSupplierId,
            status: 'SENT',
            sentBy: adminReviewedBy || 'admin',
            sentAt: new Date(),
            isDirect: true,
            visibleInfo: {
              product: requirement.title,
              category: requirement.category,
              quantity: requirement.quantity,
              unit: requirement.unit,
              budgetRange: `${requirement.budgetMin || 'N/A'} - ${requirement.budgetMax || 'N/A'} ${requirement.currency}`,
              deliveryLocation: requirement.deliveryLocation,
              deliveryDeadline: requirement.deliveryDeadline,
              specifications: requirement.specifications,
              isReorder: (requirement as any).isReorder || false,
            },
            internalInfo: {
              buyerCompany: 'Existing Customer',
              targetPrice: requirement.targetPrice,
              isReorder: (requirement as any).isReorder || false,
              originalTransactionId: (requirement as any).originalTransactionId,
            },
            responseDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h for reorders
          } as any,
        });

        // Update supplier count
        await prisma.requirement.update({
          where: { id: params.id },
          data: { suppliersSent: 1, suppliersSentAt: new Date() },
        });
      }

      // Create ProcurementTask if officer assigned (non-direct)
      let procurementTask = null;
      if (!isDirectSend && assignedProcurementOfficerId) {
        procurementTask = await prisma.procurementTask.create({
          data: {
            requirementId: params.id,
            assignedTo: assignedProcurementOfficerId,
            status: 'ASSIGNED',
            priority: procurementPriority || 'NORMAL',
            matchingCriteria: matchingInstructions || {
              preferredTiers: requirement.preferredSupplierTiers,
              geographies: requirement.preferredGeographies,
            },
            dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
            createdBy: adminReviewedBy || null,
          },
        });
      }

      // TODO: Send notification to buyer ("Requirement Approved")
      // TODO: Send notification to procurement officer / supplier
      // TODO: Send notification to AM

      return NextResponse.json({
        status: 'success',
        requirement: updatedRequirement,
        procurementTask,
        supplierCard,
        sentDirectly: isDirectSend,
      });
    } else if (action === 'reject') {
      const updatedRequirement = await prisma.requirement.update({
        where: { id: params.id },
        data: {
          status: 'CANCELLED',
          adminReviewed: true,
          adminReviewedBy: adminReviewedBy || null,
          adminReviewedAt: new Date(),
          adminNotes: adminNotes || null,
        },
      });

      return NextResponse.json({ status: 'success', requirement: updatedRequirement });
    } else if (action === 'request_changes') {
      const updatedRequirement = await prisma.requirement.update({
        where: { id: params.id },
        data: {
          status: 'UNDER_REVIEW',
          adminNotes: adminNotes || null,
        },
      });

      // TODO: Send notification to AM to update requirement

      return NextResponse.json({ status: 'success', requirement: updatedRequirement });
    } else {
      return NextResponse.json({ error: 'Invalid action. Use: approve, reject, or request_changes' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error reviewing requirement:', error);
    return NextResponse.json({ error: 'Failed to review requirement' }, { status: 500 });
  }
}
