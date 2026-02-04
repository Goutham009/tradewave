import { NextRequest, NextResponse } from 'next/server';
import { searchSuppliers } from '@/lib/services/searchService';
import logger from '@/lib/logger';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const params = {
      query: searchParams.get('q') || undefined,
      tier: searchParams.get('tier')?.split(',') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
    };

    const results = await searchSuppliers(params);
    
    logger.info('Search suppliers', {
      query: params.query,
      resultsCount: results.total,
      durationMs: Date.now() - startTime,
    });

    return NextResponse.json({
      success: true,
      ...results,
    });
  } catch (error) {
    logger.error('Search suppliers failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      durationMs: Date.now() - startTime,
    });

    return NextResponse.json(
      { success: false, error: 'Search failed' },
      { status: 500 }
    );
  }
}
