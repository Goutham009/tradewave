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

    // In production, this would update the document status in the database
    // Mock response for demo
    return NextResponse.json({
      success: true,
      message: 'Document verified successfully',
      document: {
        id: documentId,
        status: 'VERIFIED',
        verifiedAt: new Date().toISOString(),
        verifiedBy: session.user?.id || 'current-user',
      },
    });
  } catch (error) {
    console.error('Document verify error:', error);
    return NextResponse.json(
      { error: 'Failed to verify document' },
      { status: 500 }
    );
  }
}
