import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import { getAdminDashboardStats } from '@/lib/services/analyticsService';
import { cacheGetOrSet } from '@/lib/redis';
import logger from '@/lib/logger';

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Try to get from cache first (5 minute TTL)
    const stats = await cacheGetOrSet(
      'admin:dashboard:stats',
      () => getAdminDashboardStats(),
      300
    );

    logger.info('Admin dashboard stats fetched', {
      durationMs: Date.now() - startTime,
    });

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Failed to fetch dashboard stats', {
      error: error instanceof Error ? error.message : 'Unknown error',
      durationMs: Date.now() - startTime,
    });

    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
