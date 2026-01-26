import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/db';

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
    const { complianceItemId, status, notes, documentId } = await req.json();

    if (!complianceItemId) {
      return NextResponse.json({ error: 'complianceItemId is required' }, { status: 400 });
    }

    // Get KYB
    const kyb = await prisma.supplierKYB.findUnique({
      where: { id }
    });

    if (!kyb) {
      return NextResponse.json({ error: 'KYB not found' }, { status: 404 });
    }

    // Check authorization
    if (kyb.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Verify compliance item belongs to this KYB
    const existingItem = await prisma.complianceItem.findUnique({
      where: { id: complianceItemId }
    });

    if (!existingItem || existingItem.kybId !== id) {
      return NextResponse.json({ error: 'Compliance item not found' }, { status: 404 });
    }

    // Update compliance item
    const complianceItem = await prisma.complianceItem.update({
      where: { id: complianceItemId },
      data: {
        status: status || existingItem.status,
        notes: notes !== undefined ? notes : existingItem.notes,
        documentId: documentId !== undefined ? documentId : existingItem.documentId,
        completedDate: status === 'COMPLETED' ? new Date() : 
                       status === 'PENDING' ? null : existingItem.completedDate
      },
      include: { document: true }
    });

    // Create verification log
    await prisma.verificationLog.create({
      data: {
        kybId: id,
        action: 'COMPLIANCE_UPDATED',
        actionDetails: `Compliance item ${complianceItem.itemType} updated to ${status || 'no status change'}`,
        performedByAdminId: session.user.role === 'ADMIN' ? session.user.id : null,
        oldValue: existingItem.status,
        newValue: status || existingItem.status
      }
    });

    return NextResponse.json(complianceItem);
  } catch (error) {
    console.error('Error updating compliance item:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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

    const kyb = await prisma.supplierKYB.findUnique({
      where: { id }
    });

    if (!kyb) {
      return NextResponse.json({ error: 'KYB not found' }, { status: 404 });
    }

    // Check authorization
    if (kyb.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const complianceItems = await prisma.complianceItem.findMany({
      where: { kybId: id },
      include: { document: true },
      orderBy: [
        { isMandatory: 'desc' },
        { status: 'asc' },
        { createdAt: 'asc' }
      ]
    });

    // Calculate summary
    const mandatory = complianceItems.filter((c: any) => c.isMandatory);
    const recommended = complianceItems.filter((c: any) => c.isRecommended);
    const completed = complianceItems.filter((c: any) => c.status === 'COMPLETED');

    return NextResponse.json({
      items: complianceItems,
      summary: {
        total: complianceItems.length,
        completed: completed.length,
        mandatoryTotal: mandatory.length,
        mandatoryCompleted: mandatory.filter((c: any) => c.status === 'COMPLETED').length,
        recommendedTotal: recommended.length,
        recommendedCompleted: recommended.filter((c: any) => c.status === 'COMPLETED').length,
        completionPercentage: Math.round((completed.length / complianceItems.length) * 100) || 0
      }
    });
  } catch (error) {
    console.error('Error fetching compliance items:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
