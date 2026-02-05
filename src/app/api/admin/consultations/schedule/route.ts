import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !['ADMIN', 'ACCOUNT_MANAGER'].includes(session.user?.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { requirementId, slotId, date } = await request.json();

    if (!requirementId || !slotId || !date) {
      return NextResponse.json(
        { error: 'requirementId, slotId, and date are required' },
        { status: 400 }
      );
    }

    // In production, this would:
    // 1. Create a consultation record in the database
    // 2. Update the requirement status
    // 3. Send email notification to the buyer
    // 4. Add to the account manager's calendar

    // Mock response for demo
    const consultation = {
      id: `cons-${Date.now()}`,
      requirementId,
      accountManagerId: session.user?.id || 'current-user',
      scheduledAt: new Date(date).toISOString(),
      status: 'SCHEDULED',
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Consultation scheduled successfully. Email sent to buyer.',
      consultation,
    });
  } catch (error) {
    console.error('Schedule consultation error:', error);
    return NextResponse.json(
      { error: 'Failed to schedule consultation' },
      { status: 500 }
    );
  }
}
