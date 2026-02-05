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
    const year = searchParams.get('year');

    if (!year) {
      return NextResponse.json(
        { error: 'year is required' },
        { status: 400 }
      );
    }

    const trends = await analyticsService.getSeasonalTrends(parseInt(year));

    return NextResponse.json(trends);
  } catch (error) {
    console.error('Seasonal trends API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch seasonal trends' },
      { status: 500 }
    );
  }
}
