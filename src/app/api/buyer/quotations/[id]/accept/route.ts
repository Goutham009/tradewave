import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/buyer/quotations/[id]/accept - Buyer accepts a quotation
// Per process flow: Accept Quote → KYB/Good Standing Check → Admin Creates Transaction
// This endpoint ONLY marks the quote as accepted and the requirement as ACCEPTED.
// Transaction creation is a separate admin step (POST /api/admin/transactions/create).
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { buyerId, acceptedBy } = body;

    if (!buyerId) {
      return NextResponse.json({ error: 'buyerId is required' }, { status: 400 });
    }

    const quotation = await prisma.quotation.findUnique({
      where: { id: params.id },
      include: {
        requirement: { select: { id: true, title: true, buyerId: true, quantity: true, unit: true, category: true, deliveryLocation: true } },
        supplier: { select: { id: true, companyName: true } },
      },
    });

    if (!quotation) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    }

    if (!quotation.visibleToBuyer) {
      return NextResponse.json({ error: 'This quotation is not available' }, { status: 403 });
    }

    // KYB check: user cannot accept quotes until KYB is completed
    const buyer = await prisma.user.findUnique({
      where: { id: buyerId },
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
        acceptedBy: acceptedBy || buyerId,
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

    // TODO: Notify admin that quote was accepted, ready for transaction creation
    // TODO: Notify supplier that quote was accepted
    // TODO: Notify AM

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
      message: 'Quotation accepted. Admin will now create the transaction after verification checks.',
    });
  } catch (error) {
    console.error('Error accepting quotation:', error);
    return NextResponse.json({ error: 'Failed to accept quotation' }, { status: 500 });
  }
}
