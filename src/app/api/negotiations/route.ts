import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { getDemoNegotiationsApiPayload, shouldUseDemoFallback } from '@/lib/demo/fallback';

const ALLOWED_ROLES = new Set([
  'BUYER',
  'ACCOUNT_MANAGER',
  'SUPPLIER',
  'ADMIN',
  'PROCUREMENT_OFFICER',
]);

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = session.user.role || '';
    if (!ALLOWED_ROLES.has(role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const query = searchParams.get('q')?.trim().toLowerCase() || '';

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (role === 'BUYER') {
      where.buyerId = session.user.id;
    }

    if (role === 'ACCOUNT_MANAGER') {
      where.OR = [{ accountManagerId: session.user.id }, { requirement: { assignedAccountManagerId: session.user.id } }];
    }

    if (role === 'PROCUREMENT_OFFICER') {
      where.requirement = {
        assignedProcurementOfficerId: session.user.id,
      };
    }

    if (role === 'SUPPLIER') {
      const supplierOwnershipFilters: Record<string, unknown>[] = [{ userId: session.user.id }];
      if (session.user.email) {
        supplierOwnershipFilters.push({ supplier: { email: session.user.email } });
      }

      const supplierQuoteRows = await prisma.quotation.findMany({
        where: { OR: supplierOwnershipFilters } as any,
        select: { id: true },
      });

      const supplierQuoteIds = supplierQuoteRows.map((quotation) => quotation.id);

      if (supplierQuoteIds.length === 0) {
        return NextResponse.json({ status: 'success', threads: [], total: 0 });
      }

      where.quotationsInNegotiation = { hasSome: supplierQuoteIds };
    }

    const threads = await prisma.negotiationThread.findMany({
      where,
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
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            content: true,
            senderRole: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: { lastActivity: 'desc' },
    });

    const quotationIds = Array.from(
      new Set(threads.flatMap((thread) => thread.quotationsInNegotiation).filter((quotationId) => Boolean(quotationId)))
    );

    const quotations = quotationIds.length
      ? await prisma.quotation.findMany({
          where: { id: { in: quotationIds } },
          select: {
            id: true,
            total: true,
            currency: true,
            status: true,
            leadTime: true,
            supplier: {
              select: {
                companyName: true,
                location: true,
              },
            },
          },
        })
      : [];

    const quotationById = new Map(quotations.map((quotation) => [quotation.id, quotation]));

    const normalizedThreads = threads.map((thread) => {
      const threadQuotations = thread.quotationsInNegotiation
        .map((quotationId) => quotationById.get(quotationId))
        .filter((quotation): quotation is NonNullable<typeof quotation> => Boolean(quotation));

      const supplierNames = Array.from(
        new Set(
          threadQuotations
            .map((quotation) => quotation.supplier.companyName)
            .filter((companyName): companyName is string => Boolean(companyName))
        )
      );

      const quoteTotals = threadQuotations.map((quotation) => toNumber(quotation.total));
      const selectedQuotation = thread.selectedQuotationId
        ? threadQuotations.find((quotation) => quotation.id === thread.selectedQuotationId)
        : null;

      const currentAmount = selectedQuotation
        ? toNumber(selectedQuotation.total)
        : quoteTotals.length > 0
          ? Math.min(...quoteTotals)
          : null;

      const originalAmount = quoteTotals.length > 0 ? Math.max(...quoteTotals) : null;

      return {
        id: thread.id,
        status: thread.status,
        requirement: {
          id: thread.requirement.id,
          title: thread.requirement.title,
          category: thread.requirement.category,
          quantity: thread.requirement.quantity,
          unit: thread.requirement.unit,
        },
        buyer: {
          id: thread.requirement.buyer.id,
          name: thread.requirement.buyer.companyName || thread.requirement.buyer.name || 'Buyer',
        },
        supplierNames,
        quotationsCount: threadQuotations.length,
        rounds: thread._count.messages,
        originalAmount,
        currentAmount,
        currency: threadQuotations[0]?.currency || 'USD',
        selectedQuotationId: thread.selectedQuotationId,
        lastActivity: thread.lastActivity,
        createdAt: thread.createdAt,
        latestMessage: thread.messages[0]
          ? {
              id: thread.messages[0].id,
              content: thread.messages[0].content,
              senderRole: thread.messages[0].senderRole,
              createdAt: thread.messages[0].createdAt,
            }
          : null,
      };
    });

    const filteredThreads = query
      ? normalizedThreads.filter((thread) => {
          const searchableText = [
            thread.id,
            thread.requirement.title,
            thread.requirement.category,
            thread.buyer.name,
            ...thread.supplierNames,
          ]
            .join(' ')
            .toLowerCase();

          return searchableText.includes(query);
        })
      : normalizedThreads;

    return NextResponse.json({
      status: 'success',
      threads: filteredThreads,
      total: filteredThreads.length,
    });
  } catch (error) {
    console.error('Error fetching negotiations:', error);

    if (shouldUseDemoFallback(error)) {
      return NextResponse.json(getDemoNegotiationsApiPayload());
    }

    return NextResponse.json({ error: 'Failed to fetch negotiations' }, { status: 500 });
  }
}
