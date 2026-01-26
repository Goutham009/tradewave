import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import { prisma } from '@/lib/db';

// POST /api/buyer/auto-reorder/:id/pause - Pause auto-reorder
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
    const body = await request.json();

    const autoReorder = await prisma.autoReorder.findUnique({
      where: { id }
    });

    if (!autoReorder) {
      return NextResponse.json({ error: 'Auto-reorder not found' }, { status: 404 });
    }

    if (autoReorder.buyerId !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    if (autoReorder.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Can only pause active auto-reorders' },
        { status: 400 }
      );
    }

    const updated = await prisma.autoReorder.update({
      where: { id },
      data: {
        status: 'PAUSED',
        isPaused: true,
        pausedAt: new Date(),
        pauseReason: body.reason || null
      }
    });

    return NextResponse.json({ autoReorder: updated });
  } catch (error) {
    console.error('Error pausing auto-reorder:', error);
    return NextResponse.json(
      { error: 'Failed to pause auto-reorder' },
      { status: 500 }
    );
  }
}
