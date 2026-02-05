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
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { error: 'date parameter is required' },
        { status: 400 }
      );
    }

    // In production, this would fetch actual availability from the database
    // Mock response for demo
    const slots = [
      { id: 'slot-1', time: '09:00 AM', available: true },
      { id: 'slot-2', time: '10:00 AM', available: true },
      { id: 'slot-3', time: '11:00 AM', available: false },
      { id: 'slot-4', time: '12:00 PM', available: false },
      { id: 'slot-5', time: '02:00 PM', available: true },
      { id: 'slot-6', time: '03:00 PM', available: true },
      { id: 'slot-7', time: '04:00 PM', available: true },
      { id: 'slot-8', time: '05:00 PM', available: false },
    ];

    return NextResponse.json({ slots });
  } catch (error) {
    console.error('Available slots error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available slots' },
      { status: 500 }
    );
  }
}
