// =============================================================================
// PHASE 9: ADMIN TIER CHANGE MANAGEMENT API
// GET /api/admin/tier-changes - List pending tier change requests
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/db';

// GET - List pending tier change requests for admin review
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin role
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'PENDING';
    const severity = searchParams.get('severity');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};
    if (status !== 'ALL') {
      where.status = status;
    }

    // Get tier change requests with notifications
    const [requests, total] = await Promise.all([
      prisma.supplierTierChangeRequest.findMany({
        where,
        include: {
          supplier: {
            select: {
              id: true,
              name: true,
              companyName: true,
              email: true,
              overallRating: true,
            },
          },
          tierNotification: true,
        },
        orderBy: [
          { approvalDeadline: 'asc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.supplierTierChangeRequest.count({ where }),
    ]);

    // Filter by severity if specified
    let filteredRequests = requests;
    if (severity) {
      filteredRequests = requests.filter(
        r => r.tierNotification?.severity === severity
      );
    }

    // Calculate stats
    const stats = await prisma.supplierTierChangeRequest.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    const urgentCount = await prisma.adminSupplierTierNotification.count({
      where: {
        severity: { in: ['HIGH', 'CRITICAL'] },
        requiresAction: true,
        isAcknowledged: false,
      },
    });

    return NextResponse.json({
      requests: filteredRequests.map(r => ({
        id: r.id,
        supplier: {
          id: r.supplier.id,
          name: r.supplier.name,
          companyName: r.supplier.companyName,
          email: r.supplier.email,
          rating: r.supplier.overallRating,
        },
        previousTier: r.previousTier,
        proposedTier: r.proposedTier,
        changeReason: r.changeReason,
        status: r.status,
        severity: r.tierNotification?.severity || 'MEDIUM',
        approvalDeadline: r.approvalDeadline,
        createdAt: r.createdAt,
        metricsSnapshot: r.metricsSnapshot ? JSON.parse(r.metricsSnapshot) : null,
        tierLabel: `(Seller Tier) ${r.proposedTier}`,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        pending: stats.find(s => s.status === 'PENDING')?._count.id || 0,
        approved: stats.find(s => s.status === 'APPROVED')?._count.id || 0,
        rejected: stats.find(s => s.status === 'REJECTED')?._count.id || 0,
        onHold: stats.find(s => s.status === 'ON_HOLD')?._count.id || 0,
        investigating: stats.find(s => s.status === 'INVESTIGATING')?._count.id || 0,
        urgentCount,
      },
    });
  } catch (error) {
    console.error('Error fetching tier change requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tier change requests' },
      { status: 500 }
    );
  }
}
