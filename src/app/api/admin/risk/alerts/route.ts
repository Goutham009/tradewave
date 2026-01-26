import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/db';

// GET /api/admin/risk/alerts - Get active risk alerts
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const severity = searchParams.get('severity') || '';
    const alertType = searchParams.get('type') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = { isActive: true };
    if (severity) where.severity = severity;
    if (alertType) where.alertType = alertType;

    const [alerts, total] = await Promise.all([
      prisma.riskAlert.findMany({
        where,
        include: {
          riskProfile: {
            include: {
              user: {
                select: { id: true, name: true, email: true, companyName: true }
              }
            }
          },
          acknowledgedByAdmin: {
            select: { id: true, name: true }
          }
        },
        orderBy: [
          { severity: 'desc' },
          { createdAt: 'desc' }
        ],
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.riskAlert.count({ where })
    ]);

    return NextResponse.json({
      alerts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get Risk Alerts Error:', error);
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 });
  }
}

// PATCH /api/admin/risk/alerts - Acknowledge alert
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { alertId, actionNotes, resolve } = body;

    if (!alertId) {
      return NextResponse.json({ error: 'Alert ID required' }, { status: 400 });
    }

    const alert = await prisma.riskAlert.findUnique({
      where: { id: alertId }
    });

    if (!alert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }

    const updateData: any = {
      acknowledgedAt: new Date(),
      acknowledgedByAdminId: session.user.id
    };

    if (actionNotes) {
      updateData.actionNotes = actionNotes;
      updateData.actionTakenAt = new Date();
    }

    if (resolve) {
      updateData.isActive = false;
    }

    const updated = await prisma.riskAlert.update({
      where: { id: alertId },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      alert: updated,
      message: resolve ? 'Alert resolved' : 'Alert acknowledged'
    });

  } catch (error) {
    console.error('Acknowledge Alert Error:', error);
    return NextResponse.json({ error: 'Failed to update alert' }, { status: 500 });
  }
}
