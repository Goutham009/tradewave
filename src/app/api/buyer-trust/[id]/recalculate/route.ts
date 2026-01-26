import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import { recalculateBuyerTrustScore } from '@/lib/trust-score/engine';

// POST /api/buyer-trust/[id]/recalculate - Force recalculation (Admin only)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    const { id: buyerId } = await params;

    const result = await recalculateBuyerTrustScore(buyerId);

    if (!result) {
      return NextResponse.json({ error: 'Failed to recalculate trust score' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Trust score recalculated',
      ...result
    });
  } catch (error) {
    console.error('Error recalculating trust score:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
