import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !['ADMIN', 'PROCUREMENT_TEAM', 'ACCOUNT_MANAGER'].includes(session.user?.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { supplierId, requirementId, note, recommendation } = await request.json();

    if (!supplierId || !note) {
      return NextResponse.json(
        { error: 'supplierId and note are required' },
        { status: 400 }
      );
    }

    // In production, this would create the note in the database
    // Mock response for demo
    const supplierNote = {
      id: `note-${Date.now()}`,
      supplierId,
      requirementId: requirementId || null,
      note,
      recommendation: recommendation || 'NEUTRAL',
      createdAt: new Date().toISOString(),
      createdBy: {
        id: session.user?.id || 'current-user',
        name: session.user?.name || 'Current User',
        role: session.user?.role || 'Procurement Team',
      },
    };

    return NextResponse.json({
      success: true,
      note: supplierNote,
    });
  } catch (error) {
    console.error('Add note error:', error);
    return NextResponse.json(
      { error: 'Failed to add note' },
      { status: 500 }
    );
  }
}
