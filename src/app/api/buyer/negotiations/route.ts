import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/services/notificationService';

// POST /api/buyer/negotiations - Start a negotiation thread
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'BUYER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const requirementId = typeof body?.requirementId === 'string' ? body.requirementId : '';
    const rawQuotationIds: unknown[] = Array.isArray(body?.quotationIds) ? body.quotationIds : [];
    const normalizedQuotationIds: string[] = Array.from(
      new Set(
        rawQuotationIds
          .filter(
            (quotationId: unknown): quotationId is string =>
              typeof quotationId === 'string' && quotationId.trim().length > 0
          )
          .map((quotationId: string) => quotationId.trim())
      )
    );
    const rawNegotiationPoints: unknown[] = Array.isArray(body?.negotiationPoints)
      ? body.negotiationPoints
      : [];
    const normalizedNegotiationPoints: string[] =
      Array.isArray(body?.negotiationPoints) && body.negotiationPoints.length > 0
        ? Array.from(
            new Set(
              rawNegotiationPoints
                .filter((point: unknown): point is string => typeof point === 'string' && point.trim().length > 0)
                .map((point: string) => point.trim())
            )
          )
        : ['PRICE'];
    const normalizedBuyerTargets =
      body?.buyerTargets && typeof body.buyerTargets === 'object' && !Array.isArray(body.buyerTargets)
        ? body.buyerTargets
        : null;
    const normalizedBuyerComments =
      typeof body?.buyerComments === 'string' && body.buyerComments.trim().length > 0
        ? body.buyerComments.trim()
        : null;

    if (!requirementId || normalizedQuotationIds.length === 0) {
      return NextResponse.json(
        { error: 'requirementId and at least one quotationId are required' },
        { status: 400 }
      );
    }

    // Get requirement to find AM
    const requirement = await prisma.requirement.findUnique({
      where: { id: requirementId },
      select: { assignedAccountManagerId: true, buyerId: true },
    });

    if (!requirement) {
      return NextResponse.json({ error: 'Requirement not found' }, { status: 404 });
    }

    if (requirement.buyerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const requestedQuotationIds = normalizedQuotationIds;

    const eligibleQuotations = await prisma.quotation.findMany({
      where: {
        id: { in: requestedQuotationIds },
        requirementId,
        visibleToBuyer: true,
        status: {
          in: ['APPROVED_BY_ADMIN', 'VISIBLE_TO_BUYER', 'IN_NEGOTIATION', 'SHORTLISTED'],
        },
      },
      select: {
        id: true,
        userId: true,
        supplierId: true,
      },
    });

    if (eligibleQuotations.length !== requestedQuotationIds.length) {
      return NextResponse.json(
        { error: 'One or more quotationIds are invalid for this requirement' },
        { status: 400 }
      );
    }

    const eligibleQuotationIds = eligibleQuotations.map((quotation) => quotation.id);

    const thread = await prisma.negotiationThread.create({
      data: {
        requirementId,
        buyerId: session.user.id,
        accountManagerId: requirement?.assignedAccountManagerId || null,
        status: 'ACTIVE',
        quotationsInNegotiation: eligibleQuotationIds,
        negotiationPoints: normalizedNegotiationPoints,
        buyerTargets: normalizedBuyerTargets,
        buyerComments: normalizedBuyerComments,
        lastActivity: new Date(),
      },
    });

    // Create initial system message
    await prisma.negotiationMessage.create({
      data: {
        threadId: thread.id,
        senderId: session.user.id,
        senderRole: 'BUYER',
        messageType: 'TEXT',
        content:
          normalizedBuyerComments ||
          `Negotiation started on ${eligibleQuotationIds.length} quotation(s).`,
        metadata: {
          quotationIds: eligibleQuotationIds,
          negotiationPoints: normalizedNegotiationPoints,
          buyerTargets: normalizedBuyerTargets,
        },
      },
    });

    // Update quotations to IN_NEGOTIATION
    await prisma.quotation.updateMany({
      where: { id: { in: eligibleQuotationIds } },
      data: {
        status: 'IN_NEGOTIATION',
        negotiationThreadId: thread.id,
        negotiationStartedAt: new Date(),
      },
    });

    // Update requirement status
    await prisma.requirement.update({
      where: { id: requirementId },
      data: { status: 'NEGOTIATING' },
    });

    if (requirement.assignedAccountManagerId) {
      await createNotification({
        userId: requirement.assignedAccountManagerId,
        type: 'SYSTEM',
        title: 'New Negotiation Started',
        message: `Buyer started negotiation for requirement ${requirementId} across ${eligibleQuotationIds.length} quotation(s).`,
        resourceType: 'negotiation',
        resourceId: thread.id,
        metadata: {
          requirementId,
          quotationIds: eligibleQuotationIds,
          negotiationPoints: normalizedNegotiationPoints,
        },
        sendEmail: true,
      });
    }

    const supplierIds = Array.from(
      new Set(
        eligibleQuotations
          .map((quotation) => quotation.supplierId)
          .filter((supplierId): supplierId is string => Boolean(supplierId))
      )
    );

    const suppliers = supplierIds.length
      ? await prisma.supplier.findMany({
          where: { id: { in: supplierIds } },
          select: {
            id: true,
            email: true,
          },
        })
      : [];

    const supplierEmails = suppliers
      .map((supplier) => supplier.email)
      .filter((email): email is string => Boolean(email));

    const supplierUsers = supplierEmails.length
      ? await prisma.user.findMany({
          where: {
            role: 'SUPPLIER',
            email: { in: supplierEmails },
          },
          select: {
            id: true,
            email: true,
          },
        })
      : [];

    const supplierUserIdByEmail = new Map(supplierUsers.map((user) => [user.email, user.id]));
    const supplierUserIdBySupplierId = new Map(
      suppliers
        .map((supplier) => [supplier.id, supplierUserIdByEmail.get(supplier.email)] as const)
        .filter((entry): entry is [string, string] => Boolean(entry[1]))
    );

    const supplierUserIds = Array.from(
      new Set(
        eligibleQuotations
          .map((quotation) => quotation.userId || supplierUserIdBySupplierId.get(quotation.supplierId))
          .filter((userId): userId is string => Boolean(userId))
      )
    );

    await Promise.all(
      supplierUserIds.map((supplierUserId) =>
        createNotification({
          userId: supplierUserId,
          type: 'SYSTEM',
          title: 'Negotiation Requested by Buyer',
          message: `A buyer has started negotiation for one of your quotations. The account manager will coordinate next steps.`,
          resourceType: 'negotiation',
          resourceId: thread.id,
          metadata: {
            requirementId,
            quotationIds: eligibleQuotationIds,
            accountManagerId: requirement.assignedAccountManagerId,
          },
          sendEmail: true,
        })
      )
    );

    return NextResponse.json({
      status: 'success',
      thread: {
        id: thread.id,
        requirementId: thread.requirementId,
        status: thread.status,
        quotationIds: eligibleQuotationIds,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating negotiation:', error);
    return NextResponse.json({ error: 'Failed to start negotiation' }, { status: 500 });
  }
}

// GET /api/buyer/negotiations?buyerId=xxx - List buyer's negotiation threads
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'BUYER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const where: any = { buyerId: session.user.id };
    if (status) where.status = status;

    const threads = await prisma.negotiationThread.findMany({
      where,
      include: {
        requirement: {
          select: { id: true, title: true, category: true, quantity: true, unit: true },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { lastActivity: 'desc' },
    });

    return NextResponse.json({ threads });
  } catch (error) {
    console.error('Error fetching negotiations:', error);
    return NextResponse.json({ error: 'Failed to fetch negotiations' }, { status: 500 });
  }
}
