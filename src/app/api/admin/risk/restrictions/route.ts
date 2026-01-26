import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/db';

// POST /api/admin/risk/restrictions - Create restriction for a user
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      userId,
      restrictionType,
      description,
      reason,
      dailyLimit,
      monthlyLimit,
      transactionLimit,
      affectedCategories,
      endDate
    } = body;

    if (!userId || !restrictionType || !description || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get or create risk profile
    let riskProfile = await prisma.riskManagementProfile.findUnique({
      where: { userId }
    });

    if (!riskProfile) {
      riskProfile = await prisma.riskManagementProfile.create({
        data: {
          userId,
          hasRestrictions: true
        }
      });
    }

    // Create restriction
    const restriction = await prisma.riskRestriction.create({
      data: {
        riskProfileId: riskProfile.id,
        restrictionType,
        description,
        reason,
        dailyLimit: dailyLimit ? parseFloat(dailyLimit) : null,
        monthlyLimit: monthlyLimit ? parseFloat(monthlyLimit) : null,
        transactionLimit: transactionLimit ? parseFloat(transactionLimit) : null,
        affectedCategories: affectedCategories || [],
        endDate: endDate ? new Date(endDate) : null,
        createdByAdminId: session.user.id
      }
    });

    // Update risk profile
    await prisma.riskManagementProfile.update({
      where: { id: riskProfile.id },
      data: { hasRestrictions: true }
    });

    // Create risk history entry
    await prisma.riskHistoryEntry.create({
      data: {
        riskProfileId: riskProfile.id,
        previousOverallRiskLevel: riskProfile.overallRiskLevel,
        newOverallRiskLevel: riskProfile.overallRiskLevel,
        previousOverallScore: riskProfile.overallRiskScore,
        newOverallScore: riskProfile.overallRiskScore,
        scoreDelta: 0,
        triggerEvent: 'MANUAL_ASSESSMENT',
        triggerDetails: `Restriction added: ${restrictionType}`,
        assessedByAdminId: session.user.id
      }
    });

    // Create alert for the user
    await prisma.riskAlert.create({
      data: {
        riskProfileId: riskProfile.id,
        alertType: 'RESTRICTION_BREACH',
        severity: 'HIGH',
        message: `New restriction applied: ${description}`,
        requiredAction: 'Review and comply with restrictions'
      }
    });

    return NextResponse.json({
      success: true,
      restriction,
      message: 'Restriction created successfully'
    });

  } catch (error) {
    console.error('Create Restriction Error:', error);
    return NextResponse.json({ error: 'Failed to create restriction' }, { status: 500 });
  }
}

// DELETE /api/admin/risk/restrictions - Remove restriction
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const restrictionId = searchParams.get('id');

    if (!restrictionId) {
      return NextResponse.json({ error: 'Restriction ID required' }, { status: 400 });
    }

    const restriction = await prisma.riskRestriction.findUnique({
      where: { id: restrictionId },
      include: { riskProfile: true }
    });

    if (!restriction) {
      return NextResponse.json({ error: 'Restriction not found' }, { status: 404 });
    }

    // Deactivate restriction
    await prisma.riskRestriction.update({
      where: { id: restrictionId },
      data: { isActive: false }
    });

    // Check if user has any other active restrictions
    const activeRestrictions = await prisma.riskRestriction.count({
      where: {
        riskProfileId: restriction.riskProfileId,
        isActive: true,
        id: { not: restrictionId }
      }
    });

    if (activeRestrictions === 0) {
      await prisma.riskManagementProfile.update({
        where: { id: restriction.riskProfileId },
        data: { hasRestrictions: false }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Restriction removed successfully'
    });

  } catch (error) {
    console.error('Remove Restriction Error:', error);
    return NextResponse.json({ error: 'Failed to remove restriction' }, { status: 500 });
  }
}
