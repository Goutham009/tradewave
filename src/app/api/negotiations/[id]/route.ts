import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

const ALLOWED_ROLES = new Set([
  'BUYER',
  'ACCOUNT_MANAGER',
  'SUPPLIER',
  'ADMIN',
  'PROCUREMENT_OFFICER',
]);

type SessionUser = {
  id: string;
  role?: string | null;
  email?: string | null;
};

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getSenderRole(role: string): string {
  if (role === 'BUYER') return 'BUYER';
  if (role === 'ACCOUNT_MANAGER') return 'ACCOUNT_MANAGER';
  if (role === 'SUPPLIER') return 'SUPPLIER';
  return 'SYSTEM';
}

async function loadNegotiationThread(threadId: string) {
  const thread = await prisma.negotiationThread.findUnique({
    where: { id: threadId },
    include: {
      requirement: {
        select: {
          id: true,
          title: true,
          category: true,
          quantity: true,
          unit: true,
          buyerId: true,
          assignedAccountManagerId: true,
          assignedProcurementOfficerId: true,
          buyer: {
            select: {
              id: true,
              name: true,
              companyName: true,
            },
          },
        },
      },
      messages: {
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          senderId: true,
          senderRole: true,
          messageType: true,
          content: true,
          metadata: true,
          createdAt: true,
        },
      },
    },
  });

  if (!thread) {
    return null;
  }

  const quotations = thread.quotationsInNegotiation.length
    ? await prisma.quotation.findMany({
        where: { id: { in: thread.quotationsInNegotiation } },
        select: {
          id: true,
          userId: true,
          total: true,
          currency: true,
          status: true,
          leadTime: true,
          deliveryTimeline: true,
          supplier: {
            select: {
              id: true,
              companyName: true,
              location: true,
              email: true,
            },
          },
        },
      })
    : [];

  return { thread, quotations };
}

function canAccessThread(
  user: SessionUser,
  threadData: Awaited<ReturnType<typeof loadNegotiationThread>>
): boolean {
  if (!threadData) {
    return false;
  }

  const { thread, quotations } = threadData;
  const role = user.role || '';

  if (role === 'ADMIN') {
    return true;
  }

  if (role === 'BUYER') {
    return thread.buyerId === user.id;
  }

  if (role === 'ACCOUNT_MANAGER') {
    return (
      thread.accountManagerId === user.id ||
      thread.requirement.assignedAccountManagerId === user.id
    );
  }

  if (role === 'PROCUREMENT_OFFICER') {
    return thread.requirement.assignedProcurementOfficerId === user.id;
  }

  if (role === 'SUPPLIER') {
    return quotations.some(
      (quotation) =>
        quotation.userId === user.id ||
        Boolean(user.email && quotation.supplier.email === user.email)
    );
  }

  return false;
}

