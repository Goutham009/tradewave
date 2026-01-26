import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/db';

export async function POST(
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

    if (rfq.buyerId !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    if (rfq.status !== 'DRAFT') {
      return NextResponse.json({ error: 'RFQ already published' }, { status: 400 });
    }

    const updatedRFQ = await prisma.requestForQuote.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date()
      },
      include: {
        buyer: { select: { id: true, name: true, email: true, companyName: true } }
      }
    });

    // Log
    await prisma.rFQLog.create({
      data: {
        rfqId: id,
        action: 'PUBLISHED',
        details: `RFQ ${rfq.rfqNumber} published`,
        performedByUserId: session.user.id
      }
    });

    // Notify selected suppliers
    if (rfq.visibility === 'PRIVATE' && rfq.selectedSuppliers.length > 0) {
      for (const supplierId of rfq.selectedSuppliers) {
        await prisma.notification.create({
          data: {
            userId: supplierId,
            type: 'REQUIREMENT_CREATED',
            title: 'New RFQ Invitation',
            message: `You have been invited to submit a quote for: ${rfq.title}`,
            resourceType: 'rfq',
            resourceId: rfq.id
          }
        });
      }
    }

    return NextResponse.json(updatedRFQ);
  } catch (error) {
    console.error('Error publishing RFQ:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
