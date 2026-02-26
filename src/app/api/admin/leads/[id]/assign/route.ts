import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

// PATCH /api/admin/leads/[id]/assign - Assign AM to a lead
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { assignedTo } = body; // Account Manager user ID

    if (!assignedTo) {
      return NextResponse.json(
        { error: 'Account Manager ID is required' },
        { status: 400 }
      );
    }

    const lead = await prisma.lead.findUnique({
      where: { id: params.id },
    });

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    const updatedLead = await prisma.lead.update({
      where: { id: params.id },
      data: {
        assignedTo,
        assignedAt: new Date(),
        status: 'ASSIGNED_TO_AM',
      },
    });

    // TODO: Send notification email to assigned AM
    // TODO: Send notification to AM dashboard

    return NextResponse.json({
      status: 'success',
      lead: updatedLead,
    });
  } catch (error) {
    console.error('Error assigning lead:', error);
    return NextResponse.json(
      { error: 'Failed to assign lead' },
      { status: 500 }
    );
  }
}
