import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/db';

// GET /api/admin/kyb - List all KYB applications for admin dashboard
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user is admin
  const admin = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  });

  if (admin?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const riskLevel = searchParams.get('riskLevel');
    const country = searchParams.get('country');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (country) {
      where.registrationCountry = { contains: country, mode: 'insensitive' };
    }

    if (search) {
      where.OR = [
        { businessName: { contains: search, mode: 'insensitive' } },
        { registrationNumber: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Fetch KYBs with pagination
    const [kybs, total] = await Promise.all([
      prisma.supplierKYB.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              companyName: true,
              createdAt: true
            }
          },
          documents: {
            select: { id: true, verificationStatus: true }
          },
          badge: true,
          _count: {
            select: { documents: true, complianceItems: true }
          }
        },
        orderBy: [
          { status: 'asc' }, // Pending first
          { createdAt: 'desc' }
        ],
        take: limit,
        skip
      }),
      prisma.supplierKYB.count({ where })
    ]);

    // Calculate stats
    const stats = await prisma.supplierKYB.groupBy({
      by: ['status'],
      _count: true
    });

    const statsMap: Record<string, number> = {};
    stats.forEach(s => {
      statsMap[s.status] = s._count;
    });

    // Format response
    const formattedKybs = kybs.map(kyb => ({
      id: kyb.id,
      businessName: kyb.businessName,
      businessType: kyb.businessType,
      registrationCountry: kyb.registrationCountry,
      registrationNumber: kyb.registrationNumber,
      status: kyb.status,
      riskScore: kyb.riskScore,
      // Automated checks
      sanctionsCheckStatus: kyb.sanctionsCheckStatus,
      pepCheckStatus: kyb.pepCheckStatus,
      adverseMediaCheckStatus: kyb.adverseMediaCheckStatus,
      creditCheckStatus: kyb.creditCheckStatus,
      registryCheckStatus: kyb.registryCheckStatus,
      automatedChecksStartedAt: kyb.automatedChecksStartedAt,
      automatedChecksCompletedAt: kyb.automatedChecksCompletedAt,
      // Dates
      createdAt: kyb.createdAt,
      updatedAt: kyb.updatedAt,
      verifiedAt: kyb.verifiedAt,
      expiresAt: kyb.expiresAt,
      rejectedAt: kyb.rejectedAt,
      // Relations
      user: kyb.user,
      documentsCount: kyb._count.documents,
      complianceItemsCount: kyb._count.complianceItems,
      badge: kyb.badge,
      // Document verification status
      documentsVerified: kyb.documents.filter(d => d.verificationStatus === 'VERIFIED').length,
      documentsPending: kyb.documents.filter(d => d.verificationStatus === 'PENDING').length,
    }));

    return NextResponse.json({
      kybs: formattedKybs,
      stats: {
        total,
        pending: (statsMap['PENDING'] || 0) + (statsMap['AUTOMATED_CHECKS_IN_PROGRESS'] || 0),
        automatedChecksInProgress: statsMap['AUTOMATED_CHECKS_IN_PROGRESS'] || 0,
        automatedChecksComplete: statsMap['AUTOMATED_CHECKS_COMPLETE'] || 0,
        underReview: statsMap['UNDER_REVIEW'] || 0,
        infoRequested: statsMap['INFO_REQUESTED'] || 0,
        verified: statsMap['VERIFIED'] || 0,
        rejected: statsMap['REJECTED'] || 0,
        expired: statsMap['EXPIRED'] || 0,
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching KYB list:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
