import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import { analyticsService } from '@/lib/services/analyticsService';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate and endDate are required' },
        { status: 400 }
      );
    }

    const distribution = await analyticsService.getGeographicDistribution(
      new Date(startDate),
      new Date(endDate)
    );

    return NextResponse.json(distribution);
  } catch (error) {
    console.error('Geographic distribution API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch geographic distribution' },
      { status: 500 }
    );
  }
}
