import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/api/requireAdmin';
import { successResponse, errorResponse, getPagination, validateFilters } from '@/lib/api/errorHandler';
import { formatRequirementReference } from '@/lib/flow-references';
import { getDemoAdminRequirementsApiPayload, shouldUseDemoFallback } from '@/lib/demo/fallback';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPagination(searchParams);
    const filters = validateFilters(searchParams, ['status', 'category', 'dateFrom', 'dateTo', 'search']);
    
    // Build where clause
    const where: any = {};
    
    if (filters.status) {
      where.status = filters.status;
    }
    
    if (filters.category) {
      where.category = filters.category;
    }
    
    if (filters.search) {
      where.OR = [
        { id: { contains: filters.search, mode: 'insensitive' } },
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { buyer: { companyName: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }
    
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt.gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        where.createdAt.lte = new Date(filters.dateTo);
      }
    }
    
    const [requirements, total] = await Promise.all([
      prisma.requirement.findMany({
        where,
        include: {
          buyer: {
            select: { id: true, name: true, email: true, companyName: true },
          },
          _count: {
            select: { quotations: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      prisma.requirement.count({ where }),
    ]);

    const relatedUserIds = Array.from(
      new Set(
        requirements
          .flatMap((requirement) => [
            requirement.assignedAccountManagerId,
            requirement.assignedProcurementOfficerId,
          ])
          .filter((id): id is string => Boolean(id))
      )
    );

    const relatedUsers = relatedUserIds.length
      ? await prisma.user.findMany({
          where: { id: { in: relatedUserIds } },
          select: { id: true, name: true, email: true },
        })
      : [];

    const relatedUsersById = new Map(relatedUsers.map((user) => [user.id, user]));
    
    const formattedRequirements = requirements.map((req: any) => {
      const accountManager = req.assignedAccountManagerId
        ? relatedUsersById.get(req.assignedAccountManagerId)
        : null;
      const procurementOfficer = req.assignedProcurementOfficerId
        ? relatedUsersById.get(req.assignedProcurementOfficerId)
        : null;

      return {
        id: req.id,
        requirementReference: formatRequirementReference(req.id),
        title: req.title,
        description: req.description,
        category: req.category,
        status: req.status,
        quantity: req.quantity,
        unit: req.unit,
        targetPrice: req.targetPrice ? Number(req.targetPrice) : null,
        budgetMin: req.budgetMin ? Number(req.budgetMin) : null,
        budgetMax: req.budgetMax ? Number(req.budgetMax) : null,
        currency: req.currency,
        deliveryLocation: req.deliveryLocation,
        deliveryDeadline: req.deliveryDeadline?.toISOString() || null,
        priority: req.priority,
        amVerified: req.amVerified,
        adminReviewed: req.adminReviewed,
        suppliersContacted: req.suppliersSent || 0,
        quotesReceived: req._count?.quotations || req.quotesReceived || 0,
        quotationCount: req._count?.quotations || 0,
        buyer: req.buyer,
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
        createdAt: req.createdAt.toISOString(),
        updatedAt: req.updatedAt.toISOString(),
      };
    });
    
    return successResponse(formattedRequirements, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    if (shouldUseDemoFallback(error)) {
      const { searchParams } = new URL(request.url);
      const page = Number(searchParams.get('page') || '1');
      const limit = Number(searchParams.get('limit') || '100');
      return NextResponse.json(getDemoAdminRequirementsApiPayload(page, limit));
    }

    return errorResponse(error);
  }
}
