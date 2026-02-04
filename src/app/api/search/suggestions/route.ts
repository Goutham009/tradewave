import { NextRequest, NextResponse } from 'next/server';
import { getSearchSuggestions } from '@/lib/services/searchService';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const type = (searchParams.get('type') as 'requirements' | 'suppliers') || 'requirements';

    if (query.length < 2) {
      return NextResponse.json({ success: true, suggestions: [] });
    }

    const suggestions = await getSearchSuggestions(query, type);

    return NextResponse.json({
      success: true,
      suggestions,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to get suggestions' },
      { status: 500 }
    );
  }
}
