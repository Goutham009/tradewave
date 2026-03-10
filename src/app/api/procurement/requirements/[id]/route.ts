import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { formatRequirementReference } from '@/lib/flow-references';
import {
  getDemoProcurementRequirementByIdPayload,
  isLikelyDemoIdentifier,
  shouldUseDemoFallback,
} from '@/lib/demo/fallback';

type QueueStatus = 'pending_match' | 'suppliers_contacted' | 'quotes_received';
type OutreachStatus = 'INVITED' | 'VIEWED_RFQ' | 'QUOTATION_SUBMITTED' | 'DECLINED' | 'EXPIRED';

function toQueueStatus(status: string): QueueStatus {
  if (status === 'QUOTATIONS_READY') {
    return 'quotes_received';
  }

  if (status === 'QUOTES_PENDING' || status === 'SOURCING') {
    return 'suppliers_contacted';
  }

  return 'pending_match';
}

function toOutreachStatus(cardStatus: string): OutreachStatus {
  if (cardStatus === 'VIEWED') {
    return 'VIEWED_RFQ';
  }

  if (cardStatus === 'QUOTE_SUBMITTED') {
    return 'QUOTATION_SUBMITTED';
  }

  if (cardStatus === 'DECLINED') {
    return 'DECLINED';
  }

  if (cardStatus === 'EXPIRED') {
    return 'EXPIRED';
  }

  return 'INVITED';
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!['PROCUREMENT_OFFICER', 'PROCUREMENT_TEAM', 'ADMIN'].includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const requirement = await prisma.requirement.findUnique({
      where: { id: params.id },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            companyName: true,
          },
        },
        supplierCards: {
          include: {
            supplier: {
              select: {
                id: true,
                name: true,
                companyName: true,
                email: true,
                location: true,
              },
            },
          },
          orderBy: { sentAt: 'desc' },
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
        return NextResponse.json(getDemoProcurementRequirementByIdPayload(params.id));
      }

      return NextResponse.json({ error: 'Requirement not found' }, { status: 404 });
    }

    const procurementOwner = requirement.assignedProcurementOfficerId
      ? await prisma.user.findUnique({
          where: { id: requirement.assignedProcurementOfficerId },
          select: { id: true, name: true },
        })
      : null;

    const quotations = await prisma.quotation.findMany({
      where: { requirementId: params.id },
      select: {
        supplierId: true,
        total: true,
        submittedAt: true,
        createdAt: true,
        status: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const latestQuotationBySupplier = new Map<string, {
      total: unknown;
      submittedAt: Date | null;
      createdAt: Date;
      status: string;
    }>();

    for (const quotation of quotations) {
      if (!latestQuotationBySupplier.has(quotation.supplierId)) {
        latestQuotationBySupplier.set(quotation.supplierId, quotation);
      }
    }

    const suppliers = requirement.supplierCards.map((card) => {
      const outreachStatus = toOutreachStatus(card.status);
      const latestQuote = latestQuotationBySupplier.get(card.supplierId);
      const respondedAt =
        outreachStatus === 'QUOTATION_SUBMITTED'
          ? latestQuote?.submittedAt || latestQuote?.createdAt || card.updatedAt
          : outreachStatus === 'VIEWED_RFQ'
            ? card.viewedAt || card.updatedAt
            : outreachStatus === 'DECLINED' || outreachStatus === 'EXPIRED'
              ? card.updatedAt
              : null;

      return {
        id: card.id,
        supplierId: card.supplierId,
        supplierName: card.supplier.companyName || card.supplier.name,
        contactEmail: card.supplier.email,
        region: card.supplier.location,
        invitedAt: card.sentAt.toISOString(),
        respondedAt: respondedAt ? respondedAt.toISOString() : null,
        status: outreachStatus,
        quotedAmount: latestQuote?.total ? Number(latestQuote.total) : null,
      };
    });

    return NextResponse.json({
      requirement: {
        id: requirement.id,
        requirementReference: formatRequirementReference(requirement.id),
        buyerCompany: requirement.buyer.companyName || requirement.buyer.name,
        productType: requirement.title,
        category: requirement.category,
        quantity: requirement.quantity,
        unit: requirement.unit,
        deliveryLocation: requirement.deliveryLocation,
        deliveryDeadline: requirement.deliveryDeadline.toISOString(),
        procurementOwner: procurementOwner?.name || 'Unassigned',
        createdAt: requirement.createdAt.toISOString(),
        status: toQueueStatus(requirement.status),
        rawStatus: requirement.status,
        suppliersInvited: requirement.suppliersSent || requirement.supplierCards.length,
        quotationsReceived: requirement._count.quotations || requirement.quotesReceived || 0,
        suppliers,
      },
    });
  } catch (error) {
    console.error('Failed to fetch procurement requirement detail:', error);

    if (shouldUseDemoFallback(error)) {
      return NextResponse.json(getDemoProcurementRequirementByIdPayload(params.id));
    }

    return NextResponse.json({ error: 'Failed to fetch requirement detail' }, { status: 500 });
  }
}
