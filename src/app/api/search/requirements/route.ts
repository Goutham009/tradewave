import { NextRequest, NextResponse } from 'next/server';
import { searchRequirements, getFilterOptions } from '@/lib/services/searchService';
import logger from '@/lib/logger';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const params = {
      query: searchParams.get('q') || undefined,
      category: searchParams.get('category') || undefined,
      minQuantity: searchParams.get('minQuantity') 
        ? parseInt(searchParams.get('minQuantity')!) 
        : undefined,
      maxQuantity: searchParams.get('maxQuantity') 
        ? parseInt(searchParams.get('maxQuantity')!) 
        : undefined,
      status: searchParams.get('status') || 'OPEN',
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
      sortBy: (searchParams.get('sortBy') as 'relevance' | 'date' | 'price') || 'relevance',
    };

    const results = await searchRequirements(params);
    
    logger.info('Search requirements', {
      query: params.query,
      resultsCount: results.total,
      durationMs: Date.now() - startTime,
    });

    return NextResponse.json({
      success: true,
      ...results,
    });
  } catch (error) {
    logger.error('Search requirements failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      durationMs: Date.now() - startTime,
    });

    return NextResponse.json(
      { success: false, error: 'Search failed' },
      { status: 500 }
    );
  }
}
