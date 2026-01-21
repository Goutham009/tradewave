import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/api/requireAdmin';
import { successResponse, errorResponse, getPagination, validateFilters } from '@/lib/api/errorHandler';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPagination(searchParams, 20);
    const filters = validateFilters(searchParams, ['action', 'userId', 'resourceType', 'dateFrom', 'dateTo']);
    
    // Build where clause
    const where: any = {};
    
    if (filters.action) {
      where.action = filters.action;
    }
    
    if (filters.userId) {
      where.userId = filters.userId;
    }
    
    if (filters.resourceType) {
      where.resourceType = filters.resourceType;
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
    
    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      prisma.activity.count({ where }),
    ]);
    
    const formattedActivities = activities.map((activity: any) => ({
      id: activity.id,
      userId: activity.userId,
      userName: activity.user?.name || 'System',
      userEmail: activity.user?.email || null,
      userRole: activity.user?.role || null,
      type: activity.type,
      action: activity.action,
      description: activity.description,
      resourceType: activity.resourceType,
      resourceId: activity.resourceId,
      metadata: activity.metadata,
      ipAddress: activity.ipAddress,
      createdAt: activity.createdAt.toISOString(),
    }));
    
    return successResponse(formattedActivities, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
