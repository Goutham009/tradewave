import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/db';

// GET /api/admin/risk/monitoring - Get monitored users
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const [profiles, total] = await Promise.all([
      prisma.riskManagementProfile.findMany({
        where: { isMonitored: true },
        include: {
          user: {
            select: { id: true, name: true, email: true, companyName: true }
          },
          alerts: {
            where: { isActive: true },
            take: 5
          },
          restrictions: {
            where: { isActive: true }
          }
        },
        orderBy: { monitoringStartDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.riskManagementProfile.count({ where: { isMonitored: true } })
    ]);

    return NextResponse.json({
      profiles,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get Monitored Users Error:', error);
    return NextResponse.json({ error: 'Failed to fetch monitored users' }, { status: 500 });
  }
}

// POST /api/admin/risk/monitoring - Start monitoring a user
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { userId, reason, durationDays } = body;

    if (!userId || !reason) {
      return NextResponse.json({ error: 'User ID and reason are required' }, { status: 400 });
    }

    // Get or create risk profile
    let riskProfile = await prisma.riskManagementProfile.findUnique({
      where: { userId }
    });

    if (!riskProfile) {
      riskProfile = await prisma.riskManagementProfile.create({
        data: { userId }
      });
    }

    // Update monitoring status
    const endDate = durationDays
      ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000)
      : null;

    const updated = await prisma.riskManagementProfile.update({
      where: { id: riskProfile.id },
      data: {
        isMonitored: true,
        monitoringReason: reason,
        monitoringStartDate: new Date(),
        monitoringEndDate: endDate
      }
    });

    // Create history entry
    await prisma.riskHistoryEntry.create({
      data: {
        riskProfileId: riskProfile.id,
        previousOverallRiskLevel: riskProfile.overallRiskLevel,
        newOverallRiskLevel: riskProfile.overallRiskLevel,
        previousOverallScore: riskProfile.overallRiskScore,
        newOverallScore: riskProfile.overallRiskScore,
        scoreDelta: 0,
        triggerEvent: 'MANUAL_ASSESSMENT',
        triggerDetails: `Monitoring started: ${reason}`,
        assessedByAdminId: session.user.id
      }
    });

    return NextResponse.json({
      success: true,
      profile: updated,
      message: 'Monitoring started successfully'
    });

  } catch (error) {
    console.error('Start Monitoring Error:', error);
    return NextResponse.json({ error: 'Failed to start monitoring' }, { status: 500 });
  }
}

// DELETE /api/admin/risk/monitoring - Stop monitoring a user
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const riskProfile = await prisma.riskManagementProfile.findUnique({
      where: { userId }
    });

    if (!riskProfile) {
      return NextResponse.json({ error: 'Risk profile not found' }, { status: 404 });
    }

    await prisma.riskManagementProfile.update({
      where: { id: riskProfile.id },
      data: {
        isMonitored: false,
        monitoringEndDate: new Date()
      }
    });

    // Create history entry
    await prisma.riskHistoryEntry.create({
      data: {
        riskProfileId: riskProfile.id,
        previousOverallRiskLevel: riskProfile.overallRiskLevel,
        newOverallRiskLevel: riskProfile.overallRiskLevel,
        previousOverallScore: riskProfile.overallRiskScore,
        newOverallScore: riskProfile.overallRiskScore,
        scoreDelta: 0,
        triggerEvent: 'MANUAL_ASSESSMENT',
        triggerDetails: 'Monitoring stopped',
        assessedByAdminId: session.user.id
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Monitoring stopped successfully'
    });

  } catch (error) {
    console.error('Stop Monitoring Error:', error);
    return NextResponse.json({ error: 'Failed to stop monitoring' }, { status: 500 });
  }
}
