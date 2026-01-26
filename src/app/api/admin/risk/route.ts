import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/db';

// GET /api/admin/risk - Get risk dashboard overview
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get risk profile counts by level
    const [highRisk, criticalRisk, monitored, withRestrictions] = await Promise.all([
      prisma.riskManagementProfile.count({ where: { overallRiskLevel: 'HIGH' } }),
      prisma.riskManagementProfile.count({ where: { overallRiskLevel: 'CRITICAL' } }),
      prisma.riskManagementProfile.count({ where: { isMonitored: true } }),
      prisma.riskManagementProfile.count({ where: { hasRestrictions: true } })
    ]);

    // Get active alerts by severity
    const [criticalAlerts, highAlerts, mediumAlerts] = await Promise.all([
      prisma.riskAlert.count({ where: { isActive: true, severity: 'CRITICAL' } }),
      prisma.riskAlert.count({ where: { isActive: true, severity: 'HIGH' } }),
      prisma.riskAlert.count({ where: { isActive: true, severity: 'MEDIUM' } })
    ]);

    // Get KYB stats
    const [pendingKyb, expiringKyb] = await Promise.all([
      prisma.supplierKYB.count({ where: { status: 'UNDER_REVIEW' } }),
      prisma.supplierKYB.count({
        where: {
          status: 'VERIFIED',
          expiresAt: {
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ]);

    // Get recent high-risk users
    const highRiskUsers = await prisma.riskManagementProfile.findMany({
      where: {
        overallRiskLevel: { in: ['HIGH', 'CRITICAL'] }
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, companyName: true }
        },
        alerts: {
          where: { isActive: true },
          take: 3
        }
      },
      take: 10,
      orderBy: { overallRiskScore: 'desc' }
    });

    // Get pending KYB appeals
    const pendingAppeals = await prisma.kYBAppeal.count({
      where: { status: 'PENDING' }
    });

    return NextResponse.json({
      overview: {
        riskProfiles: {
          highRisk,
          criticalRisk,
          monitored,
          withRestrictions
        },
        alerts: {
          critical: criticalAlerts,
          high: highAlerts,
          medium: mediumAlerts,
          total: criticalAlerts + highAlerts + mediumAlerts
        },
        kyb: {
          pendingReview: pendingKyb,
          expiringSoon: expiringKyb,
          pendingAppeals
        }
      },
      highRiskUsers
    });

  } catch (error) {
    console.error('Risk Dashboard Error:', error);
    return NextResponse.json({ error: 'Failed to fetch risk dashboard' }, { status: 500 });
  }
}
