import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/db';

// POST /api/kyb/appeal - Submit KYB Appeal
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { appealReason, explanation } = body;

    if (!appealReason) {
      return NextResponse.json({ error: 'Appeal reason is required' }, { status: 400 });
    }

    // Get user's KYB profile
    const kyb = await prisma.supplierKYB.findUnique({
      where: { userId: session.user.id },
      include: { appeals: true }
    });

    if (!kyb) {
      return NextResponse.json({ error: 'No KYB profile found' }, { status: 404 });
    }

    // Only allow appeal if KYB is rejected
    if (kyb.status !== 'REJECTED') {
      return NextResponse.json({ 
        error: 'Appeals can only be submitted for rejected KYB applications' 
      }, { status: 400 });
    }

    // Check for existing pending appeal
    const existingAppeal = kyb.appeals.find(a => a.status === 'PENDING');
    if (existingAppeal) {
      return NextResponse.json({ 
        error: 'You already have a pending appeal' 
      }, { status: 400 });
    }

    // Create appeal
    const appeal = await prisma.kYBAppeal.create({
      data: {
        kybId: kyb.id,
        appealReason,
        explanation,
        status: 'PENDING',
        submittedAt: new Date()
      },
      include: {
        documents: true
      }
    });

    // Update KYB status to indicate appeal submitted
    await prisma.supplierKYB.update({
      where: { id: kyb.id },
      data: { status: 'UNDER_REVIEW' }
    });

    // Log the action
    await prisma.verificationLog.create({
      data: {
        kybId: kyb.id,
        action: 'APPEAL_SUBMITTED',
        actionDetails: `Appeal submitted: ${appealReason.substring(0, 100)}...`
      }
    });

    return NextResponse.json({ 
      success: true,
      appeal,
      message: 'Appeal submitted successfully'
    });

  } catch (error) {
    console.error('KYB Appeal Error:', error);
    return NextResponse.json({ error: 'Failed to submit appeal' }, { status: 500 });
  }
}

// GET /api/kyb/appeal - Get user's appeals
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const kyb = await prisma.supplierKYB.findUnique({
      where: { userId: session.user.id },
      include: {
        appeals: {
          include: {
            documents: true,
            reviewedByAdmin: {
              select: { id: true, name: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!kyb) {
      return NextResponse.json({ error: 'No KYB profile found' }, { status: 404 });
    }

    return NextResponse.json({ appeals: kyb.appeals });

  } catch (error) {
    console.error('Get KYB Appeals Error:', error);
    return NextResponse.json({ error: 'Failed to fetch appeals' }, { status: 500 });
  }
}
