import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const riskLevel = searchParams.get('riskLevel');
    const country = searchParams.get('country');
    const region = searchParams.get('region');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build where clause
    const whereClause: any = {};

    if (status) {
      whereClause.status = status;
    }

    if (riskLevel) {
      whereClause.riskAssessment = { riskLevel };
    }

    if (country) {
      whereClause.registrationCountry = country.toUpperCase();
    }

    if (region) {
      whereClause.registrationRegion = { contains: region, mode: 'insensitive' };
    }

    if (search) {
      whereClause.OR = [
        { businessName: { contains: search, mode: 'insensitive' } },
        { taxIdNumber: { contains: search, mode: 'insensitive' } },
        { registrationNumber: { contains: search, mode: 'insensitive' } },
        { primaryContactEmail: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } }
      ];
    }

    // Fetch KYBs with pagination
    const [kybs, total] = await Promise.all([
      prisma.supplierKYB.findMany({
        where: whereClause,
        include: {
          user: { select: { id: true, email: true, name: true, companyName: true } },
          documents: { select: { id: true, documentType: true, verificationStatus: true } },
          complianceItems: { select: { id: true, itemType: true, status: true, isMandatory: true } },
          riskAssessment: { select: { totalRiskScore: true, riskLevel: true, recommendation: true } },
          badge: { select: { badgeType: true, trustScore: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.supplierKYB.count({ where: whereClause })
    ]);

    // Get stats by status
    const statusStats = await prisma.supplierKYB.groupBy({
      by: ['status'],
      _count: true
    });

    // Get stats by country
    const countryStats = await prisma.supplierKYB.groupBy({
      by: ['registrationCountry'],
      _count: true
    });

    // Get stats by risk level
    const riskStats = await prisma.riskAssessment.groupBy({
      by: ['riskLevel'],
      _count: true
    });

    // Get recent activity
    const recentActivity = await prisma.verificationLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        kyb: { select: { businessName: true, registrationCountry: true } },
        performedByAdmin: { select: { name: true } }
      }
    });

    // Calculate summary stats
    const pendingCount = statusStats.find((s: any) => s.status === 'PENDING')?._count || 0;
    const underReviewCount = statusStats.find((s: any) => s.status === 'UNDER_REVIEW')?._count || 0;
    const verifiedCount = statusStats.find((s: any) => s.status === 'VERIFIED')?._count || 0;
    const rejectedCount = statusStats.find((s: any) => s.status === 'REJECTED')?._count || 0;

    return NextResponse.json({
      kybs: kybs.map((kyb: any) => ({
        ...kyb,
        bankAccountNumber: kyb.bankAccountNumber ? '****' : null,
        documentsCount: kyb.documents.length,
        verifiedDocuments: kyb.documents.filter((d: any) => d.verificationStatus === 'VERIFIED').length,
        mandatoryCompliance: kyb.complianceItems.filter((c: any) => c.isMandatory).length,
        completedMandatory: kyb.complianceItems.filter((c: any) => c.isMandatory && c.status === 'COMPLETED').length
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: {
        total,
        pending: pendingCount,
        underReview: underReviewCount,
        verified: verifiedCount,
        rejected: rejectedCount,
        byStatus: statusStats.reduce((acc: any, s: any) => ({ ...acc, [s.status]: s._count }), {}),
        byCountry: countryStats.reduce((acc: any, c: any) => ({ ...acc, [c.registrationCountry]: c._count }), {}),
        byRiskLevel: riskStats.reduce((acc: any, r: any) => ({ ...acc, [r.riskLevel]: r._count }), {})
      },
      recentActivity
    });
  } catch (error) {
    console.error('Error fetching KYB dashboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
