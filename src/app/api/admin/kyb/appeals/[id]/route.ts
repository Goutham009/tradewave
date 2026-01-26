import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/db';

// GET /api/admin/kyb/appeals/[id] - Get single appeal details
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const appeal = await prisma.kYBAppeal.findUnique({
      where: { id: params.id },
      include: {
        kyb: {
          include: {
            user: {
              select: { id: true, name: true, email: true, companyName: true }
            },
            documents: true,
            complianceItems: true,
            riskAssessment: true,
            verificationLogs: {
              take: 10,
              orderBy: { createdAt: 'desc' }
            }
          }
        },
        documents: true,
        reviewedByAdmin: {
          select: { id: true, name: true }
        }
      }
    });

    if (!appeal) {
      return NextResponse.json({ error: 'Appeal not found' }, { status: 404 });
    }

    return NextResponse.json({ appeal });

  } catch (error) {
    console.error('Get Appeal Details Error:', error);
    return NextResponse.json({ error: 'Failed to fetch appeal' }, { status: 500 });
  }
}

// PATCH /api/admin/kyb/appeals/[id] - Review appeal (approve/reject)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { decision, adminDecision } = body;

    if (!decision || !['APPROVED', 'REJECTED'].includes(decision)) {
      return NextResponse.json({ error: 'Invalid decision' }, { status: 400 });
    }

    const appeal = await prisma.kYBAppeal.findUnique({
      where: { id: params.id },
      include: { kyb: true }
    });

    if (!appeal) {
      return NextResponse.json({ error: 'Appeal not found' }, { status: 404 });
    }

    if (appeal.status !== 'PENDING') {
      return NextResponse.json({ error: 'Appeal already processed' }, { status: 400 });
    }

    // Update appeal
    const updatedAppeal = await prisma.kYBAppeal.update({
      where: { id: params.id },
      data: {
        status: decision,
        adminDecision,
        reviewedByAdminId: session.user.id,
        reviewedAt: new Date()
      }
    });

    // Update KYB status based on decision
    const newKybStatus = decision === 'APPROVED' ? 'VERIFIED' : 'REJECTED';
    await prisma.supplierKYB.update({
      where: { id: appeal.kybId },
      data: {
        status: newKybStatus,
        reviewedByAdminId: session.user.id,
        ...(decision === 'APPROVED' 
          ? { verifiedAt: new Date() }
          : { rejectedAt: new Date(), rejectionReason: adminDecision }
        )
      }
    });

    // Log the action
    await prisma.verificationLog.create({
      data: {
        kybId: appeal.kybId,
        action: decision === 'APPROVED' ? 'APPEAL_APPROVED' : 'APPEAL_REJECTED',
        actionDetails: adminDecision || `Appeal ${decision.toLowerCase()}`,
        performedByAdminId: session.user.id
      }
    });

    return NextResponse.json({
      success: true,
      appeal: updatedAppeal,
      message: `Appeal ${decision.toLowerCase()} successfully`
    });

  } catch (error) {
    console.error('Review Appeal Error:', error);
    return NextResponse.json({ error: 'Failed to process appeal' }, { status: 500 });
  }
}
