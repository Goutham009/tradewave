import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

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
    const {
      requirementId,
      quotationIds, // Array of quotation IDs buyer wants to negotiate on
      negotiationPoints, // PRICE, PAYMENT_TERMS, DELIVERY_TIMELINE, WARRANTY, etc.
      buyerTargets, // { desiredPrice, budget, paymentTerms, deliveryTimeline }
      buyerComments,
    } = body;

    if (!requirementId || !quotationIds?.length) {
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

    const thread = await prisma.negotiationThread.create({
      data: {
        requirementId,
        buyerId: session.user.id,
        accountManagerId: requirement?.assignedAccountManagerId || null,
        status: 'ACTIVE',
        quotationsInNegotiation: quotationIds,
        negotiationPoints: negotiationPoints || ['PRICE'],
        buyerTargets: buyerTargets || null,
        buyerComments: buyerComments || null,
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
        content: buyerComments || `Negotiation started on ${quotationIds.length} quotation(s).`,
        metadata: { quotationIds, negotiationPoints, buyerTargets },
      },
    });

    // Update quotations to IN_NEGOTIATION
    await prisma.quotation.updateMany({
      where: { id: { in: quotationIds } },
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

    // TODO: Notify AM about negotiation start
    // TODO: Notify relevant suppliers through AM

    return NextResponse.json({
      status: 'success',
      thread: {
        id: thread.id,
        requirementId: thread.requirementId,
        status: thread.status,
        quotationIds,
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
