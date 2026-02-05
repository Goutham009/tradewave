import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !['ADMIN', 'ACCOUNT_MANAGER'].includes(session.user?.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const documentId = params.id;
    const { reason } = await request.json();

    if (!reason) {
      return NextResponse.json(
        { error: 'rejection reason is required' },
        { status: 400 }
      );
    }

    // In production, this would update the document status in the database
    // Mock response for demo
    return NextResponse.json({
      success: true,
      message: 'Document rejected',
      document: {
        id: documentId,
        status: 'REJECTED',
        rejectionReason: reason,
        rejectedAt: new Date().toISOString(),
        rejectedBy: session.user?.id || 'current-user',
      },
    });
  } catch (error) {
    console.error('Document reject error:', error);
    return NextResponse.json(
      { error: 'Failed to reject document' },
      { status: 500 }
    );
  }
}