async function resolveSupplierUserIds(
  quotations: Array<{
    userId: string | null;
    supplier: { email: string };
  }>
): Promise<string[]> {
  const userIds = new Set<string>();
  const supplierEmails = new Set<string>();

  for (const quotation of quotations) {
    if (quotation.userId) {
      userIds.add(quotation.userId);
    } else if (quotation.supplier.email) {
      supplierEmails.add(quotation.supplier.email);
    }
  }

  if (supplierEmails.size > 0) {
    const supplierUsers = await prisma.user.findMany({
      where: {
        role: 'SUPPLIER',
        email: { in: Array.from(supplierEmails) },
      },
      select: { id: true },
    });

    for (const user of supplierUsers) {
      userIds.add(user.id);
    }
  }

  return Array.from(userIds);
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = session.user.role || '';
    if (!ALLOWED_ROLES.has(role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const threadData = await loadNegotiationThread(params.id);
    if (!threadData) {
      return NextResponse.json({ error: 'Negotiation thread not found' }, { status: 404 });
    }

    if (!canAccessThread(session.user as SessionUser, threadData)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { thread, quotations } = threadData;
    const quoteTotals = quotations.map((quotation) => toNumber(quotation.total));
    const selectedQuotation = thread.selectedQuotationId
      ? quotations.find((quotation) => quotation.id === thread.selectedQuotationId)
      : null;

    const response = {
      id: thread.id,
      status: thread.status,
      accountManagerId: thread.accountManagerId,
      negotiationPoints: thread.negotiationPoints,
      buyerTargets: thread.buyerTargets,
      buyerComments: thread.buyerComments,
      selectedQuotationId: thread.selectedQuotationId,
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt,
      lastActivity: thread.lastActivity,
      requirement: {
        id: thread.requirement.id,
        title: thread.requirement.title,
        category: thread.requirement.category,
        quantity: thread.requirement.quantity,
        unit: thread.requirement.unit,
      },
      buyer: {
        id: thread.requirement.buyer.id,
        name:
          thread.requirement.buyer.companyName ||
          thread.requirement.buyer.name ||
          'Buyer',
      },
      quotations: quotations.map((quotation) => ({
        id: quotation.id,
        supplierName: quotation.supplier.companyName,
        supplierLocation: quotation.supplier.location,
        total: toNumber(quotation.total),
        currency: quotation.currency,
        status: quotation.status,
        leadTime: quotation.leadTime,
        deliveryTimeline: quotation.deliveryTimeline,
        isSelected: quotation.id === thread.selectedQuotationId,
      })),
      currentAmount: selectedQuotation
        ? toNumber(selectedQuotation.total)
        : quoteTotals.length > 0
          ? Math.min(...quoteTotals)
          : null,
      originalAmount: quoteTotals.length > 0 ? Math.max(...quoteTotals) : null,
      messages: thread.messages.map((message) => ({
        id: message.id,
        senderId: message.senderId,
        senderRole: message.senderRole,
        messageType: message.messageType,
        content: message.content,
        metadata: message.metadata,
        createdAt: message.createdAt,
      })),
    };

    return NextResponse.json({ status: 'success', thread: response });
  } catch (error) {
    console.error('Error fetching negotiation thread:', error);
    return NextResponse.json(
      { error: 'Failed to fetch negotiation thread' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = session.user.role || '';
    if (!ALLOWED_ROLES.has(role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const content = typeof body?.content === 'string' ? body.content.trim() : '';
    const messageType = typeof body?.messageType === 'string' ? body.messageType : 'TEXT';
    const metadata = body?.metadata && typeof body.metadata === 'object' ? body.metadata : null;

    if (!content) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    const threadData = await loadNegotiationThread(params.id);
    if (!threadData) {
      return NextResponse.json({ error: 'Negotiation thread not found' }, { status: 404 });
    }

    if (!canAccessThread(session.user as SessionUser, threadData)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (threadData.thread.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Cannot post messages to a closed negotiation thread' },
        { status: 400 }
      );
    }

    const senderRole = getSenderRole(role);

    const createdMessage = await prisma.$transaction(async (tx) => {
      const message = await tx.negotiationMessage.create({
        data: {
          threadId: threadData.thread.id,
          senderId: session.user.id,
          senderRole,
          messageType,
          content,
          metadata,
        },
      });

      await tx.negotiationThread.update({
        where: { id: threadData.thread.id },
        data: { lastActivity: new Date() },
      });

      return message;
    });

    const supplierUserIds = await resolveSupplierUserIds(threadData.quotations);

    const recipients = new Set<string>();
    recipients.add(threadData.thread.buyerId);
    if (threadData.thread.accountManagerId) {
      recipients.add(threadData.thread.accountManagerId);
    }
    for (const userId of supplierUserIds) {
      recipients.add(userId);
    }
    recipients.delete(session.user.id);

    if (recipients.size > 0) {
      await prisma.notification.createMany({
        data: Array.from(recipients).map((userId) => ({
          userId,
          type: 'SYSTEM',
          title: 'Negotiation Update',
          message: `New message on negotiation for ${threadData.thread.requirement.title}.`,
          resourceType: 'negotiation',
          resourceId: threadData.thread.id,
        })),
      });
    }

    return NextResponse.json(
      {
        status: 'success',
        message: {
          id: createdMessage.id,
          senderId: createdMessage.senderId,
          senderRole: createdMessage.senderRole,
          messageType: createdMessage.messageType,
          content: createdMessage.content,
          metadata: createdMessage.metadata,
          createdAt: createdMessage.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error posting negotiation message:', error);
    return NextResponse.json(
      { error: 'Failed to post negotiation message' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = session.user.role || '';
    if (!ALLOWED_ROLES.has(role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!['BUYER', 'ACCOUNT_MANAGER', 'ADMIN', 'PROCUREMENT_OFFICER'].includes(role)) {
      return NextResponse.json(
        { error: 'Only buyer/account manager/admin/procurement can update negotiation status' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const action = typeof body?.action === 'string' ? body.action : '';

    const threadData = await loadNegotiationThread(params.id);
    if (!threadData) {
      return NextResponse.json({ error: 'Negotiation thread not found' }, { status: 404 });
    }

    if (!canAccessThread(session.user as SessionUser, threadData)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (action === 'SET_STATUS') {
      const nextStatus = typeof body?.status === 'string' ? body.status : '';
      const allowedStatuses = new Set(['ACTIVE', 'COMPLETED', 'ABANDONED', 'EXPIRED']);

      if (!allowedStatuses.has(nextStatus)) {
        return NextResponse.json(
          { error: 'Invalid status. Use ACTIVE, COMPLETED, ABANDONED, or EXPIRED.' },
          { status: 400 }
        );
      }

      const updated = await prisma.negotiationThread.update({
        where: { id: threadData.thread.id },
        data: {
          status: nextStatus,
          completedAt: nextStatus === 'COMPLETED' ? new Date() : null,
          lastActivity: new Date(),
        },
      });

      return NextResponse.json({
        status: 'success',
        thread: {
          id: updated.id,
          status: updated.status,
          selectedQuotationId: updated.selectedQuotationId,
          lastActivity: updated.lastActivity,
        },
      });
    }

    if (action === 'SELECT_QUOTATION') {
      const selectedQuotationId =
        typeof body?.selectedQuotationId === 'string' ? body.selectedQuotationId : '';

      if (!selectedQuotationId) {
        return NextResponse.json(
          { error: 'selectedQuotationId is required for SELECT_QUOTATION action' },
          { status: 400 }
        );
      }

      const isInThread = threadData.thread.quotationsInNegotiation.includes(selectedQuotationId);
      if (!isInThread) {
        return NextResponse.json(
          { error: 'Selected quotation is not part of this negotiation thread' },
          { status: 400 }
        );
      }

      const updated = await prisma.negotiationThread.update({
        where: { id: threadData.thread.id },
        data: {
          selectedQuotationId,
          lastActivity: new Date(),
        },
      });

      return NextResponse.json({
        status: 'success',
        thread: {
          id: updated.id,
          status: updated.status,
          selectedQuotationId: updated.selectedQuotationId,
          lastActivity: updated.lastActivity,
        },
      });
    }

    return NextResponse.json(
      { error: 'Invalid action. Use SET_STATUS or SELECT_QUOTATION.' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating negotiation thread:', error);
    return NextResponse.json(
      { error: 'Failed to update negotiation thread' },
      { status: 500 }
    );
  }
}
