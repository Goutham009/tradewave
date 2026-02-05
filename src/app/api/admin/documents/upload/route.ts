import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !['ADMIN', 'ACCOUNT_MANAGER'].includes(session.user?.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const documentType = formData.get('documentType') as string;
    const requirementId = formData.get('requirementId') as string;
    const buyerId = formData.get('buyerId') as string;

    if (!file || !documentType || !requirementId || !buyerId) {
      return NextResponse.json(
        { error: 'file, documentType, requirementId, and buyerId are required' },
        { status: 400 }
      );
    }

    // In production, this would:
    // 1. Upload the file to S3 or another storage service
    // 2. Create a document record in the database
    // 3. Return the document details with the file URL

    // Mock response for demo
    const document = {
      id: `doc-${Date.now()}`,
      requirementId,
      buyerId,
      documentType,
      fileName: file.name,
      fileUrl: `/documents/${file.name}`,
      fileSize: file.size,
      status: 'PENDING',
      uploadedById: session.user?.id || 'current-user',
      uploadedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      document,
    });
  } catch (error) {
    console.error('Document upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}
