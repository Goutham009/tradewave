import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { formatRequirementReference } from '@/lib/flow-references';
import { getDemoProcurementRequirementsApiPayload, shouldUseDemoFallback } from '@/lib/demo/fallback';

type QueueStatus = 'pending_match' | 'suppliers_contacted' | 'quotes_received';
type QueuePriority = 'high' | 'medium' | 'low';

function toQueueStatus(status: string): QueueStatus {
  if (status === 'QUOTATIONS_READY') {
    return 'quotes_received';
  }

  if (status === 'QUOTES_PENDING' || status === 'SOURCING') {
    return 'suppliers_contacted';
  }

  return 'pending_match';
}

function toQueuePriority(value: string | null | undefined): QueuePriority {
  const normalized = (value || '').toUpperCase();

  if (normalized === 'URGENT' || normalized === 'HIGH') {
    return 'high';
  }

  if (normalized === 'LOW') {
    return 'low';
  }

  return 'medium';
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!['PROCUREMENT_OFFICER', 'PROCUREMENT_TEAM', 'ADMIN'].includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {
      sentDirectlyToSupplier: false,
      status: {
        in: ['VERIFIED', 'SOURCING', 'QUOTES_PENDING', 'QUOTATIONS_READY'],
      },
    };

    if (status && status !== 'all') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { buyer: { companyName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const requirements = await prisma.requirement.findMany({
      where,
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            companyName: true,
          },
        },
        _count: {
          select: {
            quotations: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 100,
    });

    const procurementOwnerIds = Array.from(
      new Set(
        requirements
          .map((requirement) => requirement.assignedProcurementOfficerId)
          .filter((id): id is string => Boolean(id))
      )
    );

    const procurementOwners = procurementOwnerIds.length
      ? await prisma.user.findMany({
          where: { id: { in: procurementOwnerIds } },
          select: { id: true, name: true },
        })
      : [];

    const procurementOwnerById = new Map(
      procurementOwners.map((owner) => [owner.id, owner])
    );

    return NextResponse.json({
      requirements: requirements.map((requirement) => ({
        id: requirement.id,
        requirementReference: formatRequirementReference(requirement.id),
        title: requirement.title,
        buyerName: requirement.buyer.companyName || requirement.buyer.name,
        category: requirement.category,
        quantity: requirement.quantity,
        unit: requirement.unit,
        budget:
          requirement.totalBudgetMax !== null
            ? Number(requirement.totalBudgetMax)
            : requirement.budgetMax !== null
              ? Number(requirement.budgetMax) * requirement.quantity
              : requirement.budgetMin !== null
                ? Number(requirement.budgetMin) * requirement.quantity
                : 0,
        deliveryLocation: requirement.deliveryLocation,
        deadline: requirement.deliveryDeadline.toISOString(),
        status: toQueueStatus(requirement.status),
        rawStatus: requirement.status,
        priority: toQueuePriority(requirement.procurementPriority || String(requirement.priority)),
        suppliersContacted: requirement.suppliersSent || 0,
        quotesReceived: requirement._count.quotations || requirement.quotesReceived || 0,
        procurementOwner:
          (requirement.assignedProcurementOfficerId
            ? procurementOwnerById.get(requirement.assignedProcurementOfficerId)?.name
            : null) || 'Unassigned',
        createdAt: requirement.createdAt.toISOString(),
        lastUpdated: requirement.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Failed to fetch procurement requirements queue:', error);

    if (shouldUseDemoFallback(error)) {
      return NextResponse.json(getDemoProcurementRequirementsApiPayload());
    }

    return NextResponse.json({ error: 'Failed to fetch requirements queue' }, { status: 500 });
  }
}
