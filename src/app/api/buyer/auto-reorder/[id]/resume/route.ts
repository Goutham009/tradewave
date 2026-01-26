import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import { prisma } from '@/lib/db';

// POST /api/buyer/auto-reorder/:id/resume - Resume paused auto-reorder
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const autoReorder = await prisma.autoReorder.findUnique({
      where: { id }
    });

    if (!autoReorder) {
      return NextResponse.json({ error: 'Auto-reorder not found' }, { status: 404 });
    }

    if (autoReorder.buyerId !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    if (autoReorder.status !== 'PAUSED') {
      return NextResponse.json(
        { error: 'Can only resume paused auto-reorders' },
        { status: 400 }
      );
    }

    // Calculate next order date from now
    let nextOrderDate = new Date();
    switch (autoReorder.frequency) {
      case 'WEEKLY':
        nextOrderDate.setDate(nextOrderDate.getDate() + 7);
        break;
      case 'MONTHLY':
        nextOrderDate.setMonth(nextOrderDate.getMonth() + 1);
        break;
      case 'QUARTERLY':
        nextOrderDate.setMonth(nextOrderDate.getMonth() + 3);
        break;
      case 'YEARLY':
        nextOrderDate.setFullYear(nextOrderDate.getFullYear() + 1);
        break;
      case 'CUSTOM':
        if (autoReorder.customIntervalDays) {
          nextOrderDate.setDate(nextOrderDate.getDate() + autoReorder.customIntervalDays);
        }
        break;
    }

    const updated = await prisma.autoReorder.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        isPaused: false,
        pausedAt: null,
        pauseReason: null,
        nextOrderDate
      }
    });

    return NextResponse.json({ autoReorder: updated });
  } catch (error) {
    console.error('Error resuming auto-reorder:', error);
    return NextResponse.json(
      { error: 'Failed to resume auto-reorder' },
      { status: 500 }
    );
  }
}
