import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'BUYER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // In production, fetch actual status updates from database
    // const updates = await prisma.statusUpdate.findMany({
    //   where: {
    //     buyerId: session.user.id,
    //     read: false,
    //   },
    //   orderBy: { createdAt: 'desc' },
    //   take: 10,
    // });

    // Mock updates for demo (return empty to simulate no new updates)
    // Real implementation would return actual new updates
    const updates: any[] = [];

    return NextResponse.json({ updates });
  } catch (error) {
    console.error('Status updates error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch status updates' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'BUYER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { updateIds } = await request.json();

    if (!updateIds || !Array.isArray(updateIds)) {
      return NextResponse.json(
        { error: 'updateIds array is required' },
        { status: 400 }
      );
    }

    // In production, mark updates as read
    // await prisma.statusUpdate.updateMany({
    //   where: { id: { in: updateIds } },
    //   data: { read: true },
    // });

    return NextResponse.json({
      success: true,
      message: `${updateIds.length} updates marked as read`,
    });
  } catch (error) {
    console.error('Mark updates read error:', error);
    return NextResponse.json(
      { error: 'Failed to mark updates as read' },
      { status: 500 }
    );
  }
}
