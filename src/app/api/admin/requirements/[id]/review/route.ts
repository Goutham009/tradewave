import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { formatRequirementReference } from '@/lib/flow-references';

// POST /api/admin/requirements/[id]/review - Admin reviews and approves requirement
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const {
      action, // 'approve', 'reject', 'request_changes'
      adminNotes,
      // Procurement assignment (when approving)
      assignedProcurementOfficerId,
      procurementPriority,
      matchingInstructions, // JSON object with matching criteria
      // Direct send to supplier (for reorders)
      sentDirectlyToSupplier,
      sendTo, // 'direct' | 'procurement'
    } = body;
    const adminReviewedBy = session.user.id;

    const requirement = await prisma.requirement.findUnique({
      where: { id: params.id },
    });

    if (!requirement) {
      return NextResponse.json({ error: 'Requirement not found' }, { status: 404 });
    }

    if (action === 'approve') {
      const isDirectSend = sentDirectlyToSupplier || sendTo === 'direct';
      const requirementRef = formatRequirementReference(requirement.id);

      // Update requirement
      const updatedRequirement = await prisma.requirement.update({
        where: { id: params.id },
        data: {
          status: 'VERIFIED',
          adminReviewed: true,
          adminReviewedBy,
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
            sentBy: adminReviewedBy,
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
            createdBy: adminReviewedBy,
          },
        });
      }

      // Notify buyer and assigned AM after admin approval
      await prisma.notification.createMany({
        data: [
          {
            userId: requirement.buyerId,
            type: 'REQUIREMENT_CREATED',
            title: 'Requirement Approved',
            message: `Requirement ${requirementRef} has been approved by admin and moved to ${isDirectSend ? 'direct supplier outreach' : 'procurement matching'}.`,
            resourceType: 'requirement',
            resourceId: requirement.id,
          },
          ...(requirement.assignedAccountManagerId
            ? [
                {
                  userId: requirement.assignedAccountManagerId,
                  type: 'REQUIREMENT_CREATED' as const,
                  title: 'Client Requirement Approved',
                  message: `Requirement ${requirementRef} for your client has been approved by admin.`,
                  resourceType: 'requirement',
                  resourceId: requirement.id,
                },
              ]
            : []),
        ],
      });

      if (!isDirectSend) {
        if (assignedProcurementOfficerId) {
          await prisma.notification.create({
            data: {
              userId: assignedProcurementOfficerId,
              type: 'REQUIREMENT_CREATED',
              title: 'New Requirement Assigned',
              message: `Requirement ${requirementRef} is ready for supplier matching.`,
              resourceType: 'requirement',
              resourceId: requirement.id,
            },
          });
        } else {
          const procurementUsers = await prisma.user.findMany({
            where: { role: 'PROCUREMENT_OFFICER' },
            select: { id: true },
          });

          if (procurementUsers.length > 0) {
            await prisma.notification.createMany({
              data: procurementUsers.map((user) => ({
                userId: user.id,
                type: 'REQUIREMENT_CREATED',
                title: 'Requirement Ready for Procurement',
                message: `Requirement ${requirementRef} is approved and waiting for supplier matching.`,
                resourceType: 'requirement',
                resourceId: requirement.id,
              })),
            });
          }
        }
      }

      return NextResponse.json({
        status: 'success',
        requirement: updatedRequirement,
        requirementReference: requirementRef,
        procurementTask,
        supplierCard,
        sentDirectly: isDirectSend,
      });
    } else if (action === 'reject') {
      const requirementRef = formatRequirementReference(requirement.id);
      const updatedRequirement = await prisma.requirement.update({
        where: { id: params.id },
        data: {
          status: 'CANCELLED',
          adminReviewed: true,
          adminReviewedBy,
          adminReviewedAt: new Date(),
          adminNotes: adminNotes || null,
        },
      });

      await prisma.notification.createMany({
        data: [
          {
            userId: requirement.buyerId,
            type: 'REQUIREMENT_CREATED',
            title: 'Requirement Rejected by Admin',
            message: `Requirement ${requirementRef} was rejected by admin.${adminNotes ? ` Notes: ${adminNotes}` : ''}`,
            resourceType: 'requirement',
            resourceId: requirement.id,
          },
          ...(requirement.assignedAccountManagerId
            ? [
                {
                  userId: requirement.assignedAccountManagerId,
                  type: 'REQUIREMENT_CREATED' as const,
                  title: 'Requirement Rejected',
                  message: `Requirement ${requirementRef} was rejected by admin.${adminNotes ? ` Notes: ${adminNotes}` : ''}`,
                  resourceType: 'requirement',
                  resourceId: requirement.id,
                },
              ]
            : []),
        ],
      });

      return NextResponse.json({ status: 'success', requirement: updatedRequirement, requirementReference: requirementRef });
    } else if (action === 'request_changes') {
      const requirementRef = formatRequirementReference(requirement.id);
      const updatedRequirement = await prisma.requirement.update({
        where: { id: params.id },
        data: {
          status: 'UNDER_REVIEW',
          adminNotes: adminNotes || null,
        },
      });

      await prisma.notification.createMany({
        data: [
          {
            userId: requirement.buyerId,
            type: 'REQUIREMENT_CREATED',
            title: 'Admin Requested Requirement Changes',
            message: `Admin requested changes for requirement ${requirementRef}.${adminNotes ? ` Details: ${adminNotes}` : ''}`,
            resourceType: 'requirement',
            resourceId: requirement.id,
          },
          ...(requirement.assignedAccountManagerId
            ? [
                {
                  userId: requirement.assignedAccountManagerId,
                  type: 'REQUIREMENT_CREATED' as const,
                  title: 'Requirement Update Needed',
                  message: `Requirement ${requirementRef} needs updates before approval.${adminNotes ? ` Details: ${adminNotes}` : ''}`,
                  resourceType: 'requirement',
                  resourceId: requirement.id,
                },
              ]
            : []),
        ],
      });

      return NextResponse.json({ status: 'success', requirement: updatedRequirement, requirementReference: requirementRef });
    } else {
      return NextResponse.json({ error: 'Invalid action. Use: approve, reject, or request_changes' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error reviewing requirement:', error);
    return NextResponse.json({ error: 'Failed to review requirement' }, { status: 500 });
  }
}
