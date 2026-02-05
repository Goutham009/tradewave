import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !['ADMIN', 'ACCOUNT_MANAGER'].includes(session.user?.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const buyerId = searchParams.get('buyerId');
    const requirementId = searchParams.get('requirementId');

    if (!buyerId) {
      return NextResponse.json(
        { error: 'buyerId is required' },
        { status: 400 }
      );
    }

    // In production, this would fetch communications from the database
    // Mock response for demo
    const communications = [
      {
        id: 'comm-001',
        buyerId,
        requirementId: requirementId || 'req-001',
        message: 'Initial consultation call completed. Buyer confirmed requirements.',
        type: 'PHONE',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        accountManager: {
          id: 'am-001',
          name: 'Sarah Johnson',
          role: 'Account Manager',
        },
      },
      {
        id: 'comm-002',
        buyerId,
        requirementId: requirementId || 'req-001',
        message: 'Sent detailed quotation comparison document via email.',
        type: 'EMAIL',
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        accountManager: {
          id: 'am-001',
          name: 'Sarah Johnson',
          role: 'Account Manager',
        },
      },
    ];

    return NextResponse.json({ communications });
  } catch (error) {
    console.error('Fetch communications error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch communications' },
      { status: 500 }
    );
  }
}
