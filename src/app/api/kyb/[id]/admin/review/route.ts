import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/db';

function calculateTrustScore(kyb: any): number {
  let score = 50;

  // Document verification score (40 points max)
  const verifiedDocs = kyb.documents?.filter((d: any) => d.verificationStatus === 'VERIFIED').length || 0;
  const totalDocs = Math.max(kyb.documents?.length || 1, 1);
  const docScore = (verifiedDocs / totalDocs) * 40;
  score += docScore;

  // Business age score (10 points max)
  const yearsInBusiness = new Date().getFullYear() - (kyb.businessEstablishedYear || new Date().getFullYear());
  if (yearsInBusiness >= 10) score += 10;
  else if (yearsInBusiness >= 5) score += 8;
  else if (yearsInBusiness >= 3) score += 5;
  else if (yearsInBusiness >= 1) score += 3;

  // Compliance score (10 points max)
  const completedCompliance = kyb.complianceItems?.filter((c: any) => c.status === 'COMPLETED').length || 0;
  const totalCompliance = Math.max(kyb.complianceItems?.length || 1, 1);
  const complianceScore = (completedCompliance / totalCompliance) * 10;
  score += complianceScore;

  return Math.min(100, Math.round(score));
}

function getRiskLevel(riskScore: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  if (riskScore <= 25) return 'LOW';
  if (riskScore <= 50) return 'MEDIUM';
  if (riskScore <= 75) return 'HIGH';
  return 'CRITICAL';
}

function getBadgeType(trustScore: number): 'GOLD' | 'SILVER' | 'BRONZE' | 'VERIFIED' {
  if (trustScore >= 90) return 'GOLD';
  if (trustScore >= 70) return 'SILVER';
  if (trustScore >= 50) return 'BRONZE';
  return 'VERIFIED';
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { decision, adminNotes, rejectionReason } = await req.json();

    if (!decision || !['APPROVE', 'REJECT', 'REQUEST_MORE_INFO'].includes(decision)) {
      return NextResponse.json({ error: 'Invalid decision' }, { status: 400 });
    }

    const kyb = await prisma.supplierKYB.findUnique({
      where: { id },
      include: {
        user: true,
        documents: true,
        complianceItems: true,
        riskAssessment: true
      }
    });

    if (!kyb) {
      return NextResponse.json({ error: 'KYB not found' }, { status: 404 });
    }

    let newStatus: 'VERIFIED' | 'REJECTED' | 'DOCUMENTS_REQUIRED';
    let trustScore = calculateTrustScore(kyb);
    let notificationType: 'KYB_VERIFIED' | 'KYB_REJECTED' | 'KYB_DOCUMENTS_REQUIRED';
    let notificationMessage: string;

    switch (decision) {
      case 'APPROVE':
        newStatus = 'VERIFIED';
        trustScore = Math.min(100, trustScore + 10);
        notificationType = 'KYB_VERIFIED';
        notificationMessage = `Your KYB verification for ${kyb.businessName} has been approved!`;
        break;
      case 'REJECT':
        newStatus = 'REJECTED';
        trustScore = Math.max(0, trustScore - 20);
        notificationType = 'KYB_REJECTED';
        notificationMessage = `Your KYB verification for ${kyb.businessName} was not approved. Reason: ${rejectionReason}`;
        break;
      case 'REQUEST_MORE_INFO':
        newStatus = 'DOCUMENTS_REQUIRED';
        notificationType = 'KYB_DOCUMENTS_REQUIRED';
        notificationMessage = `Additional documents required for your KYB verification. ${adminNotes || ''}`;
        break;
      default:
        return NextResponse.json({ error: 'Invalid decision' }, { status: 400 });
    }

    const riskScore = 100 - trustScore;

    // Update KYB
    await prisma.supplierKYB.update({
      where: { id },
      data: {
        status: newStatus,
        riskScore,
        reviewedByAdminId: session.user.id,
        adminNotes,
        rejectionReason: decision === 'REJECT' ? rejectionReason : null,
        verifiedAt: decision === 'APPROVE' ? new Date() : null,
        rejectedAt: decision === 'REJECT' ? new Date() : null,
        expiresAt: decision === 'APPROVE' ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : null
      }
    });

    // Update or create risk assessment
    await prisma.riskAssessment.upsert({
      where: { kybId: id },
      create: {
        kybId: id,
        totalRiskScore: riskScore,
        riskLevel: getRiskLevel(riskScore),
        recommendation: decision === 'APPROVE' ? 'AUTO_APPROVE' : decision === 'REJECT' ? 'REJECT' : 'MANUAL_REVIEW'
      },
      update: {
        totalRiskScore: riskScore,
        riskLevel: getRiskLevel(riskScore),
        recommendation: decision === 'APPROVE' ? 'AUTO_APPROVE' : decision === 'REJECT' ? 'REJECT' : 'MANUAL_REVIEW'
      }
    });

    // Create or update badge for approved KYB
    if (decision === 'APPROVE') {
      const badgeType = getBadgeType(trustScore);
      await prisma.verificationBadge.upsert({
        where: { kybId: id },
        create: {
          kybId: id,
          badgeType,
          trustScore,
          displayOnProfile: true,
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        },
        update: {
          badgeType,
          trustScore,
          displayOnProfile: true,
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        }
      });

      // Notify user of badge earned
      await prisma.notification.create({
        data: {
          userId: kyb.userId,
          type: 'KYB_BADGE_EARNED',
          title: `${badgeType} Verification Badge Earned`,
          message: `Congratulations! Your business has earned a ${badgeType} verification badge.`,
          resourceType: 'kyb',
          resourceId: kyb.id
        }
      });
    }

    // Create verification log
    await prisma.verificationLog.create({
      data: {
        kybId: id,
        action: decision,
        actionDetails: adminNotes || `KYB ${decision.toLowerCase()} by admin`,
        performedByAdminId: session.user.id,
        oldValue: kyb.status,
        newValue: newStatus
      }
    });

    // Notify user
    await prisma.notification.create({
      data: {
        userId: kyb.userId,
        type: notificationType,
        title: `KYB ${decision === 'APPROVE' ? 'Approved' : decision === 'REJECT' ? 'Rejected' : 'Update Required'}`,
        message: notificationMessage,
        resourceType: 'kyb',
        resourceId: kyb.id
      }
    });

    // Fetch complete updated KYB
    const completeKYB = await prisma.supplierKYB.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, name: true, companyName: true } },
        documents: true,
        complianceItems: true,
        riskAssessment: true,
        badge: true,
        verificationLogs: { orderBy: { createdAt: 'desc' }, take: 10 }
      }
    });

    return NextResponse.json(completeKYB);
  } catch (error) {
    console.error('Error reviewing KYB:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    const kyb = await prisma.supplierKYB.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, name: true, companyName: true } },
        documents: { orderBy: { createdAt: 'desc' } },
        complianceItems: { include: { document: true } },
        riskAssessment: true,
        badge: true,
        verificationLogs: { 
          orderBy: { createdAt: 'desc' },
          include: { performedByAdmin: { select: { name: true, email: true } } }
        }
      }
    });

    if (!kyb) {
      return NextResponse.json({ error: 'KYB not found' }, { status: 404 });
    }

    // Mask sensitive data
    const kybSafe = {
      ...kyb,
      bankAccountNumber: kyb.bankAccountNumber ? '****' : null
    };

    return NextResponse.json(kybSafe);
  } catch (error) {
    console.error('Error fetching KYB:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
