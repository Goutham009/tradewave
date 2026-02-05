import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !['ADMIN', 'ACCOUNT_MANAGER'].includes(session.user?.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { buyerId, requirementId, message, type } = await request.json();

    if (!buyerId || !message || !type) {
      return NextResponse.json(
        { error: 'buyerId, message, and type are required' },
        { status: 400 }
      );
    }

    // In production, this would create the communication record in the database
    // Mock response for demo
    const communication = {
      id: `comm-${Date.now()}`,
      buyerId,
      requirementId: requirementId || null,
      message,
      type,
      createdAt: new Date().toISOString(),
      accountManager: {
        id: session.user?.id || 'current-user',
        name: session.user?.name || 'Current User',
        role: session.user?.role || 'Account Manager',
      },
    };

    return NextResponse.json({
      success: true,
      communication,
    });
  } catch (error) {
    console.error('Add communication error:', error);
    return NextResponse.json(
      { error: 'Failed to add communication' },
      { status: 500 }
    );
  }
}
