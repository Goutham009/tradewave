import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    const rfq = await prisma.requestForQuote.findUnique({
      where: { id },
      include: {
        buyer: { select: { id: true, name: true, email: true, companyName: true } },
        attachments: true,
        quotes: {
          include: {
            seller: { select: { id: true, name: true, companyName: true } },
            quantityBreaks: true,
            _count: { select: { messages: true } }
          },
          orderBy: { createdAt: 'desc' }
        },
        logs: {
          include: { performedByUser: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
          take: 20
        },
        comparisons: true
      }
    });

    if (!rfq) {
      return NextResponse.json({ error: 'RFQ not found' }, { status: 404 });
    }

    // Check access - buyer or invited supplier
    const isBuyer = rfq.buyerId === session.user.id;
    const isInvited = rfq.selectedSuppliers.includes(session.user.id);
    const isPublic = rfq.visibility === 'PUBLIC';
    const isAdmin = session.user.role === 'ADMIN';

    if (!isBuyer && !isInvited && !isPublic && !isAdmin) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Increment view count for non-buyers
    if (!isBuyer) {
      await prisma.requestForQuote.update({
        where: { id },
        data: { viewCount: { increment: 1 } }
      });
    }

    return NextResponse.json(rfq);
  } catch (error) {
    console.error('Error fetching RFQ:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();

    const rfq = await prisma.requestForQuote.findUnique({
      where: { id }
    });

    if (!rfq) {
      return NextResponse.json({ error: 'RFQ not found' }, { status: 404 });
    }

    if (rfq.buyerId !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Only allow updates if DRAFT
    if (rfq.status !== 'DRAFT' && !body.extendExpiry) {
      return NextResponse.json(
        { error: 'Can only update draft RFQs' },
        { status: 400 }
      );
    }

    const updateData: any = {};

    // Allowed fields to update
    const allowedFields = [
      'title', 'description', 'specifications', 'requestedQuantity', 'quantityUnit',
      'deliveryLocation', 'deliveryCity', 'deliveryRegion', 'deliveryCountry', 'deliveryDate',
      'industryCategory', 'productCategory', 'incoterms', 'qualityStandards',
      'certificationRequired', 'productionCapacityNeeded', 'visibility', 'selectedSuppliers',
      'estimatedBudget', 'budgetRange'
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'deliveryDate') {
          updateData[field] = new Date(body[field]);
        } else if (field === 'budgetRange' && typeof body[field] === 'object') {
          updateData[field] = JSON.stringify(body[field]);
        } else {
          updateData[field] = body[field];
        }
      }
    }

    // Handle expiry extension
    if (body.extendExpiry && body.expiresAt) {
      updateData.expiresAt = new Date(body.expiresAt);
    }

    const updatedRFQ = await prisma.requestForQuote.update({
      where: { id },
      data: updateData,
      include: {
        buyer: { select: { id: true, name: true, email: true, companyName: true } },
        attachments: true
      }
    });

    // Log update
    await prisma.rFQLog.create({
      data: {
        rfqId: id,
        action: 'UPDATED',
        details: `RFQ updated: ${Object.keys(updateData).join(', ')}`,
        performedByUserId: session.user.id
      }
    });

    return NextResponse.json(updatedRFQ);
  } catch (error) {
    console.error('Error updating RFQ:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    const rfq = await prisma.requestForQuote.findUnique({
      where: { id }
    });

    if (!rfq) {
      return NextResponse.json({ error: 'RFQ not found' }, { status: 404 });
    }

    if (rfq.buyerId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Only allow deletion of DRAFT RFQs
    if (rfq.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Can only delete draft RFQs. Archive instead.' },
        { status: 400 }
      );
    }

    await prisma.requestForQuote.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting RFQ:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
