import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/api/requireAdmin';
import { successResponse, errorResponse } from '@/lib/api/errorHandler';
import { formatRequirementReference } from '@/lib/flow-references';
import {
  getDemoAdminRequirementByIdPayload,
  isLikelyDemoIdentifier,
  shouldUseDemoFallback,
} from '@/lib/demo/fallback';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const requirement = await prisma.requirement.findUnique({
      where: { id: params.id },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            companyName: true,
          },
        },
        _count: {
          select: {
            quotations: true,
          },
        },
      },
    });

    if (!requirement) {
      if (isLikelyDemoIdentifier(params.id, ['req_demo_', 'req-', 'req_'])) {
        return NextResponse.json(getDemoAdminRequirementByIdPayload(params.id));
      }

      return NextResponse.json({ success: false, error: 'Requirement not found' }, { status: 404 });
    }

    const [acceptedQuotation, activeTransaction] = await Promise.all([
      prisma.quotation.findFirst({
        where: {
          requirementId: requirement.id,
          status: 'ACCEPTED',
        },
        select: { id: true },
      }),
      prisma.transaction.findFirst({
        where: {
          requirementId: requirement.id,
          status: { not: 'CANCELLED' as any },
        },
        orderBy: { createdAt: 'desc' },
        select: { id: true },
      }),
    ]);

    const relatedUserIds = [
      requirement.assignedAccountManagerId,
      requirement.assignedProcurementOfficerId,
    ].filter((id): id is string => Boolean(id));

    const relatedUsers = relatedUserIds.length
      ? await prisma.user.findMany({
          where: { id: { in: relatedUserIds } },
          select: { id: true, name: true, email: true },
        })
      : [];

    const relatedUsersById = new Map(relatedUsers.map((user) => [user.id, user]));

    const accountManager = requirement.assignedAccountManagerId
      ? relatedUsersById.get(requirement.assignedAccountManagerId)
      : null;

    const procurementOfficer = requirement.assignedProcurementOfficerId
      ? relatedUsersById.get(requirement.assignedProcurementOfficerId)
      : null;

    const specificationsText =
      requirement.technicalSpecs ||
      (requirement.specifications && Object.keys(requirement.specifications as object).length > 0
        ? JSON.stringify(requirement.specifications, null, 2)
        : null);

    return successResponse({
      id: requirement.id,
      requirementReference: formatRequirementReference(requirement.id),
      title: requirement.title,
      description: requirement.description,
      category: requirement.category,
      status: requirement.status,
      isReorder: (requirement as any).isReorder || false,
      originalTransactionId: (requirement as any).originalTransactionId || null,
      preferredSupplierId: (requirement as any).preferredSupplierId || null,
      sentDirectlyToSupplier: (requirement as any).sentDirectlyToSupplier || false,
      quantity: requirement.quantity,
      unit: requirement.unit,
      budgetMin: requirement.budgetMin ? Number(requirement.budgetMin) : null,
      budgetMax: requirement.budgetMax ? Number(requirement.budgetMax) : null,
      currency: requirement.currency,
      deliveryLocation: requirement.deliveryLocation,
      deliveryDeadline: requirement.deliveryDeadline.toISOString(),
      priority: requirement.priority,
      amVerified: requirement.amVerified,
      adminReviewed: requirement.adminReviewed,
      suppliersContacted: requirement.suppliersSent || 0,
      quotesReceived: requirement._count?.quotations || requirement.quotesReceived || 0,
      buyer: requirement.buyer,
      accountManager: accountManager
        ? {
            id: accountManager.id,
            name: accountManager.name,
            email: accountManager.email,
          }
        : null,
      procurementOfficer: procurementOfficer
        ? {
            id: procurementOfficer.id,
            name: procurementOfficer.name,
            email: procurementOfficer.email,
          }
        : null,
      specifications: specificationsText,
      additionalNotes: requirement.internalNotes || null,
      acceptedQuotationId: acceptedQuotation?.id || null,
      transactionId: activeTransaction?.id || null,
      createdAt: requirement.createdAt.toISOString(),
      updatedAt: requirement.updatedAt.toISOString(),
    });
  } catch (error) {
    if (shouldUseDemoFallback(error)) {
      return NextResponse.json(getDemoAdminRequirementByIdPayload(params.id));
    }

    return errorResponse(error);
  }
}
