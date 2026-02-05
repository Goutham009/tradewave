import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

// Mock drafts storage (in production, use database)
const draftsStore: Map<string, any> = new Map();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'SUPPLIER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const invitationId = searchParams.get('invitationId');

    if (!invitationId) {
      return NextResponse.json(
        { error: 'invitationId is required' },
        { status: 400 }
      );
    }

    const supplierId = session.user?.id || 'supplier-001';
    const draftKey = `${supplierId}-${invitationId}`;
    
    // In production, fetch from database
    const draft = draftsStore.get(draftKey) || null;

    return NextResponse.json({ draft });
  } catch (error) {
    console.error('Fetch draft error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch draft' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'SUPPLIER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { invitationId, draftId, content } = await request.json();

    if (!invitationId || !content) {
      return NextResponse.json(
        { error: 'invitationId and content are required' },
        { status: 400 }
      );
    }

    const supplierId = session.user?.id || 'supplier-001';
    const draftKey = `${supplierId}-${invitationId}`;

    // In production, upsert to database
    const draft = {
      id: draftId || `draft-${Date.now()}`,
      supplierId,
      invitationId,
      content,
      createdAt: draftsStore.get(draftKey)?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    draftsStore.set(draftKey, draft);

    return NextResponse.json({
      success: true,
      draft,
    });
  } catch (error) {
    console.error('Save draft error:', error);
    return NextResponse.json(
      { error: 'Failed to save draft' },
      { status: 500 }
    );
  }
}
