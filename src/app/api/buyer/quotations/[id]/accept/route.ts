import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { formatQuotationReference, formatRequirementReference } from '@/lib/flow-references';

// POST /api/buyer/quotations/[id]/accept - Buyer accepts a quotation
// Per process flow: Accept Quote → KYB/Good Standing Check → Admin Creates Transaction
// This endpoint ONLY marks the quote as accepted and the requirement as ACCEPTED.
// Transaction creation is a separate admin step (POST /api/admin/transactions/create).
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'BUYER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { acceptedBy } = body;

    const quotation = await prisma.quotation.findUnique({
      where: { id: params.id },
      include: {
        requirement: {
          select: {
            id: true,
            title: true,
            buyerId: true,
            quantity: true,
            unit: true,
            category: true,
            deliveryLocation: true,
            assignedAccountManagerId: true,
          },
        },
        supplier: { select: { id: true, companyName: true, email: true } },
      },
    });

    if (!quotation) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    }

    if (!quotation.visibleToBuyer) {
      return NextResponse.json({ error: 'This quotation is not available' }, { status: 403 });
    }

    if (quotation.requirement.buyerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // KYB check: user cannot accept quotes until KYB is completed
    const buyer = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { kybStatus: true },
    });

    if (!buyer || buyer.kybStatus !== 'COMPLETED') {
      return NextResponse.json({
        error: 'KYB verification required',
        message: 'You must complete KYB verification before accepting quotes. Go to your dashboard to start KYB.',
        kybStatus: buyer?.kybStatus || 'PENDING',
      }, { status: 403 });
    }

    // Update accepted quotation
    await prisma.quotation.update({
      where: { id: params.id },
      data: {
        status: 'ACCEPTED',
        acceptedAt: new Date(),
        acceptedBy: acceptedBy || session.user.id,
      },
    });

    // Reject other quotations for this requirement
    await prisma.quotation.updateMany({
      where: {
        requirementId: quotation.requirementId,
        id: { not: params.id },
        status: { in: ['APPROVED_BY_ADMIN', 'VISIBLE_TO_BUYER', 'IN_NEGOTIATION'] },
      },
      data: {
        status: 'DECLINED',
        rejectedAt: new Date(),
        declinedReason: 'Another quotation was accepted',
      },
    });

    // Update requirement to ACCEPTED (waiting for admin to create transaction)
    await prisma.requirement.update({
      where: { id: quotation.requirementId },
      data: { status: 'ACCEPTED' },
    });

    const quotationRef = formatQuotationReference(quotation.id);
    const requirementRef = formatRequirementReference(quotation.requirementId);

    // Resolve supplier user account for notifications
    let supplierUserId = quotation.userId;
    if (!supplierUserId && quotation.supplier.email) {
      const supplierUser = await prisma.user.findFirst({
        where: {
          role: 'SUPPLIER',
          email: quotation.supplier.email,
        },
        select: { id: true },
      });
      supplierUserId = supplierUser?.id || null;
    }

    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    });

    const notifications = [
      ...admins.map((admin) => ({
        userId: admin.id,
        type: 'QUOTATION_ACCEPTED' as const,
        title: 'Buyer Accepted Quotation',
        message: `${quotationRef} for ${requirementRef} was accepted by buyer and is ready for transaction creation.`,
        resourceType: 'quotation',
        resourceId: quotation.id,
      })),
      ...(supplierUserId
        ? [
            {
              userId: supplierUserId,
              type: 'QUOTATION_ACCEPTED' as const,
              title: 'Your Quotation Was Accepted',
              message: `Buyer accepted ${quotationRef} for ${requirementRef}. Admin review for transaction setup is next.`,
              resourceType: 'quotation',
              resourceId: quotation.id,
            },
          ]
        : []),
      ...(quotation.requirement.assignedAccountManagerId
        ? [
            {
              userId: quotation.requirement.assignedAccountManagerId,
              type: 'QUOTATION_ACCEPTED' as const,
              title: 'Client Selected a Quotation',
              message: `Your client accepted ${quotationRef} for ${requirementRef}.`,
              resourceType: 'quotation',
              resourceId: quotation.id,
            },
          ]
        : []),
    ];

    if (notifications.length > 0) {
      await prisma.notification.createMany({
        data: notifications,
      });
    }

    return NextResponse.json({
      status: 'success',
      quotation: {
        id: quotation.id,
        status: 'ACCEPTED',
        amount: Number(quotation.total),
        currency: quotation.currency,
        supplier: quotation.supplier.companyName,
        requirementId: quotation.requirementId,
      },
      references: {
        quotationReference: quotationRef,
        requirementReference: requirementRef,
      },
      message: 'Quotation accepted. Admin will now create the transaction after verification checks.',
    });
  } catch (error) {
    console.error('Error accepting quotation:', error);
    return NextResponse.json({ error: 'Failed to accept quotation' }, { status: 500 });
  }
}
