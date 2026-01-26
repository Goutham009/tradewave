import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/db';

// GET /api/risk/profile - Get user's risk profile
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    let riskProfile = await prisma.riskManagementProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        restrictions: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' }
        },
        riskHistory: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        },
        alerts: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    // Create profile if doesn't exist
    if (!riskProfile) {
      riskProfile = await prisma.riskManagementProfile.create({
        data: {
          userId: session.user.id,
          overallRiskLevel: 'MEDIUM',
          overallRiskScore: 50,
          kybRiskScore: 50,
          complianceRiskScore: 50,
          transactionRiskScore: 50,
          paymentRiskScore: 50,
          behavioralRiskScore: 50
        },
        include: {
          restrictions: true,
          riskHistory: true,
          alerts: true
        }
      });
    }

    return NextResponse.json({ riskProfile });

  } catch (error) {
    console.error('Get Risk Profile Error:', error);
    return NextResponse.json({ error: 'Failed to fetch risk profile' }, { status: 500 });
  }
}
